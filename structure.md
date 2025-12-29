# Project Structure

## Monorepo Organization
This is a pnpm workspace monorepo with two main packages and shared infrastructure.

```
the...copy/
├── frontend/          # Next.js 16 application
├── backend/           # Express.js API server
├── scripts/           # Shared build and deployment scripts
├── monitoring/        # Prometheus & Grafana configurations
├── redis/             # Redis configuration files
├── .github/           # CI/CD workflows and automation
└── docs/              # Project documentation
```

## Frontend Structure (`frontend/`)

### Core Directories
```
frontend/src/
├── app/                    # Next.js App Router pages
│   ├── (main)/            # Main application routes
│   │   ├── actorai-arabic/     # Actor AI features
│   │   │   └── self-tape-suite/  # Self-tape recording system
│   │   ├── directors-studio/    # Director's workspace
│   │   └── card-scanner/        # Landing page scanner
│   └── __smoke__/         # Smoke tests
├── components/            # Reusable React components
│   ├── ui/               # Shadcn/ui components (Radix UI based)
│   ├── card-scanner/     # Card scanner specific components
│   └── [feature]/        # Feature-specific components
├── hooks/                # Custom React hooks
│   ├── usePerformanceDetection.ts
│   └── [other hooks]
├── workers/              # Web Workers for heavy computations
│   └── particle-physics.worker.ts
├── lib/                  # Utility libraries and helpers
├── ai/                   # AI/ML integration (Genkit)
├── orchestration/        # Complex workflow orchestration
├── config/               # Application configuration
├── constants/            # Application constants
├── types/                # TypeScript type definitions
└── styles/               # Global styles and Tailwind config
```

### Key Frontend Patterns
- **App Router**: Next.js 16 App Router with route groups `(main)`
- **Component Architecture**: Shadcn/ui components with Radix UI primitives
- **State Management**: Zustand for global state, React Query for server state
- **Styling**: Tailwind CSS 4 with custom design system
- **Performance**: Web Workers, lazy loading, code splitting

## Backend Structure (`backend/`)

### Core Directories
```
backend/src/
├── controllers/          # Request handlers
│   └── metrics.controller.ts
├── services/            # Business logic layer
├── middleware/          # Express middleware
├── db/                  # Database schemas and migrations
├── queues/              # BullMQ job queues
├── config/              # Server configuration
├── utils/               # Utility functions
├── types/               # TypeScript types
└── __tests__/           # Test files
```

### Key Backend Patterns
- **Layered Architecture**: Controllers → Services → Database
- **Database**: Drizzle ORM with Neon PostgreSQL (serverless)
- **Job Queues**: BullMQ with Redis for background processing
- **API Design**: RESTful endpoints with OpenAPI documentation
- **Security**: Helmet, CSRF protection, rate limiting, session management

## Infrastructure & DevOps

### Monitoring Stack (`monitoring/`)
- **Prometheus**: Metrics collection and storage
- **Grafana**: Visualization dashboards
- **Sentry**: Error tracking and performance monitoring
- **OpenTelemetry**: Distributed tracing

### Redis Configuration (`redis/`)
- Redis server configurations
- Sentinel setup for high availability
- Windows-specific configurations

### CI/CD (`.github/workflows/`)
- **Security Scanning**: CodeQL, Snyk, Bearer, DevSkim, Trivy
- **Code Quality**: Codacy analysis
- **Testing**: Coverage reports, automated tests
- **Deployment**: Blue-green deployment, Firebase hosting
- **Database**: Neon workflow for database operations

## Shared Resources

### Scripts (`scripts/`)
- **Database**: Backup, restore, integrity verification
- **Deployment**: Blue-green deployment automation
- **Performance**: Image optimization, bundle analysis
- **Development**: Port management, service startup

### Documentation (`docs/`)
- Architecture Decision Records (ADRs)
- Performance optimization guides
- Operations documentation

## Configuration Files

### Root Level
- `pnpm-workspace.yaml`: Workspace configuration
- `package.json`: Monorepo scripts and dependencies
- `docker-compose.*.yml`: Container orchestration
- `.env*`: Environment configurations (dev, production, blue/green)

### Frontend Specific
- `next.config.ts`: Next.js configuration
- `tailwind.config.ts`: Tailwind CSS configuration
- `tsconfig.json`: TypeScript configuration
- `vitest.config.ts`: Test configuration
- `playwright.config.ts`: E2E test configuration

### Backend Specific
- `drizzle.config.ts`: Database ORM configuration
- `tsconfig.build.json`: Build-specific TypeScript config
- `openapi.yaml`: API documentation

## Architectural Patterns

### Frontend Architecture
1. **Server Components First**: Leverage React Server Components for data fetching
2. **Client Components**: Use 'use client' directive only when needed (interactivity, hooks)
3. **Progressive Enhancement**: Core functionality works without JavaScript
4. **Performance Budgets**: Enforced bundle size limits and performance metrics

### Backend Architecture
1. **Microservices Ready**: Modular design allows service extraction
2. **Queue-Based Processing**: Heavy operations handled asynchronously via BullMQ
3. **Caching Strategy**: Redis for session storage, API caching, and pub/sub
4. **Database Optimization**: Connection pooling, prepared statements, indexes

### Deployment Architecture
1. **Blue-Green Deployment**: Zero-downtime deployments with traffic switching
2. **Containerization**: Docker support for consistent environments
3. **Monitoring**: Comprehensive observability with metrics, logs, and traces
4. **High Availability**: Redis Sentinel, database replication ready
