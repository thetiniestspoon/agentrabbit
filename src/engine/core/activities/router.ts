import type { LLMAdapter } from '../../adapters/llm/types.js';
import { getActivitiesForPhase } from './taxonomy.js';

export interface AgentState {
  id: string;
  name: string;
  slug: string;
  archetype: string;
  status: 'idle' | 'active' | 'fatigued';
  isMeta: boolean;
  goals?: string[];
  performanceScore?: number;
  fatigueCount?: number;
}

export interface ProjectContext {
  projectName: string;
  phase: 'divergent' | 'convergent' | 'elevation';
  round: number;
  pendingTasks: Array<{ id: string; title: string; priority: string }>;
  recentArtifacts: Array<{ id: string; title: string; type: string; status: string; authorSlug: string }>;
  recentHistory: Array<{ type: string; title: string; description?: string }>;
  governanceMode?: string;
}

export interface ActivityAssignment {
  agentId: string;
  agentName: string;
  activity: string;
  reasoning: string;
  taskId?: string;
  artifactId?: string;
  chatMessage?: string;
  [key: string]: unknown;
}

export interface ActivityRouterOptions {
  llm: LLMAdapter;
}

export class ActivityRouter {
  private llm: LLMAdapter;

  constructor(options: ActivityRouterOptions) {
    this.llm = options.llm;
  }

  async route(agents: AgentState[], context: ProjectContext): Promise<ActivityAssignment[]> {
    const idleAgents = agents.filter(a => a.status === 'idle');
    if (idleAgents.length === 0) return [];

    const phaseActivities = getActivitiesForPhase(context.phase);
    const activityList = phaseActivities
      .map((a, i) => `${i + 1}. "${a.name}" — ${a.description}${a.metaOnly ? ' [META ONLY]' : ''}${a.idleOnly ? ' [IDLE ONLY]' : ''}`)
      .join('\n');

    const agentList = idleAgents.map(a => {
      const meta = a.isMeta ? ' [META AGENT]' : '';
      const goals = a.goals?.length ? `\n    Goals: ${a.goals.join('; ')}` : '';
      return `- ${a.name} (${a.archetype})${meta} [id: ${a.id}]${goals}`;
    }).join('\n');

    const taskList = context.pendingTasks.map(t =>
      `- "${t.title}" (priority: ${t.priority}) [id: ${t.id}]`
    ).join('\n') || 'No pending tasks';

    const artifactList = context.recentArtifacts.map(a =>
      `- "${a.title}" (${a.type}, ${a.status}) by ${a.authorSlug} [id: ${a.id}]`
    ).join('\n') || 'No artifacts yet';

    const systemPrompt = `You are the Overseer — an orchestration AI managing project "${context.projectName}".
Round ${context.round}. Phase: ${context.phase.toUpperCase()}.

Assign each idle agent ONE activity. Rules:
- META AGENTS do quality_review or judge_competition only
- Prefer pick_up_task when tasks exist matching the agent's expertise
- Each agent gets exactly one activity
- Return ONLY a JSON object: { "assignments": [...] }

Available activities:
${activityList}

Idle agents:
${agentList}

Pending tasks:
${taskList}

Recent artifacts:
${artifactList}`;

    const response = await this.llm.call([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: 'Assign activities to each idle agent. Return JSON.' },
    ], { jsonMode: true });

    try {
      const cleaned = response.content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      const parsed = JSON.parse(cleaned);
      const assignments = Array.isArray(parsed.assignments) ? parsed.assignments : [];
      return assignments.map((a: Record<string, unknown>) => ({
        agentId: (a.agent_id as string) ?? '',
        agentName: (a.agent_name as string) ?? '',
        activity: (a.activity as string) ?? 'discuss_in_chat',
        reasoning: (a.reasoning as string) ?? '',
        taskId: a.task_id as string | undefined,
        artifactId: a.artifact_id as string | undefined,
        chatMessage: a.chat_message as string | undefined,
        ...a,
      }));
    } catch {
      return [];
    }
  }
}
