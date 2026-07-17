# AgentRabbit Decision Log

All architectural and business decisions are logged here with rationale so any agent can understand why things are the way they are.

---

### DEC-001: Credit packs over per-transaction pricing
**Date:** 2026-04-03
**Decided by:** Shawn
**Rationale:** Stripe's $0.30 fixed fee destroys margins on micro-transactions ($0.25-$0.50). Credit packs batch the fee into one $5+ charge. Users buy credits, spend them on agent hires. Three tiers: $5 (500 credits), $10 (1,100 credits, 10% bonus), $25 (3,000 credits, 20% bonus).
**Impact:** Need credit balance system, pack purchase flow, upsell UI after free runs expire.

### DEC-002: 3 free quick agents per day
**Date:** 2026-04-03
**Decided by:** Shawn
**Rationale:** Generous enough to build daily habit and demonstrate value. Quick-only (no swarm) keeps cost at ~$0.09/user/day. Resets at midnight UTC. Requires account to prevent abuse.
**Impact:** Need free run counter, daily reset logic, auth gate before free runs.

### DEC-003: Foundry Engine vendored into repo
**Date:** 2026-04-03
**Decided by:** Shawn
**Rationale:** No npm publish step needed. Self-contained. Engine source copied into `src/engine/`. Avoids local path dependencies or npm account setup.
**Impact:** Must manually sync if engine upstream changes. Acceptable trade-off for simplicity.

### DEC-004: Share Turnkey Supabase instance (xebulbfhwyezjrqobzow)
**Date:** 2026-04-03
**Decided by:** Shawn
**Rationale:** Reduce Supabase instance count and carrying cost. All AgentRabbit tables use `ar_` prefix to avoid collision with Turnkey's real estate tables. Shared auth infrastructure.
**Impact:** Must be careful with RLS policies. ar_ prefix is mandatory on all tables.

### DEC-005: Dan is advisor, not code contributor
**Date:** 2026-04-03
**Decided by:** Shawn
**Rationale:** Shawn builds solo with agents. Dan provides ideas, feedback, and validation. No need to plan for Dan's workflow or branch management.
**Impact:** All build work is Shawn + Claude Code agents.

### DEC-006: Swarm-backed agents from day one (for Deep tier)
**Date:** 2026-04-03
**Decided by:** Shawn
**Rationale:** Differentiation IS the product. Anyone can wrap an LLM prompt. The Foundry Engine's multi-agent orchestration with quality scoring and memory is the moat. Ship with it, not after.
**Impact:** Phase 3 (swarm integration) is critical path, not a nice-to-have. Must vendor engine and build swarm configs before launch.

### DEC-007: GSD workflow with /fourminds at gates
**Date:** 2026-04-03
**Decided by:** Shawn + orchestrator
**Rationale:** GSD provides proven plan-execute-verify cycle. /fourminds provides a focus-group-style review council at phase boundaries. Together they ensure quality without slowing velocity.
**Impact:** Phase gates require /fourminds review before proceeding.

### DEC-009: Stripe blocked until Totem EIN
**Date:** 2026-04-03
**Decided by:** Shawn
**Rationale:** Totem (Shawn's business entity) does not yet have an EIN. Stripe account creation requires it. Build everything else first — stub payment flows with mock/test credits so the full UX is testable without live payments.
**Impact:** Phase 1 backend builds credit system logic but stubs Stripe checkout. Phase 2 frontend builds credit UI with mock balance. Phase 4 launch prep waits for EIN + Stripe. No timeline pressure — Shawn will surface when ready.

### DEC-008: Dropbox folder as async comms line
**Date:** 2026-04-03
**Decided by:** Shawn
**Rationale:** Shawn can view HTML previews and status updates on mobile via Dropbox. Agents can write decision requests. Bidirectional and async — doesn't require Shawn to be at a terminal.
**Impact:** All human-blocking decisions go to Dropbox. Agents check Dropbox at session start/end.
