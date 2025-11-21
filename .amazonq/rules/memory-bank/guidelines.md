

# Development Guidelines - The Copy

أمر توجيهي للنموذج: سياسة عدم ترحيل المشكلات (No-Deferral, Root-Cause First)

المبدأ الحاكم:
أي مشكلة تُكتشف في هذه المرحلة يُحظر تأجيلها أو تجاوزها مؤقتًا. يجب حلّها من الجذور (Root Cause) حلًا دائمًا قبل الانتقال لأي مهمة أخرى.

النطاق:
يسري على جميع الأخطاء والتحذيرات والتدهورات الأداءية ومخاطر الأمان والتقنية الديونية (Tech Debt) التي تظهر أثناء التطوير أو الاختبار أو الدمج.

القواعد الإلزامية:

تشخيص سببي: طبّق منهجية 5 Whys أو Fishbone للوصول للسبب الجذري وتوثيقه بإيجاز.

حل دائم لا مؤقت: يُمنع استخدام الحيل/الـWorkarounds/التجاهل/@ts-ignore دون معالجة السبب.

اختبارات مانعة للتكرار: أضِف اختبار وحدة/تكامل يُثبت عدم تكرار المشكلة (Regression Guard).

حماية أمامية: أضِف تحققات إدخال/تحكم أخطاء/قياسات أداء أو قواعد أمان حيث يلزم.

توثيق موجز: سجّل: وصف المشكلة، السبب الجذري، التعديل، الاختبارات المضافة، وأي تأثيرات جانبية.

تحقق مستقل: نفّذ إعادة اختبار كاملة للمسار المتأثر وراجِع السجلات/القياسات بعد الإصلاح.

مسار التنفيذ عند اكتشاف مشكلة:

(أ) إعادة إنتاج مُوثّقة بخطوات واضحة وبيانات اختبارية.

(ب) عزل السبب الجذري وتأكيده بأدلة (رسائل خطأ، تتبّع، قياسات).

(ج) تنفيذ تعديل يعالج السبب لا العرض.

(د) إضافة اختبارات مانعة + مراقبة (Metrics/Logging) إن لزم.

(هـ) تشغيل الحزمة الاختبارية كاملة وتمريرها دون إنذارات جديدة.

(و) مراجعة سريعة من نظير (Peer Review) قبل الدمج.

معيار الإغلاق (Definition of Done):

السبب الجذري مُوثّق ومُعالج.

اختبارات مانعة مضافة وتنجح.

عدم وجود تحذيرات/ديون مؤجلة مرتبطة بالمشكلة.

لا تدهور في الأداء أو الأمان.

المراقبة لا تُظهر تكرارًا بعد الإصلاح.

الاستثناءات والطوارئ:
لا يُسمح بتجاوز هذه السياسة إلا بموافقة صريحة مُسبّبة ومؤقتة، مع إنشاء تذكرة مُلزمة بزمن قصير لإزالة أي حلّ مؤقت.
## Code Quality Standards

### TypeScript Configuration
- **Strict Mode**: Enabled throughout the project for maximum type safety
- **Type Definitions**: Explicit types for function parameters and return values
- **No Implicit Any**: All variables must have defined types
- **Interface Over Type**: Prefer interfaces for object shapes, types for unions/intersections
- **Null Safety**: Use optional chaining (?.) and nullish coalescing (??) operators

### Naming Conventions
- **Files**: kebab-case for all files (e.g., `websocket.service.ts`, `metrics.controller.ts`)
- **Classes**: PascalCase (e.g., `CardStreamController`, `ParticleSystem`, `MetricsController`)
- **Functions/Methods**: camelCase (e.g., `getSnapshot`, `handleMouseMove`, `updateParticlePhysics`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `BASELINE`, `STROKE_WIDTH`, `PARTICLE_THRESHOLDS`)
- **Interfaces/Types**: PascalCase with descriptive names (e.g., `ParticlePosition`, `EffectConfig`)
- **Private Members**: Prefix with underscore or use TypeScript private keyword

### File Organization
- **Service Files**: `*.service.ts` for business logic services
- **Controller Files**: `*.controller.ts` for request handlers
- **Test Files**: `*.test.ts` or `*.spec.ts` alongside source files
- **Type Files**: `*.types.ts` for shared type definitions
- **Config Files**: `*.config.ts` for configuration objects

### Code Structure
- **Single Responsibility**: Each class/function has one clear purpose
- **Separation of Concerns**: Controllers → Services → Database layers
- **DRY Principle**: Extract repeated logic into utility functions
- **Small Functions**: Keep functions focused and under 50 lines when possible
- **Early Returns**: Use guard clauses to reduce nesting

## Frontend Patterns (Next.js + React)

### Component Structure
```typescript
"use client"; // Only when needed (client components)

import { useEffect, useRef } from "react";
import type React from "react"; // Type-only imports

export default function ComponentName() {
  const ref = useRef<HTMLElement>(null);
  
  useEffect(() => {
    // Cleanup pattern
    return () => {
      // Cleanup logic
    };
  }, []);
  
  return <div>...</div>;
}
```

### React Hooks Usage
- **useState**: For component-level state
- **useRef**: For DOM references and mutable values that don't trigger re-renders
- **useEffect**: For side effects with proper cleanup
- **Custom Hooks**: Extract reusable logic (e.g., `useDeviceCapabilities`)
- **Dependency Arrays**: Always specify dependencies explicitly

### Event Handlers
- **Naming**: Prefix with `handle` (e.g., `handleMouseMove`, `handleClick`)
- **Type Safety**: Use React event types (e.g., `React.MouseEvent`, `React.TouchEvent`)
- **Cleanup**: Remove event listeners in useEffect cleanup
- **Passive Events**: Use `{ passive: false }` when preventing default

### Performance Optimization
- **Memoization**: Use React.memo for expensive components
- **Lazy Loading**: Dynamic imports for large components
- **Image Optimization**: Use Next.js Image component with proper sizing
- **Code Splitting**: Separate large features into chunks
- **requestAnimationFrame**: For smooth animations
- **requestIdleCallback**: For non-critical background tasks

### Three.js Integration
```typescript
// Proper cleanup pattern
useEffect(() => {
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  
  const animate = () => {
    renderer.render(scene, camera);
    animationId = requestAnimationFrame(animate);
  };
  animate();
  
  return () => {
    cancelAnimationFrame(animationId);
    renderer.dispose();
    geometry.dispose();
    material.dispose();
  };
}, []);
```

## Backend Patterns (Express.js + TypeScript)

### Controller Pattern
```typescript
export class ControllerName {
  async methodName(req: Request, res: Response): Promise<void> {
    try {
      // Validation
      const { param } = req.query;
      if (!param) {
        res.status(400).json({ success: false, error: 'رسالة خطأ بالعربية' });
        return;
      }
      
      // Business logic via service
      const result = await service.doSomething(param);
      
      // Success response
      res.json({ success: true, data: result });
    } catch (error) {
      logger.error('Error description:', error);
      res.status(500).json({ success: false, error: 'رسالة خطأ بالعربية' });
    }
  }
}

export const controllerName = new ControllerName();
```

### Service Pattern
```typescript
class ServiceName {
  private dependency: DependencyType;
  
  constructor() {
    this.dependency = getDependency();
  }
  
  async performAction(params: ParamsType): Promise<ResultType> {
    // Validation
    if (!params.required) {
      throw new Error('Validation error');
    }
    
    // Business logic
    const result = await this.dependency.execute(params);
    
    // Return typed result
    return result;
  }
}

export const serviceName = new ServiceName();
```

### Error Handling
- **Try-Catch**: Wrap async operations in try-catch blocks
- **Logging**: Use logger service for all errors with context
- **User Messages**: Provide Arabic error messages in responses
- **HTTP Status Codes**: Use appropriate codes (400, 404, 500, etc.)
- **Error Types**: Create custom error classes for specific scenarios

### Database Patterns (Drizzle ORM)
```typescript
// Query pattern
const results = await db
  .select()
  .from(table)
  .where(eq(table.userId, userId))
  .orderBy(desc(table.createdAt))
  .limit(10);

// Insert pattern
const [inserted] = await db
  .insert(table)
  .values({ ...data })
  .returning();

// Update pattern
await db
  .update(table)
  .set({ ...updates })
  .where(eq(table.id, id));

// Transaction pattern
await db.transaction(async (tx) => {
  await tx.insert(table1).values(data1);
  await tx.insert(table2).values(data2);
});
```

### Caching Strategy
```typescript
// Cache-aside pattern
async function getData(key: string) {
  // Try cache first
  const cached = await cacheService.get(key);
  if (cached) return cached;
  
  // Fetch from database
  const data = await db.query.table.findFirst({ where: eq(table.id, key) });
  
  // Store in cache
  if (data) {
    await cacheService.set(key, data, TTL);
  }
  
  return data;
}
```

## Testing Patterns

### Unit Test Structure
```typescript
describe('ServiceName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    // Cleanup
  });
  
  describe('methodName', () => {
    it('should handle success case', async () => {
      // Arrange
      const input = { test: 'data' };
      
      // Act
      const result = await service.methodName(input);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
    
    it('should handle error case', async () => {
      // Test error scenarios
    });
  });
});
```

### Mocking Patterns
```typescript
// Mock modules
jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock implementations
const mockFunction = jest.fn().mockReturnValue('result');
const mockAsync = jest.fn().mockResolvedValue({ data: 'test' });
```

## API Design Patterns

### RESTful Endpoints
- **GET**: Retrieve resources (idempotent)
- **POST**: Create new resources
- **PUT/PATCH**: Update existing resources
- **DELETE**: Remove resources
- **Naming**: Use plural nouns (`/api/projects`, `/api/scenes`)
- **Nesting**: Limit to 2 levels (`/api/projects/:id/scenes`)

### Response Format
```typescript
// Success response
{
  success: true,
  data: { /* result */ },
  count?: number, // For lists
  pagination?: { /* pagination info */ }
}

// Error response
{
  success: false,
  error: 'رسالة خطأ بالعربية',
  details?: { /* additional error info */ }
}
```

### Query Parameters
- **Filtering**: `?status=active&type=movie`
- **Sorting**: `?sort=createdAt&order=desc`
- **Pagination**: `?page=1&limit=20`
- **Date Ranges**: `?start=2024-01-01&end=2024-12-31`

## Real-time Communication

### WebSocket Events
```typescript
// Event naming: category:action
socket.emit('job:started', payload);
socket.emit('analysis:progress', payload);
socket.emit('system:error', payload);

// Room naming: type:id
socket.join('user:user-123');
socket.join('project:project-abc');
socket.join('queue:ai-analysis');
```

### Event Payload Structure
```typescript
interface RealtimeEvent<T> {
  event: RealtimeEventType;
  payload: T & {
    timestamp: string;
    eventType: RealtimeEventType;
    userId?: string;
  };
}
```

## Security Practices

### Input Validation
- **Zod Schemas**: Validate all user inputs
- **UUID Validation**: Use regex for UUID format checking
- **Sanitization**: Clean HTML/SQL inputs with libraries
- **Type Checking**: Leverage TypeScript for compile-time safety

### Authentication & Authorization
- **JWT Tokens**: Use for stateless authentication
- **Token Expiry**: Set reasonable expiration times
- **Refresh Tokens**: Implement for long-lived sessions
- **Role-Based Access**: Check permissions before operations

### Rate Limiting
```typescript
// Multi-level rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'تم تجاوز الحد المسموح من الطلبات',
});
```

## Performance Best Practices

### Database Optimization
- **Indexes**: Create composite indexes for common queries
- **Query Optimization**: Use EXPLAIN to analyze slow queries
- **Connection Pooling**: Reuse database connections
- **Batch Operations**: Group multiple inserts/updates
- **Pagination**: Always paginate large result sets

### Caching Strategy
- **Cache Keys**: Use descriptive, hierarchical keys (`user:123:profile`)
- **TTL Values**: Set appropriate expiration times
- **Cache Invalidation**: Clear cache on data updates
- **Cache Warming**: Pre-populate frequently accessed data

### Code Optimization
- **Lazy Loading**: Load resources only when needed
- **Debouncing**: Limit rapid function calls
- **Throttling**: Control execution frequency
- **Memoization**: Cache expensive computations
- **Worker Threads**: Offload CPU-intensive tasks

## Logging & Monitoring

### Logging Levels
```typescript
logger.debug('Detailed debugging information');
logger.info('General informational messages');
logger.warn('Warning messages for potential issues');
logger.error('Error messages with stack traces', error);
```

### Structured Logging
```typescript
logger.info('User action', {
  userId: 'user-123',
  action: 'create_project',
  projectId: 'project-abc',
  timestamp: new Date().toISOString(),
});
```

### Metrics Collection
- **Request Metrics**: Track response times, error rates
- **Resource Metrics**: Monitor CPU, memory, disk usage
- **Business Metrics**: Count operations, user actions
- **Custom Metrics**: Application-specific measurements

## Documentation Standards

### Code Comments
- **JSDoc**: Use for public APIs and complex functions
- **Inline Comments**: Explain "why" not "what"
- **TODO Comments**: Mark incomplete work with context
- **Arabic Support**: Include Arabic descriptions where appropriate

### Function Documentation
```typescript
/**
 * Calculate optimal particle count based on device capabilities
 * 
 * @returns {number} Optimal particle count for current device
 * 
 * @example
 * const count = getOptimalParticleCount();
 * // Returns: 3000 (on mid-range device)
 */
function getOptimalParticleCount(): number {
  // Implementation
}
```

## Git Workflow

### Commit Messages
- **Format**: `type(scope): description`
- **Types**: feat, fix, docs, style, refactor, test, chore
- **Examples**: 
  - `feat(websocket): add room subscription support`
  - `fix(cache): resolve memory leak in Redis client`
  - `docs(readme): update installation instructions`

### Branch Naming
- **Features**: `feature/description`
- **Fixes**: `fix/issue-description`
- **Hotfixes**: `hotfix/critical-issue`
- **Releases**: `release/v1.0.0`

## Arabic Language Support

### UI Text
- **RTL Support**: Use CSS `direction: rtl` for Arabic content
- **Font Selection**: Use Arabic-compatible fonts
- **Text Alignment**: Right-align Arabic text
- **Number Formatting**: Use Arabic numerals where appropriate

### Error Messages
- **User-Facing**: Always in Arabic
- **Developer Logs**: Can be in English
- **API Responses**: Arabic for error field

### Content Handling
- **Encoding**: UTF-8 throughout the stack
- **Validation**: Support Arabic characters in regex patterns
- **Sorting**: Use locale-aware sorting for Arabic text

## Common Patterns & Idioms

### Singleton Pattern
```typescript
class ServiceName {
  private static instance: ServiceName;
  
  private constructor() {}
  
  static getInstance(): ServiceName {
    if (!ServiceName.instance) {
      ServiceName.instance = new ServiceName();
    }
    return ServiceName.instance;
  }
}
```

### Factory Pattern
```typescript
function createParticle(type: ParticleType): Particle {
  switch (type) {
    case 'spark': return new SparkParticle();
    case 'wave': return new WaveParticle();
    default: return new DefaultParticle();
  }
}
```

### Observer Pattern
```typescript
class EventEmitter {
  private listeners: Map<string, Function[]> = new Map();
  
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }
  
  emit(event: string, data: any) {
    this.listeners.get(event)?.forEach(cb => cb(data));
  }
}
```

### Async/Await Pattern
```typescript
// Always use try-catch with async/await
async function fetchData() {
  try {
    const result = await apiCall();
    return result;
  } catch (error) {
    logger.error('Failed to fetch data:', error);
    throw error;
  }
}

// Parallel execution
const [data1, data2] = await Promise.all([
  fetchData1(),
  fetchData2(),
]);
```

## Frequently Used Annotations

### TypeScript Decorators
- Not heavily used in this codebase
- Prefer explicit patterns over decorators

### JSDoc Tags
```typescript
/**
 * @param {string} userId - User identifier
 * @returns {Promise<User>} User object
 * @throws {Error} When user not found
 * @deprecated Use getUserById instead
 */
```

### ESLint Directives
```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = unknownData;

// Disable for entire file (use sparingly)
/* eslint-disable @typescript-eslint/no-unused-vars */
```

## Build & Deployment

### Environment Variables
- **Required**: Always provide `.env.example` template
- **Validation**: Validate on startup using Zod
- **Secrets**: Never commit actual secrets
- **Naming**: Use UPPER_SNAKE_CASE

### Build Process
```bash
# Development
pnpm dev

# Production build
pnpm build

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Testing
pnpm test
```

### Deployment Checklist
- ✅ All tests passing
- ✅ No TypeScript errors
- ✅ No ESLint warnings
- ✅ Environment variables configured
- ✅ Database migrations applied
- ✅ Redis connection verified
- ✅ Monitoring enabled
