# Development Guidelines - The Copy

## Code Quality Standards

### File Organization
- **Single Responsibility**: Each file has one clear purpose (5/5 files analyzed)
- **Modular Structure**: Separate concerns into distinct modules (controllers, services, utils, components)
- **Explicit Exports**: Use named exports for better tree-shaking and clarity
- **Barrel Files**: Avoid barrel exports to prevent circular dependencies

### Naming Conventions
- **Files**: kebab-case for all files (e.g., `shots.controller.test.ts`, `resource-monitor.service.ts`)
- **Components**: PascalCase for React components (e.g., `OptimizedParticleAnimation`)
- **Functions**: camelCase for functions and methods (e.g., `getShots`, `calculateCpuUsage`)
- **Constants**: SCREAMING_SNAKE_CASE for constants (e.g., `ARABIC_ACTION_VERBS`, `ACTION_START_PATTERNS`)
- **Types/Interfaces**: PascalCase for TypeScript types (e.g., `ParticlePosition`, `EffectConfig`)
- **Private Methods**: Prefix with underscore for class private methods (e.g., `_calculateCpuUsage`)

### Code Formatting
- **Indentation**: 2 spaces (consistent across all files)
- **Line Length**: Keep lines under 100 characters when possible
- **Semicolons**: Always use semicolons (backend), optional in frontend with consistent style
- **Quotes**: Single quotes for strings in backend, double quotes in frontend JSX
- **Trailing Commas**: Use trailing commas in multi-line arrays/objects

### Documentation Standards
- **JSDoc Comments**: Use JSDoc for all public functions and classes (4/5 files have comprehensive JSDoc)
- **Inline Comments**: Explain complex logic, not obvious code
- **Arabic Comments**: Use Arabic for user-facing messages and error strings
- **Section Headers**: Use comment blocks to separate logical sections

Example from resource-monitor.service.ts:
```typescript
/**
 * Resource Monitor Service
 *
 * Monitors system resources and detects backpressure, rate limits, and bottlenecks
 */

// ===== Resource Monitoring Metrics =====

/**
 * System CPU usage percentage
 */
export const systemCpuUsage = new Gauge({...});
```

## TypeScript Patterns

### Type Safety
- **Strict Mode**: Enable strict TypeScript checks
- **Explicit Types**: Always declare return types for functions (5/5 files follow this)
- **Type Imports**: Use `import type` for type-only imports
- **Avoid `any`**: Use `unknown` or proper types instead of `any`
- **Const Assertions**: Use `as const` for literal types (seen in arabic-action-verbs.ts)

Example:
```typescript
export const ARABIC_ACTION_VERBS = [
  "يدخل",
  "يخرج",
  // ...
] as const;
```

### Interface vs Type
- **Interfaces**: For object shapes that may be extended
- **Types**: For unions, intersections, and complex types
- **Consistent Usage**: Pick one approach per domain

### Generics
- **Descriptive Names**: Use meaningful generic names (not just `T`)
- **Constraints**: Add constraints when needed (`T extends SomeType`)

## React Patterns (Frontend)

### Component Structure
- **"use client" Directive**: Add at top of client components (seen in particle-background-optimized.tsx)
- **Hooks First**: Declare all hooks at component top
- **Early Returns**: Handle edge cases early (SSR checks, reduced motion)
- **Cleanup**: Always cleanup effects with return functions

Example from particle-background-optimized.tsx:
```typescript
export default function OptimizedParticleAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  
  // Check for window object (SSR)
  if (typeof window === "undefined") return null;
  
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  
  if (prefersReducedMotion) return null;
  
  useEffect(() => {
    // ... setup
    return cleanup; // Always cleanup
  }, []);
  
  return <canvas ref={canvasRef} />;
}
```

### Performance Optimization
- **useMemo**: Memoize expensive calculations
- **useCallback**: Memoize callback functions passed to children
- **Lazy Loading**: Use dynamic imports for heavy components
- **Batch Updates**: Process large datasets in batches (seen in particle generation)
- **requestIdleCallback**: Use for non-critical work

Example:
```typescript
const requestIdle = (
  callback: (deadline: any) => void,
  options?: any
): number => {
  if (typeof requestIdleCallback !== "undefined") {
    return requestIdleCallback(callback, options);
  } else {
    return setTimeout(
      () => callback({
        timeRemaining: () => Math.max(0, 50),
        didTimeout: false,
      }),
      options?.timeout || 0
    ) as any;
  }
};
```

### Accessibility
- **Reduced Motion**: Respect `prefers-reduced-motion` (implemented in particle component)
- **Semantic HTML**: Use proper HTML elements
- **ARIA Labels**: Add when needed for screen readers
- **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible

## Backend Patterns (Express/Node.js)

### Controller Structure
- **Request Validation**: Validate all inputs at controller level
- **Authorization First**: Check user authentication before processing
- **Error Handling**: Use try-catch with proper error responses
- **Consistent Response Format**: Use standard response structure

Example from shots.controller.test.ts:
```typescript
await shotsController.getShots(
  mockRequest as any,
  mockResponse as Response
);

expect(mockResponse.json).toHaveBeenCalledWith({
  success: true,
  data: mockShots,
});
```

### Service Layer
- **Business Logic**: Keep all business logic in services
- **Dependency Injection**: Pass dependencies to services
- **Single Responsibility**: Each service handles one domain
- **Async/Await**: Use async/await for all async operations

### Error Handling
- **Try-Catch Blocks**: Wrap all async operations
- **Logging**: Log errors with context using Winston
- **User-Friendly Messages**: Return Arabic error messages for users
- **Error Details**: Include details in development, hide in production

Example from resource-monitor.service.ts:
```typescript
try {
  // CPU Usage
  const cpuUsage = this.calculateCpuUsage();
  systemCpuUsage.set(cpuUsage);
  
  if (cpuUsage > this.thresholds.cpu.critical) {
    logger.error('Critical CPU usage', { cpuUsage });
    backpressureEvents.inc({ type: 'cpu_critical' });
  }
} catch (error) {
  logger.error('Failed to update system metrics:', error);
}
```

### Monitoring & Metrics
- **Prometheus Metrics**: Use prom-client for all metrics
- **Structured Logging**: Use Winston with JSON format
- **Performance Tracking**: Monitor critical operations
- **Resource Monitoring**: Track CPU, memory, event loop lag

## Testing Patterns

### Test Structure (Vitest)
- **Describe Blocks**: Group related tests
- **beforeEach**: Reset mocks and state before each test
- **Clear Test Names**: Use descriptive test names
- **Arrange-Act-Assert**: Follow AAA pattern

Example from shots.controller.test.ts:
```typescript
describe('ShotsController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  
  beforeEach(async () => {
    mockRequest = {
      params: {},
      body: {},
      user: { id: 'user-123' },
    };
    
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    
    vi.clearAllMocks();
  });
  
  describe('getShots', () => {
    it('should return shots for authorized user', async () => {
      // Arrange
      const mockShots = [{ id: 'shot-1', title: 'Shot 1' }];
      mockDb.select.mockReturnValueOnce({...});
      
      // Act
      await shotsController.getShots(mockRequest as any, mockResponse as Response);
      
      // Assert
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockShots,
      });
    });
  });
});
```

### Test Coverage
- **Happy Path**: Test successful scenarios
- **Error Cases**: Test all error conditions
- **Edge Cases**: Test boundary conditions
- **Authorization**: Test unauthorized access
- **Validation**: Test input validation

### Mocking
- **vi.mock**: Mock external dependencies at module level
- **Mock Functions**: Use vi.fn() for function mocks
- **Mock Return Values**: Use mockReturnValue/mockResolvedValue
- **Clear Mocks**: Always clear mocks between tests

## Data Validation

### Zod Schemas
- **Input Validation**: Validate all user inputs with Zod
- **Type Inference**: Use z.infer<typeof schema> for types
- **Error Messages**: Provide clear validation error messages
- **Reusable Schemas**: Define schemas once, reuse across app

Example pattern:
```typescript
const shotSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  sceneId: z.string().uuid(),
  orderIndex: z.number().int().optional(),
});

// Validate
const result = shotSchema.safeParse(data);
if (!result.success) {
  return res.status(400).json({
    success: false,
    error: 'بيانات غير صالحة',
    details: result.error.issues,
  });
}
```

## Performance Best Practices

### Memory Management
- **Cleanup Resources**: Always cleanup timers, listeners, subscriptions
- **Typed Arrays**: Use Float32Array for large numeric datasets (particle positions)
- **Object Pooling**: Reuse objects when possible
- **Avoid Memory Leaks**: Clear references in cleanup functions

Example:
```typescript
const cleanup = () => {
  try {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (cleanupTimeoutRef.current) {
      clearTimeout(cleanupTimeoutRef.current);
    }
    
    canvas.removeEventListener('mousemove', handleCanvasMouseMove);
    
    if (geometry) geometry.dispose();
    if (material) material.dispose();
    if (renderer) renderer.dispose();
    
    sceneRef.current = null;
  } catch (error) {
    console.error('خطأ في تنظيف موارد الجسيمات:', error);
  }
};
```

### Batch Processing
- **Large Datasets**: Process in batches to avoid blocking
- **requestAnimationFrame**: Use for visual updates
- **requestIdleCallback**: Use for non-critical work
- **Progress Tracking**: Track progress for long operations

### Caching
- **Redis**: Cache frequently accessed data
- **In-Memory**: Use Map/Set for temporary caching
- **TTL**: Set appropriate time-to-live for cached data
- **Cache Invalidation**: Clear cache when data changes

## Security Practices

### Input Validation
- **Validate Everything**: Never trust user input
- **UUID Validation**: Validate UUIDs for IDs
- **Sanitization**: Sanitize HTML/SQL inputs
- **Rate Limiting**: Implement rate limiting on all endpoints

### Authentication & Authorization
- **JWT Tokens**: Use JWT for authentication
- **User Context**: Always check req.user
- **Ownership Verification**: Verify user owns resources
- **Early Returns**: Return 401/403 early for unauthorized access

Example pattern:
```typescript
if (!req.user) {
  return res.status(401).json({
    success: false,
    error: 'غير مصرح',
  });
}
```

### Error Messages
- **Arabic for Users**: User-facing errors in Arabic
- **No Sensitive Data**: Don't expose internal details
- **Log Details**: Log full errors server-side
- **Consistent Format**: Use consistent error response format

## Arabic Language Support

### Text Processing
- **RTL Support**: Design for right-to-left text
- **Arabic Patterns**: Use regex patterns for Arabic text
- **Character Sets**: Use Unicode ranges for Arabic (\u0600-\u06FF)
- **Verb Conjugation**: Handle masculine/feminine verb forms

Example from arabic-action-verbs.ts:
```typescript
export const ARABIC_ACTION_VERBS = [
  "يدخل", "تدخل",  // Masculine, Feminine
  "يخرج", "تخرج",
  // ...
] as const;

export const ACTION_VERBS_SET = new Set(ARABIC_ACTION_VERBS);

export function isActionVerb(word: string): boolean {
  return ACTION_VERBS_SET.has(word);
}
```

### User Messages
- **Arabic Errors**: All user-facing errors in Arabic
- **Arabic Logs**: Use Arabic for user-visible logs
- **English Internals**: Use English for internal logs/comments
- **Consistent Terminology**: Use consistent Arabic terms

## Common Patterns

### Singleton Services
- **Export Instance**: Export singleton instance of services
- **Class-based**: Use classes for stateful services
- **Initialization**: Provide start/stop methods

Example:
```typescript
export class ResourceMonitorService {
  private monitorInterval: NodeJS.Timeout | null = null;
  
  startMonitoring(intervalMs: number = 5000): void {
    if (this.monitorInterval) {
      logger.warn('Resource monitoring already started');
      return;
    }
    // ... setup
  }
  
  stopMonitoring(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
  }
}

export const resourceMonitor = new ResourceMonitorService();
export default resourceMonitor;
```

### Constants Organization
- **Separate Files**: Extract large constant sets to separate files
- **Typed Constants**: Use `as const` for type safety
- **Derived Sets**: Create Sets from arrays for O(1) lookup
- **Export Utilities**: Export helper functions with constants

### Async Patterns
- **Async/Await**: Prefer async/await over promises
- **Error Handling**: Always wrap in try-catch
- **Promise.all**: Use for parallel operations
- **Sequential**: Use for dependent operations

### Environment Configuration
- **dotenv**: Use dotenv for environment variables
- **Type-safe Env**: Create typed env config
- **Validation**: Validate env vars at startup
- **Defaults**: Provide sensible defaults

## Code Review Checklist

Before submitting code, ensure:
- [ ] All functions have JSDoc comments
- [ ] TypeScript strict mode passes
- [ ] Tests cover happy path and error cases
- [ ] No console.log (use logger instead)
- [ ] Error messages in Arabic for users
- [ ] Resources cleaned up in useEffect/finally
- [ ] Input validation with Zod
- [ ] Authorization checks in place
- [ ] Performance considerations addressed
- [ ] Accessibility requirements met
- [ ] No hardcoded secrets or credentials
