import type { LLMAdapter } from '../../adapters/llm/types.js';
import type { StorageAdapter } from '../../adapters/storage/types.js';
import type { EventAdapter } from '../../adapters/events/types.js';
import type { PromptComposer } from '../prompt/composer.js';
import type { AgentRegistry } from '../registry/agent-registry.js';
import type { Artifact, FatigueRecord } from '../../types.js';
import { detectPhase, type PhaseStats } from '../phases/detector.js';
import { ActivityRouter, type AgentState, type ProjectContext, type ActivityAssignment } from '../activities/router.js';
import { WorkingMemoryManager } from '../memory/working-memory.js';

export interface OverseerOptions {
  llm: LLMAdapter;
  storage: StorageAdapter;
  events: EventAdapter;
  composer: PromptComposer;
  registry: AgentRegistry;
  fatigueThreshold?: number;
}

export interface OverseerRunOptions {
  task: string;
  maxRounds: number;
  agents: AgentState[];
  pendingTasks: Array<{ id: string; title: string; priority: string }>;
  onGate?: (gate: string) => Promise<void>;
}

export interface OverseerResult {
  round: number;
  phase: 'divergent' | 'convergent' | 'elevation';
  completed: boolean;
  artifacts: Artifact[];
  fatigue: Record<string, FatigueRecord>;
}

export class OverseerLoop {
  private llm: LLMAdapter;
  private storage: StorageAdapter;
  private events: EventAdapter;
  private composer: PromptComposer;
  private registry: AgentRegistry;
  private router: ActivityRouter;
  private memoryManager: WorkingMemoryManager;
  private fatigueThreshold: number;

  constructor(options: OverseerOptions) {
    this.llm = options.llm;
    this.storage = options.storage;
    this.events = options.events;
    this.composer = options.composer;
    this.registry = options.registry;
    this.router = new ActivityRouter({ llm: options.llm });
    this.memoryManager = new WorkingMemoryManager({ llm: options.llm, storage: options.storage });
    this.fatigueThreshold = options.fatigueThreshold ?? 5;
  }

  async run(options: OverseerRunOptions): Promise<OverseerResult> {
    const { task, maxRounds, onGate } = options;
    const agents = options.agents;
    const pendingTasks = options.pendingTasks;
    const allArtifacts: Artifact[] = [];
    const fatigue: Record<string, FatigueRecord> = {};
    let round = 0;

    // Initialize fatigue records
    for (const agent of agents) {
      fatigue[agent.slug] = {
        agentSlug: agent.slug,
        consecutiveRounds: agent.fatigueCount ?? 0,
        lastActiveRound: 0,
        totalActions: 0,
      };
    }

    while (round < maxRounds) {
      round++;

      this.events.emit({
        type: 'room:started',
        timestamp: new Date().toISOString(),
        data: { round, maxRounds, phase: 'survey' },
      });

      // 1. Survey — determine current stats
      const stats: PhaseStats = {
        totalTasks: pendingTasks.length + allArtifacts.length,
        doneTasks: allArtifacts.length,
        artifactCount: allArtifacts.length,
        approvedCount: 0,
        archivedCount: 0,
        avgQualityScore: null,
      };

      // 2. Detect phase
      const phase = detectPhase(stats);

      this.events.emit({
        type: 'phase:transition',
        timestamp: new Date().toISOString(),
        data: { phase, round },
      });

      // 3. Apply fatigue — rotate agents past threshold
      const activeAgents = agents.filter(a => {
        const record = fatigue[a.slug];
        if (record && record.consecutiveRounds >= this.fatigueThreshold) {
          a.status = 'fatigued';
          return false;
        }
        return a.status === 'idle';
      });

      // 4. Route — assign activities via LLM
      const context: ProjectContext = {
        projectName: task,
        phase,
        round,
        pendingTasks,
        recentArtifacts: allArtifacts.map(a => ({
          id: a.id, title: a.title, type: 'analysis',
          status: 'draft', authorSlug: a.agentSlug,
        })),
        recentHistory: [],
      };

      const assignments = await this.router.route(activeAgents, context);

      // 5. Execute — run each assignment
      for (const assignment of assignments) {
        const artifact = await this.executeAssignment(assignment, task, allArtifacts, round);
        if (artifact) {
          allArtifacts.push(artifact);

          // Update fatigue by matching slug
          const slug = assignment.agentId;
          const record = fatigue[slug];
          if (record) {
            record.consecutiveRounds++;
            record.lastActiveRound = round;
            record.totalActions++;
          }
        }
      }

      // 6. Phase gate check
      if (onGate && phase !== 'divergent') {
        await onGate(phase);
      }

      // Save state
      await this.storage.writeState({
        phase,
        round,
        artifactCount: allArtifacts.length,
        completed: round >= maxRounds,
      });

      // No assignments = nothing to do
      if (assignments.length === 0) {
        this.events.emit({
          type: 'room:completed',
          timestamp: new Date().toISOString(),
          data: { round, reason: 'no_idle_agents' },
        });
      }
    }

    return {
      round,
      phase: detectPhase({
        totalTasks: pendingTasks.length + allArtifacts.length,
        doneTasks: allArtifacts.length,
        artifactCount: allArtifacts.length,
        approvedCount: 0, archivedCount: 0, avgQualityScore: null,
      }),
      completed: true,
      artifacts: allArtifacts,
      fatigue,
    };
  }

  private async executeAssignment(
    assignment: ActivityAssignment,
    task: string,
    existingArtifacts: Artifact[],
    round: number,
  ): Promise<Artifact | null> {
    const { activity, agentId, agentName } = assignment;

    // Only certain activities produce artifacts
    if (!['pick_up_task', 'cross_pollinate', 'consolidate_artifacts', 'elevate_deliverables'].includes(activity)) {
      this.events.emit({
        type: 'agent:completed',
        timestamp: new Date().toISOString(),
        data: { agentId, agentName, activity, produced: 'non-artifact' },
      });
      return null;
    }

    // Find template by slug (agentId is the slug in overseer context)
    const template = this.registry.getBySlug(agentId) ?? this.registry.all()[0];
    if (!template) return null;

    const systemPrompt = this.composer.compose({
      template,
      taskContext: task,
      upstreamArtifacts: existingArtifacts.slice(-5),
    });

    this.events.emit({
      type: 'agent:executing',
      timestamp: new Date().toISOString(),
      data: { agentId, agentName, activity },
    });

    const response = await this.llm.call([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Execute activity: ${activity}. Task: ${assignment.taskId ?? task}. Respond with JSON.` },
    ], { jsonMode: true });

    let parsed: { title?: string; content?: string };
    try { parsed = JSON.parse(response.content); }
    catch { parsed = { title: `${agentName} output`, content: response.content }; }

    const artifact: Artifact = {
      id: `overseer-r${round}-${agentId}-${activity}`,
      roomId: `overseer-round-${round}`,
      agentSlug: agentId,
      title: parsed.title ?? `${agentName} — ${activity}`,
      content: parsed.content ?? response.content,
      streamWeights: { research: 0.25, synthesis: 0.25, critique: 0.25, design: 0.25 },
      createdAt: new Date().toISOString(),
    };

    await this.storage.writeArtifact(artifact.id, artifact.content);

    this.events.emit({
      type: 'artifact:created',
      timestamp: new Date().toISOString(),
      data: { artifactId: artifact.id, title: artifact.title, agentId, activity },
    });

    // Extract memory
    const extraction = await this.memoryManager.extract({
      agentName,
      archetype: template.archetype,
      action: `${activity}: ${artifact.title}`,
      artifactSlice: artifact.content.slice(0, 500),
      contextSlice: task,
    });

    if (extraction) {
      await this.memoryManager.update(agentId, extraction.entry, extraction.goals);
    }

    return artifact;
  }
}
