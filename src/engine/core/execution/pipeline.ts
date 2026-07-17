import { topoSort } from '../topology/sort.js';
import type { LLMAdapter } from '../../adapters/llm/types.js';
import type { StorageAdapter } from '../../adapters/storage/types.js';
import type { EventAdapter } from '../../adapters/events/types.js';
import type { PromptComposer } from '../prompt/composer.js';
import type { AgentRegistry } from '../registry/agent-registry.js';
import type { Room, Artifact, BranchingStrategy } from '../../types.js';
import { BranchingEngine, deriveBranchingConfig } from '../quality/branching.js';
import { WorkingMemoryManager } from '../memory/working-memory.js';

export interface PipelineOptions {
  llm: LLMAdapter;
  storage: StorageAdapter;
  events: EventAdapter;
  composer: PromptComposer;
  registry: AgentRegistry;
  branchingEngine?: BranchingEngine;
  memoryManager?: WorkingMemoryManager;
}

export interface RunOptions {
  task: string;
  onGate?: (gate: string) => Promise<void>;
  branching?: {
    strategy: BranchingStrategy;
    variants: number;
    survivors: number;
  };
}

export class PipelineRunner {
  private llm: LLMAdapter;
  private storage: StorageAdapter;
  private events: EventAdapter;
  private composer: PromptComposer;
  private registry: AgentRegistry;
  private branchingEngine?: BranchingEngine;
  private memoryManager?: WorkingMemoryManager;

  constructor(options: PipelineOptions) {
    this.llm = options.llm;
    this.storage = options.storage;
    this.events = options.events;
    this.composer = options.composer;
    this.registry = options.registry;
    this.branchingEngine = options.branchingEngine;
    this.memoryManager = options.memoryManager;
  }

  async run(rooms: Room[], options: RunOptions): Promise<Artifact[]> {
    const sorted = topoSort(rooms);
    const allArtifacts: Artifact[] = [];
    const artifactsByRoom = new Map<string, Artifact[]>();

    for (const room of sorted) {
      this.events.emit({
        type: 'room:started',
        timestamp: new Date().toISOString(),
        data: { roomId: room.id, name: room.name },
      });

      // Collect upstream artifacts
      const upstreamArtifacts: Artifact[] = [];
      for (const upId of room.upstream) {
        const roomArtifacts = artifactsByRoom.get(upId) ?? [];
        upstreamArtifacts.push(...roomArtifacts);
      }

      // Execute each agent in the room
      const roomArtifacts: Artifact[] = [];

      for (const agentSlug of room.agentSlugs) {
        const template = this.registry.getBySlug(agentSlug);
        if (!template) {
          this.events.emit({
            type: 'error',
            timestamp: new Date().toISOString(),
            data: { message: `Unknown agent template: ${agentSlug}` },
          });
          continue;
        }

        this.events.emit({
          type: 'agent:executing',
          timestamp: new Date().toISOString(),
          data: { agentSlug, roomName: room.name },
        });

        // Load working memory for injection
        let memoryContext: string | undefined;
        if (this.memoryManager) {
          memoryContext = (await this.memoryManager.getForInjection(agentSlug)) ?? undefined;
        }

        // Compose the prompt (with memory if available)
        const systemPrompt = this.composer.compose({
          template,
          taskContext: options.task,
          upstreamArtifacts,
          additionalInstructions: memoryContext || undefined,
        });

        // Determine branching config for this room
        const roomBranching = room.branchingConfig ?? options.branching;
        const effectiveBranching = roomBranching
          ? deriveBranchingConfig([template.archetype], {
              strategy: (roomBranching as any).strategy ?? 'single',
              variants: (roomBranching as any).variantCount ?? (roomBranching as any).variants ?? 1,
              survivors: (roomBranching as any).survivorCount ?? (roomBranching as any).survivors ?? 1,
            })
          : null;

        let artifact: Artifact;

        if (effectiveBranching && effectiveBranching.strategy !== 'single' && this.branchingEngine) {
          // Branching path
          const result = await this.branchingEngine.generateAndEvaluate({
            room,
            template,
            systemPrompt,
            task: options.task,
            upstreamArtifacts,
            variantCount: effectiveBranching.variants,
            survivorCount: effectiveBranching.survivors,
          });

          const winner = result.survivors[0];
          artifact = {
            id: winner.id,
            roomId: room.id,
            agentSlug,
            title: winner.title,
            content: winner.content,
            streamWeights: { research: 0.25, synthesis: 0.25, critique: 0.25, design: 0.25 },
            isWinner: true,
            createdAt: new Date().toISOString(),
          };
        } else {
          // Single execution path (existing behavior)
          const response = await this.llm.call([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: 'Execute your role for this task. Respond with the JSON format specified.' },
          ], {
            jsonMode: true,
          });

          // Parse response
          let parsed: { title?: string; content?: string; takeaways?: string[]; openQuestions?: string[]; hypotheses?: string[] };
          try {
            parsed = JSON.parse(response.content);
          } catch {
            parsed = { title: `${agentSlug} output`, content: response.content };
          }

          // Create artifact
          artifact = {
            id: `${room.id}-${agentSlug}-v1`,
            roomId: room.id,
            agentSlug,
            title: parsed.title ?? `${agentSlug} output`,
            content: parsed.content ?? response.content,
            streamWeights: { research: 0.25, synthesis: 0.25, critique: 0.25, design: 0.25 },
            createdAt: new Date().toISOString(),
          };
        }

        // Store artifact
        await this.storage.writeArtifact(artifact.id, artifact.content);
        roomArtifacts.push(artifact);
        allArtifacts.push(artifact);

        this.events.emit({
          type: 'artifact:created',
          timestamp: new Date().toISOString(),
          data: { artifactId: artifact.id, title: artifact.title, agentSlug },
        });

        // Extract working memory after execution
        if (this.memoryManager) {
          const extraction = await this.memoryManager.extract({
            agentName: template.name,
            archetype: template.archetype,
            action: `Completed task in room "${room.name}"`,
            artifactSlice: artifact.content.slice(0, 500),
            contextSlice: options.task,
          });

          if (extraction) {
            await this.memoryManager.update(agentSlug, extraction.entry, extraction.goals);
            this.events.emit({
              type: 'memory:extracted',
              timestamp: new Date().toISOString(),
              data: { agentSlug, takeawayCount: extraction.entry.takeaways.length },
            });
          }
        }
      }

      artifactsByRoom.set(room.id, roomArtifacts);

      // Update room status
      room.status = 'completed';

      this.events.emit({
        type: 'room:completed',
        timestamp: new Date().toISOString(),
        data: { roomId: room.id, name: room.name, artifactCount: roomArtifacts.length },
      });
    }

    // Save final state
    await this.storage.writeState({
      phase: 'divergent',
      round: 1,
      roomsCompleted: sorted.filter(r => r.status === 'completed').length,
      totalRooms: sorted.length,
      artifactCount: allArtifacts.length,
    });

    return allArtifacts;
  }
}
