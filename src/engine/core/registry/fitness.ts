import type { AgentTemplate } from '../../types.js';

/**
 * Score how well an agent template fits a task description.
 * Uses keyword overlap between task and template capabilities/description.
 * Returns a score from 0 to 1.
 */
export function scoreFitness(template: AgentTemplate, taskDescription: string): number {
  const taskWords = new Set(
    taskDescription.toLowerCase().split(/\s+/).filter(w => w.length > 3)
  );

  const templateWords = [
    template.name,
    template.description,
    ...template.capabilities,
  ].join(' ').toLowerCase().split(/\s+/).filter(w => w.length > 3);

  if (templateWords.length === 0) return 0;

  const matches = templateWords.filter(w => taskWords.has(w)).length;
  return matches / templateWords.length;
}

/**
 * Rank all templates by fitness for a task, return top N.
 */
export function rankTemplates(
  templates: AgentTemplate[],
  taskDescription: string,
  topN: number = 10
): { template: AgentTemplate; score: number }[] {
  return templates
    .map(template => ({ template, score: scoreFitness(template, taskDescription) }))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}
