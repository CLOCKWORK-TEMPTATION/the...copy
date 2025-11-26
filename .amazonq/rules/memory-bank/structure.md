# Project Structure - The Copy

## Repository Organization

This is a **pnpm monorepo** with two main packages:

```
theeeecopy/
├── backend/          # Express.js API server
├── frontend/         # Next.js web application
├── docs/            # Project documentation
├── scripts/         # Build and deployment scripts
├── monitoring/      # Prometheus & Grafana configs
├── redis/           # Redis Windows binaries
└── pnpm-workspace.yaml
```

## Backend Structure (`/backend`)

### Core Directories

```
backend/
├── src/
│   ├── config/           # Configuration files (database, redis, queues)
│   ├── controllers/      # Request handlers (projects, scenes, characters, shots, analysis, metrics, realtime)
│   ├── db/              # Database schema and connection (Drizzle ORM)
│   ├── middleware/      # Express middleware (auth, validation, rate limiting, error handling)
│   ├── queues/          # BullMQ job processors (AI analysis, document processing)
│   ├── services/        # Business logic (AI, cache, websocket, SSE, document parsing)
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions (validation, logging, security)
│   ├── server.ts        # Main Express server
│   └── mcp-server.ts    # Model Context Protocol server
├── db-performance-analysis/  # Database optimization tools and reports
├── migrations/          # SQL migration files
├── drizzle/            # Drizzle ORM metadata
└── docs/               # Backend-specific documentation
```

### Key Components

**Database Layer** (`src/db/`)
- `schema.ts`: Drizzle ORM schema definitions (users, projects, scenes, characters, shots, analyses)
- `index.ts`: Database connection and query helpers
- Uses PostgreSQL (Neon Serverless) with connection pooling

**Services** (`src/services/`)
- `ai.service.ts`: Google Gemini API integration for analysis
- `cache.service.ts`: Redis caching with TTL management
- `websocket.service.ts`: Socket.IO WebSocket management
- `sse.service.ts`: Server-Sent Events streaming
- `document.service.ts`: PDF/DOCX parsing (pdfjs-dist, mammoth)

**Queue System** (`src/queues/`)
- `ai-analysis.queue.ts`: Background AI analysis jobs
- `document-processing.queue.ts`: Async document parsing
- Uses BullMQ with Redis backend
- Bull Board dashboard at `/admin/queues`

**Controllers** (`src/controllers/`)
- RESTful API endpoints for CRUD operations
- Real-time endpoints for WebSocket/SSE connections
- Metrics endpoints for Prometheus

**Middleware** (`src/middleware/`)
- `auth.middleware.ts`: JWT authentication
- `validation.middleware.ts`: Zod schema validation
- `rate-limit.middleware.ts`: Multi-level rate limiting
- `error.middleware.ts`: Centralized error handling
- `security.middleware.ts`: Helmet, CORS, CSP

## Frontend Structure (`/frontend`)

### Core Directories

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (main)/            # Main application routes
│   │   │   ├── directors-studio/    # Directors Studio feature
│   │   │   ├── actorai-arabic/      # Seven Stations Analysis
│   │   │   └── ...
│   │   ├── api/               # API route handlers
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components (button, dialog, card, etc.)
│   │   ├── landing/          # Landing page components
│   │   └── ...               # Feature-specific components
│   ├── lib/                  # Utility libraries
│   │   ├── api.ts           # API client functions
│   │   ├── utils.ts         # Helper functions
│   │   └── validations.ts   # Zod schemas
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript type definitions
│   ├── config/              # Configuration files
│   ├── styles/              # Global styles and Tailwind
│   ├── ai/                  # Genkit AI integration
│   ├── orchestration/       # Multi-agent orchestration
│   └── middleware.ts        # Next.js middleware
├── public/                  # Static assets
│   ├── images/
│   ├── fonts/
│   └── directors-studio/
├── tests/                   # Test files
│   ├── unit/
│   └── e2e/
└── scripts/                 # Build and utility scripts
```

### Key Components

**App Router** (`src/app/`)
- Server and client components
- Nested layouts for different sections
- API routes for backend communication
- Parallel routes for complex UIs

**UI Components** (`src/components/ui/`)
- shadcn/ui component library
- Radix UI primitives
- Tailwind CSS styling
- Accessible and customizable

**Directors Studio** (`src/app/(main)/directors-studio/`)
- Project management interface
- Scene breakdown tools
- Character tracking
- Shot list generation
- Tab-based navigation (Overview, Scenes, Characters, Shots)

**Seven Stations Analysis** (`src/app/(main)/actorai-arabic/`)
- Script upload and parsing
- AI analysis interface
- Real-time progress tracking
- Results visualization

**API Integration** (`src/lib/api.ts`)
- Centralized API client
- Error handling
- Request/response typing
- Authentication headers

## Documentation Structure (`/docs`)

```
docs/
├── performance-optimization/    # Performance guides
│   ├── README.md
│   ├── QUICK_START.md
│   ├── IMPLEMENTATION_PLAN.md
│   └── ...
├── operations/                 # Operational runbooks
│   ├── REDIS_WINDOWS.md
│   ├── ROLLBACK_PLAN.md
│   └── RUNBOOKS.md
├── adrs/                      # Architecture Decision Records
│   └── 001-multi-agent-ai-architecture.md
├── realtime-communication.md  # WebSocket/SSE guide
├── METRICS_DASHBOARD.md       # Monitoring guide
└── CDN_SETUP.md              # CDN configuration
```

## Configuration Files

### Root Level
- `pnpm-workspace.yaml`: Monorepo workspace configuration
- `package.json`: Root package with shared scripts
- `.env`: Environment variables (not committed)
- `.env.example`: Environment variable template

### Backend
- `tsconfig.json`: TypeScript configuration
- `drizzle.config.ts`: Drizzle ORM configuration
- `vitest.config.ts`: Test configuration
- `docker-compose.yml`: Docker services (Redis, PostgreSQL)
- `.eslintrc.js`: ESLint rules

### Frontend
- `next.config.ts`: Next.js configuration
- `tailwind.config.ts`: Tailwind CSS configuration
- `tsconfig.json`: TypeScript configuration
- `vitest.config.ts`: Vitest configuration
- `playwright.config.ts`: E2E test configuration
- `sentry.client.config.ts`: Sentry monitoring

## Architectural Patterns

### Backend Architecture
- **Layered Architecture**: Controllers → Services → Database
- **Repository Pattern**: Database access abstraction via Drizzle ORM
- **Service Layer**: Business logic separation
- **Middleware Pipeline**: Request processing chain
- **Queue-Based Processing**: Async jobs with BullMQ
- **Caching Strategy**: Redis for frequently accessed data

### Frontend Architecture
- **App Router**: File-based routing with layouts
- **Server Components**: Default server-side rendering
- **Client Components**: Interactive UI with 'use client'
- **API Routes**: Backend communication layer
- **Component Composition**: Reusable UI components
- **State Management**: React Hooks + Zustand for global state

### Communication Patterns
- **REST API**: Standard CRUD operations
- **WebSocket**: Bidirectional real-time updates
- **SSE**: Server-to-client streaming (logs, progress)
- **Job Queues**: Background processing with status updates

### Data Flow
1. **User Request** → Frontend (Next.js)
2. **API Call** → Backend (Express.js)
3. **Authentication** → JWT Middleware
4. **Validation** → Zod Schema Validation
5. **Business Logic** → Service Layer
6. **Data Access** → Drizzle ORM → PostgreSQL
7. **Caching** → Redis (read-through/write-through)
8. **Background Jobs** → BullMQ → Worker Processes
9. **Real-time Updates** → WebSocket/SSE → Frontend
10. **Response** → JSON → Frontend → UI Update

## Database Schema

### Core Tables
- `users`: User accounts and authentication
- `projects`: Film/TV projects
- `scenes`: Individual scenes within projects
- `characters`: Character definitions and tracking
- `shots`: Shot lists with camera details
- `analyses`: AI analysis results
- `sessions`: User session management

### Relationships
- Projects → Scenes (one-to-many)
- Projects → Characters (one-to-many)
- Scenes → Shots (one-to-many)
- Projects → Analyses (one-to-many)
- Users → Projects (one-to-many, via userId)

### Indexes
- Composite indexes on (userId, projectId) for fast filtering
- Indexes on foreign keys for join performance
- Partial indexes for active records
- See `backend/migrations/add-performance-indexes.sql`

## Deployment Architecture

### Frontend (Vercel)
- Automatic deployments from Git
- Edge network distribution
- Serverless functions for API routes
- Image optimization
- Analytics and monitoring

### Backend (Custom/VPS)
- Node.js process with PM2
- Nginx reverse proxy
- Redis for caching and queues
- PostgreSQL (Neon Serverless)
- SSL/TLS termination

### Monitoring Stack
- Sentry: Error tracking and performance
- Prometheus: Metrics collection
- Grafana: Metrics visualization
- Bull Board: Queue monitoring
- Custom health checks

## Development Workflow

### Local Development
1. Start Redis: `pnpm start:redis`
2. Start Backend: `cd backend && pnpm dev`
3. Start Frontend: `cd frontend && pnpm dev`
4. Access: Frontend (localhost:5000), Backend (localhost:3001)

### Testing
- Unit tests: Vitest
- E2E tests: Playwright
- Coverage: Vitest coverage
- Linting: ESLint
- Type checking: TypeScript compiler

### Build Process
1. Type checking
2. Linting
3. Unit tests
4. Build (TypeScript → JavaScript)
5. Bundle optimization
6. E2E tests
7. Deployment
