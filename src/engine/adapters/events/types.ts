export type EventType =
  | 'swarm:initialized'
  | 'room:started' | 'room:completed' | 'room:failed'
  | 'agent:executing' | 'agent:completed'
  | 'artifact:created'
  | 'phase:transition'
  | 'gate:pending' | 'gate:approved'
  | 'branching:started' | 'branching:evaluated' | 'branching:selected'
  | 'memory:extracted' | 'memory:promoted'
  | 'overseer:round' | 'overseer:completed'
  | 'error';

export interface EngineEvent {
  type: EventType;
  timestamp: string;
  data: Record<string, unknown>;
}

export interface EventAdapter {
  emit(event: EngineEvent): void;
}
