# Technology Stack - The Copy

## Programming Languages

### Primary Languages
- **TypeScript 5.7+**: All application code (frontend and backend)
- **JavaScript**: Build scripts and configuration files
- **PowerShell**: Windows automation scripts
- **Bash**: Unix/Linux deployment scripts

## Frontend Technologies

### Core Framework
- **Next.js 15.0.0**: React framework with App Router
- **React 18.3.1**: UI library
- **React DOM 18.3.1**: React renderer

### Styling & UI
- **Tailwind CSS 4.1.16**: Utility-first CSS framework
- **tailwindcss-animate 1.0.7**: Animation utilities
- **PostCSS 8**: CSS processing
- **shadcn/ui**: Component library built on Radix UI
- **Radix UI**: Unstyled, accessible component primitives
- **Framer Motion 11.0.0**: Animation library
- **GSAP 3.13.0**: Advanced animations
- **Three.js 0.180.0**: 3D graphics

### State Management & Data Fetching
- **Zustand 5.0.8**: Lightweight state management
- **TanStack Query 5.90.10**: Server state management
- **React Hook Form 7.54.2**: Form state management

### AI Integration
- **@google/generative-ai 0.24.1**: Google Gemini API client
- **genkit 1.23.0**: AI framework
- **@genkit-ai/google-genai 1.23.0**: Genkit Google AI plugin
- **@genkit-ai/next 1.23.0**: Genkit Next.js integration

### Validation & Types
- **Zod 3.23.8**: Schema validation
- **drizzle-zod 0.8.3**: Drizzle ORM Zod integration

### Utilities
- **date-fns 3.6.0**: Date manipulation
- **lucide-react 0.475.0**: Icon library
- **clsx 2.1.1**: Conditional classnames
- **tailwind-merge 3.0.1**: Tailwind class merging
- **dompurify 3.3.0**: XSS sanitization

## Backend Technologies

### Core Framework
- **Node.js 20.x**: JavaScript runtime
- **Express.js 5.1.0**: Web framework
- **TypeScript 5.0+**: Type-safe development

### Database & ORM
- **PostgreSQL**: Primary database (Neon Serverless)
- **@neondatabase/serverless 1.0.2**: Neon driver
- **Drizzle ORM 0.44.7**: TypeScript ORM
- **drizzle-kit 0.31.7**: Schema management

### Caching & Queues
- **Redis 5.10.0**: In-memory cache and session store
- **BullMQ 5.63.2**: Queue system for background jobs
- **@bull-board 6.14.2**: Queue monitoring UI

### AI & Document Processing
- **@google/generative-ai 0.24.1**: Google Gemini API
- **mammoth 1.7.0**: DOCX parsing
- **pdfjs-dist 5.4.394**: PDF parsing

### Security & Authentication
- **jsonwebtoken 9.0.2**: JWT tokens
- **bcrypt 6.0.0**: Password hashing
- **helmet 8.1.0**: Security headers
- **cors 2.8.5**: CORS middleware
- **express-rate-limit 8.2.1**: Rate limiting

### Monitoring & Logging
- **@sentry/node 10.26.0**: Error tracking
- **@sentry/profiling-node 10.26.0**: Performance profiling
- **winston 3.11.0**: Logging
- **prom-client 15.1.3**: Prometheus metrics

### Real-time Communication
- **socket.io 4.8.1**: WebSocket server
- **Server-Sent Events**: Built-in Express support

### Validation & Utilities
- **Zod 4.1.12**: Schema validation
- **uuid 13.0.0**: UUID generation
- **dotenv 17.2.3**: Environment variables
- **compression 1.7.4**: Response compression

## Development Tools

### Build Tools
- **pnpm 10.20.0**: Package manager (monorepo support)
- **tsc-watch 7.2.0**: TypeScript watch mode
- **tsx 4.7.0**: TypeScript execution
- **esbuild 0.25.0**: Fast bundler
- **@next/bundle-analyzer 16.0.3**: Bundle analysis

### Testing
- **Vitest 4.0.10**: Unit testing framework
- **@vitest/coverage-v8 4.0.10**: Code coverage
- **@vitest/ui 2.1.8**: Test UI
- **Playwright 1.49.1**: E2E testing
- **@testing-library/react 16.3.0**: React testing utilities
- **supertest 7.1.3**: API testing

### Code Quality
- **ESLint 9.17.0**: Linting
- **@typescript-eslint 8.47.0**: TypeScript ESLint
- **Prettier 3.6.2**: Code formatting
- **husky 9.1.7**: Git hooks
- **lint-staged 15.2.10**: Staged file linting

### Performance & Monitoring
- **@lhci/cli 0.15.1**: Lighthouse CI
- **web-vitals 4.2.4**: Core Web Vitals
- **sharp 0.34.5**: Image optimization

## Development Commands

### Monorepo Commands (Root)
```bash
# Start development environment
pnpm start:dev

# Stop all services
pnpm stop

# Run tests
pnpm test

# Lint all packages
pnpm lint

# Build all packages
pnpm build

# Type checking
pnpm typecheck
```

### Frontend Commands
```bash
# Development server (port 5000)
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Bundle analysis
pnpm analyze

# Run tests
pnpm test
pnpm test:coverage
pnpm test:watch

# E2E tests
pnpm e2e
pnpm e2e:ui
pnpm e2e:debug

# Linting
pnpm lint
pnpm lint:fix

# Type checking
pnpm typecheck

# Performance
pnpm perf:analyze
pnpm budget:check
pnpm lighthouse
```

### Backend Commands
```bash
# Development server with watch
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Run tests
pnpm test
pnpm test:coverage

# Database operations
pnpm db:generate    # Generate migrations
pnpm db:push        # Push schema to database
pnpm db:studio      # Open Drizzle Studio

# Performance analysis
pnpm perf:setup
pnpm perf:seed
pnpm perf:baseline
pnpm perf:apply-indexes
pnpm perf:compare

# Linting
pnpm lint
pnpm lint:fix

# Type checking
pnpm typecheck

# MCP Server
pnpm mcp
pnpm dev:mcp
```

## Environment Configuration

### Required Environment Variables

#### Frontend (.env)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

#### Backend (.env)
```bash
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:pass@host/db

# Redis
REDIS_URL=redis://localhost:6379
REDIS_ENABLED=true
QUEUE_ENABLED=true

# AI
GEMINI_API_KEY=your_gemini_key

# Security
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret

# Monitoring
SENTRY_DSN=your_sentry_dsn
```

## Build System

### Package Manager
- **pnpm workspaces**: Monorepo management
- **Shared dependencies**: Hoisted to root when possible
- **Overrides**: Specific version pinning for compatibility

### Build Process
1. **TypeScript Compilation**: `tsc` for type checking and compilation
2. **Next.js Build**: Optimized production build with code splitting
3. **Bundle Analysis**: Optional analysis with `ANALYZE=true`
4. **Asset Optimization**: Image optimization with Sharp
5. **Source Maps**: Generated for debugging (Sentry integration)

### Deployment Targets
- **Frontend**: Vercel (recommended) or custom Node.js server
- **Backend**: Custom Node.js server, Docker, or cloud platforms
- **Database**: Neon Serverless PostgreSQL
- **Redis**: Redis Cloud, AWS ElastiCache, or self-hosted
- **Monitoring**: Sentry for errors, Prometheus + Grafana for metrics

## Version Requirements
- **Node.js**: 20.x (LTS)
- **pnpm**: 10.20.0+
- **PostgreSQL**: 14+ (or Neon Serverless)
- **Redis**: 6.0+ (optional but recommended)
- **TypeScript**: 5.0+
