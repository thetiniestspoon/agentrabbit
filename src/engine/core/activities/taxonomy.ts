export interface ActivityType {
  name: string;
  description: string;
  metaOnly: boolean;
  idleOnly: boolean;
  phases: ('divergent' | 'convergent' | 'elevation')[];
  requiredFields: string[];
}

/**
 * 30 activity types defining the full action vocabulary for agents.
 */
export const ACTIVITY_TYPES: ActivityType[] = [
  { name: 'pick_up_task', description: 'Agent takes a backlog/todo task, produces an artifact deliverable', metaOnly: false, idleOnly: false, phases: ['divergent', 'convergent'], requiredFields: ['task_id'] },
  { name: 'discuss_in_chat', description: 'Agent posts a substantive message to a channel', metaOnly: false, idleOnly: false, phases: ['divergent', 'convergent', 'elevation'], requiredFields: ['chat_message'] },
  { name: 'review_artifact', description: 'Agent reads a peer artifact and posts constructive critique', metaOnly: false, idleOnly: false, phases: ['divergent', 'convergent', 'elevation'], requiredFields: ['artifact_id'] },
  { name: 'create_branch', description: 'Agent proposes an exploratory direction as a new branch', metaOnly: false, idleOnly: false, phases: ['divergent'], requiredFields: ['branch_name', 'branch_description'] },
  { name: 'summarize_history', description: 'Agent reviews recent events and posts a status update', metaOnly: false, idleOnly: false, phases: ['divergent', 'convergent', 'elevation'], requiredFields: [] },
  { name: 'generate_tasks', description: 'Agent generates 3-5 new actionable follow-on tasks', metaOnly: false, idleOnly: false, phases: ['divergent', 'convergent'], requiredFields: ['generated_tasks'] },
  { name: 'quality_review', description: 'Meta agent scores a completed artifact (0-10)', metaOnly: true, idleOnly: false, phases: ['divergent', 'convergent', 'elevation'], requiredFields: ['artifact_id'] },
  { name: 'judge_competition', description: 'Critic/synthesizer compares two competing artifacts', metaOnly: true, idleOnly: false, phases: ['convergent', 'elevation'], requiredFields: ['artifact_id', 'competing_artifact_id'] },
  { name: 'initiate_debate', description: 'Critic/analyst opens a structured debate on a claim', metaOnly: false, idleOnly: false, phases: ['divergent', 'convergent'], requiredFields: ['artifact_id', 'debate_topic'] },
  { name: 'contribute_to_debate', description: 'Agent argues a position in an open debate', metaOnly: false, idleOnly: false, phases: ['divergent', 'convergent'], requiredFields: ['debate_id', 'debate_stance', 'debate_argument'] },
  { name: 'resolve_debate', description: 'Synthesizer/facilitator closes a debate with synthesis', metaOnly: false, idleOnly: false, phases: ['convergent', 'elevation'], requiredFields: ['debate_id'] },
  { name: 'consolidate_artifacts', description: 'Scan for duplicates, archive old, create consolidated index', metaOnly: false, idleOnly: false, phases: ['convergent', 'elevation'], requiredFields: [] },
  { name: 'elevate_deliverables', description: 'Final delivery: select top artifacts, create synthesis', metaOnly: false, idleOnly: false, phases: ['elevation'], requiredFields: [] },
  { name: 'request_upstream_revision', description: 'Flag an upstream artifact for revision', metaOnly: false, idleOnly: false, phases: ['convergent'], requiredFields: ['artifact_id', 'revision_reason'] },
  { name: 'cross_pollinate', description: 'Read 2+ artifacts from different rooms and produce synthesis', metaOnly: false, idleOnly: false, phases: ['divergent', 'convergent'], requiredFields: ['source_artifact_ids'] },
  { name: 'milestone_checkin', description: 'CEL posts progress update to stakeholder', metaOnly: false, idleOnly: false, phases: ['divergent', 'convergent', 'elevation'], requiredFields: ['checkin_summary'] },
  { name: 'alignment_check', description: 'Compare artifacts against project charter', metaOnly: false, idleOnly: false, phases: ['convergent', 'elevation'], requiredFields: ['artifact_id'] },
  { name: 'execute_orchestrator_task', description: 'Pick up and execute an orchestrator task', metaOnly: false, idleOnly: false, phases: ['divergent', 'convergent', 'elevation'], requiredFields: ['orchestrator_task_id'] },
  { name: 'explore_branch', description: 'Explore an existing branch with sandbox artifacts', metaOnly: false, idleOnly: false, phases: ['divergent'], requiredFields: ['branch_id'] },
  { name: 'propose_branch_merge', description: 'Propose merging branch learnings back to main', metaOnly: false, idleOnly: false, phases: ['convergent'], requiredFields: ['branch_id', 'merge_summary'] },
  // Low-priority idle activities (21-30)
  { name: 'sticky_note', description: 'Brief 1-3 sentence observation as sandbox artifact', metaOnly: false, idleOnly: true, phases: ['divergent', 'convergent', 'elevation'], requiredFields: ['note_content'] },
  { name: 'water_cooler_riff', description: 'Two idle agents have casual exchange', metaOnly: false, idleOnly: true, phases: ['divergent', 'convergent', 'elevation'], requiredFields: ['partner_agent_id', 'topic'] },
  { name: 'margin_notes', description: 'Brief 1-2 sentence annotation on a peer artifact', metaOnly: false, idleOnly: true, phases: ['divergent', 'convergent', 'elevation'], requiredFields: ['artifact_id', 'annotation_text'] },
  { name: 'sketchbook_doodle', description: 'Creative/designer produces rough sandbox concept', metaOnly: false, idleOnly: true, phases: ['divergent', 'convergent'], requiredFields: ['note_content'] },
  { name: 'sandbox_proposal', description: 'Propose a sandbox experiment to the user', metaOnly: false, idleOnly: true, phases: ['divergent'], requiredFields: ['proposal_text'] },
  { name: 'connection_mapping', description: 'Trace relationships between artifacts', metaOnly: false, idleOnly: true, phases: ['convergent', 'elevation'], requiredFields: ['note_content'] },
  { name: 'devils_workshop', description: 'Critic writes contrarian note on high-scoring artifact', metaOnly: false, idleOnly: true, phases: ['convergent'], requiredFields: ['artifact_id', 'note_content'] },
  { name: 'hallway_pitch', description: 'Casual summary of latest work', metaOnly: false, idleOnly: true, phases: ['divergent', 'convergent', 'elevation'], requiredFields: ['chat_message'] },
  { name: 'inner_monologue', description: 'Internal reflection while idle', metaOnly: false, idleOnly: true, phases: ['divergent', 'convergent', 'elevation'], requiredFields: ['inner_thought'] },
  { name: 'pattern_scan', description: 'Read observations and check for coherent insight cluster', metaOnly: false, idleOnly: true, phases: ['convergent', 'elevation'], requiredFields: ['target_agent_id'] },
];

export function getActivity(name: string): ActivityType | null {
  return ACTIVITY_TYPES.find(a => a.name === name) ?? null;
}

export function isMetaOnly(name: string): boolean {
  return getActivity(name)?.metaOnly ?? false;
}

export function isIdleActivity(name: string): boolean {
  return getActivity(name)?.idleOnly ?? false;
}

export function getActivitiesForPhase(phase: 'divergent' | 'convergent' | 'elevation'): ActivityType[] {
  return ACTIVITY_TYPES.filter(a => a.phases.includes(phase));
}
