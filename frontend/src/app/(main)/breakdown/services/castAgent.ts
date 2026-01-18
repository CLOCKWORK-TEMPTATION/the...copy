/**
 * Cast Agent Service
 *
 * This file re-exports from the refactored castAgent module for backward compatibility.
 * The original monolithic file has been split into focused modules:
 *
 * - castAgent/constants.ts: Configuration and NLP keyword lists
 * - castAgent/types.ts: TypeScript type definitions
 * - castAgent/parser.ts: Text parsing and NLP helper functions
 * - castAgent/analyzer.ts: Character and emotion analysis functions
 * - castAgent/scriptAnalyzer.ts: Main local analysis engine (analyzeScriptLocal)
 * - castAgent/aiAgent.ts: Google GenAI integration (runCastAgent)
 * - castAgent/exporter.ts: Export format generators
 *
 * Benefits of the refactoring:
 * 1. Each module has a single responsibility
 * 2. Functions are smaller and more testable
 * 3. Constants are centralized and easy to modify
 * 4. Types are clearly defined in one place
 * 5. Import only what you need for better tree-shaking
 */

// Re-export everything from the new module structure
export * from './castAgent';
