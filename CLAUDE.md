# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**النسخة (The Copy)** is a monorepo for an Arabic drama script analysis and cinematography platform. It combines a Next.js 16 frontend with an Express.js backend, featuring AI-powered screenplay analysis tools using Google Gemini AI.

## Package Manager

This project uses **pnpm 10.20.0+** (not npm or yarn). Always use pnpm commands:
- `pnpm install` - Install dependencies
- `pnpm start` - Start all services
- `pnpm --filter frontend <command>` - Run in frontend workspace
- `pnpm --filter @the-copy/backend <command>` - Run in backend workspace

## Development Commands

### Starting the Application

```bash
# Start all services (frontend + backend + redis)
pnpm start

# Development mode with hot reload
pnpm start:dev

# Start Redis only (Windows: includes redis/redis-server.exe)
pnpm start:redis

# Stop all development services
pnpm kill:dev
```

### Frontend (Next.js 16)

```bash
# Development server (runs on port 5000)
cd frontend && pnpm dev

# Production build
pnpm --filter frontend build

# Type checking
pnpm --filter frontend typecheck

# Linting
pnpm --filter frontend lint
pnpm --filter frontend lint:fix

# Testing
pnpm --filter frontend test           # Unit tests (Vitest)
pnpm --filter frontend e2e            # E2E tests (Playwright)
pnpm --filter frontend smoke:tests    # Smoke tests
```

### Backend (Express.js)

```bash
# Development server with auto-reload
cd backend && pnpm dev

# Build TypeScript
pnpm --filter @the-copy/backend build

# Start production server
pnpm --filter @the-copy/backend start

# Database operations (Drizzle ORM)
pnpm --filter @the-copy/backend db:generate  # Generate migrations
pnpm --filter @the-copy/backend db:push      # Push schema changes
pnpm --filter @the-copy/backend db:studio    # Open Drizzle Studio

# Testing
pnpm --filter @the-copy/backend test
```

## Architecture

### Monorepo Structure

```
the...copy/
├── frontend/          # Next.js 16 application (port 5000)
│   └── src/
│       ├── app/              # Next.js App Router
│       │   ├── (auth)/       # Login/register pages
│       │   ├── (main)/       # Main application routes
│       │   └── ui/           # Landing page with hero animations
│       ├── components/       # Reusable UI components
│       ├── lib/              # Utilities, API clients, stores
│       │   └── drama-analyst/  # Frontend analysis orchestration
│       └── ai/               # AI service integrations (Genkit)
├── backend/           # Express.js API (port 3000)
│   └── src/
│       ├── services/         # Business logic
│       │   └── agents/       # AI analysis agents (7 specialized agents)
│       ├── controllers/      # Express route handlers
│       ├── db/               # Drizzle ORM schema
│       └── queues/           # BullMQ background jobs
├── scripts/           # Shared scripts (development, deployment)
└── redis/             # Redis server (Windows development)
```

### The Seven-Agent Analysis System

The core feature is an AI-powered drama analysis pipeline with seven specialized agents:

1. **Character Deep Analyzer** - Character development and arc analysis
2. **Dialogue Advanced Analyzer** - Dialogue patterns and authenticity
3. **Cultural Historical Analyzer** - Cultural context and historical accuracy
4. **Target Audience Analyzer** - Demographic identification
5. **Themes Messages Analyzer** - Theme and message extraction
6. **Visual Cinematic Analyzer** - Visual storytelling suggestions
7. **Producibility Analyzer** - Production feasibility assessment

**Agent Registry**: [backend/src/services/agents/index.ts](backend/src/services/agents/index.ts)
**Agent Base Class**: [backend/src/services/agents/shared/BaseAgent.ts](backend/src/services/agents/shared/BaseAgent.ts)

### Technology Stack

**Frontend:**
- Next.js 16 with App Router
- TypeScript 5.7
- Tailwind CSS v4 (OKLCH color system)
- Radix UI primitives
- Framer Motion + GSAP (animations)
- React Query (server state)
- Zustand (client state)
- Socket.io-client (real-time updates)

**Backend:**
- Express.js 5
- TypeScript 5.0
- Drizzle ORM with PostgreSQL (Neon)
- Redis (caching + BullMQ queues)
- Socket.io (WebSocket)
- Google Gemini AI
- BullMQ (background jobs)

**Observability:**
- Sentry (error tracking + performance)
- OpenTelemetry (distributed tracing)
- Winston (logging)

### Key Path Aliases (frontend/tsconfig.json)

```typescript
@/*           → ./src/*
@/components/* → ./src/components/*
@/lib/*       → ./src/lib/*
@core/*       → ./src/lib/drama-analyst/*
@agents/*     → ./src/lib/drama-analyst/agents/*
@services/*   → ./src/lib/drama-analyst/services/*
@shared/*     → ./src/app/(main)/directors-studio/shared/*
```

## Important Conventions

### Arabic Language Support

The application is primarily in **Arabic (RTL)**:
- Font: **Cairo** for Arabic text
- All UI must support `dir="rtl"` layout
- Use Tailwind's logical properties (e.g., `ms-` instead of `ml-`, `me-` instead of `mr-`)

### Animation Strategy

Two animation systems are used:
- **GSAP**: Timeline-based animations for the landing page hero and launcher cards
- **Framer Motion**: Component-level animations and transitions

Key files:
- [frontend/src/lib/particle-system.ts](frontend/src/lib/particle-system.ts) - Particle effects
- [frontend/src/lib/animations.ts](frontend/src/lib/animations.ts) - Animation utilities
- [frontend/src/components/LauncherCenterCard.tsx](frontend/src/components/LauncherCenterCard.tsx) - Main card with GSAP animations

### State Management

- **Client State**: Zustand stores in [frontend/src/lib/stores/](frontend/src/lib/stores/)
- **Server State**: React Query in [frontend/src/lib/queryClient.ts](frontend/src/lib/queryClient.ts)
- **Real-time**: Socket.io for live updates (analysis progress, notifications)

### API Integration

Frontend → Backend communication:
1. **Next.js API Routes** ([frontend/src/app/api/](frontend/src/app/api/)) - Proxy to backend
2. **Direct Backend Calls** - Socket.io for real-time, HTTP for REST
3. **AI Services** - Both frontend (Genkit) and backend (Gemini) can call AI

### Environment Variables

Key variables (see [.env.example](.env.example)):
- `DATABASE_URL` - PostgreSQL connection (Neon)
- `REDIS_URL` or `REDIS_HOST`/`REDIS_PORT` - Redis connection
- `GOOGLE_GENAI_API_KEY` - Gemini AI access
- `JWT_SECRET`, `SESSION_SECRET` - Authentication
- `NEXT_PUBLIC_SENTRY_DSN` - Error tracking
- `SENTRY_ORG`, `SENTRY_PROJECT` - Sentry configuration

### Testing Strategy

- **Unit Tests**: Vitest with React Testing Library
- **E2E Tests**: Playwright
- **Backend Tests**: Vitest with Supertest
- Run `pnpm ci` to execute full CI pipeline (lint → typecheck → test → build → e2e)

## Deployment

### Frontend (Vercel)
- Build: `cd frontend && pnpm build`
- Output: `frontend/.next`
- Environment variables injected automatically
- Sentry source maps uploaded on deploy

### Backend (Render)
- Runtime: Node.js 20.x
- Build: `cd backend && pnpm build && pnpm start`
- Requires: PostgreSQL (Neon) + Redis addons

### CI/CD

GitHub Actions pipeline ([.github/workflows/ci.yml](.github/workflows/ci.yml)):
1. Change detection (frontend/backend/root)
2. Parallel lint, typecheck, test
3. Build with caching
4. E2E tests on PRs
5. Target: <7 minutes total runtime

## Common Patterns

### Adding a New Agent (Backend)

1. Create directory in `backend/src/services/agents/<agentName>/`
2. Extend `BaseAgent` from `./shared/BaseAgent`
3. Register in `backend/src/services/agents/registry.ts`
4. Add to orchestrator if needed

### Adding a New Page (Frontend)

1. Create in `frontend/src/app/(main)/<page-name>/page.tsx`
2. Use route groups for logical separation
3. Apply RTL layout for Arabic content
4. Use Radix UI primitives + Tailwind

### Performance Considerations

- Images use Next.js Image with remote patterns ([frontend/next.config.ts](frontend/next.config.ts))
- Static assets cached aggressively (CSP headers configured)
- Bundle analysis: `ANALYZE=true pnpm --filter frontend build`
- Performance budgets enforced in CI
- Redis caching for API responses

## Troubleshooting

### Build Warnings

OpenTelemetry and Sentry warnings during build are **expected and safe**. These are suppressed in [frontend/next.config.ts](frontend/next.config.ts) webpack config.

### Redis on Windows

The project includes `redis/redis-server.exe` for Windows development. Use `pnpm start:redis` to start locally.

### Hydration Mismatches

Client components using `useElementSize` or similar hooks should guard against hydration:
```tsx
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return null;
```

See [frontend/src/components/LauncherCenterCard.tsx](frontend/src/components/LauncherCenterCard.tsx) for example.

## File Locations

- Main routes: [frontend/src/app/(main)/*](frontend/src/app/(main))
- Components: [frontend/src/components/*](frontend/src/components)
- Backend API: [backend/src/controllers/*](backend/src/controllers)
- Database schema: [backend/src/db/schema/*](backend/src/db/schema)
- Background jobs: [backend/src/queues/*](backend/src/queues)
- Shared types: [frontend/src/types/*](frontend/src/types)
