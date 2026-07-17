import type { StorageAdapter } from './types.js';

/**
 * In-memory storage adapter for serverless/edge function execution.
 * State lives only for the duration of the request — no filesystem needed.
 * Results are captured and returned, then persisted to Supabase by the caller.
 */
export class MemoryStorage implements StorageAdapter {
  private config: Record<string, unknown> | null = null;
  private rooms: Record<string, unknown>[] | null = null;
  private state: Record<string, unknown> | null = null;
  private team: Record<string, unknown>[] | null = null;
  private artifacts: Map<string, string> = new Map();
  private memories: Map<string, Record<string, unknown>> = new Map();
  private reputation: Record<string, unknown> | null = null;

  async writeConfig(config: Record<string, unknown>): Promise<void> {
    this.config = config;
  }
  async readConfig(): Promise<Record<string, unknown> | null> {
    return this.config;
  }

  async writeRooms(rooms: Record<string, unknown>[]): Promise<void> {
    this.rooms = rooms;
  }
  async readRooms(): Promise<Record<string, unknown>[] | null> {
    return this.rooms;
  }

  async writeState(state: Record<string, unknown>): Promise<void> {
    this.state = state;
  }
  async readState(): Promise<Record<string, unknown> | null> {
    return this.state;
  }

  async writeTeam(team: Record<string, unknown>[]): Promise<void> {
    this.team = team;
  }
  async readTeam(): Promise<Record<string, unknown>[] | null> {
    return this.team;
  }

  async writeArtifact(id: string, content: string): Promise<void> {
    this.artifacts.set(id, content);
  }
  async readArtifact(id: string): Promise<string | null> {
    return this.artifacts.get(id) ?? null;
  }
  async listArtifacts(): Promise<string[]> {
    return Array.from(this.artifacts.keys());
  }

  async writeMemory(agentSlug: string, memory: Record<string, unknown>): Promise<void> {
    this.memories.set(agentSlug, memory);
  }
  async readMemory(agentSlug: string): Promise<Record<string, unknown> | null> {
    return this.memories.get(agentSlug) ?? null;
  }

  async writeReputation(reputation: Record<string, unknown>): Promise<void> {
    this.reputation = reputation;
  }
  async readReputation(): Promise<Record<string, unknown> | null> {
    return this.reputation;
  }

  /** Get all artifacts collected during execution */
  getAllArtifacts(): Map<string, string> {
    return new Map(this.artifacts);
  }
}
