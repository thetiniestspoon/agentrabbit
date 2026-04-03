export interface Agent {
  id: string;
  name: string;
  tagline: string;
  description: string;
  creatorName: string;
  creatorStory: string;
  category: string;
  priceCents: number;
  emoji: string;
  sampleOutput: string;
}

export const agents: Agent[] = [
  {
    id: "meal-planner",
    name: "Meal Planner",
    tagline: "A week of dinners, decided in seconds.",
    description:
      "Tell me what your family likes, any dietary needs, and how many days you need covered. I will give you a complete meal plan with recipes and a grocery list, organized by store section.",
    creatorName: "Rosa, mom of 3 in Austin",
    creatorStory: "I was spending 45 minutes every Sunday just figuring out what to cook. Now I spend that time with my kids.",
    category: "Home & Life",
    priceCents: 25,
    emoji: "🍽️",
    sampleOutput: "Monday: Chicken stir-fry with rice\nTuesday: Black bean tacos\nWednesday: Sheet pan salmon...\n\nGrocery List:\nProduce: broccoli, bell peppers, limes...",
  },
  {
    id: "invoice-drafter",
    name: "Invoice Drafter",
    tagline: "Professional invoices in 30 seconds flat.",
    description:
      "Give me your business name, client details, and what you did. I will create a clean, professional invoice ready to send or print. Looks like you hired a designer.",
    creatorName: "Marcus, freelance photographer in Chicago",
    creatorStory: "I was losing hours making invoices in Word. Now I send them right after the shoot while the client is still smiling.",
    category: "Money & Business",
    priceCents: 50,
    emoji: "📄",
    sampleOutput: "INVOICE #1047\nFrom: Marcus Chen Photography\nTo: Sarah & James Wedding\nPhotography Package: $2,500\nDue: April 15, 2026",
  },
  {
    id: "event-coordinator",
    name: "Event Coordinator",
    tagline: "From idea to timeline in one conversation.",
    description:
      "Tell me the occasion, the date, how many people, and your budget. I will give you a full timeline, preparation checklist, and suggestions you might not have thought of.",
    creatorName: "Diane, church volunteer in Atlanta",
    creatorStory: "I coordinate potlucks, fundraisers, and community events. This helper does in two minutes what used to take me a whole evening.",
    category: "Community & Social",
    priceCents: 35,
    emoji: "🎉",
    sampleOutput: "Birthday Party for 20 kids\n\nTimeline:\n2:00 PM — Guests arrive, free play\n2:30 PM — Craft station...\n\nChecklist:\n[ ] Order cake by Thursday...",
  },
  {
    id: "appointment-organizer",
    name: "Appointment Organizer",
    tagline: "Untangle your schedule in seconds.",
    description:
      "Paste in your appointments, doctor visits, meetings, or school events. I will organize them into a clear calendar view, flag any conflicts, and suggest reminders so nothing slips through.",
    creatorName: "James, retired teacher in Portland",
    creatorStory: "After retirement, my calendar got busier, not quieter. Volunteer shifts, doctor visits, grandkid pickups. This keeps me sane.",
    category: "Health & Wellness",
    priceCents: 25,
    emoji: "📅",
    sampleOutput: "This Week:\nMon 9:00 AM — Dr. Patel (dentist) ⚠️ conflicts with 9:30 yoga\nTue 2:00 PM — Library volunteering\nWed 10:00 AM — Grocery pickup...",
  },
  {
    id: "weekly-digest",
    name: "Weekly Digest",
    tagline: "Your week, summarized by a friendly librarian.",
    description:
      "Tell me what topics interest you — cooking, local news, health tips, anything. I will curate 5-7 highlights for the week plus one surprise recommendation you did not ask for but will love.",
    creatorName: "Priya, librarian in Denver",
    creatorStory: "I help people find things they did not know they were looking for. That is what a good librarian does, and this helper does the same.",
    category: "Learning & Growth",
    priceCents: 15,
    emoji: "📚",
    sampleOutput: "Your Weekly Digest — April 2, 2026\n\n1. 🍳 Cooking: One-pot pasta tricks trending on...\n2. 🌿 Garden: It is time to start tomato seedlings...\n\nSurprise Pick: A 10-minute documentary about...",
  },
];

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
