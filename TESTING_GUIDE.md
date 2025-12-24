# Testing and Coverage Guide

## 📋 Table of Contents

1. [Overview](#overview)
2. [Test Structure](#test-structure)
3. [Running Tests](#running-tests)
4. [Coverage Configuration](#coverage-configuration)
5. [Writing Tests](#writing-tests)
6. [Integration Tests](#integration-tests)
7. [CI/CD Coverage Validation](#cicd-coverage-validation)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Overview

This project uses **Vitest** as the testing framework for both frontend and backend, with comprehensive coverage requirements enforced at CI/CD time.

### Key Statistics

- **Test Framework:** Vitest 3.0.0+
- **Frontend Coverage Target:** 85% (lines, functions, statements) / 80% (branches)
- **Backend Coverage Target:** 85% (lines, functions, statements) / 80% (branches)
- **CI/CD Enforcement:** Strict - builds fail if thresholds not met
- **Test Types:** Unit, Integration, E2E (Playwright)

---

## Test Structure

### Frontend Tests

```
frontend/
├── src/
│   ├── __tests__/               # Integration and component tests
│   │   ├── integration/
│   │   │   └── components.integration.test.tsx
│   │   └── utils/
│   └── **/*.test.ts(x)          # Colocated unit tests
├── tests/
│   └── setup.ts                 # Test environment setup
└── vitest.config.ts             # Vitest configuration
```

### Backend Tests

```
backend/
├── src/
│   ├── test/
│   │   ├── setup.ts             # Test environment setup
│   │   ├── integration/         # Integration tests
│   │   │   ├── api.integration.test.ts
│   │   │   └── database.integration.test.ts
│   │   └── security.comprehensive.test.ts
│   └── **/*.test.ts             # Colocated unit tests
└── vitest.config.ts             # Vitest configuration
```

---

## Running Tests

### All Tests

```bash
# From root directory
pnpm test              # Run all tests
pnpm test:coverage     # Run with coverage report
pnpm test:watch        # Watch mode
pnpm test:ui           # Vitest UI mode
```

### Frontend Only

```bash
cd frontend

# Run tests
pnpm test              # Run unit tests
pnpm test:coverage     # Generate coverage report
pnpm test:watch        # Watch mode
pnpm test:ui           # Vitest UI

# Run specific test
pnpm test -- src/lib/utils.test.ts

# Run with pattern matching
pnpm test -- --grep "utility"

# Run smoke tests
pnpm test:smoke

# Run E2E tests
pnpm e2e               # Run all E2E tests
pnpm e2e:ui            # Playwright UI mode
pnpm e2e:headed        # Run with visible browser
pnpm e2e:debug         # Debug mode
```

### Backend Only

```bash
cd backend

# Run tests
pnpm test              # Run unit tests
pnpm test:coverage     # Generate coverage report
pnpm test:watch        # Watch mode

# Run specific test
pnpm test -- src/test/integration/api.integration.test.ts

# Run with pattern matching
pnpm test -- --grep "health check"
```

---

## Coverage Configuration

### Frontend Configuration

File: `frontend/vitest.config.ts`

```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html', 'lcov', 'json-summary'],
  reportsDirectory: './reports/coverage',
  lines: 85,
  functions: 85,
  branches: 80,
  statements: 85,
  all: true,
  perFile: true,
  skipFull: false,
  thresholds: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    each: {
      branches: 75,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}
```

### Backend Configuration

File: `backend/vitest.config.ts`

```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html', 'lcov', 'json-summary'],
  reportsDirectory: './coverage',
  lines: 85,
  functions: 85,
  branches: 80,
  statements: 85,
  all: true,
  perFile: true,
  skipFull: false,
  thresholds: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    each: {
      branches: 75,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}
```

### Thresholds Explained

- **global:** Overall coverage for the entire codebase
- **each:** Per-file coverage requirements
- **lines:** % of code lines executed
- **functions:** % of functions called
- **branches:** % of conditional branches tested
- **statements:** % of statements executed

---

## Writing Tests

### Unit Tests (Backend)

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('HealthCheckService', () => {
  let service: HealthCheckService;

  beforeEach(() => {
    service = new HealthCheckService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('checkDatabase', () => {
    it('should return healthy status when database is connected', async () => {
      vi.mocked(database.ping).mockResolvedValueOnce(true);

      const result = await service.checkDatabase();

      expect(result).toEqual({ status: 'healthy' });
      expect(database.ping).toHaveBeenCalledOnce();
    });

    it('should return unhealthy status when database is down', async () => {
      vi.mocked(database.ping).mockRejectedValueOnce(new Error('Connection failed'));

      const result = await service.checkDatabase();

      expect(result).toEqual({ status: 'unhealthy', error: 'Connection failed' });
    });

    it('should timeout after specified duration', async () => {
      vi.mocked(database.ping).mockImplementationOnce(
        () => new Promise(() => {}) // Never resolves
      );

      const result = await Promise.race([
        service.checkDatabase(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 100)
        ),
      ]);

      // Should handle timeout gracefully
      expect(result).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should not throw on unexpected errors', async () => {
      vi.mocked(database.ping).mockRejectedValueOnce(new Error('Unexpected error'));

      expect(async () => {
        await service.checkDatabase();
      }).not.toThrow();
    });
  });
});
```

### Component Tests (Frontend)

```typescript
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProjectForm from './ProjectForm';

describe('ProjectForm Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  it('should render form with input fields', () => {
    renderWithProvider(<ProjectForm />);

    expect(screen.getByLabelText('Project Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByText('Create Project')).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    renderWithProvider(<ProjectForm />);

    const submitButton = screen.getByText('Create Project');
    await user.click(submitButton);

    expect(screen.getByText('Title is required')).toBeInTheDocument();
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    const mockSubmit = vi.fn();

    renderWithProvider(<ProjectForm onSubmit={mockSubmit} />);

    const titleInput = screen.getByLabelText('Project Title');
    const descriptionInput = screen.getByLabelText('Description');
    const submitButton = screen.getByText('Create Project');

    await user.type(titleInput, 'My Project');
    await user.type(descriptionInput, 'A great project');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        title: 'My Project',
        description: 'A great project',
      });
    });
  });

  it('should handle errors gracefully', async () => {
    const user = userEvent.setup();
    const mockSubmit = vi.fn().mockRejectedValue(new Error('API error'));

    renderWithProvider(<ProjectForm onSubmit={mockSubmit} />);

    const titleInput = screen.getByLabelText('Project Title');
    const submitButton = screen.getByText('Create Project');

    await user.type(titleInput, 'My Project');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to create project')).toBeInTheDocument();
    });
  });
});
```

### Mocking Best Practices

```typescript
// ✅ Mock external dependencies
vi.mock('@/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// ✅ Mock with specific implementations
vi.mocked(apiClient.get).mockResolvedValueOnce({ data: [] });

// ✅ Clear mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});

// ❌ Don't test implementation details
// ❌ Don't mock things you don't own (use test doubles instead)
// ❌ Don't test third-party libraries
```

---

## Integration Tests

### API Integration Tests

See: `backend/src/test/integration/api.integration.test.ts`

```typescript
describe('Backend API Integration Tests', () => {
  // Tests for:
  // - Health checks and system status
  // - Authentication and authorization flows
  // - REST API endpoints (GET, POST, PUT, DELETE)
  // - Request validation
  // - Error handling
  // - Concurrent requests
});
```

### Database Integration Tests

See: `backend/src/test/integration/database.integration.test.ts`

```typescript
describe('Database Integration Tests', () => {
  // Tests for:
  // - Database connection and health
  // - CRUD operations (Create, Read, Update, Delete)
  // - Transaction handling
  // - Error scenarios (constraint violations, timeouts)
  // - Performance and optimization
});
```

### Component Integration Tests

See: `frontend/src/__tests__/integration/components.integration.test.tsx`

```typescript
describe('Frontend Integration Tests', () => {
  // Tests for:
  // - Component composition and data flow
  // - API client integration
  // - State management (React Query)
  // - Form handling and validation
  // - Error boundaries
  // - Accessibility
  // - Performance (memoization)
});
```

---

## CI/CD Coverage Validation

### Coverage Workflow

File: `.github/workflows/coverage.yml`

The CI pipeline:

1. **Runs Tests with Coverage**
   ```bash
   pnpm test:coverage
   ```

2. **Verifies Thresholds**
   ```bash
   # Extracts coverage metrics from coverage-summary.json
   # Compares against thresholds
   # Fails if any metric is below threshold
   ```

3. **Uploads to Codecov**
   ```bash
   # Sends LCOV report to codecov.io
   # Provides PR comments with coverage changes
   ```

4. **Comments on PR**
   ```markdown
   ## 📊 Frontend Coverage Report
   
   | Metric | Coverage | Threshold | Status |
   |--------|----------|-----------|--------|
   | Lines | 87.23% | 85% | ✅ |
   | Functions | 86.50% | 85% | ✅ |
   | Branches | 81.20% | 80% | ✅ |
   | Statements | 88.10% | 85% | ✅ |
   ```

### Coverage Badge Updates

File: `.github/workflows/update-badges.yml`

Automatically:
1. Generates coverage badges in SVG format
2. Commits badges to `.github/badges/`
3. Updates README with badge references
4. Uploads reports to artifacts

---

## Best Practices

### Do's ✅

- ✅ Write tests as you develop features
- ✅ Use descriptive test names
- ✅ Follow AAA pattern (Arrange, Act, Assert)
- ✅ Test behavior, not implementation
- ✅ Mock external dependencies
- ✅ Test error cases and edge cases
- ✅ Keep tests focused and independent
- ✅ Use test utilities to avoid duplication
- ✅ Run tests before committing
- ✅ Keep coverage above thresholds

### Don'ts ❌

- ❌ Don't skip CI checks
- ❌ Don't test third-party libraries
- ❌ Don't create interdependent tests
- ❌ Don't test private implementation details
- ❌ Don't use `any` type in tests
- ❌ Don't ignore test failures
- ❌ Don't commit code with failing tests
- ❌ Don't mock things you own
- ❌ Don't test multiple things in one test
- ❌ Don't use `sleep()` for waiting (use `waitFor`)

### Test Names

```typescript
// ✅ Good: Describes expected behavior
it('should return 404 when project not found');
it('should validate email format on submit');
it('should display error message when API fails');

// ❌ Bad: Vague or implementation-focused
it('works correctly');
it('tests the function');
it('mock called');
```

### Test Organization

```typescript
describe('UserService', () => {
  // Arrange: Setup shared state
  let service: UserService;
  
  beforeEach(() => {
    service = new UserService();
  });

  describe('createUser', () => {
    // Act & Assert: Test behavior
    it('should create user with valid data', async () => {
      const user = await service.createUser({ name: 'John' });
      expect(user.id).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should throw on invalid email', async () => {
      expect(() => 
        service.createUser({ email: 'invalid' })
      ).toThrow('Invalid email');
    });
  });
});
```

---

## Troubleshooting

### Coverage Not Meeting Thresholds

**Problem:** Coverage is below threshold but tests pass locally

**Solutions:**
1. Check coverage report: `cd frontend && open reports/coverage/index.html`
2. Identify uncovered lines
3. Add tests for missing coverage
4. Check if exclusions are correct in vitest.config.ts

### Tests Fail in CI but Pass Locally

**Problem:** Tests work locally but fail in CI

**Solutions:**
1. Check for flaky tests (use `--reporter=verbose`)
2. Ensure test data is isolated
3. Check environment variables
4. Look for timing-dependent tests (replace with `waitFor`)
5. Run with `--reporter=verbose` for details

### Coverage Not Updating

**Problem:** Coverage badges not updating on main branch

**Solutions:**
1. Check if `update-badges.yml` workflow is enabled
2. Verify coverage report was generated
3. Check GitHub Actions permissions
4. Re-run workflow manually

### Database Tests Failing

**Problem:** Database integration tests failing

**Solutions:**
1. Ensure test database is running
2. Check connection string in `.env.test`
3. Run migrations: `pnpm db:push --env test`
4. Clear test database: `pnpm db:reset --env test`

### Timeout Issues

**Problem:** Tests timing out

**Solutions:**
```typescript
// Increase timeout for specific test
it('should process large file', async () => {
  // test code
}, { timeout: 10000 }); // 10 seconds

// Or in vitest.config.ts
test: {
  testTimeout: 10000, // 10 seconds globally
}
```

---

## Resources

- [Vitest Documentation](https://vitest.dev)
- [Testing Library Documentation](https://testing-library.com)
- [Playwright Documentation](https://playwright.dev)
- [Codecov Documentation](https://docs.codecov.io)

---

## Questions?

See the main [README.md](../README.md) for general project information.
