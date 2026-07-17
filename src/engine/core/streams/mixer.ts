/**
 * Manifold Constrained Hyperconnections (mHC) — Stream Mixing Utilities
 *
 * Implements 4 functional streams (research, synthesis, critique, design) with
 * doubly stochastic mixing at room boundaries via Sinkhorn-Knopp projection.
 *
 * Three mixing matrices:
 *   H_res  — strict (Birkhoff polytope) — room boundary redistribution
 *   H_pre  — soft (archetype weights) — how agents read from streams
 *   H_post — soft (archetype defaults) — how agents write to streams
 */

import type { StreamName } from '../../types.js';

export type { StreamWeights } from '../../types.js';

/** 4x4 row-major matrix */
export type MixingMatrix = number[][];

// ── Constants ────────────────────────────────────────────────────────────

export const STREAM_NAMES: readonly StreamName[] = ['research', 'synthesis', 'critique', 'design'] as const;

export const UNIFORM_WEIGHTS = {
  research: 0.25, synthesis: 0.25, critique: 0.25, design: 0.25,
} as const;

export const IDENTITY_MATRIX: MixingMatrix = [
  [1, 0, 0, 0],
  [0, 1, 0, 0],
  [0, 0, 1, 0],
  [0, 0, 0, 1],
];

// ── Sinkhorn-Knopp Projection ────────────────────────────────────────────

/**
 * Project a positive matrix onto the Birkhoff polytope (set of doubly stochastic
 * matrices) via the Sinkhorn-Knopp algorithm. Alternately normalizes rows and
 * columns until convergence.
 */
export function sinkhornKnopp(
  matrix: MixingMatrix,
  maxIterations = 20,
  epsilon = 1e-6,
): MixingMatrix {
  const n = matrix.length;
  // Clone and ensure all entries are positive
  let A = matrix.map((row) => row.map((v) => Math.max(v, 1e-10)));

  for (let iter = 0; iter < maxIterations; iter++) {
    // Normalize rows
    for (let i = 0; i < n; i++) {
      const rowSum = A[i].reduce((s, v) => s + v, 0);
      if (rowSum > 0) A[i] = A[i].map((v) => v / rowSum);
    }
    // Normalize columns
    for (let j = 0; j < n; j++) {
      const colSum = A.reduce((s, row) => s + row[j], 0);
      if (colSum > 0) {
        for (let i = 0; i < n; i++) A[i][j] /= colSum;
      }
    }
    // Check convergence
    let maxDeviation = 0;
    for (let i = 0; i < n; i++) {
      maxDeviation = Math.max(
        maxDeviation,
        Math.abs(A[i].reduce((s, v) => s + v, 0) - 1),
      );
    }
    for (let j = 0; j < n; j++) {
      const colSum = A.reduce((s, row) => s + row[j], 0);
      maxDeviation = Math.max(maxDeviation, Math.abs(colSum - 1));
    }
    if (maxDeviation < epsilon) break;
  }
  return A;
}

// ── H_pre: Archetype Blend Weights (how agents READ streams) ─────────────

export const ARCHETYPE_BLEND_WEIGHTS: Record<string, Record<StreamName, number>> = {
  researcher:   { research: 0.45, synthesis: 0.20, critique: 0.20, design: 0.15 },
  analyst:      { research: 0.35, synthesis: 0.15, critique: 0.35, design: 0.15 },
  strategist:   { research: 0.20, synthesis: 0.30, critique: 0.15, design: 0.35 },
  creative:     { research: 0.15, synthesis: 0.35, critique: 0.10, design: 0.40 },
  critic:       { research: 0.20, synthesis: 0.10, critique: 0.55, design: 0.15 },
  synthesizer:  { research: 0.20, synthesis: 0.45, critique: 0.20, design: 0.15 },
  designer:     { research: 0.10, synthesis: 0.15, critique: 0.10, design: 0.65 },
  engagement:   { research: 0.25, synthesis: 0.30, critique: 0.25, design: 0.20 },
  facilitator:  { research: 0.25, synthesis: 0.30, critique: 0.25, design: 0.20 },
  prototyper:   { research: 0.10, synthesis: 0.15, critique: 0.10, design: 0.65 },
};

// ── H_post: Archetype Output Weights (how agents WRITE to streams) ───────

export const ARCHETYPE_OUTPUT_WEIGHTS: Record<string, Record<StreamName, number>> = {
  researcher:   { research: 0.65, synthesis: 0.15, critique: 0.15, design: 0.05 },
  analyst:      { research: 0.50, synthesis: 0.10, critique: 0.35, design: 0.05 },
  strategist:   { research: 0.15, synthesis: 0.25, critique: 0.10, design: 0.50 },
  creative:     { research: 0.05, synthesis: 0.30, critique: 0.05, design: 0.60 },
  critic:       { research: 0.15, synthesis: 0.10, critique: 0.60, design: 0.15 },
  synthesizer:  { research: 0.10, synthesis: 0.60, critique: 0.15, design: 0.15 },
  designer:     { research: 0.05, synthesis: 0.10, critique: 0.05, design: 0.80 },
  engagement:   { research: 0.15, synthesis: 0.35, critique: 0.20, design: 0.30 },
  facilitator:  { research: 0.15, synthesis: 0.35, critique: 0.20, design: 0.30 },
  prototyper:   { research: 0.05, synthesis: 0.10, critique: 0.05, design: 0.80 },
};

/** Artifact type can shift output weights */
const ARTIFACT_TYPE_SHIFTS: Partial<Record<string, Partial<Record<StreamName, number>>>> = {
  research:    { research: 0.20 },
  analysis:    { research: 0.15, critique: 0.10 },
  critique:    { critique: 0.25 },
  review:      { critique: 0.20 },
  framework:   { synthesis: 0.20 },
  synthesis:   { synthesis: 0.25 },
  strategy:    { design: 0.15, synthesis: 0.10 },
  design:      { design: 0.20 },
  blueprint:   { design: 0.20 },
  plan:        { design: 0.15, synthesis: 0.10 },
  reference:   { research: 0.10 },
};

// ── H_res: Default Mixing Matrices (per dominant archetype) ──────────────

const RAW_MIXING_PRESETS: Record<string, MixingMatrix> = {
  research_heavy: [
    [0.55, 0.15, 0.20, 0.10],
    [0.15, 0.55, 0.15, 0.15],
    [0.20, 0.15, 0.50, 0.15],
    [0.10, 0.15, 0.15, 0.60],
  ],
  uniform: [
    [0.25, 0.25, 0.25, 0.25],
    [0.25, 0.25, 0.25, 0.25],
    [0.25, 0.25, 0.25, 0.25],
    [0.25, 0.25, 0.25, 0.25],
  ],
  critique_focused: [
    [0.50, 0.15, 0.25, 0.10],
    [0.15, 0.50, 0.25, 0.10],
    [0.15, 0.15, 0.55, 0.15],
    [0.10, 0.15, 0.20, 0.55],
  ],
  design_focused: [
    [0.50, 0.15, 0.15, 0.20],
    [0.15, 0.45, 0.15, 0.25],
    [0.15, 0.15, 0.55, 0.15],
    [0.15, 0.20, 0.10, 0.55],
  ],
  identity: [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ],
};

// Pre-normalize all presets
export const MIXING_PRESETS: Record<string, MixingMatrix> = Object.fromEntries(
  Object.entries(RAW_MIXING_PRESETS).map(([key, matrix]) => [
    key,
    key === 'identity' ? matrix : sinkhornKnopp(matrix),
  ]),
);

/** Map dominant archetype to a default mixing preset */
export const ARCHETYPE_DEFAULT_PRESET: Record<string, string> = {
  researcher: 'research_heavy',
  analyst: 'research_heavy',
  strategist: 'design_focused',
  creative: 'uniform',
  critic: 'critique_focused',
  synthesizer: 'uniform',
  designer: 'design_focused',
  engagement: 'uniform',
  facilitator: 'uniform',
  prototyper: 'design_focused',
};

// ── Core Stream Functions ────────────────────────────────────────────────

/** Normalize weights so they sum to 1.0 */
export function normalizeWeights(weights: Record<StreamName, number>): Record<StreamName, number> {
  const total = STREAM_NAMES.reduce((s, k) => s + (weights[k] || 0), 0);
  if (total <= 0) return { ...UNIFORM_WEIGHTS };
  return Object.fromEntries(
    STREAM_NAMES.map((k) => [k, (weights[k] || 0) / total]),
  ) as Record<StreamName, number>;
}

/** Get H_pre blend weights for an archetype */
export function getAgentBlendWeights(archetype: string): Record<StreamName, number> {
  return ARCHETYPE_BLEND_WEIGHTS[archetype] || { ...UNIFORM_WEIGHTS };
}

/**
 * H_post: Classify an artifact's stream distribution based on its creator's
 * archetype and the artifact's type.
 */
export function classifyArtifactStreams(
  archetype: string,
  artifactType?: string,
): Record<StreamName, number> {
  const base = { ...(ARCHETYPE_OUTPUT_WEIGHTS[archetype] || UNIFORM_WEIGHTS) };
  const typeShift = artifactType ? ARTIFACT_TYPE_SHIFTS[artifactType] : undefined;
  if (typeShift) {
    for (const [key, delta] of Object.entries(typeShift)) {
      base[key as StreamName] = (base[key as StreamName] || 0) + (delta || 0);
    }
  }
  return normalizeWeights(base);
}

/**
 * Compute the aggregate stream state from a set of upstream artifacts.
 * Each artifact's stream_weights contributes proportionally.
 * Then applies the H_res mixing matrix.
 */
export function computeStreamState(
  artifacts: Array<{ stream_weights?: Record<StreamName, number>; content?: unknown }>,
  mixingMatrix?: MixingMatrix | null,
): Record<StreamName, number> {
  if (artifacts.length === 0) return { ...UNIFORM_WEIGHTS };

  // Aggregate upstream stream weights (simple average)
  const aggregate: Record<StreamName, number> = { research: 0, synthesis: 0, critique: 0, design: 0 };
  for (const a of artifacts) {
    const w = a.stream_weights || UNIFORM_WEIGHTS;
    for (const s of STREAM_NAMES) {
      aggregate[s] += w[s] || 0.25;
    }
  }
  // Normalize to sum=1
  const normalized = normalizeWeights(aggregate);

  // Apply H_res mixing matrix if provided
  if (!mixingMatrix) return normalized;

  const inputVec = STREAM_NAMES.map((s) => normalized[s]);
  const outputVec = [0, 0, 0, 0];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      outputVec[i] += (mixingMatrix[i]?.[j] ?? (i === j ? 1 : 0)) * inputVec[j];
    }
  }
  const result = Object.fromEntries(
    STREAM_NAMES.map((s, i) => [s, outputVec[i]]),
  ) as Record<StreamName, number>;
  return normalizeWeights(result);
}

/**
 * Build stream-sectioned context from upstream artifacts.
 * Returns formatted string with artifacts organized by stream,
 * with token budgets proportional to the agent's blend weights.
 */
export function buildStreamSectionedContext(
  artifacts: Array<{
    stream_weights?: Record<StreamName, number>;
    type?: string;
    title?: string;
    description?: string;
    content?: unknown;
  }>,
  agentBlendWeights: Record<StreamName, number>,
  totalCharBudget = 6000,
): string {
  if (artifacts.length === 0) return '';

  const streamLabels: Record<StreamName, string> = {
    research: 'RESEARCH STREAM (findings, evidence, data)',
    synthesis: 'SYNTHESIS STREAM (frameworks, narratives, combinations)',
    critique: 'CRITIQUE STREAM (evaluations, risks, gaps)',
    design: 'DESIGN STREAM (solutions, implementations, deliverables)',
  };

  const sections: string[] = [];

  for (const stream of STREAM_NAMES) {
    const charBudget = Math.floor(totalCharBudget * agentBlendWeights[stream]);
    if (charBudget < 100) continue;

    const scored = artifacts
      .map((a) => ({
        artifact: a,
        weight: a.stream_weights?.[stream] ?? 0.25,
      }))
      .filter((s) => s.weight > 0.1)
      .sort((a, b) => b.weight - a.weight);

    if (scored.length === 0) continue;

    const sectionParts: string[] = [`=== ${streamLabels[stream]} ===`];
    let usedChars = 0;

    for (const { artifact: a, weight } of scored) {
      if (usedChars >= charBudget) break;
      const contentRaw = typeof a.content === 'string'
        ? a.content
        : a.content
        ? JSON.stringify(a.content)
        : 'empty';
      const remaining = charBudget - usedChars;
      const preview = contentRaw.slice(0, Math.min(remaining, 800));
      const weightPct = Math.round(weight * 100);
      sectionParts.push(
        `  - [${a.type || 'unknown'}] "${a.title || 'Untitled'}" (${weightPct}%): ${a.description || ''}\n    ${preview}`,
      );
      usedChars += preview.length + 100;
    }

    sections.push(sectionParts.join('\n'));
  }

  return sections.join('\n\n');
}

/**
 * Get the mixing matrix for a room connection.
 * Falls back through: stored matrix -> archetype preset -> identity.
 */
export function getMixingMatrix(
  storedMatrix?: MixingMatrix | null,
  mixingBias?: string | null,
  dominantArchetype?: string | null,
): MixingMatrix {
  // 1. Explicit stored matrix (Sinkhorn-normalize for safety)
  if (storedMatrix && Array.isArray(storedMatrix) && storedMatrix.length === 4) {
    return sinkhornKnopp(storedMatrix);
  }
  // 2. Named preset from mixing_bias
  if (mixingBias && MIXING_PRESETS[mixingBias]) {
    return MIXING_PRESETS[mixingBias];
  }
  // 3. Archetype default
  if (dominantArchetype) {
    const preset = ARCHETYPE_DEFAULT_PRESET[dominantArchetype];
    if (preset && MIXING_PRESETS[preset]) {
      return MIXING_PRESETS[preset];
    }
  }
  // 4. Identity (no mixing)
  return IDENTITY_MATRIX;
}

/**
 * Shift stream weights for a divergent variant (evolution).
 * Rotates the dominant stream to a different one.
 */
export function shiftWeightsForDivergent(parent: Record<StreamName, number>): Record<StreamName, number> {
  const entries = STREAM_NAMES.map((s) => ({ stream: s, weight: parent[s] }));
  entries.sort((a, b) => b.weight - a.weight);
  const shifted = { ...parent };
  const top = entries[0].stream;
  const second = entries[1].stream;
  shifted[top] = parent[second];
  shifted[second] = parent[top];
  return normalizeWeights(shifted);
}

/**
 * Compute stream diversity score for a set of artifacts.
 * Higher = more evenly distributed across streams.
 * Returns 0-1 where 1 = perfectly uniform distribution.
 */
export function streamDiversityScore(
  artifacts: Array<{ stream_weights?: Record<StreamName, number> }>,
): number {
  if (artifacts.length === 0) return 1;
  // Find each artifact's dominant stream
  const dominantCounts: Record<StreamName, number> = {
    research: 0, synthesis: 0, critique: 0, design: 0,
  };
  for (const a of artifacts) {
    const w = a.stream_weights || UNIFORM_WEIGHTS;
    let maxStream: StreamName = 'research';
    let maxVal = 0;
    for (const s of STREAM_NAMES) {
      if (w[s] > maxVal) { maxVal = w[s]; maxStream = s; }
    }
    dominantCounts[maxStream]++;
  }
  // Shannon entropy normalized to [0, 1]
  const total = artifacts.length;
  let entropy = 0;
  for (const s of STREAM_NAMES) {
    const p = dominantCounts[s] / total;
    if (p > 0) entropy -= p * Math.log2(p);
  }
  return entropy / 2; // max entropy for 4 categories = 2 bits
}
