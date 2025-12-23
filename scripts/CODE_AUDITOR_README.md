# Elite Code Auditor & Reverse Engineering Tool

## Overview

The **Elite Code Auditor** is a specialized tool designed to perform deep, comprehensive technical analysis of software projects based **strictly and exclusively** on source code logic, completely ignoring all documentation and comments.

## Critical Constraints (Non-Negotiable)

1. **IGNORE ALL DOCUMENTATION:** Treats all `README.md`, `docs/`, comments, and external documentation files as "corrupted" and "untrusted data."
2. **CODE IS THE ONLY TRUTH:** Analysis is derived solely from syntax, imports, class definitions, function calls, and configuration files.
3. **NO HALLUCINATIONS:** If a feature is described in a comment but implemented differently in code, the tool follows the code. If code is ambiguous, it states the ambiguity rather than guessing.

## What It Analyzes

### 1. Tech Stack & Dependency Verification
- Analyzes `package.json` files to identify exact frameworks, libraries, and versions
- Determines the build system and runtime environment
- No reliance on documentation claims

### 2. Architectural Reconstruction
- Identifies entry points (e.g., `server.ts`, `main.py`, `App.tsx`)
- Maps project structure (Monolith vs. Microservices, MVC, MVVM, Clean Architecture, etc.)
- Traces data flow: How requests travel from UI/API to database and back

### 3. Data Modeling (Schema Inference)
- Ignores ER diagrams
- Analyzes ORM models, SQL migration files, or Type interfaces
- Reconstructs the actual database schema and relationships

### 4. Business Logic & Key Workflows
- Identifies core controllers or service classes
- Maps out primary functional capabilities based on existing methods and logic gates
- Extracts feature lists from actual implementation

## Usage

### Basic Usage

Run the code auditor on the current directory:

```bash
pnpm run audit:code
```

Or run it on a specific directory:

```bash
npx tsx scripts/code-auditor.ts /path/to/project
```

### Output

The tool generates two files:

1. **TECHNICAL_REALITY_REPORT.md** - Human-readable formatted report
2. **technical-reality-report.json** - Machine-readable JSON report

## Report Structure

The Technical Reality Report contains:

### 1. Executive Summary
What the project actually does based on code evidence.

### 2. Verified Tech Stack
- Languages
- Frameworks (with versions)
- Databases
- Infrastructure tools
- Build systems
- Runtime environments

### 3. Architecture Diagram (Textual)
- Architecture pattern (MVC, Layered, Microservices, etc.)
- Entry points
- Component interaction
- Data flow description

### 4. Core Data Models
- Actual entities from ORM schema
- Field definitions with types and constraints
- Relationships (one-to-many, many-to-one, many-to-many)

### 5. Business Logic & Workflows
- Controllers with endpoint counts
- Services with method counts
- Main features extracted from implementation

### 6. Discrepancy Notes (Optional)
- Violations of standard conventions
- Unusual patterns detected
- Multi-database usage
- Non-standard practices

## Example Output

```
═══════════════════════════════════════════════════════════════
  TECHNICAL REALITY REPORT
  Elite Code Audit - Based Strictly on Source Code Logic
═══════════════════════════════════════════════════════════════

1. EXECUTIVE SUMMARY
───────────────────────────────────────────────────────────────
This is a full-stack Drama Analysis and Screenplay Management 
Platform with AI capabilities.

ACTUAL PROJECT PURPOSE (derived from code analysis):
- A web application for analyzing dramatic scripts using AI
- Provides a "Directors Studio" for managing projects
- Implements a "Seven Stations Pipeline" for script analysis
- Supports real-time collaboration via WebSocket
...
```

## Implementation Details

### Files Analyzed

The auditor examines:
- `package.json` files (root, backend, frontend)
- Configuration files (`drizzle.config.ts`, `next.config.ts`, `tsconfig.json`)
- ORM schema files (`backend/src/db/schema.ts`)
- Controller files (`*.controller.ts`)
- Service files (`*.service.ts`)
- Entry point files (`server.ts`, `layout.tsx`, `page.tsx`)
- Directory structure for architecture mapping

### What It IGNORES

- All `README.md` files
- All files in `docs/` directories
- All inline comments (`//`, `/**/`)
- JSDoc comments
- Markdown documentation
- Any files that only contain documentation

## Philosophy

This tool embodies the principle that **the code is the single source of truth**. Documentation can become stale, comments can be misleading, but the code is what actually runs. By analyzing only the code itself, this tool provides a "reality check" on what the system actually does, not what someone claims it does.

## Use Cases

1. **Onboarding New Developers** - Get a true picture of the codebase
2. **Technical Due Diligence** - Verify actual implementation vs. documentation
3. **Architecture Reviews** - Understand the real architecture
4. **Legacy Code Analysis** - When documentation is outdated or missing
5. **Reverse Engineering** - Understand third-party code
6. **Audit Preparation** - Generate accurate technical documentation

## Limitations

- Cannot analyze compiled code (requires source code)
- Database schema inference limited to ORM models (doesn't connect to actual database)
- Business logic extraction depends on clear naming conventions
- Method counting is approximate and based on pattern matching

## Technical Notes

- Built with TypeScript
- Uses AST-like pattern matching for code analysis
- No external dependencies beyond Node.js standard library
- Completely stateless - each run is independent
- Safe to run - only reads files, never modifies them

## Contributing

When enhancing this tool:
- Maintain the "code is truth" philosophy
- Never add features that read documentation
- Keep pattern matching precise to avoid hallucinations
- Add discrepancy detection for unusual patterns
- Ensure output is both human and machine-readable

## License

Part of The Copy project - same license applies.
