import fs from 'node:fs/promises';
import path from 'node:path';
import type { StorageAdapter } from './types.js';

export interface FileStorageOptions {
  root: string;
}

export class FileStorage implements StorageAdapter {
  private root: string;

  constructor(options: FileStorageOptions) {
    this.root = options.root;
  }

  async readConfig() { return this.readJson('config.json'); }
  async writeConfig(config: Record<string, unknown>) { return this.writeJson('config.json', config); }

  async readTeam() { return this.readJson('team.json') as Promise<Record<string, unknown>[] | null>; }
  async writeTeam(team: Record<string, unknown>[]) { return this.writeJson('team.json', team); }

  async readRooms() { return this.readJson('rooms.json') as Promise<Record<string, unknown>[] | null>; }
  async writeRooms(rooms: Record<string, unknown>[]) { return this.writeJson('rooms.json', rooms); }

  async readState() { return this.readJson('state.json'); }
  async writeState(state: Record<string, unknown>) { return this.writeJson('state.json', state); }

  async writeArtifact(id: string, content: string) {
    const dir = path.join(this.root, 'artifacts');
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, `${id}.md`), content, 'utf-8');
  }

  async readArtifact(id: string): Promise<string | null> {
    try {
      return await fs.readFile(path.join(this.root, 'artifacts', `${id}.md`), 'utf-8');
    } catch {
      return null;
    }
  }

  async listArtifacts(): Promise<string[]> {
    try {
      const files = await fs.readdir(path.join(this.root, 'artifacts'));
      return files.filter(f => f.endsWith('.md')).map(f => f.replace('.md', ''));
    } catch {
      return [];
    }
  }

  async readMemory(agentSlug: string) {
    return this.readJson(path.join('memory', `${agentSlug}.json`));
  }

  async writeMemory(agentSlug: string, memory: Record<string, unknown>) {
    return this.writeJson(path.join('memory', `${agentSlug}.json`), memory);
  }

  async readReputation() { return this.readJson('reputation.json'); }
  async writeReputation(reputation: Record<string, unknown>) { return this.writeJson('reputation.json', reputation); }

  private async readJson(relativePath: string): Promise<Record<string, unknown> | null> {
    try {
      const raw = await fs.readFile(path.join(this.root, relativePath), 'utf-8');
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  private async writeJson(relativePath: string, data: unknown): Promise<void> {
    const fullPath = path.join(this.root, relativePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, JSON.stringify(data, null, 2), 'utf-8');
  }
}
