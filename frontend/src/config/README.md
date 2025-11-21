# Configuration

This directory contains application-level configuration and constants.

## Purpose

Centralize configuration that is used across multiple features:

- Application constants
- Feature flags
- Theme configuration
- API endpoints
- App metadata

## Guidelines

1. **Type-safe**: Use TypeScript for all config
2. **Named exports**: Export individual constants/configs
3. **Environment-aware**: Use environment variables where appropriate
4. **Immutable**: Export constants as `const` or `readonly`

## Example

```tsx
// config/app.ts

export const APP_NAME = "النسخة" as const;
export const APP_NAME_EN = "The Copy" as const;

export const ROUTES = {
  HOME: "/",
  EDITOR: "/editor",
  ANALYSIS: "/analysis",
  DEVELOPMENT: "/development",
  BRAINSTORM: "/brainstorm",
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;
```
