// Types
export * from './types.js';

// Adapter interfaces
export type * from './adapters/llm/types.js';
export type * from './adapters/storage/types.js';
export type * from './adapters/events/types.js';

// Adapter implementations
export { ClaudeAdapter } from './adapters/llm/claude.js';
export type { ClaudeAdapterOptions } from './adapters/llm/claude.js';
export { OpenRouterAdapter } from './adapters/llm/openrouter.js';
export type { OpenRouterAdapterOptions } from './adapters/llm/openrouter.js';
export { LLMGatewayAdapter } from './adapters/llm/llm-gateway.js';
export type { LLMGatewayAdapterOptions } from './adapters/llm/llm-gateway.js';
export { FileStorage } from './adapters/storage/file-storage.js';
export type { FileStorageOptions } from './adapters/storage/file-storage.js';
export { MemoryStorage } from './adapters/storage/memory-storage.js';
export { CLIEvents } from './adapters/events/cli-events.js';
export { SilentEvents } from './adapters/events/silent-events.js';

// Core modules
export { AgentRegistry } from './core/registry/agent-registry.js';
export { getArchetype, getArchetypeTempo, ARCHETYPES } from './core/registry/archetypes.js';
export { scoreFitness, rankTemplates } from './core/registry/fitness.js';
export { PromptComposer } from './core/prompt/composer.js';
export type { ComposeOptions } from './core/prompt/composer.js';
export { RoomBuilder } from './core/topology/room.js';
export type { RoomDefinition } from './core/topology/room.js';
export { topoSort } from './core/topology/sort.js';
export { PipelineRunner } from './core/execution/pipeline.js';
export type { PipelineOptions, RunOptions } from './core/execution/pipeline.js';

// Quality
export { BranchingEngine, selectSurvivors, deriveBranchingConfig } from './core/quality/branching.js';
export {
  getArchetypeWeights, computeWeightedFitness,
  buildEvaluationPrompt, parseEvaluationResponse,
} from './core/quality/evaluation.js';
export type { EvaluationScores, EvaluationResult, DimensionWeights } from './core/quality/evaluation.js';

// Memory
export { WorkingMemoryManager, autoPromoteHypotheses, formatMemoryForInjection } from './core/memory/working-memory.js';

// Reputation
export { ReputationStore } from './core/memory/reputation.js';
export type { AgentReputation, ScoreRecord } from './core/memory/reputation.js';

// Phases
export { detectPhase } from './core/phases/detector.js';
export type { PhaseStats } from './core/phases/detector.js';

// Streams
export {
  sinkhornKnopp, normalizeWeights, getAgentBlendWeights,
  classifyArtifactStreams, computeStreamState, getMixingMatrix,
  streamDiversityScore, buildStreamSectionedContext, shiftWeightsForDivergent,
  UNIFORM_WEIGHTS, IDENTITY_MATRIX,
  STREAM_NAMES, ARCHETYPE_BLEND_WEIGHTS, ARCHETYPE_OUTPUT_WEIGHTS,
  MIXING_PRESETS, ARCHETYPE_DEFAULT_PRESET,
} from './core/streams/mixer.js';
export type { MixingMatrix } from './core/streams/mixer.js';

// Activities
export { ACTIVITY_TYPES, getActivity, isMetaOnly, isIdleActivity, getActivitiesForPhase } from './core/activities/taxonomy.js';
export type { ActivityType } from './core/activities/taxonomy.js';
export { ActivityRouter } from './core/activities/router.js';
export type { AgentState, ProjectContext, ActivityAssignment } from './core/activities/router.js';

// Overseer
export { OverseerLoop } from './core/execution/overseer.js';
export type { OverseerOptions, OverseerRunOptions, OverseerResult } from './core/execution/overseer.js';

// Engine
export { FoundryEngine } from './engine.js';
export type { EngineOptions, InitOptions, Swarm } from './engine.js';
