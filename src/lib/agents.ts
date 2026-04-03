export type FieldType = "text" | "textarea" | "number" | "select" | "date" | "repeatable";

export interface FormField {
  key: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
  options?: { value: string; label: string }[];
  /** For repeatable groups: the sub-fields in each row */
  fields?: Omit<FormField, "fields">[];
}

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
  inputSchema: FormField[];
}

export const agents: Agent[] = [
  {
    id: "meal-planner",
    name: "Meal Planner",
    tagline: "A week of dinners, decided in seconds.",
    description:
      "Tell me what your family likes, any dietary needs, and how many days you need covered. I will give you a complete meal plan with recipes and a grocery list, organized by store section.",
    creatorName: "Rosa, mom of 3 in Austin",
    creatorStory:
      "I was spending 45 minutes every Sunday just figuring out what to cook. Now I spend that time with my kids.",
    category: "Home & Life",
    priceCents: 25,
    emoji: "\u{1F37D}\uFE0F",
    sampleOutput:
      "Monday: Chicken stir-fry with rice\nTuesday: Black bean tacos\nWednesday: Sheet pan salmon...\n\nGrocery List:\nProduce: broccoli, bell peppers, limes...",
    inputSchema: [
      {
        key: "dietary_needs",
        type: "select",
        label: "Any dietary needs?",
        options: [
          { value: "none", label: "No restrictions" },
          { value: "vegetarian", label: "Vegetarian" },
          { value: "vegan", label: "Vegan" },
          { value: "gluten-free", label: "Gluten-free" },
          { value: "dairy-free", label: "Dairy-free" },
          { value: "other", label: "Other (describe below)" },
        ],
      },
      {
        key: "people_count",
        type: "number",
        label: "How many people are you feeding?",
        placeholder: "4",
        min: 1,
        max: 12,
        required: true,
      },
      {
        key: "days",
        type: "number",
        label: "How many days do you need covered?",
        placeholder: "5",
        min: 1,
        max: 7,
        required: true,
      },
      {
        key: "preferences",
        type: "textarea",
        label: "Any favorites or things to avoid?",
        placeholder:
          "We love Mexican food. No seafood. Kids are picky about vegetables.",
      },
      {
        key: "budget",
        type: "select",
        label: "What is your grocery budget like?",
        options: [
          { value: "budget", label: "Budget-friendly" },
          { value: "moderate", label: "Moderate" },
          { value: "no-limit", label: "No limit" },
        ],
      },
    ],
  },
  {
    id: "invoice-drafter",
    name: "Invoice Drafter",
    tagline: "Professional invoices in 30 seconds flat.",
    description:
      "Give me your business name, client details, and what you did. I will create a clean, professional invoice ready to send or print. Looks like you hired a designer.",
    creatorName: "Marcus, freelance photographer in Chicago",
    creatorStory:
      "I was losing hours making invoices in Word. Now I send them right after the shoot while the client is still smiling.",
    category: "Money & Business",
    priceCents: 50,
    emoji: "\u{1F4C4}",
    sampleOutput:
      "INVOICE #1047\nFrom: Marcus Chen Photography\nTo: Sarah & James Wedding\nPhotography Package: $2,500\nDue: April 15, 2026",
    inputSchema: [
      {
        key: "your_name",
        type: "text",
        label: "Your name or business name",
        placeholder: "Marcus Chen Photography",
        required: true,
      },
      {
        key: "your_email",
        type: "text",
        label: "Your email",
        placeholder: "marcus@example.com",
      },
      {
        key: "client_name",
        type: "text",
        label: "Client name",
        placeholder: "Sarah Johnson",
        required: true,
      },
      {
        key: "client_email",
        type: "text",
        label: "Client email",
        placeholder: "sarah@example.com",
      },
      {
        key: "services",
        type: "repeatable",
        label: "What did you do? (add each service or item)",
        fields: [
          {
            key: "description",
            type: "text",
            label: "Service or item",
            placeholder: "Wedding photography package",
            required: true,
          },
          {
            key: "amount",
            type: "number",
            label: "Amount ($)",
            placeholder: "2500",
            min: 0,
            required: true,
          },
        ],
      },
      {
        key: "due_date",
        type: "date",
        label: "When is payment due?",
      },
      {
        key: "notes",
        type: "textarea",
        label: "Any notes for the client?",
        placeholder: "Thank you for your business!",
      },
    ],
  },
  {
    id: "event-coordinator",
    name: "Event Coordinator",
    tagline: "From idea to timeline in one conversation.",
    description:
      "Tell me the occasion, the date, how many people, and your budget. I will give you a full timeline, preparation checklist, and suggestions you might not have thought of.",
    creatorName: "Diane, church volunteer in Atlanta",
    creatorStory:
      "I coordinate potlucks, fundraisers, and community events. This helper does in two minutes what used to take me a whole evening.",
    category: "Community & Social",
    priceCents: 35,
    emoji: "\u{1F389}",
    sampleOutput:
      "Birthday Party for 20 kids\n\nTimeline:\n2:00 PM \u2014 Guests arrive, free play\n2:30 PM \u2014 Craft station...\n\nChecklist:\n[ ] Order cake by Thursday...",
    inputSchema: [
      {
        key: "event_type",
        type: "select",
        label: "What kind of event?",
        required: true,
        options: [
          { value: "birthday", label: "Birthday party" },
          { value: "wedding", label: "Wedding or reception" },
          { value: "meeting", label: "Meeting or workshop" },
          { value: "fundraiser", label: "Fundraiser" },
          { value: "potluck", label: "Potluck or dinner" },
          { value: "other", label: "Something else" },
        ],
      },
      {
        key: "event_name",
        type: "text",
        label: "Give it a name",
        placeholder: "Lily's 7th Birthday",
      },
      {
        key: "event_date",
        type: "date",
        label: "When is it?",
        required: true,
      },
      {
        key: "guest_count",
        type: "number",
        label: "How many guests?",
        placeholder: "20",
        min: 1,
        required: true,
      },
      {
        key: "budget",
        type: "text",
        label: "What is your budget?",
        placeholder: "$200, or 'not sure yet'",
      },
      {
        key: "location",
        type: "text",
        label: "Where will it be?",
        placeholder: "Backyard, community center, church hall...",
      },
      {
        key: "special_notes",
        type: "textarea",
        label: "Anything else I should know?",
        placeholder:
          "Some guests are vegetarian. We need wheelchair access. Theme is unicorns.",
      },
    ],
  },
  {
    id: "appointment-organizer",
    name: "Appointment Organizer",
    tagline: "Untangle your schedule in seconds.",
    description:
      "Paste in your appointments, doctor visits, meetings, or school events. I will organize them into a clear calendar view, flag any conflicts, and suggest reminders so nothing slips through.",
    creatorName: "James, retired teacher in Portland",
    creatorStory:
      "After retirement, my calendar got busier, not quieter. Volunteer shifts, doctor visits, grandkid pickups. This keeps me sane.",
    category: "Health & Wellness",
    priceCents: 25,
    emoji: "\u{1F4C5}",
    sampleOutput:
      "This Week:\nMon 9:00 AM \u2014 Dr. Patel (dentist) \u26A0\uFE0F conflicts with 9:30 yoga\nTue 2:00 PM \u2014 Library volunteering\nWed 10:00 AM \u2014 Grocery pickup...",
    inputSchema: [
      {
        key: "appointments_text",
        type: "textarea",
        label: "Paste or type your appointments",
        placeholder:
          "Monday: dentist at 9am, yoga at 9:30am\nTuesday: library 2-4pm\nWednesday: grocery pickup 10am, lunch with Maria 12pm\nThursday: grandkids after school 3pm",
        required: true,
      },
      {
        key: "time_zone",
        type: "select",
        label: "Your time zone",
        options: [
          { value: "ET", label: "Eastern" },
          { value: "CT", label: "Central" },
          { value: "MT", label: "Mountain" },
          { value: "PT", label: "Pacific" },
        ],
      },
      {
        key: "preferences",
        type: "textarea",
        label: "Any preferences?",
        placeholder:
          "I prefer mornings for medical appointments. No meetings after 4pm please.",
      },
    ],
  },
  {
    id: "weekly-digest",
    name: "Weekly Digest",
    tagline: "Your week, summarized by a friendly librarian.",
    description:
      "Tell me what topics interest you \u2014 cooking, local news, health tips, anything. I will curate 5-7 highlights for the week plus one surprise recommendation you did not ask for but will love.",
    creatorName: "Priya, librarian in Denver",
    creatorStory:
      "I help people find things they did not know they were looking for. That is what a good librarian does, and this helper does the same.",
    category: "Learning & Growth",
    priceCents: 15,
    emoji: "\u{1F4DA}",
    sampleOutput:
      "Your Weekly Digest \u2014 April 2, 2026\n\n1. \u{1F373} Cooking: One-pot pasta tricks trending on...\n2. \u{1F33F} Garden: It is time to start tomato seedlings...\n\nSurprise Pick: A 10-minute documentary about...",
    inputSchema: [
      {
        key: "topics",
        type: "textarea",
        label: "What topics interest you?",
        placeholder:
          "Cooking, gardening, local news in Denver, health tips, parenting",
        required: true,
      },
      {
        key: "tone",
        type: "select",
        label: "How detailed should it be?",
        options: [
          { value: "brief", label: "Just the highlights" },
          { value: "detailed", label: "Give me the details" },
          { value: "conversational", label: "Tell me like a friend would" },
        ],
      },
      {
        key: "focus",
        type: "select",
        label: "What is the main goal?",
        options: [
          { value: "news", label: "Stay informed" },
          { value: "learning", label: "Learn something new" },
          { value: "inspiration", label: "Get inspired" },
          { value: "mixed", label: "A little of everything" },
        ],
      },
    ],
  },
];

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function getAgent(id: string): Agent | undefined {
  return agents.find((a) => a.id === id);
}
