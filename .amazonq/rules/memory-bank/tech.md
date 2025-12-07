# Technology Stack - The Copy

## Programming Languages
- **TypeScript 5.7+**: Primary language for both frontend and backend
- **JavaScript**: Legacy code and build scripts
- **SQL**: Database queries and migrations

## Frontend Stack

### Core Framework
- **Next.js 16.0.7**: React framework with App Router
- **React 19.2.1**: UI library with latest concurrent features
- **React DOM 19.2.1**: DOM rendering

### UI Components & Styling
- **Tailwind CSS 4.1.16**: Utility-first CSS framework
- **shadcn/ui**: Accessible component library built on Radix UI
- **Radix UI**: Unstyled, accessible component primitives
  - Dialog, Dropdown, Popover, Toast, Tabs, etc.
- **Framer Motion 11.0**: Animation library
- **GSAP 3.13**: Advanced animations and timeline control
- **Lucide React 0.475**: Icon library

### State Management & Data Fetching
- **Zustand 5.0.8**: Lightweight state management
- **TanStack Query 5.90.10**: Server state management and caching
- **React Hook Form 7.54.2**: Form state and validation
- **Zod 3.25.76**: Schema validation

### AI & Analysis
- **Genkit 1.25.0**: AI orchestration framework
- **@genkit-ai/google-genai 1.23.0**: Google Gemini integration
- **@google/generative-ai 0.24.1**: Direct Gemini API client

### 3D & Graphics
- **Three.js 0.180.0**: 3D graphics library
- **Embla Carousel 8.6.0**: Carousel component

### Document Processing
- **pdfjs-dist 4.4.168**: PDF parsing and rendering
- **mammoth 1.7.0**: DOCX to HTML conversion
- **DOMPurify 3.3.0**: XSS sanitization

### Development Tools
- **Vitest 2.1.8**: Unit testing framework
- **@vitest/ui**: Test UI dashboard
- **Playwright 1.49.1**: E2E testing
- **ESLint 8.57.0**: Linting with TypeScript support
- **Prettier 3.6.2**: Code formatting
- **Husky 9.1.7**: Git hooks

### Build & Optimization
- **@next/bundle-analyzer**: Bundle size analysis
- **sharp 0.34.5**: Image optimization
- **PostCSS 8**: CSS processing
- **cssnano 6.0.2**: CSS minification

### Monitoring
- **@sentry/nextjs 8.55.0**: Error tracking and performance monitoring
- **web-vitals 4.2.4**: Core Web Vitals measurement
- **@lhci/cli 0.15.1**: Lighthouse CI

## Backend Stack

### Core Framework
- **Node.js 20.x**: JavaScript runtime
- **Express 5.1.0**: Web framework
- **TypeScript 5.0+**: Type safety

### Database & ORM
- **PostgreSQL**: Primary database (Neon Serverless)
- **Drizzle ORM 0.44.7**: TypeScript ORM
- **drizzle-kit 0.31.7**: Schema migrations
- **@neondatabase/serverless 1.0.2**: Serverless Postgres driver
- **MongoDB 7.0.0**: Document storage (legacy, being phased out)

### Caching & Queues
- **Redis 5.10.0**: Caching and pub/sub
- **BullMQ 5.63.2**: Job queue system
- **@bull-board/* 6.14.2**: Queue monitoring UI

### AI Integration
- **@google/generative-ai 0.24.1**: Gemini API client
- **@modelcontextprotocol/sdk 1.22.0**: MCP server implementation

### Authentication & Security
- **jsonwebtoken 9.0.2**: JWT token generation/validation
- **bcrypt 6.0.0**: Password hashing
- **helmet 8.1.0**: Security headers
- **cors 2.8.5**: CORS middleware
- **express-rate-limit 8.2.1**: Rate limiting
- **express-session 1.18.2**: Session management
- **cookie-parser 1.4.7**: Cookie handling
- **zod 4.1.12**: Input validation

### Real-Time Communication
- **socket.io 4.8.1**: WebSocket server
- **ws 8.18.3**: WebSocket client

### Monitoring & Logging
- **@sentry/node 10.26.0**: Error tracking
- **@sentry/profiling-node 10.26.0**: Performance profiling
- **winston 3.11.0**: Logging framework
- **prom-client 15.1.3**: Prometheus metrics

### File Processing
- **multer 2.0.2**: File upload handling
- **mammoth 1.7.0**: DOCX processing
- **pdfjs-dist 5.4.394**: PDF processing

### Utilities
- **uuid 13.0.0**: UUID generation
- **compression 1.7.4**: Response compression
- **dotenv 17.2.3**: Environment variable management
- **module-alias 2.2.3**: Path aliasing

### Testing
- **Vitest 4.0.10**: Unit testing
- **@vitest/coverage-v8 4.0.10**: Code coverage
- **supertest 7.1.3**: HTTP testing

### Development Tools
- **tsx 4.7.0**: TypeScript execution
- **tsc-watch 7.2.0**: TypeScript watch mode
- **ESLint 9.17.0**: Linting
- **@typescript-eslint/* 8.47.0**: TypeScript ESLint plugins

## Infrastructure & DevOps

### Package Management
- **pnpm 10.20.0**: Fast, disk-efficient package manager
- **pnpm workspaces**: Monorepo management

### Containerization
- **Docker**: Container runtime
- **Docker Compose**: Multi-container orchestration

### Hosting & Deployment
- **Vercel**: Frontend hosting (production)
- **Neon**: Serverless PostgreSQL
- **Upstash/Self-hosted**: Redis hosting
- **Firebase**: Static hosting (alternative)

### CI/CD
- **GitHub Actions**: Automated workflows
- **Husky**: Pre-commit/pre-push hooks
- **lint-staged**: Staged file linting

### Monitoring Stack
- **Prometheus**: Metrics collection
- **Grafana**: Metrics visualization
- **Sentry**: Error tracking and APM
- **Bull Board**: Queue monitoring

## Development Commands

### Root Level (Monorepo)
```bash
pnpm install              # Install all dependencies
pnpm dev                  # Start all services
pnpm build                # Build all packages
pnpm test                 # Run all tests
pnpm lint                 # Lint all packages
pnpm typecheck            # Type check all packages
```

### Frontend
```bash
cd frontend
pnpm dev                  # Start dev server (port 5000)
pnpm build                # Production build
pnpm start                # Start production server
pnpm test                 # Run unit tests
pnpm test:coverage        # Test with coverage
pnpm e2e                  # Run Playwright tests
pnpm lint                 # Lint code
pnpm format               # Format with Prettier
pnpm typecheck            # Type check
pnpm analyze              # Analyze bundle size
pnpm lighthouse           # Run Lighthouse CI
```

### Backend
```bash
cd backend
pnpm dev                  # Start dev server (port 3001)
pnpm build                # Compile TypeScript
pnpm start                # Start production server
pnpm test                 # Run unit tests
pnpm test:coverage        # Test with coverage
pnpm lint                 # Lint code
pnpm typecheck            # Type check
pnpm db:generate          # Generate migrations
pnpm db:push              # Push schema to database
pnpm db:studio            # Open Drizzle Studio
```

### Database Performance
```bash
cd backend
pnpm perf:setup           # Setup test database
pnpm perf:seed            # Seed test data
pnpm perf:baseline        # Run baseline tests
pnpm perf:apply-indexes   # Apply optimizations
pnpm perf:post-optimization  # Test after optimization
pnpm perf:compare         # Compare results
```

## Version Requirements

### Node.js
- **Required**: 20.x
- **Recommended**: 20.11.0 or later
- **Package Manager**: pnpm 10.20.0+

### Browser Support
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Android 90+
- **No IE11 Support**: Modern JavaScript features required

## Environment Variables

### Frontend (.env)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_SENTRY_DSN=<sentry-dsn>
SENTRY_AUTH_TOKEN=<sentry-token>
```

### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://user:pass@host/db
MONGODB_URI=mongodb://user:pass@host/db

# Redis
REDIS_URL=redis://localhost:6379

# AI
GEMINI_API_KEY=<google-api-key>

# Auth
JWT_SECRET=<secret>
SESSION_SECRET=<secret>

# Monitoring
SENTRY_DSN=<sentry-dsn>
```

## Build Outputs

### Frontend
- **.next/**: Next.js build output
- **.next/static/**: Static assets with hashes
- **.next/server/**: Server-side code
- **public/**: Static files served as-is

### Backend
- **dist/**: Compiled JavaScript from TypeScript
- **drizzle/**: Generated migration files

## Performance Targets

### Frontend
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **Cumulative Layout Shift**: < 0.1
- **Bundle Size**: < 300KB (main bundle)

### Backend
- **API Response Time**: < 200ms (p95)
- **Database Query Time**: < 50ms (p95)
- **Cache Hit Rate**: > 80%
- **Queue Processing**: < 5s per job (p95)

## Security Standards
- **HTTPS Only**: TLS 1.3 in production
- **CSP**: Strict Content Security Policy
- **HSTS**: HTTP Strict Transport Security enabled
- **Rate Limiting**: 100 req/min per IP, 1000 req/min per user
- **Password Policy**: bcrypt with 12 rounds
- **JWT Expiry**: 24 hours (access), 7 days (refresh)
