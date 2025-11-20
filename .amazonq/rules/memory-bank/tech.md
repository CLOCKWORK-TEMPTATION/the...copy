# Technology Stack - The Copy

## Programming Languages

### TypeScript 5.7+
- **Primary Language**: Used throughout frontend and backend
- **Strict Mode**: Enabled for type safety
- **Configuration**: Separate tsconfig.json for frontend/backend
- **Features Used**: Generics, utility types, type guards, discriminated unions

### JavaScript
- **Build Scripts**: Node.js scripts for automation
- **Legacy Code**: Some static assets (actorai-arabic/static-source)

## Frontend Technologies

### Core Framework
- **Next.js 15.4.7**: React framework with App Router
- **React 18.3.1**: UI library with concurrent features
- **Node.js 20.11.0+**: Runtime requirement

### UI & Styling
- **Tailwind CSS 4.1.16**: Utility-first CSS framework
- **shadcn/ui**: Component library built on Radix UI
- **Radix UI**: Accessible component primitives
- **Framer Motion 11.0**: Animation library
- **GSAP 3.13**: Advanced animations
- **Three.js 0.180**: 3D graphics (particle effects)

### State Management & Data Fetching
- **React Hooks**: useState, useEffect, useContext, custom hooks
- **Zustand 5.0.8**: Lightweight state management
- **TanStack Query 5.90.6**: Server state management
- **React Hook Form 7.54.2**: Form handling

### Validation & Types
- **Zod 3.25.76**: Schema validation
- **Drizzle Zod 0.8.3**: Database schema to Zod conversion

### AI Integration
- **Genkit 1.20.0**: AI framework
- **@genkit-ai/google-genai**: Google Gemini integration
- **@google/generative-ai 0.24.1**: Gemini API client

### Document Processing
- **pdfjs-dist 4.4.168**: PDF parsing
- **mammoth 1.7.0**: DOCX parsing
- **dompurify 3.3.0**: HTML sanitization

### Development Tools
- **Vitest 2.1.8**: Unit testing framework
- **Playwright 1.49.1**: E2E testing
- **ESLint 9.17.0**: Code linting
- **Prettier 3.6.2**: Code formatting
- **TypeScript 5.7.2**: Type checking

### Build & Optimization
- **@next/bundle-analyzer**: Bundle size analysis
- **sharp 0.34.5**: Image optimization
- **PostCSS**: CSS processing
- **cssnano**: CSS minification

### Monitoring
- **@sentry/nextjs 8.47.0**: Error tracking
- **web-vitals 4.2.4**: Performance metrics
- **Lighthouse CI**: Performance auditing

## Backend Technologies

### Core Framework
- **Node.js 20+**: JavaScript runtime
- **Express.js 4.18.2**: Web framework
- **TypeScript 5.0+**: Type safety

### Database & ORM
- **PostgreSQL**: Primary database (Neon Serverless)
- **Drizzle ORM 0.44.7**: TypeScript ORM
- **drizzle-kit 0.31.6**: Schema management and migrations
- **@neondatabase/serverless 1.0.2**: Neon database driver

### Caching & Queues
- **Redis 5.9.0**: In-memory cache and message broker
- **BullMQ 5.63.0**: Job queue system
- **@bull-board/express 6.14.0**: Queue monitoring UI

### Real-time Communication
- **Socket.IO 4.8.1**: WebSocket library
- **Server-Sent Events**: Built-in HTTP streaming

### AI Integration
- **@google/generative-ai 0.24.1**: Google Gemini API
- **@modelcontextprotocol/sdk 1.20.2**: MCP server

### Authentication & Security
- **jsonwebtoken 9.0.2**: JWT tokens
- **bcrypt 6.0.0**: Password hashing
- **helmet 7.1.0**: Security headers
- **cors 2.8.5**: CORS middleware
- **express-rate-limit 7.1.5**: Rate limiting
- **zod 3.25.76**: Input validation

### Document Processing
- **pdfjs-dist 4.4.168**: PDF parsing
- **mammoth 1.7.0**: DOCX parsing
- **multer 2.0.2**: File upload handling

### Monitoring & Logging
- **@sentry/node 10.23.0**: Error tracking
- **@sentry/profiling-node 10.23.0**: Performance profiling
- **winston 3.11.0**: Logging library
- **prom-client 15.1.3**: Prometheus metrics

### Testing
- **Vitest 4.0.2**: Unit testing
- **@vitest/coverage-v8 4.0.2**: Code coverage
- **supertest 7.1.3**: HTTP testing

### Development Tools
- **tsx 4.7.0**: TypeScript execution
- **tsc-watch 7.2.0**: TypeScript watch mode
- **ESLint 9.17.0**: Code linting
- **@typescript-eslint**: TypeScript ESLint plugins

### Utilities
- **dotenv 16.5.0**: Environment variables
- **uuid 13.0.0**: UUID generation
- **compression 1.7.4**: Response compression
- **cookie-parser 1.4.7**: Cookie parsing
- **express-session 1.18.2**: Session management

## DevOps & Infrastructure

### Package Management
- **pnpm 10.20.0**: Fast, disk-efficient package manager
- **pnpm workspaces**: Monorepo management

### Containerization
- **Docker**: Container runtime
- **Docker Compose**: Multi-container orchestration
- **Redis Container**: Development cache
- **PostgreSQL Container**: Development database (optional)

### CI/CD
- **GitHub Actions**: Automated workflows
- **Husky 9.1.7**: Git hooks
- **lint-staged 15.2.10**: Pre-commit linting

### Monitoring Stack
- **Prometheus**: Metrics collection
- **Grafana**: Metrics visualization
- **Sentry**: Error tracking and APM
- **Bull Board**: Queue monitoring

### Deployment
- **Vercel**: Frontend hosting (Next.js)
- **Custom VPS**: Backend hosting
- **Neon**: Serverless PostgreSQL
- **Redis Cloud**: Production cache (optional)

## Development Commands

### Root Level (Monorepo)
```bash
pnpm install              # Install all dependencies
pnpm start:dev            # Start both frontend and backend
pnpm kill:dev             # Stop all development servers
pnpm start:redis          # Start Redis server (Windows)
pnpm lint                 # Lint frontend code
pnpm test                 # Run frontend tests
pnpm build                # Build frontend
pnpm ci                   # Full CI pipeline
```

### Backend Commands
```bash
cd backend

# Development
pnpm dev                  # Start dev server with watch mode
pnpm dev:mcp              # Start MCP server in watch mode
pnpm build                # Compile TypeScript
pnpm start                # Start production server

# Database
pnpm db:generate          # Generate Drizzle migrations
pnpm db:push              # Push schema to database
pnpm db:studio            # Open Drizzle Studio

# Performance Analysis
pnpm perf:setup           # Setup performance testing
pnpm perf:seed            # Seed test data
pnpm perf:baseline        # Run baseline performance tests
pnpm perf:apply-indexes   # Apply database indexes
pnpm perf:post-optimization  # Run post-optimization tests
pnpm perf:compare         # Compare performance results

# Testing
pnpm test                 # Run unit tests
pnpm test:coverage        # Run tests with coverage

# Code Quality
pnpm lint                 # Run ESLint
pnpm lint:fix             # Fix ESLint issues
pnpm typecheck            # Type check without emitting
```

### Frontend Commands
```bash
cd frontend

# Development
pnpm dev                  # Start dev server (port 5000)
pnpm dev:fallback         # Start with fallback handling
pnpm build                # Production build
pnpm start                # Start production server
pnpm analyze              # Analyze bundle size

# AI Development
pnpm genkit:dev           # Start Genkit dev server
pnpm genkit:watch         # Start Genkit with watch mode

# Testing
pnpm test                 # Run unit tests
pnpm test:smoke           # Run smoke tests
pnpm test:watch           # Run tests in watch mode
pnpm test:coverage        # Run tests with coverage
pnpm test:ui              # Open Vitest UI
pnpm e2e                  # Run E2E tests
pnpm e2e:ui               # Run E2E tests with UI
pnpm e2e:debug            # Debug E2E tests

# Code Quality
pnpm lint                 # Run ESLint
pnpm lint:fix             # Fix ESLint issues
pnpm format               # Format code with Prettier
pnpm format:check         # Check code formatting
pnpm typecheck            # Type check without emitting

# Performance
pnpm lighthouse           # Run Lighthouse CI
pnpm budget:check         # Check performance budget
pnpm budget:report        # Generate budget report
pnpm performance:report   # Generate performance report

# Build & Deploy
pnpm prebuild             # Generate pages manifest
pnpm build:production     # Production build with optimizations
pnpm sentry:sourcemaps    # Upload sourcemaps to Sentry
```

## Environment Variables

### Backend (.env)
```bash
# Server
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5000

# Database
DATABASE_URL=postgresql://user:pass@host/db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Google Gemini
GEMINI_API_KEY=your-api-key

# Sentry
SENTRY_DSN=your-sentry-dsn
SENTRY_ENVIRONMENT=development
```

### Frontend (.env.local)
```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:3001

# Sentry
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_AUTH_TOKEN=your-auth-token

# Gemini
NEXT_PUBLIC_GEMINI_API_KEY=your-api-key
```

## Build System

### Frontend Build
- **Compiler**: Next.js compiler (SWC)
- **Bundler**: Webpack (Next.js default)
- **Output**: `.next/` directory
- **Optimizations**: Code splitting, tree shaking, minification
- **Static Export**: Supports static HTML export

### Backend Build
- **Compiler**: TypeScript compiler (tsc)
- **Output**: `dist/` directory
- **Watch Mode**: tsc-watch for development
- **Module System**: CommonJS

### Asset Optimization
- **Images**: Sharp for optimization
- **CSS**: PostCSS with cssnano
- **JavaScript**: Terser minification
- **Fonts**: Self-hosted with optimization

## Version Requirements

### Minimum Versions
- Node.js: 20.11.0+
- npm: 10.0.0+
- pnpm: 10.20.0
- TypeScript: 5.0+
- PostgreSQL: 14+
- Redis: 6.0+

### Recommended Versions
- Node.js: 20.x LTS
- pnpm: Latest stable
- PostgreSQL: 15+ (Neon Serverless)
- Redis: 7.x

## Browser Support

### Frontend
- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- Mobile browsers: iOS Safari 14+, Chrome Android 90+

### Features Used
- ES2020+ syntax
- CSS Grid and Flexbox
- WebSocket API
- EventSource (SSE)
- Web Vitals API
- Intersection Observer
- ResizeObserver
