# Technology Stack

## Programming Languages
- **TypeScript 5.7+**: Primary language for both frontend and backend
- **JavaScript**: Build scripts and configuration files
- **PowerShell**: Windows automation scripts
- **Bash**: Unix/Linux deployment scripts

## Frontend Technologies

### Core Framework
- **Next.js 16.1.1**: React framework with App Router
- **React 19.2.1**: UI library with latest features
- **React DOM 19.2.1**: React renderer

### UI & Styling
- **Tailwind CSS 4.1.16**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
  - @radix-ui/react-dialog, accordion, dropdown-menu, etc.
- **Framer Motion 12.23.26**: Animation library
- **GSAP 3.14.2**: Advanced animations and timeline control
- **Three.js 0.182.0**: 3D graphics and WebGL
- **Lucide React 0.562.0**: Icon library

### State Management & Data Fetching
- **Zustand 5.0.8**: Lightweight state management
- **TanStack React Query 5.90.10**: Server state management
- **React Hook Form 7.54.2**: Form state management
- **Zod 3.25.76**: Schema validation

### AI & ML Integration
- **Genkit 1.25.0**: AI workflow orchestration
- **@genkit-ai/google-genai 1.23.0**: Google AI integration
- **@google/generative-ai 0.24.1**: Gemini API client
- **Groq SDK 0.37.0**: Fast LLM inference

### Database & Backend Integration
- **Drizzle ORM 0.44.7**: Type-safe database client
- **Convex 1.31.2**: Real-time backend platform
- **Socket.io Client 4.8.1**: WebSocket communication
- **Redis 5.10.0**: Caching client

### Document Processing
- **PDF.js 5.4.449**: PDF parsing and rendering
- **Mammoth 1.7.0**: DOCX to HTML conversion
- **DOMPurify 3.3.0**: HTML sanitization

### Monitoring & Observability
- **@sentry/nextjs 10.32.1**: Error tracking and performance monitoring
- **@opentelemetry/sdk-trace-web**: Distributed tracing
- **Web Vitals 5.1.0**: Core Web Vitals measurement

### Development Tools
- **ESLint 8.57.0**: Code linting
- **Prettier 3.6.2**: Code formatting
- **Vitest 2.1.8**: Unit testing framework
- **Playwright 1.49.1**: E2E testing
- **@vitest/ui**: Test UI dashboard
- **@vitest/coverage-v8**: Code coverage

### Build & Optimization
- **@next/bundle-analyzer**: Bundle size analysis
- **Sharp 0.34.5**: Image optimization
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing
- **cssnano**: CSS minification

## Backend Technologies

### Core Framework
- **Express.js 5.1.0**: Web application framework
- **Node.js 20.x**: JavaScript runtime

### Database & ORM
- **Drizzle ORM 0.45.1**: Type-safe SQL ORM
- **Drizzle Kit 0.31.7**: Database migrations
- **@neondatabase/serverless 1.0.2**: Neon PostgreSQL client
- **MongoDB 7.0.0**: Document database client

### Job Queues & Background Processing
- **BullMQ 5.66.2**: Redis-based job queue
- **@bull-board/express 6.14.2**: Queue monitoring UI
- **Redis 5.10.0**: In-memory data store

### Authentication & Security
- **bcrypt 6.0.0**: Password hashing
- **jsonwebtoken 9.0.2**: JWT token generation
- **otplib 12.0.1**: OTP generation for 2FA
- **qrcode 1.5.4**: QR code generation
- **helmet 8.1.0**: Security headers
- **csurf 1.11.0**: CSRF protection
- **express-rate-limit 8.2.1**: Rate limiting

### Session Management
- **express-session 1.18.2**: Session middleware
- **connect-pg-simple 10.0.0**: PostgreSQL session store
- **cookie-parser 1.4.7**: Cookie parsing

### Real-time Communication
- **Socket.io 4.8.3**: WebSocket server
- **ws 8.18.3**: WebSocket library

### AI Integration
- **@google/generative-ai 0.24.1**: Gemini API
- **@modelcontextprotocol/sdk 1.22.0**: MCP server implementation

### Monitoring & Observability
- **@sentry/node 10.32.1**: Error tracking
- **@sentry/profiling-node 10.32.1**: Performance profiling
- **@opentelemetry/sdk-node**: Distributed tracing
- **prom-client 15.1.3**: Prometheus metrics
- **winston 3.11.0**: Logging library

### File Processing
- **multer 2.0.2**: File upload handling
- **mammoth 1.7.0**: DOCX processing
- **pdfjs-dist 5.4.394**: PDF parsing

### Utilities
- **axios 1.13.2**: HTTP client
- **compression 1.7.4**: Response compression
- **cors 2.8.5**: CORS middleware
- **dotenv 17.2.3**: Environment variables
- **uuid 13.0.0**: UUID generation
- **zod 4.1.12**: Schema validation

### Development Tools
- **tsx 4.7.0**: TypeScript execution
- **tsc-watch 7.2.0**: TypeScript watch mode
- **vitest 4.0.10**: Testing framework
- **supertest 7.1.3**: HTTP testing
- **ESLint 9.17.0**: Code linting

## Build System & Package Management

### Package Manager
- **pnpm 10.20.0**: Fast, disk space efficient package manager
- **pnpm workspaces**: Monorepo management

### Build Tools
- **TypeScript Compiler**: Type checking and compilation
- **Next.js Build**: Frontend bundling and optimization
- **esbuild 0.25.0**: Fast JavaScript bundler

## Infrastructure & DevOps

### Containerization
- **Docker**: Container runtime
- **Docker Compose**: Multi-container orchestration

### Monitoring Stack
- **Prometheus**: Metrics collection
- **Grafana**: Metrics visualization
- **Jaeger**: Distributed tracing (via OpenTelemetry)

### CI/CD
- **GitHub Actions**: Automated workflows
- **Firebase Hosting**: Static site deployment
- **Vercel**: Frontend deployment option

### Security Scanning
- **CodeQL**: Semantic code analysis
- **Snyk**: Dependency vulnerability scanning
- **Bearer**: Security and privacy scanning
- **DevSkim**: Security linting
- **Trivy**: Container security scanning
- **Codacy**: Code quality analysis

## Development Commands

### Root Level (Monorepo)
```bash
pnpm install              # Install all dependencies
pnpm dev                  # Start development servers
pnpm build                # Build all packages
pnpm test                 # Run all tests
pnpm lint                 # Lint frontend code
pnpm typecheck            # Type check all packages
pnpm ci                   # Run full CI pipeline locally
```

### Frontend Specific
```bash
pnpm --filter frontend dev              # Start dev server (port 5000)
pnpm --filter frontend build            # Production build
pnpm --filter frontend test             # Run unit tests
pnpm --filter frontend test:coverage    # Run tests with coverage
pnpm --filter frontend e2e              # Run E2E tests
pnpm --filter frontend lint             # Lint code
pnpm --filter frontend typecheck        # Type check
```

### Backend Specific
```bash
pnpm --filter @the-copy/backend dev           # Start dev server with watch
pnpm --filter @the-copy/backend build         # Build TypeScript
pnpm --filter @the-copy/backend start         # Start production server
pnpm --filter @the-copy/backend test          # Run tests
pnpm --filter @the-copy/backend db:generate   # Generate migrations
pnpm --filter @the-copy/backend db:push       # Push schema to database
pnpm --filter @the-copy/backend db:studio     # Open Drizzle Studio
pnpm --filter @the-copy/backend mcp           # Start MCP server
```

### Utility Scripts
```bash
# Windows PowerShell scripts
.\setup.ps1                    # Initial project setup
.\start-dev.ps1                # Start all development services
.\kill-dev.ps1                 # Stop all development services
.\scripts\start-app.ps1        # Start application
.\scripts\kill-ports.ps1       # Kill processes on specific ports

# Database operations
.\scripts\database\verify-neon-backup.ts      # Verify database backups
.\scripts\database\cleanup-test-dbs.sh        # Clean test databases

# Deployment
.\scripts\deploy\blue-green-deploy.sh         # Blue-green deployment
```

## Environment Configuration

### Required Environment Variables

#### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_FIREBASE_*`: Firebase configuration
- `NEXT_PUBLIC_CONVEX_URL`: Convex backend URL
- `GOOGLE_GENERATIVE_AI_API_KEY`: Gemini API key
- `GROQ_API_KEY`: Groq API key
- `SENTRY_DSN`: Sentry project DSN

#### Backend (.env)
- `DATABASE_URL`: PostgreSQL connection string
- `MONGODB_URI`: MongoDB connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: JWT signing secret
- `SESSION_SECRET`: Session encryption secret
- `GOOGLE_AI_API_KEY`: Google AI API key
- `SENTRY_DSN`: Sentry project DSN

## Version Requirements
- **Node.js**: 20.x (specified in .nvmrc)
- **pnpm**: >=10.0.0
- **TypeScript**: 5.7+
- **Next.js**: 16.x
- **React**: 19.x
