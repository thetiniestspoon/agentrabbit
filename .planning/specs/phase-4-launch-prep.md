# Phase 4: Launch Prep

**Agent role:** Orchestrator + All
**Depends on:** Phase 3 + Stripe (EIN)
**Goal:** Production-ready for real users

## Tasks

### 1. Stripe Integration (blocked until EIN)
- Create Stripe products for credit packs ($5, $10, $25)
- Build Edge Function: ar-stripe-checkout (creates Checkout Session)
- Build Edge Function: ar-stripe-webhook (handles payment confirmation, adds credits)
- Add "Buy Credits" button to Nav and hire flow
- Handle Stripe test mode -> live mode switch

### 2. Error Handling & Resilience
- Graceful fallback when LLM Gateway is down
- Timeout handling for deep agents (60s limit)
- Rate limiting per user (prevent abuse)
- Edge Function error logging

### 3. Legal Pages
- Privacy policy (what data we collect, how it's used)
- Terms of service (no warranties, refund policy for credits)
- Cookie notice (Supabase auth uses localStorage)

### 4. Landing Page Refresh
- Update copy from validation language to live product
- Add "Sign in" CTA alongside waitlist
- Show real agent capabilities, not just previews

### 5. Mobile Responsiveness
- Test all flows on mobile
- Bottom nav with credit display
- Touch-friendly hire flow

### 6. [HUMAN] Ship It Call
- Shawn reviews final product in browser
- Tests end-to-end flow
- Says "ship it" or provides feedback

### 7. [REVIEW] /fourminds Gate
- "Would you pay for this?" evaluation
- Focus on: value clarity, trust signals, UX friction
- Document in .planning/reviews/phase-4-fourminds.md
