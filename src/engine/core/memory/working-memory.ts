import type { LLMAdapter } from '../../adapters/llm/types.js';
import type { StorageAdapter } from '../../adapters/storage/types.js';
import type { MemoryEntry, WorkingMemoryState } from '../../types.js';

const MAX_ENTRIES = 20;

export interface WorkingMemoryOptions {
  llm: LLMAdapter;
  storage: StorageAdapter;
}

export interface ExtractOptions {
  agentName: string;
  archetype: string;
  action: string;
  artifactSlice: string;
  contextSlice: string;
}

/**
 * Auto-promote hypotheses to pinned insights when a takeaway confirms them.
 * Promotion rule: >40% of hypothesis words (length > 3) appear in a takeaway.
 */
export function autoPromoteHypotheses(wm: WorkingMemoryState, newEntry: MemoryEntry): void {
  const allHypotheses = wm.entries.flatMap(e => e.hypotheses ?? []);

  for (const takeaway of newEntry.takeaways) {
    const takeawayLower = takeaway.toLowerCase();
    for (const hyp of allHypotheses) {
      const hypWords = hyp.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const matchCount = hypWords.filter(w => takeawayLower.includes(w)).length;
      if (hypWords.length > 0 && matchCount / hypWords.length > 0.4) {
        const promoted = `Confirmed: ${hyp} (evidence: ${takeaway})`;
        if (!wm.pinned.includes(promoted) && wm.pinned.length < 5) {
          wm.pinned.push(promoted);
        }
      }
    }
  }
}

/**
 * Format working memory for prompt injection.
 */
export function formatMemoryForInjection(wm: WorkingMemoryState, maxEntries = 5): string {
  const parts: string[] = ['[YOUR WORKING MEMORY]'];

  if (wm.pinned?.length) {
    parts.push(`Pinned insights: ${wm.pinned.join('; ')}`);
  }

  if (wm.goals?.length) {
    parts.push(`Current goals: ${wm.goals.map((g, i) => `${i + 1}. ${g}`).join(' ')}`);
  }

  if (wm.entries?.length) {
    const recent = wm.entries.slice(-maxEntries);
    parts.push('Recent memory:');
    for (const e of recent) {
      const line = `- ${e.action}`;
      const details: string[] = [];
      if (e.takeaways?.length) details.push(`Takeaways: ${e.takeaways.join('; ')}`);
      if (e.openQuestions?.length) details.push(`Questions: ${e.openQuestions.join('; ')}`);
      if (e.hypotheses?.length) details.push(`Hypotheses: ${e.hypotheses.join('; ')}`);
      parts.push(details.length ? `${line} | ${details.join(' | ')}` : line);
    }
  }

  parts.push('[END WORKING MEMORY]');
  return parts.join('\n');
}

/**
 * Parse LLM extraction response into structured memory entry.
 */
export function parseMemoryExtraction(raw: string): { entry: MemoryEntry; goals: string[] } | null {
  try {
    const cleaned = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(cleaned);

    const entry: MemoryEntry = {
      timestamp: new Date().toISOString(),
      action: '',
      takeaways: Array.isArray(parsed.takeaways) ? parsed.takeaways.slice(0, 4) : [],
      openQuestions: Array.isArray(parsed.open_questions) ? parsed.open_questions.slice(0, 3) : [],
      hypotheses: Array.isArray(parsed.hypotheses) ? parsed.hypotheses.slice(0, 2) : [],
      processReflection: typeof parsed.process_reflection === 'string' ? parsed.process_reflection : undefined,
    };

    const goals = Array.isArray(parsed.goals) ? parsed.goals.slice(0, 3) : [];
    return { entry, goals };
  } catch {
    return null;
  }
}

/**
 * Build the LLM prompt for memory extraction.
 */
export function buildExtractionPrompt(agentName: string, archetype: string): string {
  return `You are ${agentName} (${archetype}). You just completed an action. Extract your working memory concisely. Return ONLY a JSON object with these fields:
- takeaways: 2-4 key insights from this action (strings)
- open_questions: 1-3 unresolved questions (strings)
- hypotheses: 1-2 working theories worth tracking (strings)
- process_reflection: 1 sentence reflecting on your approach — was the framing right? What would you do differently?
- goals: 1-3 things you want to investigate or work on next (strings)

Be specific and project-relevant. No generic filler.`;
}

export class WorkingMemoryManager {
  private llm: LLMAdapter;
  private storage: StorageAdapter;

  constructor(options: WorkingMemoryOptions) {
    this.llm = options.llm;
    this.storage = options.storage;
  }

  /**
   * Extract working memory from an agent's completed action via LLM.
   */
  async extract(options: ExtractOptions): Promise<{ entry: MemoryEntry; goals: string[] } | null> {
    const { agentName, archetype, action, artifactSlice, contextSlice } = options;

    try {
      const response = await this.llm.call([
        { role: 'system', content: buildExtractionPrompt(agentName, archetype) },
        {
          role: 'user',
          content: `Action completed: ${action}\n\n${artifactSlice ? `Output excerpt:\n${artifactSlice}\n` : ''}${contextSlice ? `Project context:\n${contextSlice}` : ''}\n\nExtract your working memory. Return ONLY JSON.`,
        },
      ], { maxTokens: 512 });

      const result = parseMemoryExtraction(response.content);
      if (result) {
        result.entry.action = action;
      }
      return result;
    } catch {
      return null;
    }
  }

  /**
   * Update stored working memory with a new entry, run auto-promotion, persist.
   */
  async update(agentSlug: string, newEntry: MemoryEntry, newGoals: string[]): Promise<void> {
    const raw = await this.storage.readMemory(agentSlug);
    const wm: WorkingMemoryState = (raw as unknown as WorkingMemoryState) ?? {
      entries: [],
      pinned: [],
      goals: [],
    };

    // Append entry, evict oldest if over cap
    wm.entries.push(newEntry);
    if (wm.entries.length > MAX_ENTRIES) {
      wm.entries = wm.entries.slice(-MAX_ENTRIES);
    }

    // Update goals
    wm.goals = newGoals;

    // Auto-promote hypotheses
    autoPromoteHypotheses(wm, newEntry);

    await this.storage.writeMemory(agentSlug, wm as unknown as Record<string, unknown>);
  }

  /**
   * Get formatted memory for prompt injection.
   */
  async getForInjection(agentSlug: string): Promise<string | null> {
    const raw = await this.storage.readMemory(agentSlug);
    if (!raw) return null;
    const wm = raw as unknown as WorkingMemoryState;
    return formatMemoryForInjection(wm);
  }
}
