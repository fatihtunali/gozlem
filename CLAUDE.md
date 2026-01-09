# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Gozlem is a psychological choice game with a "choice -> ambiguous feedback -> memory" loop. The system observes player choices across categories (time, curiosity, risk, control, sacrifice, pattern, memory) and provides intentionally ambiguous feedback, creating a sense that the system is "watching" the player.

## Architecture

**Monorepo structure:**
- `/` - Express.js API backend (TypeScript, ESM)
- `/web` - Next.js 16 frontend (React 19, TypeScript, Tailwind CSS 4)

**Backend** serves REST API at `/v1/*` with PostgreSQL database:
- Sessions track player state (step count, streaks)
- Prompts are served from a static bank (`src/data/prompts.ts`) based on category rotation
- Choices generate feedback and may trigger "revelation" milestones at steps 7, 21, 60
- OpenAPI spec in `openapi.yaml`, Swagger UI at `/docs`

**Frontend** is a single-page game experience:
- `Game.tsx` handles all game phases: loading, playing, feedback, revelation
- `api.ts` contains API client with TypeScript interfaces
- Images served from `/public/images/prompts/{category}/`

## Commands

### Backend (root directory)
```bash
npm run dev          # Start API with hot reload (tsx watch)
npm run build        # Compile TypeScript
npm start            # Run compiled output
npm run migrate      # Run database migrations
```

### Frontend (web directory)
```bash
cd web
npm run dev          # Start Next.js dev server
npm run build        # Production build
npm run lint         # Run ESLint
```

### Image Generation Scripts
```bash
npx tsx scripts/generate-placeholders.ts  # Generate placeholder images
npx tsx scripts/generate-dalle.ts         # Generate DALL-E images (requires API key)
```

## Environment Variables

Backend (`.env`):
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - development/production

Frontend (`web/.env.local`):
- `NEXT_PUBLIC_API_URL` - API base URL (default: https://haydihepberaber.com)

## Key Concepts

- **PromptCategory**: 7 psychological categories that rotate through gameplay
- **Milestone**: Revelations trigger at steps 7, 21, 60 showing "observations" about player behavior
- **Feedback**: Intentionally ambiguous responses with optional social hints ("X people chose similarly")
- **Streak tracking**: System tracks consecutive same-choice patterns

## Database

PostgreSQL with tables for sessions, events, and idempotency keys. Schema in `src/db/schema.sql`. Run migrations with `npm run migrate`.
