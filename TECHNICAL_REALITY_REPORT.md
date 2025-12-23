════════════════════════════════════════════════════════════════════════════════
  TECHNICAL REALITY REPORT
  Elite Code Audit - Based Strictly on Source Code Logic
════════════════════════════════════════════════════════════════════════════════

1. EXECUTIVE SUMMARY
────────────────────────────────────────────────────────────────────────────────
This is a full-stack Drama Analysis and Screenplay Management Platform with AI capabilities.

ACTUAL PROJECT PURPOSE (derived from code analysis):
- A web application for analyzing dramatic scripts using AI (Google Gemini)
- Provides a "Directors Studio" for managing film/drama projects, scenes, characters, and shots
- Implements a "Seven Stations Pipeline" for comprehensive script analysis
- Supports real-time collaboration via WebSocket
- Background job processing for intensive AI operations
- Multi-language support (primary: Arabic, with RTL support)

ARCHITECTURE:
Layered Architecture (MVC-like): Controllers → Services → Database
- Backend: REST API built with Express.js + TypeScript
- Frontend: Next.js 16 (App Router) with React 19
- Monorepo structure managed with pnpm workspaces

KEY CAPABILITIES (from code evidence):
- AI Integration (Gemini)
- AI-Powered Script Analysis
- User Authentication & Authorization
- Character Management
- System Metrics & Monitoring
- Project Management
- Background Job Processing
- Real-time Communication
- Scene Management
- Shot Planning
- Actorai Arabic
- Analysis
- Arabic Creative Writing Studio
- Arabic Prompt Engineering Studio
- Brain Storm Ai
- Brainstorm
- Breakdown
- Cinematography Studio
- Development
- Directors Studio
- Editor
- Metrics Dashboard
- New
- Ui

RUNTIME:
- Node.js Node.js 20.x
- Package Manager: pnpm 10.20.0

2. VERIFIED TECH STACK
────────────────────────────────────────────────────────────────────────────────
Languages: JavaScript/TypeScript, TypeScript
Frameworks:
  - Express.js (Backend)
  - Next.js 16.0.10 (Frontend)
  - React ^19.2.1
Databases:
  - PostgreSQL (via Drizzle ORM)
  - Database Dialect: postgresql
  - MongoDB
  - Redis (Caching/Sessions)
Infrastructure:
  - BullMQ (Job Queue)
  - Socket.IO (WebSocket)
  - Sentry (Error Monitoring)
  - Vercel (Deployment)
Build System: pnpm 10.20.0, TypeScript Compiler (tsc), Next.js Build System
Runtime: Node.js 20.x

3. ARCHITECTURE DIAGRAM (TEXTUAL)
────────────────────────────────────────────────────────────────────────────────
Pattern: Layered Architecture (MVC-like): Controllers → Services → Database

Entry Points:
  - backend/src/server.ts (Backend API Server)
  - frontend/src/app/layout.tsx (Next.js App Router)
  - frontend/src/app/page.tsx (Main Page)

Data Flow:
  1. HTTP Server created with Express
  2. WebSocket service initialized
  3. Background job workers (BullMQ) initialized
  4. API endpoints exposed via Express routes
  5. Request → Authentication Middleware → Controllers
  6. Controllers → Services → Database (PostgreSQL via Drizzle ORM)

4. CORE DATA MODELS
────────────────────────────────────────────────────────────────────────────────

[SESSIONS]
Fields:
  - sid: varchar (PRIMARY KEY)
  - sess: jsonb (NOT NULL)
  - expire: timestamp (NOT NULL)

[USERS]
Fields:
  - id: varchar (PRIMARY KEY)
  - email: varchar (NOT NULL, UNIQUE)
  - passwordHash: text (NOT NULL)
  - firstName: varchar
  - lastName: varchar
  - profileImageUrl: varchar
  - createdAt: timestamp (NOT NULL)
  - updatedAt: timestamp (NOT NULL)
Relationships:
  - one-to-many: projects (via projects_set)

[PROJECTS]
Fields:
  - id: varchar (PRIMARY KEY)
  - title: text (NOT NULL)
  - scriptContent: text
  - userId: varchar (REFERENCES users)
  - createdAt: timestamp (NOT NULL)
  - updatedAt: timestamp (NOT NULL)
Relationships:
  - many-to-one: users (via userId)
  - one-to-many: scenes (via scenes_set)
  - one-to-many: characters (via characters_set)

[SCENES]
Fields:
  - id: varchar (PRIMARY KEY)
  - projectId: varchar (NOT NULL, REFERENCES projects)
  - sceneNumber: integer (NOT NULL)
  - title: text (NOT NULL)
  - location: text (NOT NULL)
  - timeOfDay: text (NOT NULL)
  - characters: jsonb (NOT NULL)
  - description: text
  - shotCount: integer (NOT NULL)
  - status: text (NOT NULL)
Relationships:
  - many-to-one: projects (via projectId)
  - one-to-many: shots (via shots_set)

[CHARACTERS]
Fields:
  - id: varchar (PRIMARY KEY)
  - projectId: varchar (NOT NULL, REFERENCES projects)
  - name: text (NOT NULL)
  - appearances: integer (NOT NULL)
  - consistencyStatus: text (NOT NULL)
  - lastSeen: text
  - notes: text
Relationships:
  - many-to-one: projects (via projectId)

[SHOTS]
Fields:
  - id: varchar (PRIMARY KEY)
  - sceneId: varchar (NOT NULL, REFERENCES scenes)
  - shotNumber: integer (NOT NULL)
  - shotType: text (NOT NULL)
  - cameraAngle: text (NOT NULL)
  - cameraMovement: text (NOT NULL)
  - lighting: text (NOT NULL)
  - aiSuggestion: text
Relationships:
  - many-to-one: scenes (via sceneId)

5. BUSINESS LOGIC & WORKFLOWS
────────────────────────────────────────────────────────────────────────────────
Controllers:
  - AIController: 0 endpoints ()
  - AnalysisController: 2 endpoints (runSevenStationsPipeline, getStationDetails)
  - AuthController: 3 endpoints (signup, login, logout)
  - CharactersController: 0 endpoints ()
  - MetricsController: 16 endpoints (getSnapshot, getLatest, getRange...)
  - ProjectsController: 0 endpoints ()
  - QueueController: 5 endpoints (getJobStatus, getQueueStats, getSpecificQueueStats...)
  - RealtimeController: 2 endpoints (getStats, healthCheck)
  - ScenesController: 0 endpoints ()
  - ShotsController: 0 endpoints ()

Services:
  - AnalysisService: 49 methods
  - AuthService: 34 methods
  - cache-metrics: 58 methods
  - CacheService: 114 methods
  - GeminiService: 76 methods
  - MetricsAggregatorService: 53 methods
  - realtime: 85 methods
  - RedisMetricsService: 59 methods
  - ResourceMonitorService: 90 methods
  - sse: 112 methods
  - websocket: 109 methods

Main Features:
  - AI Integration (Gemini)
  - AI-Powered Script Analysis
  - User Authentication & Authorization
  - Character Management
  - System Metrics & Monitoring
  - Project Management
  - Background Job Processing
  - Real-time Communication
  - Scene Management
  - Shot Planning
  - Actorai Arabic
  - Analysis
  - Arabic Creative Writing Studio
  - Arabic Prompt Engineering Studio
  - Brain Storm Ai
  - Brainstorm
  - Breakdown
  - Cinematography Studio
  - Development
  - Directors Studio
  - Editor
  - Metrics Dashboard
  - New
  - Ui

6. DISCREPANCY NOTES
────────────────────────────────────────────────────────────────────────────────
  ⚠️  Documentation files exist but were ignored per audit constraints
  ⚠️  Uses module-alias for path aliasing (non-standard for TypeScript projects with tsconfig paths)
  ⚠️  Uses both PostgreSQL (Drizzle ORM) and MongoDB - dual database system

METADATA
────────────────────────────────────────────────────────────────────────────────
Analysis Timestamp: 2025-12-23T20:52:35.250Z
Project Root: /home/runner/work/the...copy/the...copy
Files Analyzed: 22

════════════════════════════════════════════════════════════════════════════════
END OF TECHNICAL REALITY REPORT
════════════════════════════════════════════════════════════════════════════════
