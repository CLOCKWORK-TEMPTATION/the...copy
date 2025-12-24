# Testing & Coverage - Quick Reference Card

## 🧪 Test Commands

```bash
# Run all tests
pnpm test

# With coverage report
pnpm test:coverage

# Watch mode (re-run on changes)
pnpm test:watch

# Vitest UI (visual test runner)
pnpm test:ui

# Frontend E2E tests
cd frontend && pnpm e2e

# Frontend smoke tests
cd frontend && pnpm test:smoke

# Backend only
cd backend && pnpm test

# Specific test file
pnpm test -- path/to/file.test.ts

# Tests matching pattern
pnpm test -- --grep "pattern"
```

## 📊 Coverage Reports

### View HTML Reports
```bash
# Frontend
cd frontend && open reports/coverage/index.html

# Backend
cd backend && open coverage/index.html
```

### Coverage Thresholds
| Metric | Target | Per-File |
|--------|--------|----------|
| Lines | 85% | 80% |
| Functions | 85% | 80% |
| Branches | 80% | 75% |
| Statements | 85% | 80% |

## 📍 Test Locations

### Integration Tests
```
backend/
  └── src/test/integration/
      ├── api.integration.test.ts      (API endpoints)
      └── database.integration.test.ts (DB operations)

frontend/
  └── src/__tests__/integration/
      └── components.integration.test.tsx (Components)
```

### Unit Tests (Colocated)
```
Any file with .test.ts or .test.tsx extension
Examples:
  src/lib/utils.test.ts
  src/components/Button.test.tsx
```

## 🔧 Configuration Files

```
frontend/vitest.config.ts    # Vitest + coverage config
backend/vitest.config.ts     # Vitest + coverage config
frontend/tests/setup.ts      # Test environment setup
backend/src/test/setup.ts    # Test environment setup
```

## 🔄 CI/CD Workflows

### Coverage Verification
File: `.github/workflows/coverage.yml`

- Runs on: PRs to main/develop, pushes to main/develop
- Jobs:
  - ✅ coverage-frontend
  - ✅ coverage-backend
  - ✅ coverage-report
- Output: PR comments, Codecov reports, artifacts

### Badge Updates
File: `.github/workflows/update-badges.yml`

- Runs after: Coverage verification passes
- Updates: `.github/badges/` SVG files
- Generates: Coverage summary report

## 📝 Writing Tests

### Test Structure (AAA Pattern)
```typescript
describe('Feature', () => {
  // Arrange: Setup
  let service: Service;
  
  beforeEach(() => {
    service = new Service();
  });

  // Act & Assert
  it('should do something', () => {
    const result = service.method();
    expect(result).toBe(expected);
  });
});
```

### Common Matchers
```typescript
expect(value).toBe(expected)           // Exact match
expect(value).toEqual(expected)        // Deep equal
expect(value).toBeTruthy()             // Truthy
expect(value).toBeNull()               // Null
expect(value).toBeDefined()            // Defined
expect(value).toThrow()                // Throws error
expect(fn).toHaveBeenCalled()          // Mock called
expect(fn).toHaveBeenCalledWith(args)  // Called with args
expect(array).toHaveLength(n)          // Array length
expect(element).toBeInTheDocument()    // DOM element
```

## 🎯 Common Issues

### Coverage Below Threshold
```bash
# 1. Check coverage report
cd frontend && open reports/coverage/index.html

# 2. Find uncovered lines (red markers)

# 3. Add tests for missing coverage

# 4. Re-run coverage
pnpm test:coverage
```

### Tests Failing in CI
```bash
# 1. Run tests locally
pnpm test

# 2. Check for flaky tests
pnpm test -- --reporter=verbose

# 3. Run E2E tests
pnpm e2e

# 4. Check for environment issues
# - Database connection?
# - API availability?
# - Environment variables?
```

### Database Tests Failing
```bash
# 1. Check database running
# 2. Run migrations: pnpm db:push --env test
# 3. Clear test data: pnpm db:reset --env test
# 4. Check connection string in .env.test
```

## 📚 Documentation

- **Full Guide:** `TESTING_GUIDE.md`
- **Implementation:** `TESTING_AND_COVERAGE_SETUP.md`
- **Examples:** Integration test files
- **README:** `README.md` (#testing section)

## 🚀 Pre-Commit Checklist

- [ ] Tests pass: `pnpm test`
- [ ] Coverage adequate: `pnpm test:coverage`
- [ ] Lint passes: `pnpm lint`
- [ ] Types check: `pnpm typecheck`
- [ ] Build succeeds: `pnpm build`

## 💡 Pro Tips

```bash
# Run only changed tests (watch mode)
pnpm test:watch

# Run tests in parallel for speed
pnpm test -- --reporter=verbose

# Generate coverage before commit
pnpm test:coverage && git add coverage/

# View live test results in UI
pnpm test:ui

# Debug specific test
pnpm test -- --grep "test name" --reporter=verbose
```

## 🔐 Coverage Badges

Automatically generated and updated:

```markdown
![Frontend Lines](https://raw.githubusercontent.com/[org]/[repo]/main/.github/badges/frontend-lines.svg)
![Frontend Coverage](https://raw.githubusercontent.com/[org]/[repo]/main/.github/badges/frontend-coverage.svg)
![Backend Coverage](https://raw.githubusercontent.com/[org]/[repo]/main/.github/badges/backend-coverage.svg)
```

## 📊 Coverage Summary Command

```bash
# Display coverage in terminal
pnpm test:coverage

# Expected output:
# ✓ src/lib/utils.test.ts (10)
# ✓ src/components/Button.test.tsx (8)
# 
# Test Files: 50 passed (50)
# Tests: 318 passed (318)
# Coverage: 87.2% L 85.5% F 82.1% B 86.9% S
```

---

**Last Updated:** December 24, 2025
**Framework:** Vitest 3.0+
**Status:** ✅ Ready for Use
