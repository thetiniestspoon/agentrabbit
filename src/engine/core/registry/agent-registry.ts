import { createRequire } from 'node:module';
import type { AgentTemplate, Archetype } from '../../types.js';

const require = createRequire(import.meta.url);
const templateData: AgentTemplate[] = require('../../templates/registry.json');

export class AgentRegistry {
  private templates: AgentTemplate[];

  constructor(customTemplates?: AgentTemplate[]) {
    this.templates = customTemplates ?? templateData;
  }

  all(): AgentTemplate[] {
    return [...this.templates];
  }

  getBySlug(slug: string): AgentTemplate | null {
    return this.templates.find(t => t.slug === slug) ?? null;
  }

  filterByArchetype(archetype: Archetype): AgentTemplate[] {
    return this.templates.filter(t => t.archetype === archetype);
  }

  filterByCategory(category: string): AgentTemplate[] {
    return this.templates.filter(
      t => t.category.toLowerCase() === category.toLowerCase()
    );
  }

  search(query: string): AgentTemplate[] {
    const terms = query.toLowerCase().split(/\s+/);
    return this.templates.filter(t => {
      const searchable = [
        t.name, t.description, t.category,
        ...t.capabilities,
      ].join(' ').toLowerCase();
      return terms.some(term => searchable.includes(term));
    });
  }

  getMetaAgents(): AgentTemplate[] {
    return this.templates.filter(t => t.isMeta === true);
  }
}
