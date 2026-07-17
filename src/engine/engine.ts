import type { LLMAdapter } from './adapters/llm/types.js';
import type { StorageAdapter } from './adapters/storage/types.js';
import type { EventAdapter } from './adapters/events/types.js';
import { AgentRegistry } from './core/registry/agent-registry.js';
import { PromptComposer } from './core/prompt/composer.js';
import { RoomBuilder } from './core/topology/room.js';
import { PipelineRunner } from './core/execution/pipeline.js';
import { BranchingEngine } from './core/quality/branching.js';
import { WorkingMemoryManager } from './core/memory/working-memory.js';
import { OverseerLoop } from './core/execution/overseer.js';
import type { AgentState } from './core/activities/router.js';
import type { Room, Artifact, SwarmConfig, Scale, GovernanceMode, BranchingStrategy } from './types.js';

export interface EngineOptions {
  llm: LLMAdapter;
  storage: StorageAdapter;
  events: EventAdapter;
}

export interface InitOptions {
  task: string;
  scale?: Scale;
  governance?: GovernanceMode;
  rooms?: { name: string; agentSlugs: string[]; dependsOn?: string[] }[];
}

export interface Swarm {
  config: SwarmConfig;
  rooms: Room[];
}

export class FoundryEngine {
  private llm: LLMAdapter;
  private storage: StorageAdapter;
  private events: EventAdapter;
  private registry: AgentRegistry;
  private composer: PromptComposer;

  constructor(options: EngineOptions) {
    this.llm = options.llm;
    this.storage = options.storage;
    this.events = options.events;
    this.registry = new AgentRegistry();
    this.composer = new PromptComposer();
  }

  async init(options: InitOptions): Promise<Swarm> {
    const config: SwarmConfig = {
      task: options.task,
      scale: options.scale ?? 'standard',
      governance: options.governance ?? 'guided',
      branching: { strategy: 'single', variants: 1, survivors: 1 },
      streams: ['research', 'synthesis', 'critique', 'design'],
      phaseGates: [],
    };

    let rooms: Room[];

    if (options.rooms) {
      // User-provided room topology
      const builder = new RoomBuilder();
      rooms = builder.buildDAG(options.rooms);
    } else {
      // Auto-generate topology via LLM task analysis
      rooms = await this.autoGenerateTopology(options.task, config.scale);
    }

    // Persist config
    await this.storage.writeConfig(config as unknown as Record<string, unknown>);
    await this.storage.writeRooms(rooms as unknown as Record<string, unknown>[]);
    await this.storage.writeState({
      phase: 'divergent',
      round: 0,
      gatePending: null,
    });

    this.events.emit({
      type: 'swarm:initialized',
      timestamp: new Date().toISOString(),
      data: {
        task: options.task,
        agentCount: rooms.reduce((sum, r) => sum + r.agentSlugs.length, 0),
        roomCount: rooms.length,
      },
    });

    return { config, rooms };
  }

  async runPipeline(swarm: Swarm, options?: {
    onGate?: (gate: string) => Promise<void>;
    branching?: { strategy: BranchingStrategy; variants: number; survivors: number };
  }): Promise<Artifact[]> {
    const branchingEngine = new BranchingEngine({
      llm: this.llm,
      storage: this.storage,
      events: this.events,
    });

    const memoryManager = new WorkingMemoryManager({
      llm: this.llm,
      storage: this.storage,
    });

    const runner = new PipelineRunner({
      llm: this.llm,
      storage: this.storage,
      events: this.events,
      composer: this.composer,
      registry: this.registry,
      branchingEngine,
      memoryManager,
    });

    return runner.run(swarm.rooms, {
      task: swarm.config.task,
      onGate: options?.onGate,
      branching: options?.branching,
    });
  }

  async runOverseer(swarm: Swarm, options: {
    maxRounds?: number;
    onGate?: (gate: string) => Promise<void>;
  } = {}): Promise<Artifact[]> {
    const overseer = new OverseerLoop({
      llm: this.llm,
      storage: this.storage,
      events: this.events,
      composer: this.composer,
      registry: this.registry,
    });

    // Build agent states from room assignments
    const agents: AgentState[] = swarm.rooms.flatMap(room =>
      room.agentSlugs.map(slug => {
        const template = this.registry.getBySlug(slug);
        return {
          id: slug,
          name: template?.name ?? slug,
          slug,
          archetype: template?.archetype ?? 'researcher',
          status: 'idle' as const,
          isMeta: template?.isMeta ?? false,
        };
      })
    );

    // Build pending tasks from room names
    const pendingTasks = swarm.rooms.map(r => ({
      id: r.id,
      title: `${r.name}: ${swarm.config.task}`,
      priority: 'high',
    }));

    const result = await overseer.run({
      task: swarm.config.task,
      maxRounds: options.maxRounds ?? 10,
      agents,
      pendingTasks,
      onGate: options.onGate,
    });

    return result.artifacts;
  }

  getRegistry(): AgentRegistry {
    return this.registry;
  }

  private async autoGenerateTopology(task: string, scale: Scale): Promise<Room[]> {
    const scaleGuide = {
      focused: { rooms: '2-3', agents: '4-6' },
      standard: { rooms: '4-6', agents: '8-15' },
      comprehensive: { rooms: '6-10', agents: '15-30' },
    };

    const guide = scaleGuide[scale];
    const templateList = this.registry.all()
      .map(t => `${t.slug} (${t.archetype}): ${t.description}`)
      .join('\n');

    const response = await this.llm.call([
      {
        role: 'system',
        content: `You are a swarm architect. Given a task, design a room topology (DAG) for a multi-agent pipeline.\n\nAvailable agent templates:\n${templateList}\n\nScale: ${guide.rooms} rooms, ${guide.agents} total agents.\n\nRespond with ONLY a JSON array of room objects:\n[\n  {\n    "name": "Room Name",\n    "agentSlugs": ["template-slug-1"],\n    "dependsOn": ["Upstream Room Name"]\n  }\n]\n\nRules:\n- First room(s) have no dependsOn\n- Later rooms depend on earlier rooms\n- Choose agents whose capabilities match the room's purpose\n- Cover research, analysis, synthesis, and review phases`,
      },
      { role: 'user', content: task },
    ], { jsonMode: true });

    let roomDefs: { name: string; agentSlugs: string[]; dependsOn?: string[] }[];
    try {
      roomDefs = JSON.parse(response.content);
    } catch {
      // Fallback: simple 3-room pipeline
      roomDefs = [
        { name: 'Research', agentSlugs: ['researcher'] },
        { name: 'Analysis', agentSlugs: ['analyst'], dependsOn: ['Research'] },
        { name: 'Synthesis', agentSlugs: ['synthesizer'], dependsOn: ['Analysis'] },
      ];
    }

    const builder = new RoomBuilder();
    return builder.buildDAG(roomDefs);
  }
}
