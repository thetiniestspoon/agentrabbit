import type { EventAdapter, EngineEvent } from './types.js';

/**
 * Silent event adapter for server-side execution.
 * Collects events in memory for optional logging/debugging.
 * Does not print to console (unlike CLIEvents).
 */
export class SilentEvents implements EventAdapter {
  private events: EngineEvent[] = [];

  emit(event: EngineEvent): void {
    this.events.push(event);
  }

  /** Get all events collected during execution */
  getAll(): EngineEvent[] {
    return [...this.events];
  }

  /** Get events of a specific type */
  getByType(type: EngineEvent['type']): EngineEvent[] {
    return this.events.filter(e => e.type === type);
  }

  /** Check if any errors occurred */
  hasErrors(): boolean {
    return this.events.some(e => e.type === 'error');
  }
}
