# Feature Components

This directory contains components that are specific to particular features or domains of the application.

## Organization

Components should be organized by feature/domain:

```
features/
├── analysis/          # Analysis-related components
├── editor/            # Editor-specific components
├── projects/          # Project management components
└── auth/              # Authentication components (if needed)
```

## Guidelines

1. **Feature-specific**: Components here should be tied to specific business features
2. **Client components**: Extract interactive logic into separate client components
3. **Named exports**: Always use named exports (enforced by ESLint)
4. **Co-location**: Keep feature-related files together (components, hooks, utils)

## Example

```tsx
// features/analysis/AnalysisResults.tsx
"use client";

import { useState } from "react";

export function AnalysisResults({ data }: { data: AnalysisData }) {
  // Component implementation
}
```
