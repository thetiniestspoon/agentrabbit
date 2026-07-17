// Core types used across the engine

export type Archetype =
  | 'researcher' | 'analyst' | 'strategist' | 'creative'
  | 'critic' | 'synthesizer' | 'facilitator' | 'prototyper'
  | 'engagement' | 'designer';

export type Tempo = 'quick' | 'measured' | 'deliberate';

export type GovernanceMode = 'autonomous' | 'guided' | 'collaborative';

export type Scale = 'focused' | 'standard' | 'comprehensive';

export type BranchingStrategy = 'single' | 'same_archetype' | 'cross_archetype';

export type StreamName = 'research' | 'synthesis' | 'critique' | 'design';

export type StreamWeights = Record<StreamName, number>;

export type RoomStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export type AgentStatus = 'idle' | 'active' | 'fatigued';

export interface SwarmConfig {
  task: string;
  scale: Scale;
  governance: GovernanceMode;
  branching: {
    strategy: BranchingStrategy;
    variants: number;
    survivors: number;
  };
  streams: StreamName[];
  phaseGates: string[];
}

export interface AgentTemplate {
  slug: string;
  name: string;
  archetype: Archetype;
  category: string;
  description: string;
  systemPrompt: string;
  capabilities: string[];
  isMeta?: boolean;
  icon?: string;
  color?: string;
  model?: string;
  layer?: 'orchestration' | 'doer' | 'qc' | 'cel';
  tempo?: Tempo;
}

export interface Room {
  id: string;
  name: string;
  agentSlugs: string[];
  upstream: string[];
  downstream: string[];
  status: RoomStatus;
  branchingConfig?: {
    strategy: BranchingStrategy;
    variantCount: number;
    survivorCount: number;
  };
}

export interface Artifact {
  id: string;
  roomId: string;
  agentSlug: string;
  title: string;
  content: string;
  streamWeights: StreamWeights;
  variant?: number;
  isWinner?: boolean;
  createdAt: string;
}

export interface SwarmState {
  phase: 'divergent' | 'convergent' | 'elevation';
  round: number;
  config: SwarmConfig;
  rooms: Room[];
  artifacts: Artifact[];
  gatePending: string | null;
}

export interface VariantResult {
  id: string;
  roomId: string;
  agentSlug: string;
  title: string;
  content: string;
  variant: number;
  fitness: number;
  scores: { alignment: number; depth: number; actionability: number; distinctiveness: number };
  summary: string;
}

export interface BranchingResult {
  survivors: VariantResult[];
  archived: VariantResult[];
  winnerId: string;
}

export interface MemoryEntry {
  timestamp: string;
  action: string;
  takeaways: string[];
  openQuestions: string[];
  hypotheses: string[];
  processReflection?: string;
}

export interface WorkingMemoryState {
  entries: MemoryEntry[];
  pinned: string[];
  goals: string[];
}

export interface FatigueRecord {
  agentSlug: string;
  consecutiveRounds: number;
  lastActiveRound: number;
  totalActions: number;
}

export interface OverseerState {
  round: number;
  phase: 'divergent' | 'convergent' | 'elevation';
  maxRounds: number;
  fatigue: Record<string, FatigueRecord>;
  completed: boolean;
}
