# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**The Copy** is an Arabic creative writing and drama analysis platform built with a modern tech stack:
- Frontend: Next.js 15, TypeScript, Tailwind CSS
- Backend: Node.js/Express, TypeScript, PostgreSQL (Neon Serverless)
- Additional technologies: Redis, BullMQ, Google Gemini AI, Three.js, GSAP

## Key Commands

### Development Setup
```bash
# Install dependencies
pnpm install

# Start development (both frontend and backend)
pnpm dev

# Start only frontend (port 5000)
cd frontend && pnpm dev

# Start only backend (port 3001)
cd backend && pnpm dev
```

### Database Operations
```bash
# Apply database schema changes
cd backend && pnpm db:push

# Open database studio
cd backend && pnpm db:studio
```

### Testing
```bash
# Run frontend tests
cd frontend && pnpm test

# Run backend tests
cd backend && pnpm test

# Run all tests with coverage
cd frontend && pnpm test:coverage
cd backend && pnpm test:coverage
```

### Linting and Type Checking
```bash
# Frontend linting
cd frontend && pnpm lint

# Backend linting
cd backend && pnpm lint

# Type checking (both)
pnpm typecheck
```

### Building
```bash
# Build frontend
cd frontend && pnpm build

# Build backend
cd backend && pnpm build
```

### Performance Analysis
```bash
# Run performance tests
cd backend && pnpm perf:baseline

# Compare optimization results
cd backend && pnpm perf:compare
```

## Architecture Structure

### Monorepo Organization
- Root: Contains monorepo configuration and shared scripts
- `/frontend`: Next.js application with landing pages and directors studio
- `/backend`: Express.js API server with AI analysis capabilities
- `/docs`: Project documentation and performance guides

### Frontend Key Features
- Landing page with video text mask and cards scanner (Three.js/GSAP)
- Directors Studio for project management
- Seven Stations drama analysis using Google Gemini AI
- Responsive RTL Arabic design

### Backend Key Components
- Express.js API with authentication (JWT)
- PostgreSQL database with Drizzle ORM
- Redis caching and BullMQ job processing
- Google Gemini AI integration for drama analysis
- WebSocket/SSE for real-time updates
- Sentry and Prometheus monitoring

## Development Workflow

1. **Environment Setup**: Copy `.env.example` to `.env` in both frontend and backend directories
2. **Database**: Ensure PostgreSQL is running or use Neon connection string
3. **Redis**: Optional but recommended for caching (start with `pnpm start:redis`)
4. **Development**: Use `pnpm dev` to start both services

## Key Technologies

- **Frontend**: Next.js 15, React 18, Tailwind CSS, shadcn/ui, Three.js, GSAP
- **Backend**: Express.js, Drizzle ORM, PostgreSQL, Redis, BullMQ
- **AI**: Google Gemini API for drama analysis
- **Monitoring**: Sentry, Prometheus
- **Testing**: Vitest, Playwright
- **Dev Tools**: TypeScript, ESLint, Prettier, Husky

## Important Documentation Files

- `README.md`: Main project overview and getting started guide
- `backend/BACKEND_DOCUMENTATION.md`: Detailed backend architecture
- `backend/DATABASE_SECURITY.md`: Security guidelines
- `docs/performance-optimization/`: Performance improvement guides
- `PERFORMANCE_SYSTEM_SUMMARY.md`: Performance optimization details