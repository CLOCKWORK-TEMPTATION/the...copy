# Project Structure - The Copy

## Architecture Overview
The Copy is a **monorepo** using pnpm workspaces with three main packages:
- **frontend**: Next.js 14 application (App Router)
- **backend**: Express.js REST API with TypeScript
- **monitoring**: Prometheus + Grafana observability stack

## Directory Structure

```
the-copy/
├── frontend/              # Next.js 14 frontend application
│   ├── src/
│   │   ├── app/          # Next.js App Router pages
│   │   │   ├── (main)/  # Main application routes
│   │   │   │   ├── directors-studio/    # Production management UI
│   │   │   │   ├── editor/              # Screenplay editor
│   │   │   │   └── actorai-arabic/      # Seven stations analysis
│   │   │   └── api/     # Next.js API routes
│   │   ├── components/   # Reusable React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility libraries
│   │   ├── ai/           # Genkit AI integration
│   │   ├── orchestration/ # Multi-agent AI orchestration
│   │   ├── types/        # TypeScript type definitions
│   │   └── workers/      # Web Workers for heavy processing
│   ├── public/           # Static assets
│   └── tests/            # Frontend tests (Vitest, Playwright)
│
├── backend/              # Express.js backend API
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── services/     # Business logic layer
│   │   ├── db/           # Database schema (Drizzle ORM)
│   │   ├── queues/       # BullMQ job processors
│   │   ├── middleware/   # Express middleware
│   │   ├── config/       # Configuration management
│   │   ├── utils/        # Helper functions
│   │   ├── types/        # TypeScript types
│   │   └── server.ts     # Express app entry point
│   ├── drizzle/          # Database migrations
│   └── scripts/          # Utility scripts
│
├── monitoring/           # Observability stack
│   ├── grafana/         # Grafana dashboards
│   └── prometheus.yml   # Prometheus configuration
│
├── docs/                # Documentation
│   ├── performance-optimization/  # Performance guides
│   ├── operations/      # Runbooks and operational docs
│   └── adrs/            # Architecture Decision Records
│
├── scripts/             # Root-level utility scripts
├── redis/               # Redis configuration files
└── dev-tools/           # Development utilities
    └── db-analysis/     # Database performance tools
```

## Core Components

### Frontend Architecture

#### App Router Structure
- **(main)**: Main application layout with shared navigation
  - **directors-studio**: Project management, scenes, shots, characters
  - **editor**: Screenplay editing with real-time analysis
  - **actorai-arabic**: Seven stations dramatic analysis interface

#### Key Frontend Modules
- **components/**: shadcn/ui + custom Radix UI components
- **hooks/**: React hooks for state management and side effects
- **ai/**: Genkit integration for AI features
- **orchestration/**: Multi-agent AI coordination system
- **workers/**: Web Workers for PDF parsing and heavy computations

### Backend Architecture

#### Layered Structure
1. **Controllers**: HTTP request/response handling, validation
2. **Services**: Business logic, database operations, AI integration
3. **Queues**: Background job processing (analysis, exports)
4. **Middleware**: Authentication, rate limiting, error handling

#### Key Backend Modules
- **db/schema/**: Drizzle ORM schema definitions
  - projects, scenes, shots, characters tables
  - User authentication and sessions
- **queues/**: BullMQ processors
  - Analysis queue for AI processing
  - Export queue for PDF/DOCX generation
- **services/**: Core business logic
  - gemini.service.ts: AI analysis integration
  - cache.service.ts: Redis caching layer
  - websocket.service.ts: Real-time updates

### Database Schema (PostgreSQL)

#### Core Tables
- **users**: User accounts and authentication
- **projects**: Top-level screenplay projects
- **scenes**: Individual scenes within projects
- **shots**: Camera shots within scenes
- **characters**: Character definitions and tracking
- **analysis_results**: Cached AI analysis outputs
- **sessions**: User session management

#### Relationships
- Projects → Scenes (one-to-many)
- Scenes → Shots (one-to-many)
- Projects → Characters (many-to-many)
- Scenes → Characters (many-to-many)

### Queue System (BullMQ + Redis)

#### Job Types
1. **analysis-jobs**: Long-running AI analysis tasks
2. **export-jobs**: PDF/DOCX generation
3. **extraction-jobs**: Scene/character extraction from scripts
4. **notification-jobs**: User notifications and emails

#### Queue Features
- Priority-based processing
- Retry logic with exponential backoff
- Progress tracking via WebSocket
- Bull Board admin UI at `/admin/queues`

## Data Flow

### Script Analysis Flow
1. User uploads script (PDF/DOCX) via frontend
2. Frontend sends to `/api/projects/:id/analyze`
3. Backend validates and queues analysis job
4. BullMQ worker processes with Gemini API
5. Results cached in Redis and PostgreSQL
6. WebSocket pushes updates to frontend
7. Frontend displays analysis results

### Real-Time Updates Flow
1. Client connects via WebSocket on page load
2. Backend subscribes client to project channel
3. Any project update triggers Redis pub/sub
4. WebSocket broadcasts to all subscribed clients
5. Frontend updates UI reactively

## Configuration Management

### Environment Variables
- **frontend/.env**: Next.js config, API URLs, Sentry DSN
- **backend/.env**: Database URLs, Redis, API keys, JWT secrets
- **Root .env**: Shared configuration (deprecated, being phased out)

### Configuration Files
- **next.config.ts**: Next.js build and runtime config
- **drizzle.config.ts**: Database connection and migrations
- **tsconfig.json**: TypeScript compiler options (per package)
- **pnpm-workspace.yaml**: Monorepo workspace definition

## Build & Deployment

### Development
- Frontend: `pnpm dev` (port 5000)
- Backend: `pnpm dev` (port 3001)
- Redis: Docker Compose or Windows service

### Production
- Frontend: Vercel deployment (automatic from main branch)
- Backend: Custom deployment (Render/Railway/VPS)
- Database: Neon Serverless PostgreSQL
- Redis: Upstash or self-hosted

### CI/CD
- GitHub Actions workflows (optional)
- Pre-commit hooks via Husky
- Automated testing on push
- Bundle size monitoring

## Security Architecture

### Authentication
- JWT-based authentication
- HTTP-only cookies for token storage
- Session management via PostgreSQL

### Authorization
- Role-based access control (RBAC)
- Project-level permissions
- API key validation for external access

### Security Layers
1. **Helmet**: Security headers (CSP, HSTS)
2. **CORS**: Strict origin validation
3. **Rate Limiting**: Multi-tier limits (IP, user, endpoint)
4. **Input Validation**: Zod schemas on all endpoints
5. **SQL Injection Prevention**: Parameterized queries via Drizzle
6. **XSS Protection**: DOMPurify on frontend

## Monitoring & Observability

### Error Tracking
- Sentry for both frontend and backend
- Source maps for production debugging
- Performance monitoring and profiling

### Metrics
- Prometheus metrics at `/metrics`
- Custom business metrics (analysis count, user activity)
- Grafana dashboards for visualization

### Logging
- Winston logger in backend
- Structured JSON logs
- Log levels: error, warn, info, debug
- Security event logging

## Performance Optimizations

### Frontend
- Code splitting via Next.js dynamic imports
- Image optimization with next/image
- Bundle analysis and tree shaking
- Service Worker for offline support
- React.memo and useMemo for expensive renders

### Backend
- Redis caching (60% query reduction)
- Database indexes (8 composite indexes)
- Connection pooling (Neon serverless)
- Response compression (gzip/brotli)
- Query optimization (N+1 prevention)

### Database
- Composite indexes on frequently queried columns
- Partial indexes for filtered queries
- Query result caching in Redis
- Connection pooling and reuse
