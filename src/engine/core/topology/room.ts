import { randomUUID } from 'node:crypto';
import type { Room, BranchingStrategy } from '../../types.js';

export interface RoomDefinition {
  name: string;
  agentSlugs: string[];
  dependsOn?: string[];
  branchingConfig?: {
    strategy: BranchingStrategy;
    variantCount: number;
    survivorCount: number;
  };
}

export class RoomBuilder {
  createRoom(def: RoomDefinition): Room {
    return {
      id: randomUUID(),
      name: def.name,
      agentSlugs: def.agentSlugs,
      upstream: [],
      downstream: [],
      status: 'pending',
      branchingConfig: def.branchingConfig,
    };
  }

  buildDAG(definitions: RoomDefinition[]): Room[] {
    // Create all rooms
    const nameToRoom = new Map<string, Room>();
    const rooms: Room[] = [];

    for (const def of definitions) {
      const room = this.createRoom(def);
      nameToRoom.set(def.name, room);
      rooms.push(room);
    }

    // Wire dependencies
    for (const def of definitions) {
      if (!def.dependsOn) continue;
      const room = nameToRoom.get(def.name)!;

      for (const depName of def.dependsOn) {
        const upstream = nameToRoom.get(depName);
        if (!upstream) {
          throw new Error(`Room "${def.name}" depends on unknown room "${depName}"`);
        }
        room.upstream.push(upstream.id);
        upstream.downstream.push(room.id);
      }
    }

    // Cycle detection via DFS
    this.detectCycles(rooms);

    return rooms;
  }

  private detectCycles(rooms: Room[]) {
    const visited = new Set<string>();
    const inStack = new Set<string>();
    const roomMap = new Map(rooms.map(r => [r.id, r]));

    const dfs = (id: string) => {
      if (inStack.has(id)) throw new Error(`Cycle detected involving room ${id}`);
      if (visited.has(id)) return;

      visited.add(id);
      inStack.add(id);

      const room = roomMap.get(id)!;
      for (const downId of room.downstream) {
        dfs(downId);
      }

      inStack.delete(id);
    };

    for (const room of rooms) {
      dfs(room.id);
    }
  }
}
