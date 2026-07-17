export interface EvaluationScores {
  alignment: number;
  depth: number;
  actionability: number;
  distinctiveness: number;
}

export interface DimensionWeights {
  alignment: number;
  depth: number;
  actionability: number;
  distinctiveness: number;
}

export interface EvaluationResult {
  variantIndex: number;
  scores: EvaluationScores;
  fitness: number;
  summary: string;
}

/**
 * Archetype-specific dimension weights.
 */
export function getArchetypeWeights(archetype: string): DimensionWeights {
  switch (archetype) {
    case 'researcher':
    case 'analyst':
      return { alignment: 0.25, depth: 0.35, actionability: 0.20, distinctiveness: 0.20 };
    case 'creative':
      return { alignment: 0.20, depth: 0.25, actionability: 0.20, distinctiveness: 0.35 };
    case 'strategist':
      return { alignment: 0.25, depth: 0.20, actionability: 0.35, distinctiveness: 0.20 };
    default:
      return { alignment: 0.25, depth: 0.25, actionability: 0.25, distinctiveness: 0.25 };
  }
}

export function computeWeightedFitness(scores: EvaluationScores, weights: DimensionWeights): number {
  return (
    scores.alignment * weights.alignment +
    scores.depth * weights.depth +
    scores.actionability * weights.actionability +
    scores.distinctiveness * weights.distinctiveness
  );
}

export function parseEvaluationResponse(raw: string, variantCount: number): EvaluationResult[] {
  try {
    const cleaned = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) throw new Error('Not an array');

    return Array.from({ length: variantCount }, (_, i) => {
      const result = parsed[i] ?? parsed.find((r: any) => r.variant_index === i);
      return {
        variantIndex: i,
        scores: result?.scores ?? { alignment: 5, depth: 5, actionability: 5, distinctiveness: 5 },
        fitness: typeof result?.fitness === 'number' ? result.fitness : 5.0,
        summary: result?.summary ?? '',
      };
    });
  } catch {
    return Array.from({ length: variantCount }, (_, i) => ({
      variantIndex: i,
      scores: { alignment: 5, depth: 5, actionability: 5, distinctiveness: 5 },
      fitness: 5.0,
      summary: 'Evaluation parse failed',
    }));
  }
}

export interface VariantForEval {
  title: string;
  content: string;
  authorName: string;
  archetype: string;
}

export function buildEvaluationPrompt(
  variants: VariantForEval[],
  roomDescription: string,
  dominantArchetype: string,
): string {
  const weights = getArchetypeWeights(dominantArchetype);
  const weightNote =
    `Alignment (${Math.round(weights.alignment * 100)}%), ` +
    `Depth (${Math.round(weights.depth * 100)}%), ` +
    `Actionability (${Math.round(weights.actionability * 100)}%), ` +
    `Distinctiveness (${Math.round(weights.distinctiveness * 100)}%).`;

  const variantTexts = variants.map((v, i) =>
    `--- DRAFT ${i} (by ${v.authorName}, ${v.archetype}) ---\nTitle: ${v.title}\n${v.content.slice(0, 1500)}\n--- END DRAFT ${i} ---`
  ).join('\n\n');

  return `You are evaluating ${variants.length} competing drafts for the task: "${roomDescription}".

EVALUATION RUBRIC:
1. Alignment (does it serve the stated project goals?)
2. Depth (is this substantive rather than surface-level?)
3. Actionability (can someone act on this output?)
4. Distinctiveness (does this bring a unique perspective vs the other drafts?)

Dimension weights: ${weightNote}

Score EACH draft independently on each dimension (1-10, be critical — most work scores 4-7). Then compute a weighted fitness score.
Return ONLY a JSON array — one entry per draft, in order:
[
  { "variant_index": 0, "scores": { "alignment": <1-10>, "depth": <1-10>, "actionability": <1-10>, "distinctiveness": <1-10> }, "fitness": <weighted average>, "summary": "one sentence assessment" }
]

${variantTexts}`;
}
