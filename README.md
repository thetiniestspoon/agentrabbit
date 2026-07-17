# AgentRabbit

A marketplace for hiring AI agents — browse agent services, customize inputs, and get results delivered.

## Overview

AgentRabbit is a TaskRabbit-style platform where users browse and hire AI agents built by creators. Each agent has a defined service (meal planning, invoice drafting, event coordination, etc.), a pricing model, and a dynamic input schema that generates custom forms. The platform includes a full orchestration engine with multi-agent rooms, branching strategies, and working memory.

## Tech Stack

- Frontend: React 19 + TypeScript + Vite
- Styling: Tailwind CSS + Radix UI primitives
- Backend: Supabase (Auth, Database)
- Routing: React Router v7
- Animation: Framer Motion
- Icons: Lucide React

## Key Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, how-it-works, pricing |
| `/home` | Browse agents grid |
| `/agent/:id` | Agent detail — creator story, pricing, sample output |
| `/hire/:id` | Dynamic hire form generated from agent schema |
| `/sign-in` | Authentication |

## Getting Started

```bash
npm install
npm run dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
