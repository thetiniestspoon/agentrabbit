# AgentRabbit Checkpoint

## Last Updated
2026-04-03 by orchestrator (Phase 0-3 session)

## Current Phase
Phase 3 COMPLETE. Ready for Phase 4 (launch prep, blocked on EIN/Stripe).

## Completed This Session

### Phase 0: Foundation
- [x] PROJECT-BIBLE.md, CHECKPOINT.md, DECISIONS.md
- [x] Dropbox comms folder (input/, archive/, TODO-SHAWN.md)
- [x] Foundry Engine vendored into src/engine/ (26 files + 3 new adapters)

### Phase 1: Backend Core
- [x] Supabase schema: 7 ar_* tables + RLS + triggers + indexes
- [x] Credit deduction RPC (ar_deduct_credits, search_path secured)
- [x] 5 agents seeded (3 deep, 2 quick)
- [x] Edge Function: ar-execute-agent v3 (quick + deep swarm + quality scoring)
- [x] @supabase/supabase-js installed, client configured
- [x] React hooks: useAuth, useCredits, useFreeRuns, useHireAgent

### Phase 2: Frontend Core
- [x] Sign-in page (Magic Link)
- [x] HireFlow wired to real backend (credits, free runs, error handling)
- [x] Nav with auth state, credit balance, free run counter
- [x] Activity page (hire history with expandable results)
- [x] Code-split: lazy-loaded pages, vendor chunks (React 49KB, UI 125KB, Supabase 194KB, app 239KB)

### Phase 3: Swarm Quality
- [x] Domain-specific room prompts for all 3 deep agents (Meal Planner, Invoice Drafter, Event Coordinator)
- [x] Quality scoring: post-synthesis evaluation (1-10 scale across 4 dimensions)
- [x] Auto-retry: if score < 6, synthesis retries with quality feedback
- [x] Time budget: quality check only runs if < 45s elapsed (15s buffer in 60s Edge Function timeout)
- [x] Phase specs written for Phase 3 and Phase 4

### Security
- [x] RLS service policies scoped to service_role only
- [x] Function search_path set on ar_handle_new_user and ar_deduct_credits

## Blockers
- [HUMAN] Stripe EIN pending (DEC-009) — blocks Phase 4 launch
- [CONFIG] LLM_GATEWAY_API_KEY needs to be set in Supabase Edge Function secrets
- [CONFIG] Supabase Auth site URL for Magic Link redirects

## Next Session Should
1. Check Dropbox input/ for Shawn directives or keys
2. If LLM Gateway key is set: test end-to-end flow (sign up -> free run -> result)
3. Begin CivicKit Phase 2 (Congress.gov API integration for CivicLens) — independent track
4. Add more agents to the roster if demand signals emerge
5. When EIN arrives: implement Stripe credit pack checkout (Phase 4)

## Branch State
- main: all work on main (validation site + full backend + frontend wiring)

## Supabase State
- Instance: xebulbfhwyezjrqobzow (shared with Turnkey)
- Tables: 7 ar_* tables with RLS
- Edge Functions: ar-execute-agent v3 (ACTIVE, with quality scoring)
- RPC: ar_deduct_credits (ACTIVE)
- Agents: 5 seeded with domain-specific swarm configs
- Auth trigger: ar_on_auth_user_created (profile + 100 welcome credits)

## Architecture Summary
```
User -> GitHub Pages (React SPA)
  -> Supabase Auth (Magic Link)
  -> Supabase Edge Function (ar-execute-agent)
    -> Quick: single LLM call via LLM Gateway
    -> Deep: 4-room swarm pipeline + quality scoring + auto-retry
  -> Supabase DB (ar_* tables)
  -> [Future] Stripe (credit pack checkout)
```
