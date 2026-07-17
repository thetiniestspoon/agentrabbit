import type { Room } from '../../types.js';

/**
 * Topological sort of rooms by dependency order (Kahn's algorithm).
 * Rooms with no upstream dependencies come first.
 */
export function topoSort(rooms: Room[]): Room[] {
  if (rooms.length === 0) return [];

  const roomMap = new Map(rooms.map(r => [r.id, r]));
  const inDegree = new Map<string, number>();
  const queue: string[] = [];
  const result: Room[] = [];

  // Initialize in-degrees
  for (const room of rooms) {
    inDegree.set(room.id, room.upstream.length);
    if (room.upstream.length === 0) {
      queue.push(room.id);
    }
  }

  // Process queue
  while (queue.length > 0) {
    const id = queue.shift()!;
    const room = roomMap.get(id)!;
    result.push(room);

    for (const downId of room.downstream) {
      const deg = (inDegree.get(downId) ?? 0) - 1;
      inDegree.set(downId, deg);
      if (deg === 0) {
        queue.push(downId);
      }
    }
  }

  if (result.length !== rooms.length) {
    throw new Error('Cycle detected in room topology');
  }

  return result;
}
