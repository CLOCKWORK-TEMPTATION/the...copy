# Project Configuration - The Copy

## Git Configuration

### Root .gitignore

The root `.gitignore` defines global ignore patterns for the monorepo.

**Key Ignore Patterns:**

- **Environment & Secrets**: `.env*` (except `.env.example`, `.env.template`), `secrets/`, `credentials/`, `*.pem`, `*.key`.
- **Dependencies**: `node_modules/`, `.pnpm-store/`.
- **Build Outputs**: `.next/`, `out/`, `dist/`, `build/`.
- **Logs**: `logs/`, `*.log`, `npm-debug.log*`.
- **System & IDE**: `.DS_Store`, `Thumbs.db`, `.vscode/`, `.idea/`.
- **Project Specific**:
  - Exceptions for frontend lib: `!frontend/src/**/lib/`
  - History & Archives: `history/`, `_archive/`
  - AI/Agent Logs: `*.md` (specific large files), `q-dev-chat-*.md`

### Backend .gitignore (`/backend`)

Specific ignore rules for the Express backend.

**Key Patterns:**

- **Build**: `dist/`, `build/`, `*.tsbuildinfo`.
- **Runtime**: `pids/`, `*.pid`, `logs/`.
- **Database**: `*.db`, `*.sqlite*`.

## TypeScript Configuration

### Frontend (`/frontend/tsconfig.json`)

TypeScript configuration for the Next.js 15 application.

**Compiler Options:**

- **Target**: `ES2022`
- **Module**: `esnext` (bundler resolution)
- **Strict Mode**: Enabled (`strict: true`, `noImplicitAny: true`, etc.)
- **JSX**: `preserve` (handled by Next.js)
- **Base URL**: `.`

**Path Aliases:**

```json
{
  "@/*": ["./src/*"],
  "~/*": ["./src/*"],
  "@/components/*": ["./src/components/*"],
  "@/config/*": ["./src/config/*"],
  "@/lib/*": ["./src/lib/*"],
  "@/styles/*": ["./src/styles/*"],
  "@core/*": ["./src/lib/drama-analyst/*"],
  "@agents/*": ["./src/lib/drama-analyst/agents/*"],
  "@services/*": ["./src/lib/drama-analyst/services/*"],
  "@orchestration/*": ["./src/lib/drama-analyst/orchestration/*"],
  "@components/*": ["./src/components/*"],
  "@shared/*": ["./src/app/(main)/directors-studio/shared/*"]
}
```

**Includes:**

- `next-env.d.ts`
- `src/env.d.ts`
- `src/global.d.ts`
- `**/*.ts`, `**/*.tsx`

**Excludes:**

- `node_modules`
- `dist`, `build`, `.next`
- Tests: `**/*.test.ts`, `tests/**`
- Workers: `src/workers/**`
