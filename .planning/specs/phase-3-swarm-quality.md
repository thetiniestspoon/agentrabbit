# Phase 3: Swarm Quality Integration

**Agent role:** Backend agent
**Depends on:** Phase 1-2 (complete)
**Goal:** Deep agents produce visibly better output than quick agents

## Tasks

### 1. Improve Room Prompts
The current deep agent execution uses generic room prompts (research, analysis, critique, synthesis). Each agent should have custom room prompts tailored to their domain:

- Meal Planner: dietary research -> recipe curation -> budget/nutrition review -> plan assembly
- Invoice Drafter: info extraction -> layout design -> completeness check -> final assembly  
- Event Coordinator: requirements gathering -> logistics planning -> risk review -> final plan

Update the swarm_config in ar_agents table to include per-room system prompts.

### 2. Quality Scoring
After swarm execution, add a quality pass that evaluates the output before returning it to the user. If quality is below threshold, retry the synthesis step.

Use the Foundry Engine's evaluation module:
- `buildEvaluationPrompt()` 
- `parseEvaluationResponse()`
- `computeWeightedFitness()`

### 3. Response Formatting
Deep agent output should be consistently formatted:
- Clean markdown headers
- Actionable checklists (not just lists)
- Summary section at the top
- Estimated costs/times where applicable

### 4. A/B Comparison
Create a test harness that runs the same input through quick (single prompt) and deep (swarm) modes, then compares output quality. Document the results in .planning/reviews/.

### 5. /fourminds Review Gate
Before marking Phase 3 complete, invoke /fourminds to evaluate deep agent output quality as a focus group. Document their feedback in .planning/reviews/phase-3-fourminds.md.

## Success Criteria
- Deep agents produce output that is measurably richer (more sections, more detail, fewer gaps)
- Quality scoring catches poor outputs and triggers retry
- /fourminds council approves quality bar
