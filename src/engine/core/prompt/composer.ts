import type { AgentTemplate, Artifact } from '../../types.js';

interface MemoryContext {
  pinned: string[];
  goals: string[];
  entries: { takeaways?: string[]; openQuestions?: string[]; hypotheses?: string[] }[];
}

export interface ComposeOptions {
  template: AgentTemplate;
  taskContext: string;
  upstreamArtifacts?: Artifact[];
  workingMemory?: MemoryContext;
  additionalInstructions?: string;
}

export class PromptComposer {
  compose(options: ComposeOptions): string {
    const sections: string[] = [];

    // Role section
    sections.push(`[ROLE]\n${options.template.systemPrompt}`);

    // Task section
    sections.push(`[TASK]\n${options.taskContext}`);

    // Upstream artifacts
    if (options.upstreamArtifacts?.length) {
      const artifactSections = options.upstreamArtifacts.map(a =>
        `### ${a.title} (by ${a.agentSlug})\n${a.content}`
      ).join('\n\n');
      sections.push(`[UPSTREAM WORK]\nBuild on the following artifacts from upstream agents:\n\n${artifactSections}`);
    }

    // Working memory
    if (options.workingMemory) {
      sections.push(this.formatMemory(options.workingMemory));
    }

    // Additional instructions
    if (options.additionalInstructions) {
      sections.push(`[INSTRUCTIONS]\n${options.additionalInstructions}`);
    }

    // Output format
    sections.push(
      `[OUTPUT FORMAT]\nRespond with a JSON object:\n` +
      `{\n` +
      `  "title": "artifact title",\n` +
      `  "content": "your full analysis/output in markdown",\n` +
      `  "takeaways": ["2-4 key insights from your work"],\n` +
      `  "openQuestions": ["1-3 unresolved questions"],\n` +
      `  "hypotheses": ["1-2 working theories"]\n` +
      `}`
    );

    return sections.join('\n\n');
  }

  private formatMemory(memory: MemoryContext): string {
    const parts: string[] = ['[YOUR WORKING MEMORY]'];

    if (memory.pinned.length > 0) {
      parts.push('Pinned insights:\n' + memory.pinned.map(p => `- ${p}`).join('\n'));
    }

    if (memory.goals.length > 0) {
      parts.push('Current goals:\n' + memory.goals.map(g => `- ${g}`).join('\n'));
    }

    const recentEntries = memory.entries.slice(-5);
    if (recentEntries.length > 0) {
      const formatted = recentEntries.map(e => {
        const lines: string[] = [];
        if (e.takeaways?.length) lines.push('Takeaways: ' + e.takeaways.join('; '));
        if (e.openQuestions?.length) lines.push('Questions: ' + e.openQuestions.join('; '));
        if (e.hypotheses?.length) lines.push('Hypotheses: ' + e.hypotheses.join('; '));
        return lines.join('\n');
      }).join('\n---\n');
      parts.push('Recent memory:\n' + formatted);
    }

    parts.push('[END WORKING MEMORY]');
    return parts.join('\n\n');
  }
}
