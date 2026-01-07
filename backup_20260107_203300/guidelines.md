# Development Guidelines

## Code Quality Standards

### Formatting and Structure
- **TypeScript Strict Mode**: All files use strict TypeScript with explicit types
- **Consistent Indentation**: 2 spaces for indentation across all files
- **Line Length**: Generally kept under 100 characters for readability
- **Import Organization**: Grouped imports (external libraries, internal modules, types)
- **File Organization**: Logical grouping with clear section comments (e.g., "====== Physics Functions ======")

### Naming Conventions
- **Variables**: camelCase for variables and functions (`particleCount`, `updateParticles`)
- **Types/Interfaces**: PascalCase for types and interfaces (`ParticlePosition`, `DeviceCapabilities`)
- **Constants**: UPPER_SNAKE_CASE for constants (`SAMPLE_SCRIPT`, `APM_CONFIG`)
- **Private Members**: No underscore prefix, rely on TypeScript private keyword
- **Boolean Variables**: Prefix with `is`, `has`, `should` (`isRecording`, `hasAccess`, `shouldDisable`)
- **Event Handlers**: Prefix with `on` or `handle` (`onClick`, `handleSubmit`)

### Documentation Standards
- **JSDoc Comments**: Comprehensive JSDoc for all public functions and classes
- **Inline Comments**: Arabic and English comments for complex logic
- **Section Headers**: Clear section dividers using comment blocks
- **API Documentation**: Detailed endpoint documentation with examples
- **Type Documentation**: Inline type descriptions for complex interfaces

## Semantic Patterns

### React Component Patterns (5/5 files)

#### Client Components
```typescript
"use client";  // Always at the top for client-side components

import { useState, useCallback, useEffect, useRef } from "react";
```
- Explicit `"use client"` directive for interactive components
- Hooks imported individually for clarity
- State management with useState, complex logic with useCallback

#### State Management Pattern
```typescript
// Group related state together
const [activeTool, setActiveTool] = useState<ActiveTool>("teleprompter");
const [scriptText, setScriptText] = useState(SAMPLE_SCRIPT);
const [takes, setTakes] = useState<Take[]>(SAMPLE_TAKES);

// Notification state
const [notification, setNotification] = useState<{
  type: "success" | "error" | "info";
  message: string;
} | null>(null);
```
- Explicit type annotations for all state
- Grouped state by feature/concern
- Inline type definitions for simple types

#### Ref Management Pattern
```typescript
const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
const teleprompterIntervalRef = useRef<NodeJS.Timeout | null>(null);

// Cleanup pattern
useEffect(() => {
  return () => {
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    if (teleprompterIntervalRef.current) clearInterval(teleprompterIntervalRef.current);
  };
}, []);
```
- Refs for mutable values that don't trigger re-renders
- Explicit cleanup in useEffect return functions
- Null checks before cleanup operations

#### Callback Optimization
```typescript
const showNotification = useCallback(
  (type: "success" | "error" | "info", message: string) => {
    setNotification({ type, message });
  },
  []
);

const startRecording = useCallback(() => {
  // Implementation
}, [takes.length, startTeleprompter, showNotification]);
```
- useCallback for functions passed as props or used in dependencies
- Explicit dependency arrays
- Memoization for expensive operations

### Backend Controller Patterns (1/5 files)

#### Class-Based Controllers
```typescript
export class MetricsController {
  async getSnapshot(req: Request, res: Response): Promise<void> {
    try {
      const snapshot = await metricsAggregator.takeSnapshot();
      res.json({ success: true, data: snapshot });
    } catch (error) {
      logger.error('Failed to get metrics snapshot:', error);
      res.status(500).json({
        success: false,
        error: 'فشل في الحصول على لقطة المقاييس',
      });
    }
  }
}

export const metricsController = new MetricsController();
```
- Class-based controllers with async methods
- Consistent error handling with try-catch
- Bilingual error messages (Arabic for users, English for logs)
- Singleton export pattern

#### Response Structure Pattern
```typescript
// Success response
res.json({
  success: true,
  data: result,
  count?: number,  // Optional metadata
});

// Error response
res.status(statusCode).json({
  success: false,
  error: 'User-friendly error message in Arabic',
});
```
- Consistent response envelope with `success` flag
- Data always in `data` field
- HTTP status codes match response type

### Web Worker Patterns (1/5 files)

#### Message-Based Communication
```typescript
interface UpdateParticlesMessage {
  type: "update";
  positions: Float32Array;
  velocities: Float32Array;
  // ... other typed arrays
  config: {
    effect: Effect;
    // ... configuration
  };
}

self.addEventListener("message", (event: MessageEvent<UpdateParticlesMessage>) => {
  const { type } = event.data;
  
  if (type === "update") {
    try {
      const result = updateParticles(event.data);
      self.postMessage({ type: "updated", ...result }, [
        result.positions.buffer,
        result.velocities.buffer,
        result.colors.buffer,
      ]);
    } catch (error) {
      self.postMessage({
        type: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
});
```
- Strongly typed message interfaces
- Transferable objects for performance (typed array buffers)
- Error handling with typed error responses
- Type guards for message discrimination

#### Pure Function Pattern
```typescript
function applySparkEffect(
  particle: ParticlePosition,
  intersection: { x: number; y: number; z: number },
  velocity: ParticleVelocity,
  config: EffectConfig
): ParticleVelocity {
  // Pure calculation - no side effects
  const dx = particle.px - intersection.x;
  const dy = particle.py - intersection.y;
  const dz = particle.pz - intersection.z;
  const distSq = dx * dx + dy * dy + dz * dz;
  
  if (distSq < config.effectRadius * config.effectRadius && distSq > 0.0001) {
    const dist = Math.sqrt(distSq);
    const force = (1 - dist / config.effectRadius) * config.repelStrength * 3;
    return {
      vx: velocity.vx + (dx / dist) * force,
      vy: velocity.vy + (dy / dist) * force,
      vz: velocity.vz + (dz / dist) * force,
    };
  }
  
  return velocity;
}
```
- Pure functions for calculations
- Immutable data transformations
- Early returns for guard clauses
- Explicit return types

### Custom Hook Patterns (1/5 files)

#### Hook Composition
```typescript
export function usePerformanceDetection() {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities | null>(null);
  const [particleConfig, setParticleConfig] = useState<ParticleConfig | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const initialCaps = performanceDetector.getCapabilities();
    setCapabilities(initialCaps);
    
    const unsubscribe = performanceDetector.subscribe((newCaps) => {
      setCapabilities(newCaps);
      // Update other state...
    });
    
    unsubscribeRef.current = unsubscribe;
    
    return () => {
      unsubscribeRef.current?.();
    };
  }, []);

  return {
    capabilities,
    particleConfig,
    shouldDisable,
    // ... derived values
    getPerformanceLabel,
    forceRefresh,
  };
}
```
- Single responsibility hooks
- Subscription pattern with cleanup
- Return object with named properties
- Utility methods included in return

#### Derived State Pattern
```typescript
const getPerformanceLabel = useCallback((): string => {
  if (!capabilities) return "Unknown";
  
  const score = capabilities.performanceScore;
  if (score >= 9) return "Excellent";
  if (score >= 7) return "Good";
  if (score >= 5) return "Average";
  if (score >= 3) return "Low";
  return "Very Low";
}, [capabilities]);
```
- useCallback for derived computations
- Guard clauses for null/undefined
- Clear conditional logic

## Internal API Usage

### Shadcn/UI Component Pattern (5/5 files)
```typescript
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Usage with Tailwind classes
<Button
  variant="outline"
  className="border-purple-500 text-purple-300 hover:bg-purple-500/20"
  onClick={handleClick}
>
  Button Text
</Button>

<Card className="bg-slate-800/50 border-purple-500/30">
  <CardHeader>
    <CardTitle className="text-white">Title</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```
- Consistent import from `@/components/ui/*`
- Variant props for component variations
- Tailwind classes for customization
- Semantic HTML structure

### Service Layer Pattern (1/5 files)
```typescript
import { metricsAggregator } from '@/services/metrics-aggregator.service';
import { resourceMonitor } from '@/services/resource-monitor.service';
import { cacheMetricsService } from '@/services/cache-metrics.service';

// Usage in controllers
const snapshot = await metricsAggregator.takeSnapshot();
const resources = await resourceMonitor.getResourceStatus();
```
- Singleton service instances
- Async service methods
- Service composition in controllers

### Logger Pattern (1/5 files)
```typescript
import { logger } from '@/utils/logger';

try {
  // Operation
} catch (error) {
  logger.error('Failed to get metrics snapshot:', error);
  // Handle error
}
```
- Centralized logging utility
- Descriptive error messages
- Error object passed as second argument

### Path Alias Pattern (5/5 files)
```typescript
import { Button } from "@/components/ui/button";
import { metricsAggregator } from '@/services/metrics-aggregator.service';
import { performanceDetector } from "@/lib/performance-detection";
```
- `@/` alias for src directory
- Absolute imports over relative
- Clear module organization

## Frequently Used Code Idioms

### Conditional Rendering (3/5 files)
```typescript
{notification && (
  <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50">
    <Alert className={notificationClass}>
      <AlertDescription>{notification.message}</AlertDescription>
    </Alert>
  </div>
)}

{takes.length === 0 ? (
  <div className="text-center py-12">
    <p>No recordings yet</p>
  </div>
) : (
  takes.map((take) => <TakeCard key={take.id} take={take} />)
)}
```
- Logical AND for conditional rendering
- Ternary for if-else rendering
- Early returns for guard clauses

### Array Operations (4/5 files)
```typescript
// Map with type safety
{takes.map((take, index) => (
  <div key={take.id}>
    {take.name}
  </div>
))}

// Filter
const positivenotes = take.notes.filter((n) => n.severity === "positive");

// Reduce
const totalDuration = takes.reduce((acc, t) => acc + t.duration, 0);

// Find
const take = takes.find((t) => t.id === takeId);
```
- Functional array methods preferred
- Type inference from array type
- Explicit initial values for reduce

### Async/Await Pattern (2/5 files)
```typescript
async getSnapshot(req: Request, res: Response): Promise<void> {
  try {
    const snapshot = await metricsAggregator.takeSnapshot();
    res.json({ success: true, data: snapshot });
  } catch (error) {
    logger.error('Error:', error);
    res.status(500).json({ success: false, error: 'Error message' });
  }
}
```
- async/await over promises
- Try-catch for error handling
- Explicit Promise return types

### Object Destructuring (5/5 files)
```typescript
const { start, end } = req.query;
const { positions, velocities, config } = message;
const { effect, effectRadius, repelStrength } = config;
```
- Destructure at function/block start
- Rename when needed: `const { data: result } = response`
- Nested destructuring for deep objects

### Type Guards (3/5 files)
```typescript
if (!snapshot) {
  const newSnapshot = await metricsAggregator.takeSnapshot();
  res.json({ success: true, data: newSnapshot });
  return;
}

if (distSq < config.effectRadius * config.effectRadius && distSq > 0.0001) {
  // Safe to use distSq
}
```
- Early returns for null/undefined checks
- Explicit boundary checks
- Type narrowing with conditionals

### State Update Patterns (3/5 files)
```typescript
// Functional update
setTakes((prev) => [...prev, completedTake]);
setTakes((prev) => prev.filter((t) => t.id !== takeId));

// Object spread for immutable updates
setExportSettings((prev) => ({ ...prev, quality: value }));
setComparisonView((prev) => ({ ...prev, leftTakeId: value }));
```
- Functional updates for state depending on previous value
- Immutable updates with spread operator
- Type safety maintained through updates

## Popular Annotations

### JSDoc Patterns
```typescript
/**
 * Get comprehensive metrics snapshot
 * GET /api/metrics/snapshot
 */
async getSnapshot(req: Request, res: Response): Promise<void>

/**
 * Hook for detecting and monitoring device performance capabilities
 *
 * @example
 * ```tsx
 * function ParticleComponent() {
 *   const { config, shouldDisable } = usePerformanceDetection();
 *   if (shouldDisable) return null;
 *   return <canvas {...config} />;
 * }
 * ```
 */
export function usePerformanceDetection()
```
- HTTP method and route in controller comments
- Usage examples in hook documentation
- Clear parameter descriptions

### Type Annotations
```typescript
// Explicit function return types
const formatTime = (seconds: number): string => { }

// Generic type parameters
function usePerformanceMetric<K extends keyof DeviceCapabilities>(
  metric: K,
  callback?: (value: DeviceCapabilities[K]) => void
)

// Union types for variants
type ActiveTool = "teleprompter" | "recorder" | "comparison" | "notes" | "export";
type Effect = "default" | "spark" | "wave" | "vortex";
```
- Explicit return types for all functions
- Generic constraints for type safety
- String literal unions for variants

### Interface Definitions
```typescript
interface Take {
  id: string;
  name: string;
  duration: number;
  recordedAt: Date;
  videoUrl?: string;  // Optional properties with ?
  notes: TakeNote[];
  score?: number;
  status: "recording" | "completed" | "exported";
}
```
- Descriptive interface names
- Optional properties marked with ?
- Nested type references
- Union types for status fields

## Performance Optimization Patterns

### Memoization (3/5 files)
```typescript
const getPerformanceLabel = useCallback((): string => {
  // Computation
}, [capabilities]);

const showNotification = useCallback((type, message) => {
  setNotification({ type, message });
}, []);
```
- useCallback for function memoization
- Minimal dependency arrays
- Used for props and effect dependencies

### Lazy Loading (1/5 files)
```typescript
cardImage.loading = "lazy";
cardImage.decoding = "async";
cardImage.setAttribute("fetchpriority", "low");
```
- Native lazy loading for images
- Async decoding for non-blocking
- Priority hints for resource loading

### Cleanup Patterns (4/5 files)
```typescript
useEffect(() => {
  const interval = setInterval(() => { }, 1000);
  return () => clearInterval(interval);
}, []);

useEffect(() => {
  const unsubscribe = performanceDetector.subscribe(callback);
  return () => unsubscribe();
}, []);
```
- Always cleanup timers and subscriptions
- Return cleanup function from useEffect
- Store cleanup references in refs when needed

### Transferable Objects (1/5 files)
```typescript
self.postMessage(
  { type: "updated", ...result },
  [
    result.positions.buffer,
    result.velocities.buffer,
    result.colors.buffer,
  ]
);
```
- Transfer typed array buffers to workers
- Zero-copy data transfer
- Explicit transfer list as second argument

## Error Handling Standards

### Try-Catch Pattern (1/5 files)
```typescript
try {
  const result = await operation();
  res.json({ success: true, data: result });
} catch (error) {
  logger.error('Operation failed:', error);
  res.status(500).json({
    success: false,
    error: 'User-friendly message',
  });
}
```
- Wrap async operations in try-catch
- Log errors with context
- Return user-friendly error messages

### Type-Safe Error Handling (1/5 files)
```typescript
catch (error) {
  self.postMessage({
    type: "error",
    error: error instanceof Error ? error.message : "Unknown error",
  });
}
```
- Type guard for Error instances
- Fallback for unknown error types
- Structured error responses

### Validation Pattern (1/5 files)
```typescript
if (!start || !end) {
  res.status(400).json({
    success: false,
    error: 'يجب توفير start و end',
  });
  return;
}

if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
  res.status(400).json({
    success: false,
    error: 'تنسيق التاريخ غير صالح',
  });
  return;
}
```
- Early validation with early returns
- Specific error messages
- Appropriate HTTP status codes

## Styling Conventions

### Tailwind CSS Patterns (3/5 files)
```typescript
className="min-h-screen bg-gradient-to-bl from-slate-900 via-purple-900 to-slate-900"
className="flex items-center justify-between gap-4"
className="text-2xl font-bold text-white"
className="hover:bg-purple-500/20 transition-all"
```
- Utility-first approach
- Responsive design with breakpoints
- Opacity modifiers with `/` syntax
- Hover and transition states

### Dynamic Classes (3/5 files)
```typescript
className={`${
  activeTool === tool.id
    ? "bg-purple-600 hover:bg-purple-700 text-white"
    : "border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
}`}

className={`p-4 rounded-xl border ${
  note.severity === "positive"
    ? "bg-green-500/10 border-green-500/30"
    : note.severity === "needs_work"
    ? "bg-yellow-500/10 border-yellow-500/30"
    : "bg-slate-900/50 border-purple-500/30"
}`}
```
- Template literals for conditional classes
- Ternary operators for variants
- Nested ternaries for multiple conditions

### RTL Support (1/5 files)
```typescript
<div dir="rtl">
  {/* Arabic content */}
</div>

<Textarea dir="rtl" placeholder="أدخل نص المشهد هنا..." />
```
- Explicit `dir="rtl"` for Arabic content
- RTL-aware layout with Tailwind
- Bidirectional text support
