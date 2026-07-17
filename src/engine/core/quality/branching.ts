import type { LLMAdapter } from '../../adapters/llm/types.js';
import type { StorageAdapter } from '../../adapters/storage/types.js';
import type { EventAdapter } from '../../adapters/events/types.js';
import type { Room, Artifact, AgentTemplate, BranchingStrategy, VariantResult, BranchingResult } from '../../types.js';
import { buildEvaluationPrompt, parseEvaluationResponse } from './evaluation.js';

export interface BranchingEngineOptions {
  llm: LLMAdapter;
  storage: StorageAdapter;
  events: EventAdapter;
}

export interface GenerateOptions {
  room: Room;
  template: AgentTemplate;
  systemPrompt: string;
  task: string;
  upstreamArtifacts: Artifact[];
  variantCount: number;
  survivorCount: number;
}

/**
 * Derive effective branching config. Force single for designer/engagement/synthesizer rooms.
 */
export function deriveBranchingConfig(
  archetypes: string[],
  requestedConfig: { strategy: BranchingStrategy; variants: number; survivors: number },
): { strategy: BranchingStrategy; variants: number; survivors: number } {
  const forced = ['designer', 'engagement', 'synthesizer'];
  if (archetypes.some(a => forced.includes(a))) {
    return { strategy: 'single', variants: 1, survivors: 1 };
  }
  return requestedConfig;
}

/**
 * Statistical survivor selection.
 * Phase 1: threshold -- cull below (mean - 0.5 * stddev).
 * Phase 2: ranking -- top N from remaining pool.
 */
export function selectSurvivors<T extends { id: string; fitness: number }>(
  evaluated: T[],
  survivorCount: number,
): { survivors: T[]; archived: T[] } {
  if (evaluated.length <= survivorCount) {
    return { survivors: evaluated, archived: [] };
  }

  const scores = evaluated.map(v => v.fitness);
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((a, s) => a + (s - mean) ** 2, 0) / scores.length;
  const stddev = Math.sqrt(variance);

  const threshold = mean - (stddev * 0.5);
  let pool = evaluated.filter(v => v.fitness >= threshold);

  if (pool.length < survivorCount) {
    pool = [...evaluated].sort((a, b) => b.fitness - a.fitness).slice(0, survivorCount);
  }

  pool.sort((a, b) => b.fitness - a.fitness);
  const survivors = pool.slice(0, survivorCount);
  const survivorIds = new Set(survivors.map(s => s.id));
  const archived = evaluated.filter(v => !survivorIds.has(v.id));

  return { survivors, archived };
}

export class BranchingEngine {
  private llm: LLMAdapter;
  private storage: StorageAdapter;
  private events: EventAdapter;

  constructor(options: BranchingEngineOptions) {
    this.llm = options.llm;
    this.storage = options.storage;
    this.events = options.events;
  }

  async generateAndEvaluate(options: GenerateOptions): Promise<BranchingResult> {
    const { room, template, systemPrompt, task, upstreamArtifacts, variantCount, survivorCount } = options;

    // Generate N variants via parallel LLM calls
    const variantPromises = Array.from({ length: variantCount }, async (_, i) => {
      const userMessage = i === 0
        ? 'Execute your role for this task. Respond with the JSON format specified.'
        : `Execute your role for this task. This is variant ${i + 1} — take a DIFFERENT approach, angle, or methodology than other variants. Respond with the JSON format specified.`;

      const response = await this.llm.call([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ], { jsonMode: true });

      let parsed: { title?: string; content?: string };
      try {
        parsed = JSON.parse(response.content);
      } catch {
        parsed = { title: `${template.slug} variant ${i}`, content: response.content };
      }

      return {
        id: `${room.id}-${template.slug}-v${i + 1}`,
        roomId: room.id,
        agentSlug: template.slug,
        title: parsed.title ?? `${template.slug} variant ${i}`,
        content: parsed.content ?? response.content,
        variant: i,
        fitness: 0,
        scores: { alignment: 0, depth: 0, actionability: 0, distinctiveness: 0 },
        summary: '',
      };
    });

    const variants = await Promise.all(variantPromises);

    this.events.emit({
      type: 'agent:executing',
      timestamp: new Date().toISOString(),
      data: { agentSlug: template.slug, roomName: room.name, variantCount },
    });

    // Single variant -- skip evaluation
    if (variants.length === 1) {
      variants[0].fitness = 7.0;
      variants[0].scores = { alignment: 7, depth: 7, actionability: 7, distinctiveness: 7 };
      variants[0].summary = 'Single variant — no competition';
      return { survivors: variants, archived: [], winnerId: variants[0].id };
    }

    // Evaluate all variants via LLM
    const evalPrompt = buildEvaluationPrompt(
      variants.map(v => ({
        title: v.title,
        content: v.content,
        authorName: v.agentSlug,
        archetype: template.archetype,
      })),
      room.name,
      template.archetype,
    );

    const evalResponse = await this.llm.call([
      { role: 'system', content: 'You are a critical evaluator. Score drafts precisely and return ONLY JSON.' },
      { role: 'user', content: evalPrompt },
    ], { jsonMode: true });

    const evalResults = parseEvaluationResponse(evalResponse.content, variants.length);

    // Apply scores to variants
    for (let i = 0; i < variants.length; i++) {
      const result = evalResults[i];
      variants[i].fitness = result.fitness;
      variants[i].scores = result.scores;
      variants[i].summary = result.summary;
    }

    // Select survivors
    const { survivors, archived } = selectSurvivors(variants, survivorCount);

    // Store all variants
    for (const v of variants) {
      await this.storage.writeArtifact(v.id, v.content);
    }

    // Mark winner
    const winnerId = survivors[0]?.id ?? variants[0].id;

    this.events.emit({
      type: 'artifact:created',
      timestamp: new Date().toISOString(),
      data: {
        winnerId,
        totalVariants: variants.length,
        survivorCount: survivors.length,
        archivedCount: archived.length,
      },
    });

    return { survivors, archived, winnerId };
  }
}
