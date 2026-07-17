export interface StorageAdapter {
  // Config
  readConfig(): Promise<Record<string, unknown> | null>;
  writeConfig(config: Record<string, unknown>): Promise<void>;

  // Team
  readTeam(): Promise<Record<string, unknown>[] | null>;
  writeTeam(team: Record<string, unknown>[]): Promise<void>;

  // Rooms
  readRooms(): Promise<Record<string, unknown>[] | null>;
  writeRooms(rooms: Record<string, unknown>[]): Promise<void>;

  // State
  readState(): Promise<Record<string, unknown> | null>;
  writeState(state: Record<string, unknown>): Promise<void>;

  // Artifacts
  writeArtifact(id: string, content: string): Promise<void>;
  readArtifact(id: string): Promise<string | null>;
  listArtifacts(): Promise<string[]>;

  // Memory
  readMemory(agentSlug: string): Promise<Record<string, unknown> | null>;
  writeMemory(agentSlug: string, memory: Record<string, unknown>): Promise<void>;

  // Reputation
  readReputation(): Promise<Record<string, unknown> | null>;
  writeReputation(reputation: Record<string, unknown>): Promise<void>;
}
