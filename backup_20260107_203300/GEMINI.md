# The Copy Monorepo - GEMINI Context

## Project Overview
**The Copy** is a full-stack drama analysis platform and landing page ("النسخة") organized as a monorepo. It leverages modern web technologies to provide AI-driven analysis of screenplays.

*   **Architecture:** Monorepo managed by `pnpm`.
*   **Frontend (`frontend/`):** Next.js 16, React 19, TailwindCSS 4, GSAP, Three.js, Framer Motion. Focus on high-end visuals (Video Text Mask, Cards Scanner).
*   **Backend (`backend/`):** Node.js (Express), Drizzle ORM (PostgreSQL/Neon), Redis (BullMQ), Google GenAI, OpenTelemetry.
*   **Infrastructure:** Docker Compose for local services (Redis, Jaeger), PowerShell scripts for Windows orchestration.

## Key Directories
*   `frontend/`: Next.js application (User Interface).
*   `backend/`: Node.js Express API (Business Logic, AI processing).
*   `scripts/`: Utility scripts (PowerShell & Node.js) for build, test, and deployment.
*   `redis/`: Redis configuration and startup scripts.
*   `docker-compose.dev.yml`: Local development services definition.

## Building and Running

### Prerequisites
*   Node.js v20.x
*   pnpm v10.x
*   Docker Desktop (for Redis/Jaeger)
*   PowerShell (primary shell for scripts)

### Setup
1.  **Install Dependencies:**
    ```powershell
    pnpm install
    ```
2.  **Environment Variables:**
    *   Copy `.env.example` to `.env` in the root.
    *   Copy `frontend/.env.example` to `frontend/.env`.
    *   Copy `backend/.env.example` to `backend/.env`.
    *   Populate keys (Database URL, Redis, Google GenAI, Sentry).

### Development Commands
*   **Start All (Dev Mode):**
    ```powershell
    pnpm dev
    # Or directly:
    ./start-dev.ps1
    ```
*   **Start Backend Only:**
    ```powershell
    cd backend
    pnpm dev
    ```
*   **Start Frontend Only:**
    ```powershell
    cd frontend
    pnpm dev
    ```
*   **Start Infrastructure (Redis + Jaeger):**
    ```powershell
    docker-compose -f docker-compose.dev.yml up -d
    ```

### Testing & Quality
*   **Run All Tests:** `pnpm ci`
*   **Frontend Tests:** `pnpm --filter frontend test` (Vitest)
*   **E2E Tests:** `pnpm --filter frontend e2e` (Playwright)
*   **Linting:** `pnpm lint`

## Development Conventions
*   **Language:** TypeScript is strictly enforced.
*   **Styling:** TailwindCSS 4 with `stylelint`.
*   **Formatting:** Prettier.
*   **Linting:** ESLint with strict rules (including no duplicate exports).
*   **Database:** Drizzle ORM. Always generate/push migrations via backend scripts (`npm run db:generate`).
*   **Observability:** OpenTelemetry and Sentry are integrated. Do not remove instrumentation code.
*   **OS Compatibility:** Windows (PowerShell) is the primary dev environment. Bash scripts exist but PowerShell is preferred.

## Current Status & Active Tasks
*   **Critical UI Fix:** There is an active task to fix the "LauncherCenterCard" component in `frontend/src/components/LauncherCenterCard.tsx`. The slogan "بس اصلي" is overlapping with cards.
    *   **Fix:** Adjust `top` positioning and margins.
