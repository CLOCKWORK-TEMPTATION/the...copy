# Development Folder

⚠️ **This folder is for DEVELOPMENT and TESTING only**

## Purpose

This folder contains UI components and pages used for:

- Testing new features during development
- Prototyping and experimentation
- UI mockups and design exploration
- Development-only debugging tools

## Important Notes

1. **NOT for Production**: This folder is excluded from production builds via tsconfig.json
2. **Contains Stubs**: Components here may use stub implementations and mock data
3. **No Testing Required**: Files in this folder don't require comprehensive testing
4. **Temporary Code**: Code here may be incomplete or experimental

## Exclusion from Production

This folder is excluded from TypeScript compilation in production via:

```json
// frontend/tsconfig.json
{
  "exclude": ["src/app/(main)/development/**"]
}
```

## Current Contents

- `creative-development.tsx` - Experimental UI for testing the creative development pipeline
- Other development/testing components

## Guidelines

- Keep experimental code isolated here
- Don't import from this folder into production code
- Use mock data and stub implementations freely
- Document the purpose of each file/component

## Moving to Production

When a feature is ready for production:

1. Remove all stub implementations
2. Replace mock data with real API calls
3. Add comprehensive error handling
4. Move the code to appropriate production folder
5. Add proper tests
6. Remove from this development folder
