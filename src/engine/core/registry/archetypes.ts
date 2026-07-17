import { createRequire } from 'node:module';
import type { Archetype, Tempo, StreamWeights } from '../../types.js';

const require = createRequire(import.meta.url);
const archetypeData = require('../../templates/archetypes.json');

export interface ArchetypeDefinition {
  id: Archetype;
  name: string;
  description: string;
  tempo: Tempo;
  defaultStreamWeights: StreamWeights;
  blendWeights: StreamWeights;
}

export const ARCHETYPES: ArchetypeDefinition[] = archetypeData.archetypes as ArchetypeDefinition[];

export function getArchetype(id: Archetype): ArchetypeDefinition {
  const arch = ARCHETYPES.find(a => a.id === id);
  if (!arch) throw new Error(`Unknown archetype: ${id}`);
  return arch;
}

export function getArchetypeTempo(id: Archetype): Tempo {
  return getArchetype(id).tempo;
}
