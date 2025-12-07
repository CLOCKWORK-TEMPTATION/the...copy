# Development Guidelines - The Copy

## Code Quality Standards

### Formatting and Structure
- **Indentation**: 2 spaces for TypeScript/JavaScript, consistent across all files
- **Line Length**: Prefer lines under 100 characters, break complex expressions
- **Semicolons**: Always use semicolons in TypeScript/JavaScript
- **Quotes**: Double quotes for strings in TypeScript, single quotes acceptable in legacy JS
- **Trailing Commas**: Use trailing commas in multi-line objects and arrays

### Naming Conventions
- **Variables/Functions**: camelCase (e.g., `getUserData`, `isLoading`, `handleSubmit`)
- **Classes/Components**: PascalCase (e.g., `ScreenplayEditor`, `UserProfile`, `ApiClient`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`, `MAX_RETRIES`, `TOAST_LIMIT`)
- **Private Members**: Prefix with underscore (e.g., `_internalState`, `_processData`)
- **Boolean Variables**: Prefix with `is`, `has`, `should` (e.g., `isLoading`, `hasError`, `shouldRetry`)
- **Event Handlers**: Prefix with `handle` or `on` (e.g., `handleClick`, `onSubmit`, `handleKeyDown`)
- **Files**: kebab-case for files (e.g., `screenplay-editor.tsx`, `shots.controller.ts`)
- **Directories**: kebab-case for directories (e.g., `directors-studio`, `action-classifiers`)

### Documentation Standards
- **JSDoc Comments**: Use for public APIs, complex functions, and class methods
- **Inline Comments**: Explain "why" not "what", use sparingly for complex logic
- **Type Annotations**: Always provide explicit types for function parameters and return values
- **README Files**: Include in major feature directories with usage examples
- **Arabic Support**: Use Arabic for user-facing messages, English for code/comments

### File Organization
- **Imports Order**: 
  1. External libraries (React, third-party)
  2. Internal modules (utils, services)
  3. Types and interfaces
  4. Styles and assets
- **Export Pattern**: Named exports preferred over default exports for better refactoring
- **File Size**: Keep files under 500 lines, split into smaller modules if needed
- **Single Responsibility**: One component/class per file (exceptions for tightly coupled helpers)

## Semantic Patterns

### React Component Patterns

#### Functional Components with Hooks
```typescript
// Standard pattern used throughout the codebase
export default function ComponentName({ prop1, prop2 }: ComponentProps) {
  // State hooks first
  const [state, setState] = useState(initialValue);
  
  // Refs
  const elementRef = useRef<HTMLDivElement>(null);
  
  // Effects
  useEffect(() => {
    // Effect logic
    return () => {
      // Cleanup
    };
  }, [dependencies]);
  
  // Event handlers
  const handleEvent = (e: React.Event) => {
    // Handler logic
  };
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

#### State Management Pattern
- **Local State**: Use `useState` for component-specific state
- **Refs**: Use `useRef` for DOM references and mutable values that don't trigger re-renders
- **Derived State**: Calculate from existing state/props, don't store separately
- **State Updates**: Use functional updates when new state depends on previous state

#### Custom Hooks Pattern
```typescript
// Pattern from use-toast.ts
function useCustomHook() {
  const [state, setState] = React.useState<State>(initialState);
  
  React.useEffect(() => {
    // Setup
    return () => {
      // Cleanup
    };
  }, [dependencies]);
  
  return {
    ...state,
    actions: {
      // Action methods
    },
  };
}
```

### Backend Controller Patterns

#### Controller Structure (from shots.controller.test.ts)
```typescript
export const controllerName = {
  async actionName(req: Request, res: Response) {
    try {
      // 1. Authentication check
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'غير مصرح',
        });
      }
      
      // 2. Input validation
      const { param } = req.params;
      if (!param) {
        return res.status(400).json({
          success: false,
          error: 'معرف مطلوب',
        });
      }
      
      // 3. Data validation with Zod
      const validatedData = schema.parse(req.body);
      
      // 4. Database operations
      const result = await db.select()
        .from(table)
        .where(conditions);
      
      // 5. Authorization check
      if (!result || result.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'غير موجود',
        });
      }
      
      // 6. Success response
      return res.status(200).json({
        success: true,
        data: result,
      });
      
    } catch (error) {
      // 7. Error handling
      logger.error('Error message', error);
      return res.status(500).json({
        success: false,
        error: 'حدث خطأ',
      });
    }
  },
};
```

#### Response Format Standard
```typescript
// Success response
{
  success: true,
  data: any,
  message?: string
}

// Error response
{
  success: false,
  error: string,
  details?: any[]
}

// Created response (201)
{
  success: true,
  message: 'تم إنشاء بنجاح',
  data: createdItem
}
```

### Testing Patterns

#### Test Structure (from shots.controller.test.ts)
```typescript
describe('ComponentName', () => {
  let mockDependency: any;
  
  beforeEach(() => {
    // Setup mocks
    mockDependency = {
      method: vi.fn().mockReturnValue(value),
    };
    vi.clearAllMocks();
  });
  
  describe('methodName', () => {
    it('should handle success case', async () => {
      // Arrange
      const input = { /* test data */ };
      
      // Act
      await method(input);
      
      // Assert
      expect(result).toEqual(expected);
    });
    
    it('should handle error case', async () => {
      // Arrange - setup error condition
      
      // Act & Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });
});
```

#### Test Coverage Requirements
- **Controllers**: Test all CRUD operations, auth checks, validation, error handling
- **Components**: Test rendering, user interactions, state changes, edge cases
- **Utilities**: Test all branches, edge cases, error conditions
- **Integration**: Test API endpoints, database operations, external service calls

### Error Handling Patterns

#### Try-Catch Pattern
```typescript
try {
  // Operation that might fail
  const result = await riskyOperation();
  return result;
} catch (error) {
  // Log error with context
  logger.error('Operation failed', { error, context });
  
  // Return user-friendly error
  throw new Error('عملية فشلت');
}
```

#### Validation Pattern with Zod
```typescript
// Define schema
const schema = z.object({
  field: z.string().min(1, 'الحقل مطلوب'),
  optional: z.string().optional(),
});

// Validate
try {
  const validated = schema.parse(input);
  // Use validated data
} catch (error) {
  if (error instanceof z.ZodError) {
    return {
      success: false,
      error: 'بيانات غير صالحة',
      details: error.errors,
    };
  }
}
```

### Class-Based Patterns

#### Utility Class Pattern (from ScreenplayClassifier)
```typescript
class UtilityClass {
  // Static constants
  static readonly CONSTANT = 'value';
  
  // Static regex patterns
  static readonly PATTERN = /regex/;
  
  // Instance properties
  property: Type;
  
  constructor() {
    // Initialize instance properties
    this.property = value;
  }
  
  // Static utility methods
  static utilityMethod(input: Type): ReturnType {
    // Pure function logic
    return result;
  }
  
  // Instance methods
  instanceMethod(input: Type): ReturnType {
    // Method logic using instance properties
    return result;
  }
}
```

#### Pattern Matching and Classification
```typescript
// Use static methods for stateless operations
static isType(input: string): boolean {
  return PATTERN.test(input);
}

// Chain multiple checks for complex classification
if (isTypeA(input)) {
  return 'typeA';
} else if (isTypeB(input)) {
  return 'typeB';
} else {
  return 'default';
}
```

## Internal API Usage

### Database Operations (Drizzle ORM)

#### Query Pattern
```typescript
// Select with joins and conditions
const results = await db
  .select()
  .from(table)
  .leftJoin(otherTable, eq(table.id, otherTable.foreignKey))
  .where(and(
    eq(table.field, value),
    eq(table.userId, userId)
  ))
  .orderBy(desc(table.createdAt));
```

#### Insert Pattern
```typescript
const [created] = await db
  .insert(table)
  .values(data)
  .returning();

if (!created) {
  throw new Error('فشل الإنشاء');
}
```

#### Update Pattern
```typescript
const [updated] = await db
  .update(table)
  .set(data)
  .where(eq(table.id, id))
  .returning();
```

#### Delete Pattern
```typescript
await db
  .delete(table)
  .where(eq(table.id, id));
```

### React Hooks Usage

#### useState Pattern
```typescript
// Simple state
const [value, setValue] = useState<Type>(initialValue);

// Complex state with object
const [state, setState] = useState<StateType>({
  field1: value1,
  field2: value2,
});

// Update with functional form
setValue(prev => prev + 1);
setState(prev => ({ ...prev, field: newValue }));
```

#### useEffect Pattern
```typescript
// Run once on mount
useEffect(() => {
  initialize();
}, []);

// Run when dependencies change
useEffect(() => {
  fetchData(id);
}, [id]);

// With cleanup
useEffect(() => {
  const subscription = subscribe();
  return () => {
    subscription.unsubscribe();
  };
}, [dependency]);
```

#### useRef Pattern
```typescript
// DOM reference
const elementRef = useRef<HTMLDivElement>(null);

// Mutable value that persists across renders
const countRef = useRef(0);

// Access in effect or handler
useEffect(() => {
  if (elementRef.current) {
    elementRef.current.focus();
  }
}, []);
```

### Event Handling Patterns

#### Keyboard Events
```typescript
const handleKeyDown = (e: React.KeyboardEvent) => {
  // Prevent default browser behavior
  if (e.key === 'Tab') {
    e.preventDefault();
    // Custom tab handling
  }
  
  // Modifier keys
  if (e.ctrlKey || e.metaKey) {
    switch (e.key) {
      case 's':
        e.preventDefault();
        handleSave();
        break;
      // More shortcuts
    }
  }
};
```

#### Form Events
```typescript
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  const formData = new FormData(e.currentTarget);
  const data = Object.fromEntries(formData);
  // Process form data
};

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setState(prev => ({ ...prev, [name]: value }));
};
```

### Async Operations Pattern

#### Fetch with Retry
```typescript
const fetchWithRetry = async (
  url: string,
  options: RequestInit,
  retries: number = 3,
  delay: number = 1000
): Promise<Response> => {
  try {
    const response = await fetch(url, options);
    
    if (response.ok) {
      return response;
    }
    
    // Don't retry client errors
    if (response.status >= 400 && response.status < 500) {
      throw new Error(`Client error: ${response.status}`);
    }
    
    throw new Error(`Server error: ${response.status}`);
  } catch (error) {
    if (retries === 0) {
      throw error;
    }
    
    // Exponential backoff
    await new Promise(resolve => setTimeout(resolve, delay));
    return fetchWithRetry(url, options, retries - 1, delay * 2);
  }
};
```

## Code Idioms

### Conditional Rendering
```typescript
// Short-circuit evaluation
{condition && <Component />}

// Ternary for two options
{condition ? <ComponentA /> : <ComponentB />}

// Nullish coalescing for defaults
const value = input ?? defaultValue;

// Optional chaining for safe access
const result = object?.property?.method?.();
```

### Array Operations
```typescript
// Map for transformation
const transformed = items.map(item => ({
  ...item,
  newField: transform(item.field)
}));

// Filter for selection
const filtered = items.filter(item => item.active);

// Reduce for aggregation
const sum = items.reduce((acc, item) => acc + item.value, 0);

// Find for single item
const found = items.find(item => item.id === targetId);

// Some/Every for boolean checks
const hasActive = items.some(item => item.active);
const allValid = items.every(item => item.valid);
```

### Object Manipulation
```typescript
// Spread for shallow copy
const copy = { ...original };

// Spread with override
const updated = { ...original, field: newValue };

// Destructuring with rename
const { oldName: newName, ...rest } = object;

// Dynamic keys
const obj = { [dynamicKey]: value };

// Object.assign for merging
Object.assign(target, source1, source2);
```

### String Operations
```typescript
// Template literals for interpolation
const message = `Hello ${name}, you have ${count} items`;

// Regex for pattern matching
const matches = text.match(/pattern/g);
const replaced = text.replace(/old/g, 'new');

// String methods
const trimmed = text.trim();
const parts = text.split(',');
const joined = parts.join(', ');
```

### Type Guards and Assertions
```typescript
// Type guard function
function isType(value: unknown): value is Type {
  return typeof value === 'object' && value !== null && 'field' in value;
}

// Type assertion
const element = document.getElementById('id') as HTMLDivElement;

// Non-null assertion (use sparingly)
const value = maybeNull!;

// Optional chaining with type narrowing
if (object?.property) {
  // property is defined here
}
```

## Common Annotations

### TypeScript Type Annotations
```typescript
// Function types
type Handler = (event: Event) => void;
type AsyncFn = () => Promise<void>;

// Union types
type Status = 'idle' | 'loading' | 'success' | 'error';

// Intersection types
type Combined = TypeA & TypeB;

// Generic types
type Result<T> = { success: true; data: T } | { success: false; error: string };

// Utility types
type Partial<T> = { [P in keyof T]?: T[P] };
type Required<T> = { [P in keyof T]-?: T[P] };
type Pick<T, K extends keyof T> = { [P in K]: T[P] };
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
```

### JSDoc Annotations
```typescript
/**
 * Brief description of function
 * 
 * @param {Type} paramName - Parameter description
 * @returns {ReturnType} Return value description
 * @throws {ErrorType} When error occurs
 * @example
 * const result = functionName(param);
 */
function functionName(paramName: Type): ReturnType {
  // Implementation
}

/**
 * @typedef {Object} TypeName
 * @property {string} field1 - Field description
 * @property {number} field2 - Field description
 */
```

### React Component Props
```typescript
interface ComponentProps {
  // Required props
  requiredProp: string;
  
  // Optional props
  optionalProp?: number;
  
  // Callback props
  onEvent?: (data: EventData) => void;
  
  // Children
  children?: React.ReactNode;
  
  // Style props
  className?: string;
  style?: React.CSSProperties;
}
```

## Best Practices

### Performance
- Use `React.memo` for expensive components that re-render frequently
- Use `useMemo` for expensive calculations
- Use `useCallback` for stable function references in dependencies
- Lazy load components with `React.lazy` and `Suspense`
- Debounce/throttle frequent events (scroll, resize, input)

### Security
- Always validate user input with Zod schemas
- Sanitize HTML content with DOMPurify
- Use parameterized queries (Drizzle handles this)
- Never expose API keys in frontend code
- Implement proper authentication checks in all controllers

### Accessibility
- Use semantic HTML elements
- Provide ARIA labels for interactive elements
- Ensure keyboard navigation works
- Maintain proper heading hierarchy
- Test with screen readers

### Code Organization
- Keep components small and focused (< 300 lines)
- Extract complex logic into custom hooks
- Use utility functions for reusable logic
- Group related files in feature directories
- Maintain consistent file structure across features

### Arabic Language Support
- Use RTL (right-to-left) direction for Arabic text
- Test with Arabic fonts (Amiri, Cairo, Noto Sans Arabic)
- Use Arabic for all user-facing messages
- Support both Eastern (٠-٩) and Western (0-9) digits
- Handle Arabic-specific text processing (tashkeel, normalization)
