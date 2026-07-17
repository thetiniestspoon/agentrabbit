import type { EventAdapter, EngineEvent } from './types.js';

const ICONS: Record<string, string> = {
  'swarm:initialized': '[init]',
  'room:started': '[room]',
  'room:completed': '[done]',
  'room:failed': '[fail]',
  'agent:executing': '[agent]',
  'agent:completed': '[done]',
  'artifact:created': '[artifact]',
  'phase:transition': '[phase]',
  'gate:pending': '[gate]',
  'gate:approved': '[gate]',
  'error': '[error]',
};

export class CLIEvents implements EventAdapter {
  emit(event: EngineEvent): void {
    const icon = ICONS[event.type] ?? '[event]';
    const summary = this.summarize(event);
    console.log(`${icon} ${event.type}: ${summary}`);
  }

  private summarize(event: EngineEvent): string {
    const d = event.data;
    switch (event.type) {
      case 'swarm:initialized':
        return `Swarm ready — ${d.agentCount} agents, ${d.roomCount} rooms`;
      case 'room:started':
        return `${d.name ?? d.roomId}`;
      case 'room:completed':
        return `${d.name ?? d.roomId} — ${d.artifactCount} artifacts`;
      case 'agent:executing':
        return `${d.agentSlug} in ${d.roomName}`;
      case 'agent:completed':
        return `${d.agentSlug} — artifact: ${d.artifactTitle}`;
      case 'artifact:created':
        return `${d.title} (${d.agentSlug})`;
      case 'phase:transition':
        return `${d.from} → ${d.to}`;
      case 'gate:pending':
        return `Waiting for approval: ${d.gate}`;
      case 'gate:approved':
        return `Approved: ${d.gate}`;
      case 'error':
        return `${d.message}`;
      default:
        return JSON.stringify(d);
    }
  }
}
