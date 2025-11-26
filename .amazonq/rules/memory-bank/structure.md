# Project Structure - The Copy

## Repository Organization
This is a **pnpm monorepo** with two main packages: frontend and backend, plus shared configuration and documentation.

```
the-copy/
├── frontend/          # Next.js 15 application
├── backend/           # Express.js API server
├── docs/              # Project documentation
├── scripts/           # Build and deployment scripts
├── monitoring/        # Prometheus & Grafana configs
├── redis/             # Redis configuration files
├── dev-tools/         # Database analysis tools
└── .amazonq/          # Amazon Q rules and memory bank
```

## Frontend Structure (`/frontend`)

### Core Directories
- **`src/app/`** - Next.js 15 App Router pages and layouts
  - `(main)/` - Main application routes (directors-studio, editor, seven-stations)
  - `__smoke__/` - Smoke tests
  - `api/` - API route handlers
  
- **`src/components/`** - Reusable React components
  - UI components built with shadcn/ui and Radix UI
  - Optimized components (e.g., particle-background-optimized)
  
- **`src/ai/`** - AI integration layer
  - Genkit configuration for Google Gemini
  - AI service abstractions
  
- **`src/orchestration/`** - Multi-agent AI orchestration
  - Agent coordination and workflow management
  
- **`src/hooks/`** - Custom React hooks
- **`src/lib/`** - Utility libraries and helpers
- **`src/types/`** - TypeScript type definitions
- **`src/config/`** - Application configuration
- **`src/workers/`** - Web Workers for background processing

### Key Configuration Files
- `next.config.ts` - Next.js configuration with bundle optimization
- `tailwind.config.ts` - Tailwind CSS v4 configuration
- `tsconfig.json` - TypeScript compiler options
- `sentry.client.config.ts` - Sentry error monitoring
- `vitest.config.ts` - Vitest testing configuration
- `playwright.config.ts` - E2E testing configuration

## Backend Structure (`/backend`)

### Core Directories
- **`src/controllers/`** - Request handlers for API endpoints
  - Projects, scenes, characters, shots controllers
  - Seven stations analysis controller
  
- **`src/services/`** - Business logic layer
  - AI service (Gemini integration)
  - Cache service (Redis)
  - Queue service (BullMQ)
  - Resource monitoring service
  
- **`src/db/`** - Database layer
  - Drizzle ORM schema definitions
  - Database connection management
  
- **`src/queues/`** - Background job processing
  - Analysis queue workers
  - Job definitions and handlers
  
- **`src/middleware/`** - Express middleware
  - Authentication (JWT)
  - Rate limiting
  - Error handling
  - Security (Helmet, CORS)
  
- **`src/utils/`** - Utility functions
  - Logger (Winston)
  - Validators (Zod)
  - Helpers

### Key Configuration Files
- `drizzle.config.ts` - Drizzle ORM configuration
- `tsconfig.json` - TypeScript compiler options
- `vitest.config.ts` - Testing configuration
- `.env.example` - Environment variables template

## Documentation Structure (`/docs`)

- **`performance-optimization/`** - Performance improvement guides
  - Quick start guide
  - Implementation plan
  - Progress tracker
  - Troubleshooting
  
- **`operations/`** - Operational runbooks
  - Redis setup for Windows
  - Rollback procedures
  - Incident response
  
- **`adrs/`** - Architecture Decision Records
  - Multi-agent AI architecture

## Shared Resources

### Scripts (`/scripts`)
- `start-app.ps1` - Development environment startup
- `kill-ports.ps1` - Clean up running processes
- `test-performance.sh` - Performance testing
- `upload-to-cdn.sh` - CDN deployment

### Monitoring (`/monitoring`)
- Prometheus configuration
- Grafana dashboards
- Metrics collection setup

### Dev Tools (`/dev-tools`)
- Database performance analysis scripts
- Seed data generators
- Performance comparison tools

## Architectural Patterns

### Frontend Architecture
- **App Router**: Next.js 15 App Router for file-based routing
- **Server Components**: Default to React Server Components for performance
- **Client Components**: Marked with 'use client' for interactivity
- **API Routes**: Next.js API routes for backend communication
- **State Management**: React hooks + Zustand for global state
- **Data Fetching**: TanStack Query for server state management

### Backend Architecture
- **Layered Architecture**: Controllers → Services → Database
- **Dependency Injection**: Services injected into controllers
- **Queue-Based Processing**: Long-running tasks handled by BullMQ
- **Caching Strategy**: Redis for frequently accessed data
- **Real-time Communication**: WebSocket + SSE for live updates
- **Monitoring**: Sentry for errors, Prometheus for metrics

### Database Architecture
- **Primary Database**: PostgreSQL (Neon Serverless)
- **ORM**: Drizzle ORM with TypeScript
- **Migrations**: Drizzle Kit for schema management
- **Indexes**: 8 composite indexes for optimized queries
- **Connection Pooling**: Neon serverless driver with pooling

### Security Architecture
- **Authentication**: JWT tokens with secure storage
- **Authorization**: Role-based access control
- **Rate Limiting**: Multi-level (global, per-route, per-user)
- **Input Validation**: Zod schemas for all inputs
- **CORS**: Strict origin validation
- **CSP**: Content Security Policy via Helmet
- **Secrets Management**: Environment variables, never committed

## Key Relationships

### Frontend ↔ Backend
- REST API communication via fetch/axios
- WebSocket connection for real-time updates
- SSE for streaming analysis results
- JWT tokens in Authorization headers

### Backend ↔ Database
- Drizzle ORM for type-safe queries
- Connection pooling for performance
- Prepared statements for security

### Backend ↔ Redis
- Session storage
- API response caching
- Rate limiting counters
- Queue job storage (BullMQ)

### Backend ↔ AI Services
- Google Gemini API for analysis
- Retry logic with exponential backoff
- Response caching to reduce costs
- Queue-based processing for long tasks
