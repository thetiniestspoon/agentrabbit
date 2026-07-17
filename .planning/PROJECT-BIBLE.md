# AgentRabbit Project Bible

> The canonical plan for building a self-sustaining, then growing, agent-powered system.
> Every agent session starts by reading this file. Every agent session ends by updating CHECKPOINT.md.

**Last updated:** 2026-04-03
**Owner:** Shawn (human) + orchestrator agent
**Comms folder:** `C:\Users\shawn\Dropbox\Foundry-Satellite\satellite-Dropbox\AgentRabbit`

---

## 1. Vision

AgentRabbit is a pay-per-use AI agent marketplace where non-technical people "hire" agents like they'd hire TaskRabbit helpers. The system must:

1. **Self-sustain** — generate $500+/mo to cover all platform costs (Supabase, Vercel, LLM Gateway, Claude Code, GitHub)
2. **Grow** — fund continued creation and exploration of new agents, new products, new ideas

The competitive advantage is the **Foundry Engine** — a multi-agent swarm orchestrator that makes AgentRabbit's output meaningfully better than single-prompt competitors. Users see one clean result; behind it, a team of specialized agents researched, analyzed, critiqued, and synthesized.

---

## 2. Revenue Model

### Pricing

| Tier | Type | Price | LLM Cost | Margin | Example |
|------|------|-------|----------|--------|---------|
| Quick | Single-prompt | $0.50-1.00 | ~$0.03 | ~$0.45-0.95 | Grocery list, simple lookup |
| Deep | Swarm-backed | $2.00-5.00 | ~$0.20-0.40 | ~$1.60-4.60 | Meal plan, event coordination |

### Credit Packs (Stripe)

| Pack | Price | Credits | Bonus |
|------|-------|---------|-------|
| Starter | $5 | 500 | -- |
| Builder | $10 | 1,100 | 10% bonus |
| Power | $25 | 3,000 | 20% bonus |

Credits are denominated in cents. A $0.50 quick agent costs 50 credits. A $3.00 deep agent costs 300 credits.

### Free Tier

- 3 free **quick agent** runs per day (single-prompt only, no swarm)
- Resets at midnight UTC
- Requires account (Magic Link auth) to prevent abuse
- Free runs are tracked; after 3, user sees credit pack upsell
- No free deep/swarm agents ever

### Break-Even Math

$500/mo target at average $2/hire (blended quick+deep) = **250 paid hires/month**
At 30 days = ~8-9 paid hires/day
At 5% free-to-paid conversion with 100 daily active users = ~5 paid hires/day + growth

---

## 3. Technical Architecture

### Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React 19 + Vite + Tailwind + shadcn/ui | Existing repo |
| Backend | Supabase (shared with Turnkey) | Project: xebulbfhwyezjrqobzow |
| Agent Execution | Foundry Engine (vendored) | Copied into repo, not npm |
| LLM | LLM Gateway (api.llmgateway.io) | Multi-model support |
| Payments | Stripe | Credit pack checkout + webhooks |
| Auth | Supabase Magic Link | Email-based, no passwords |
| Hosting | GitHub Pages (landing) + Vercel (API/Edge) | Split deployment |
| Comms | Dropbox satellite folder | Human-agent coordination |

### Supabase Schema (AgentRabbit tables in Turnkey instance)

All AgentRabbit tables are prefixed with `ar_` to avoid collision with Turnkey's real estate tables.

```sql
-- Core tables
ar_profiles          -- user profiles, linked to Supabase Auth
ar_agents            -- agent definitions (name, type, config, swarm_config)
ar_credit_balances   -- per-user credit balance
ar_credit_purchases  -- Stripe purchase log
ar_hires             -- execution log (agent, user, input, output, credits_spent, duration)
ar_free_runs         -- daily free run tracker (user_id, date, count)

-- Future
ar_agent_ratings     -- user ratings per hire
ar_agent_reputation  -- Foundry Engine reputation scores
```

### Foundry Engine Integration

The engine is vendored at `src/engine/` (copied from foundry-engine repo). Each agent has a swarm configuration:

```typescript
// Quick agent: single prompt, no swarm
{ type: 'quick', prompt: '...', model: 'gemini-2.5-flash' }

// Deep agent: swarm-backed
{
  type: 'deep',
  swarmConfig: {
    scale: 'focused',        // 3-5 agents
    governance: 'autonomous', // no human gates
    rooms: [
      { name: 'research', archetype: 'researcher' },
      { name: 'analysis', archetype: 'analyst' },
      { name: 'critique', archetype: 'critic' },
      { name: 'synthesis', archetype: 'synthesizer' }
    ]
  }
}
```

### Deployment Architecture

```
GitHub Pages (thetiniestspoon.github.io/agentrabbit/)
  -> Landing page, agent browser, account UI
  -> Static React SPA

Vercel (agentrabbit-api.vercel.app or similar)
  -> API routes for agent execution
  -> Stripe webhooks
  -> Foundry Engine runs server-side

Supabase (xebulbfhwyezjrqobzow)
  -> Auth (Magic Link)
  -> Database (ar_* tables)
  -> Edge Functions (credit management, hire logging)
  -> Realtime (activity feed)
```

---

## 4. Agent Coordination Architecture

### Three Roles

```
ORCHESTRATOR (this terminal or any terminal reading this file)
  |
  |-- coordinates, tracks progress, makes architectural decisions
  |-- owns .planning/ directory and CHECKPOINT.md
  |-- calls /fourminds for design reviews
  |-- surfaces decisions to Shawn via Dropbox comms folder
  |
  +-- FRONTEND AGENT (worktree or branch: frontend/*)
  |     |-- UI components, pages, routing
  |     |-- Works from UI specs in .planning/specs/
  |     |-- Commits to feature branches
  |     |-- Reports status to .planning/CHECKPOINT.md
  |
  +-- BACKEND AGENT (worktree or branch: backend/*)
        |-- Supabase schema, Edge Functions, Stripe, Engine
        |-- Works from API specs in .planning/specs/
        |-- Commits to feature branches
        |-- Reports status to .planning/CHECKPOINT.md
```

### Coordination Protocol

1. **Orchestrator** writes specs to `.planning/specs/` before assigning work
2. **Agents** read their spec, execute, commit to feature branch
3. **Agents** update `.planning/CHECKPOINT.md` with status before stopping
4. **Orchestrator** merges branches, runs integration checks
5. **/fourminds** is invoked for design reviews at phase gates

### Shared State (How Agents Stay in Sync)

All coordination happens through files, never conversation memory:

| File | Purpose | Who Writes | Who Reads |
|------|---------|-----------|-----------|
| `.planning/PROJECT-BIBLE.md` | This file. The plan. | Orchestrator | Everyone |
| `.planning/CHECKPOINT.md` | Current state, who did what, what's next | All agents | All agents |
| `.planning/DECISIONS.md` | Log of architectural decisions with rationale | Orchestrator | All agents |
| `.planning/specs/*.md` | Task specs for frontend/backend agents | Orchestrator | Assigned agent |
| `.planning/reviews/*.md` | /fourminds review outputs | Fourminds | Orchestrator |
| `Dropbox/.../AgentRabbit/` | Human-agent comms, mobile review | Shawn + Orchestrator | Both |

### The Dropbox Comms Protocol

The folder at `C:\Users\shawn\Dropbox\Foundry-Satellite\satellite-Dropbox\AgentRabbit` serves as a bidirectional channel:

**Agent -> Shawn (decisions needed):**
- Write `NEEDS-DECISION-{topic}.md` files with context + options
- Write `REVIEW-{feature}.html` for visual review on mobile
- Write `STATUS.md` with current progress summary

**Shawn -> Agent (input provided):**
- Drop files into `input/` subfolder for agents to pick up
- Edit `NEEDS-DECISION-*.md` files with chosen option
- Create `DIRECTIVE-{topic}.md` for ad-hoc instructions

**Convention:** Agents check the Dropbox folder at the start and end of every session. Processed files are moved to `Dropbox/.../AgentRabbit/archive/`.

---

## 5. Resilience Protocol (Power Drop Recovery)

### The Problem
Any terminal can die at any time. Work must not be lost. The next agent must be able to pick up seamlessly.

### The Solution: CHECKPOINT.md

Every agent writes to `.planning/CHECKPOINT.md` at these moments:
- **Session start** — "I'm starting, here's what I plan to do"
- **After each commit** — "I completed X, next is Y"
- **Session end** — "I stopped here, next agent should do Z"
- **Before any risky operation** — "About to do X, rollback plan is Y"

### CHECKPOINT.md Format

```markdown
# AgentRabbit Checkpoint

## Last Updated
2026-04-XX HH:MM by [agent-role]

## Current Phase
Phase X: [name]

## Completed This Session
- [ ] Task description (commit: abc1234)
- [x] Task description (commit: def5678)

## In Progress
- Task description — stopped at [specific point], next step is [specific action]

## Blockers
- [HUMAN] Need Stripe API keys — requested via Dropbox NEEDS-DECISION
- [TECH] Edge Function failing on X — see error in .planning/debug/

## Next Session Should
1. First priority
2. Second priority
3. Third priority

## Branch State
- main: last known good (commit xyz)
- frontend/credit-ui: in progress, 3 commits ahead of main
- backend/stripe-integration: complete, ready for merge
```

### Recovery Procedure (Any Agent, Any Terminal)

```
1. Read .planning/PROJECT-BIBLE.md    (understand the mission)
2. Read .planning/CHECKPOINT.md       (understand current state)
3. Run: git status && git log --oneline -10  (verify branch state)
4. Check Dropbox comms folder          (any human input waiting?)
5. Pick up from "Next Session Should"  (resume work)
```

---

## 6. Execution Phases

### Phase 0: Foundation (Orchestrator, ~1 session)
**Goal:** Set up shared infrastructure so frontend/backend agents can work independently.

- [ ] Create Dropbox comms folder structure (input/, archive/)
- [ ] Initialize CHECKPOINT.md
- [ ] Create DECISIONS.md
- [ ] Write specs for Phase 1 frontend and backend work
- [ ] Vendor Foundry Engine into `src/engine/`
- [ ] Set up Vercel project for API routes
- [ ] ~~**[HUMAN]** Shawn creates Stripe account~~ **BLOCKED: Totem needs EIN first (DEC-009)**

**Gate:** Specs written, engine vendored, Vercel project exists.

### Phase 1: Backend Core (Backend Agent, ~2 sessions)
**Goal:** Database, auth, and credit system working.

- [ ] Create ar_* tables in Turnkey Supabase (via MCP)
- [ ] Implement Magic Link auth flow
- [ ] Build credit balance system (add/deduct/check)
- [ ] Build free run tracker (3/day limit)
- [ ] Create Edge Function: `ar-execute-quick` (single-prompt agent)
- [ ] Create Edge Function: `ar-execute-deep` (swarm agent via Foundry Engine)
- [ ] Create Edge Function: `ar-stripe-webhook` (credit purchase handler)
- [ ] ~~**[HUMAN]** Shawn sets Stripe keys~~ **BLOCKED: EIN (DEC-009)** — use mock credits for testing

**Gate:** Can execute a quick agent and a deep agent via API. Credits deducted correctly (mock balance).

### Phase 2: Frontend Core (Frontend Agent, ~2 sessions)
**Goal:** Users can browse, sign up, buy credits, and hire agents.

- [ ] Auth pages (Magic Link sign-in/sign-up)
- [ ] Credit pack purchase flow (Stripe Checkout redirect)
- [ ] Agent detail page: "Hire" button wired to backend
- [ ] Result display: render agent output beautifully
- [ ] Credit balance display in header
- [ ] Free run counter ("2 of 3 free runs remaining today")
- [ ] Activity feed (recent hires with results)

**Gate:** End-to-end flow works: sign up -> buy credits -> hire agent -> see result.

### Phase 3: Swarm Integration (Backend Agent, ~2 sessions)
**Goal:** Deep agents produce visibly better output than quick agents.

- [ ] Vendor and configure Foundry Engine with LLM Gateway adapter
- [ ] Build swarm configs for each of the 5 launch agents
- [ ] Implement result quality scoring (pass/fail/retry)
- [ ] Build swarm execution Edge Function with timeout handling
- [ ] A/B comparison: same prompt, quick vs deep output quality
- [ ] **[REVIEW]** /fourminds council evaluates deep agent output quality

**Gate:** Deep agents demonstrably better. /fourminds approves quality bar.

### Phase 4: Launch Prep (Orchestrator + All, ~1 session)
**Goal:** Production-ready for real users.

- [ ] Stripe: switch from test to live keys
- [ ] Error handling and graceful failures
- [ ] Rate limiting and abuse prevention
- [ ] Privacy policy and terms of service pages
- [ ] Landing page copy refresh (update from validation to live product)
- [ ] Mobile responsiveness pass
- [ ] **[HUMAN]** Shawn reviews final product, gives "ship it" call
- [ ] **[REVIEW]** /fourminds council: "Would you pay for this?"

**Gate:** Shawn says ship it.

### Phase 5: Launch & Learn (Orchestrator, ongoing)
**Goal:** Real users, real revenue, real feedback.

- [ ] Deploy to production
- [ ] Share with Dan for advisor feedback
- [ ] Monitor: hires/day, revenue/day, error rate
- [ ] Build feedback pipeline: user ratings -> agent improvement
- [ ] Add new agents based on demand signals
- [ ] **[HUMAN]** Shawn handles marketing/outreach

**Ongoing metric:** $500/mo revenue target.

### Phase 6: CivicKit Grant Track (Parallel, Month 5+)
**Goal:** Get CivicLens live with real data, pilot with Beacon, apply for Mozilla grant.

- [ ] CivicLens: integrate Congress.gov API (replace demo data)
- [ ] Deploy CivicLens to production
- [ ] **[HUMAN]** Shawn engages Beacon UU as pilot org
- [ ] Collect pilot metrics over 2-3 months
- [ ] **[HUMAN]** Shawn writes Mozilla Democracy x AI application
- [ ] Target: Mozilla cohort 2027 (~Jan/Feb 2027 deadline)

---

## 7. Agent Launch Roster

### Day 1 Agents (5)

| Agent | Tier | Credits | Swarm Config |
|-------|------|---------|-------------|
| Meal Planner | Deep | 200 ($2) | researcher (dietary) + analyst (budget) + critic (allergens) + synthesizer |
| Invoice Drafter | Deep | 300 ($3) | researcher (line items) + designer (layout) + critic (completeness) + synthesizer |
| Event Coordinator | Deep | 250 ($2.50) | researcher (logistics) + strategist (timeline) + critic (conflicts) + synthesizer |
| Appointment Organizer | Quick | 50 ($0.50) | Single prompt: calendar + conflict detection |
| Weekly Digest | Quick | 50 ($0.50) | Single prompt: curated summary from user topics |

### Expansion Agents (post-launch, based on demand)

| Agent | Tier | Idea |
|-------|------|------|
| Resume Tailor | Deep | Match resume to job posting |
| Meeting Notes | Quick | Summarize meeting from transcript |
| Social Post Writer | Quick | Platform-specific social content |
| Budget Analyzer | Deep | Categorize and analyze spending |
| Cover Letter | Deep | Personalized cover letter from job + resume |
| Lesson Planner | Deep | Teacher curriculum planning |
| Gift Finder | Quick | Gift suggestions from constraints |

---

## 8. Decision Log

Decisions are logged in `.planning/DECISIONS.md` with this format:

```markdown
### DEC-001: Credit packs over per-transaction pricing
**Date:** 2026-04-03
**Decided by:** Shawn
**Rationale:** Stripe's $0.30 fixed fee kills micro-transaction margins. Credit packs batch the fee.
**Impact:** Need credit balance system, pack tiers, upsell UI.
```

### Founding Decisions (Pre-Build)

| ID | Decision | Rationale |
|----|----------|-----------|
| DEC-001 | Credit packs, not per-transaction | Stripe fee economics |
| DEC-002 | 3 free quick agents/day | Balance acquisition vs cost (~$0.09/user/day) |
| DEC-003 | Foundry Engine vendored, not npm | Simplicity, no publish step, self-contained |
| DEC-004 | Shared Turnkey Supabase, ar_ prefix | Reduce instance count, share auth infra |
| DEC-005 | Dan is advisor, not contributor | Plan for solo + agents build |
| DEC-006 | Swarm from day one for deep agents | Differentiation is the product |
| DEC-007 | GSD workflow, /fourminds at gates | Proven process + design review |
| DEC-008 | Dropbox folder as comms line | Mobile-accessible, async, bidirectional |

---

## 9. Human Gates Checklist

These are the moments where Shawn's input is required. Everything else is agent-autonomous.

### Before Phase 1 (One Evening)
- [ ] ~~Create Stripe account~~ **BLOCKED: Totem EIN pending (DEC-009)**
- [ ] ~~Share Stripe test API keys~~ **BLOCKED: see above**
- [x] Confirm credit pack pricing ($5 / $10 / $25) — confirmed 2026-04-03
- [x] Confirm agent roster and pricing — confirmed 2026-04-03

### Before Phase 4 (30 min)
- [ ] Review product in browser
- [ ] Approve terms of service / privacy policy drafts
- [ ] Switch Stripe to live mode, share live keys
- [ ] Say "ship it"

### Phase 5+ (30-60 min/week)
- [ ] Weekly review of metrics and agent output quality
- [ ] Approve new agents before they go live
- [ ] Handle marketing / social / outreach
- [ ] Beacon pilot outreach (month 5-6)
- [ ] Grant application (month 7-9)

---

## 10. CivicKit Grant Strategy

### Target: Mozilla Democracy x AI Cohort 2027

**Amount:** $50,000 (Tier I), up to $250,000 (Tier II follow-on)
**Deadline:** ~Feb/Mar 2027 (based on 2026 cycle)
**Open source required:** Yes (CivicKit is AGPL/MIT dual-licensed)

### Why CivicKit Qualifies

Mozilla's three focus areas and CivicKit's match:
1. "Information ecosystem resilience" -> CivicLens (legislation tracking, promise tracker)
2. "Institutional transparency" -> BallotKit + PressAgent (government data, FOIA)
3. "Civic space protection" -> MutualAid OS (community organizing, anonymous-first)

### What Strengthens the Application
- Working product (not a pitch deck)
- Self-hostable (Docker Compose) — data sovereignty
- Trauma-informed UX — genuine accessibility commitment
- Pilot data from Beacon UU congregation
- Open source with contributor pathway

### Prep Timeline
| Month | Action | Owner |
|-------|--------|-------|
| 5 | CivicLens live with Congress.gov data | Agents |
| 6 | Deploy to Beacon, begin pilot | Shawn |
| 7-8 | Collect pilot metrics, user feedback | Shawn + Agents |
| 9 | Draft application, prepare budget | Shawn |
| 10 | Submit to Mozilla | Shawn |

---

## 11. Success Metrics

### Self-Sustaining (Phase 5, Month 3-4)
- [ ] 250+ paid hires/month
- [ ] $500+/mo gross revenue
- [ ] <5% error rate on agent execution
- [ ] >50% of deep agent users return within 7 days

### Growing (Phase 5+, Month 6+)
- [ ] 10+ agents live
- [ ] $1,000+/mo revenue
- [ ] Positive unit economics on every agent
- [ ] CivicKit pilot running with real users
- [ ] Mozilla grant application submitted

### Long-Term (Month 12+)
- [ ] AgentRabbit revenue covers all Foundry infrastructure
- [ ] New agents can be built and deployed in a single session
- [ ] CivicKit grant secured OR self-sustaining via partnerships
- [ ] Portfolio of agent-powered products expanding

---

## 12. File Map

```
agentrabbit/
  .planning/
    PROJECT-BIBLE.md        <- This file (the plan)
    CHECKPOINT.md           <- Current state (power-drop resilient)
    DECISIONS.md            <- Architectural decision log
    specs/                  <- Task specs for agents
      phase-0-foundation.md
      phase-1-backend.md
      phase-2-frontend.md
      ...
    reviews/                <- /fourminds outputs
    debug/                  <- Error logs, investigation notes
  src/
    engine/                 <- Vendored Foundry Engine
    components/             <- React UI
    pages/                  <- Route pages
    lib/
      agents.ts             <- Agent definitions + swarm configs
      credits.ts            <- Credit system client
      supabase.ts           <- Supabase client
    integrations/
      stripe/               <- Stripe checkout + webhook handling
      supabase/             <- Types, client, hooks
  supabase/
    migrations/             <- ar_* table definitions
    functions/              <- Edge Functions

Dropbox/.../AgentRabbit/
  STATUS.md                 <- Latest progress for Shawn
  NEEDS-DECISION-*.md       <- Pending human decisions
  REVIEW-*.html             <- Visual previews for mobile
  input/                    <- Shawn drops files/keys/directives here
  archive/                  <- Processed comms
```

---

## How to Use This Document

**If you are an agent starting a session:**
1. Read this file first
2. Read `.planning/CHECKPOINT.md` second
3. Check `Dropbox/.../AgentRabbit/input/` for human input
4. Do your work
5. Update CHECKPOINT.md before stopping
6. If you need a human decision, write to Dropbox comms folder

**If you are Shawn:**
1. Check `Dropbox/.../AgentRabbit/STATUS.md` for progress
2. Answer any `NEEDS-DECISION-*.md` files
3. Drop files/keys into `input/`
4. When ready for a session, open a terminal and say "pick up AgentRabbit"

**If you are the orchestrator:**
1. Read this file + CHECKPOINT.md
2. Decide what needs to happen next
3. Write specs for frontend/backend agents
4. Launch agents (parallel when independent)
5. Merge their work
6. Update CHECKPOINT.md
7. Call /fourminds at phase gates
