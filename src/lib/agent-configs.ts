/**
 * Agent definitions for AgentRabbit marketplace.
 * Each agent has either a quick (single-prompt) or deep (swarm-backed) configuration.
 */

export interface QuickAgentConfig {
  tier: 'quick';
  model: string;
  systemPrompt: string;
  userPromptTemplate: string; // {{input}} placeholder replaced with user input
}

export interface DeepAgentConfig {
  tier: 'deep';
  model: string;
  rooms: {
    name: string;
    agentSlugs: string[];
    dependsOn?: string[];
  }[];
  synthesisPrompt: string; // How to combine room outputs into final result
}

export type AgentConfig = QuickAgentConfig | DeepAgentConfig;

export interface AgentDefinition {
  slug: string;
  name: string;
  emoji: string;
  tagline: string;
  description: string;
  category: string;
  priceCredits: number;
  creatorName: string;
  creatorStory: string;
  sampleOutput: string;
  config: AgentConfig;
}

export const AGENT_DEFINITIONS: AgentDefinition[] = [
  // === DEEP AGENTS (Swarm-backed) ===
  {
    slug: 'meal-planner',
    name: 'Meal Planner',
    emoji: '\ud83e\udd57',
    tagline: 'A week of meals, planned in minutes',
    description: 'Get a personalized weekly meal plan with grocery list, based on your dietary needs, budget, and household size. Powered by a team of AI specialists who research recipes, optimize nutrition, check for allergens, and assemble your final plan.',
    category: 'Home & Life',
    priceCredits: 200,
    creatorName: 'Rosa',
    creatorStory: 'Rosa is a mom of three in Austin who used to spend Sunday evenings stressed about the week ahead. She built this helper to do what she wished someone would do for her \u2014 just tell me what to cook and what to buy.',
    sampleOutput: `## Your Weekly Meal Plan

### Monday
**Breakfast:** Overnight oats with banana and honey
**Lunch:** Mediterranean chickpea wrap
**Dinner:** One-pan lemon herb chicken with roasted vegetables

### Tuesday
**Breakfast:** Scrambled eggs with toast
**Lunch:** Leftover chicken grain bowl
**Dinner:** Black bean tacos with avocado crema

---

## Grocery List (estimated $65-75)

### Produce
- 2 lbs chicken thighs
- 1 bunch bananas
- 2 avocados
- 1 bag mixed greens
...`,
    config: {
      tier: 'deep',
      model: 'gemini-2.5-flash',
      rooms: [
        {
          name: 'Research',
          agentSlugs: ['dietary-researcher'],
        },
        {
          name: 'Recipe Selection',
          agentSlugs: ['recipe-curator'],
          dependsOn: ['Research'],
        },
        {
          name: 'Budget & Nutrition Review',
          agentSlugs: ['budget-analyst', 'nutrition-critic'],
          dependsOn: ['Recipe Selection'],
        },
        {
          name: 'Final Plan Assembly',
          agentSlugs: ['meal-synthesizer'],
          dependsOn: ['Budget & Nutrition Review'],
        },
      ],
      synthesisPrompt: 'Combine the research, selected recipes, and budget/nutrition feedback into a clean, actionable weekly meal plan with a consolidated grocery list. Format with markdown headers. Include estimated total grocery cost.',
    },
  },

  {
    slug: 'invoice-drafter',
    name: 'Invoice Drafter',
    emoji: '\ud83d\udcdd',
    tagline: 'Professional invoices in seconds',
    description: 'Create clean, professional invoices from a simple description of the work you did. A team of AI specialists researches formatting standards, designs the layout, checks for completeness, and delivers a ready-to-send invoice.',
    category: 'Money & Business',
    priceCredits: 300,
    creatorName: 'Marcus',
    creatorStory: 'Marcus is a freelance photographer in Chicago who lost track of payments because making invoices felt like a chore. He built this so anyone doing good work can get paid without the paperwork headache.',
    sampleOutput: `## INVOICE #2024-0047

**From:** Jane Smith Photography
**To:** Riverside Events LLC
**Date:** April 3, 2026
**Due:** April 17, 2026

---

| Description | Hours | Rate | Amount |
|-------------|-------|------|--------|
| Event photography (wedding) | 8 | $150/hr | $1,200.00 |
| Photo editing & retouching | 4 | $100/hr | $400.00 |
| Travel expenses | - | flat | $75.00 |

**Subtotal:** $1,675.00
**Tax (0%):** $0.00
**Total Due:** $1,675.00

**Payment Methods:** Venmo @janesmith / Zelle jane@email.com`,
    config: {
      tier: 'deep',
      model: 'gemini-2.5-flash',
      rooms: [
        {
          name: 'Information Extraction',
          agentSlugs: ['detail-researcher'],
        },
        {
          name: 'Invoice Design',
          agentSlugs: ['document-designer'],
          dependsOn: ['Information Extraction'],
        },
        {
          name: 'Completeness Check',
          agentSlugs: ['invoice-critic'],
          dependsOn: ['Invoice Design'],
        },
        {
          name: 'Final Assembly',
          agentSlugs: ['document-synthesizer'],
          dependsOn: ['Completeness Check'],
        },
      ],
      synthesisPrompt: 'Produce a clean, professional invoice in markdown table format. Include all line items, rates, totals. Flag anything missing (e.g., payment terms, tax info) as a note at the bottom.',
    },
  },

  {
    slug: 'event-coordinator',
    name: 'Event Coordinator',
    emoji: '\ud83c\udf89',
    tagline: 'From idea to action plan',
    description: 'Turn your event idea into a detailed timeline, checklist, and delegation plan. Whether it\'s a birthday party, community fundraiser, or team offsite \u2014 get an organized plan you can actually follow.',
    category: 'Community & Social',
    priceCredits: 250,
    creatorName: 'Diane',
    creatorStory: 'Diane has volunteered at her church in Atlanta for 20 years, organizing everything from potlucks to fundraisers. She knows that the secret to a great event is a great checklist \u2014 and now everyone can have one.',
    sampleOutput: `## Birthday Party Plan: Sofia's 7th Birthday

**Theme:** Enchanted Garden
**Date:** Saturday, April 19
**Time:** 2:00 PM - 5:00 PM
**Location:** Backyard + covered patio (rain backup: living room)
**Guest count:** 12-15 kids + parents

---

### Timeline
| Time | Activity | Who |
|------|----------|-----|
| 12:00 PM | Setup begins | You + 1 helper |
| 1:30 PM | Balloon arch + table settings | Helper |
| 2:00 PM | Guests arrive, free play | You (greet) |
| 2:30 PM | Garden scavenger hunt | You (lead) |
| 3:15 PM | Craft station: flower crowns | Helper (supervise) |
| 4:00 PM | Cake + singing | You |
| 4:30 PM | Goodie bags + wind down | Both |
| 5:00 PM | Pickup time | You |

### Checklist (2 weeks before)
- [ ] Send invitations (digital or paper)
- [ ] Order cake (confirm dietary needs)
- [ ] Buy craft supplies (pipe cleaners, fake flowers, headbands)
...`,
    config: {
      tier: 'deep',
      model: 'gemini-2.5-flash',
      rooms: [
        {
          name: 'Requirements Gathering',
          agentSlugs: ['event-researcher'],
        },
        {
          name: 'Logistics Planning',
          agentSlugs: ['logistics-strategist'],
          dependsOn: ['Requirements Gathering'],
        },
        {
          name: 'Conflict & Risk Review',
          agentSlugs: ['event-critic'],
          dependsOn: ['Logistics Planning'],
        },
        {
          name: 'Final Plan',
          agentSlugs: ['event-synthesizer'],
          dependsOn: ['Conflict & Risk Review'],
        },
      ],
      synthesisPrompt: 'Produce a complete event plan with: overview (theme, date, location, guest count), detailed timeline table, checklists organized by timeframe (2 weeks before, 1 week before, day-of), delegation suggestions, and budget estimate if possible.',
    },
  },

  // === QUICK AGENTS (Single-prompt) ===
  {
    slug: 'appointment-organizer',
    name: 'Appointment Organizer',
    emoji: '\ud83d\udcc5',
    tagline: 'Your schedule, untangled',
    description: 'Paste in your upcoming appointments, commitments, or a messy list of things you need to do \u2014 and get back a clean, organized calendar view with conflict alerts.',
    category: 'Health & Wellness',
    priceCredits: 50,
    creatorName: 'James',
    creatorStory: 'James is a retired teacher in Portland who helps his elderly neighbors manage their medical appointments. He built this because everyone deserves to feel on top of their schedule.',
    sampleOutput: `## Your Week at a Glance

### Monday, April 7
- \u23f0 9:00 AM - Dr. Patel (dentist) - 123 Oak St
- \ud83d\udcbc 1:00 PM - Team standup (Zoom)

### Tuesday, April 8
- \u26a0\ufe0f CONFLICT: Oil change (10 AM) overlaps with school pickup (10:30 AM)
  - Suggestion: Reschedule oil change to Wednesday morning

### Wednesday, April 9
- \u2705 No appointments - good day for errands`,
    config: {
      tier: 'quick',
      model: 'gemini-2.5-flash',
      systemPrompt: 'You are a friendly, organized personal scheduler. Take the user\'s messy list of appointments and commitments and produce a clean, day-by-day calendar view. Flag any time conflicts with a warning emoji and suggest fixes. Use simple formatting with emojis for quick scanning. Be warm and encouraging.',
      userPromptTemplate: 'Here are my upcoming appointments and things I need to schedule:\n\n{{input}}\n\nPlease organize these into a clean calendar view and flag any conflicts.',
    },
  },

  {
    slug: 'weekly-digest',
    name: 'Weekly Digest',
    emoji: '\ud83d\udcda',
    tagline: 'Stay curious, stay informed',
    description: 'Tell us what topics interest you, and get a curated weekly digest with the most important developments, a surprising fact, and one thing worth reading.',
    category: 'Learning & Growth',
    priceCredits: 50,
    creatorName: 'Priya',
    creatorStory: 'Priya is a librarian in Denver who believes everyone should have access to a personal research assistant. She built this for the people who are curious about the world but don\'t have time to read everything.',
    sampleOutput: `## Your Weekly Digest: AI & Education

### Top Developments
1. **UNESCO releases AI literacy framework** - New guidelines for teaching AI concepts K-12, emphasizing critical thinking over technical skills.
2. **Khan Academy expands AI tutor** - Now available in Spanish and Hindi, reaching 50M+ additional students.

### Worth Reading
"\ud83d\udcce [How Finland Teaches AI to 1% of Its Population](https://example.com)" - A fascinating look at the Elements of AI course and what other countries can learn.

### Surprise Pick
\ud83c\udf1f Did you know? The first AI teaching assistant was deployed in 1966 at Stanford \u2014 it was called SCHOLAR and taught South American geography.`,
    config: {
      tier: 'quick',
      model: 'gemini-2.5-flash',
      systemPrompt: 'You are a warm, knowledgeable research librarian creating a personalized weekly digest. Based on the user\'s interests, produce: (1) 2-3 top developments with brief explanations, (2) one article or resource worth reading with a brief hook, (3) one surprising or delightful fact. Keep the tone warm, curious, and accessible. Use markdown formatting.',
      userPromptTemplate: 'My interests and topics I want to stay updated on:\n\n{{input}}\n\nPlease create my weekly digest.',
    },
  },
];

/** Get agent definition by slug */
export function getAgentBySlug(slug: string): AgentDefinition | undefined {
  return AGENT_DEFINITIONS.find(a => a.slug === slug);
}

/** Get all active agent definitions */
export function getAllAgents(): AgentDefinition[] {
  return AGENT_DEFINITIONS;
}

/** Get agents by tier */
export function getAgentsByTier(tier: 'quick' | 'deep'): AgentDefinition[] {
  return AGENT_DEFINITIONS.filter(a => a.config.tier === tier);
}
