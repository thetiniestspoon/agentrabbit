export interface PhaseStats {
  totalTasks: number;
  doneTasks: number;
  artifactCount: number;
  approvedCount: number;
  archivedCount: number;
  avgQualityScore: number | null;
}

/**
 * Detect current project phase based on task completion and artifact metrics.
 *
 * Thresholds:
 * - Elevation: taskRatio >= 0.85, artifactCount >= 3, quality >= 6 (or null)
 * - Convergent: taskRatio >= 0.4 OR activeArtifacts >= 12
 * - Divergent: everything else
 */
export function detectPhase(stats: PhaseStats): 'divergent' | 'convergent' | 'elevation' {
  const taskRatio = stats.totalTasks > 0 ? stats.doneTasks / stats.totalTasks : 0;
  const activeArtifacts = stats.artifactCount - stats.archivedCount;

  // Elevation: most tasks done, decent artifact quality, enough artifacts
  if (
    taskRatio >= 0.85 &&
    stats.artifactCount >= 3 &&
    (stats.avgQualityScore === null || stats.avgQualityScore >= 6)
  ) {
    return 'elevation';
  }

  // Convergent: many active artifacts or majority of tasks progressing
  if (taskRatio >= 0.4 || activeArtifacts >= 12) {
    return 'convergent';
  }

  // Divergent: early stage
  return 'divergent';
}
