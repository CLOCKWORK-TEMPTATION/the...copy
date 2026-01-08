# CI/CD Pipeline Improvements

## Overview

This document describes the optimizations made to reduce CI/CD pipeline execution time from >15 minutes to <7 minutes.

## Optimization Strategies Applied

### 1. Change Detection (Skip Unchanged Services)

Using `dorny/paths-filter@v3` to detect which parts of the monorepo changed:

```yaml
- frontend/**     → Frontend jobs only
- backend/**      → Backend jobs only
- root files      → All jobs
```

**Benefit**: Skip entire job chains when code hasn't changed.

### 2. Parallel Test Execution

Jobs run in parallel instead of sequential:

```
┌─────────────────────────────────────────────────────────────┐
│  Stage 1: changes (detect changes)                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Stage 2: install (shared dependency installation)          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ lint-frontend│ │ lint-backend │ │typecheck-fe  │ │typecheck-be  │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
        ↓                ↓                ↓                ↓
┌──────────────┐                   ┌──────────────┐
│ test-frontend│                   │ test-backend │
└──────────────┘                   └──────────────┘
        ↓                                 ↓
┌──────────────┐                   ┌──────────────┐
│build-frontend│                   │ build-backend│
└──────────────┘                   └──────────────┘
        ↓
┌──────────────┐
│  e2e-tests   │ (PR only)
└──────────────┘
```

### 3. Dependency Caching

Three levels of caching:

#### a) pnpm Store Cache
```yaml
- uses: actions/cache@v4
  with:
    path: $(pnpm store path)
    key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
```

#### b) node_modules Cache
```yaml
- uses: actions/cache@v4
  with:
    path: |
      node_modules
      frontend/node_modules
      backend/node_modules
    key: ${{ runner.os }}-node-modules-${{ hashFiles('**/pnpm-lock.yaml') }}
```

#### c) Next.js Build Cache
```yaml
- uses: actions/cache@v4
  with:
    path: frontend/.next/cache
    key: ${{ runner.os }}-nextjs-${{ hashFiles('**/pnpm-lock.yaml') }}-${{ hashFiles('frontend/**/*.ts', 'frontend/**/*.tsx') }}
```

### 4. Incremental Builds

- **Next.js**: Uses `.next/cache` for incremental compilation
- **TypeScript Backend**: Uses `tsconfig.tsbuildinfo` for incremental builds

### 5. Concurrency Control

Cancel in-progress runs when new commits are pushed:

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

### 6. Conditional E2E Tests

E2E tests only run on PRs (not on main push) to save time:

```yaml
if: github.event_name == 'pull_request'
```

## Estimated Time Savings

| Stage | Before | After | Savings |
|-------|--------|-------|---------|
| Install Dependencies | ~3 min | ~30s (cached) | 2.5 min |
| Lint (sequential) | ~4 min | ~1 min (parallel) | 3 min |
| TypeCheck (sequential) | ~3 min | ~45s (parallel) | 2.25 min |
| Tests (sequential) | ~4 min | ~1.5 min (parallel) | 2.5 min |
| Build (sequential) | ~5 min | ~2 min (cached + parallel) | 3 min |
| **Total** | **~19 min** | **~5.75 min** | **~13 min** |

## Files Modified

1. `.github/workflows/ci.yml` - New comprehensive CI pipeline
2. `.github/workflows/firebase-hosting-merge.yml` - Optimized with caching
3. `.github/workflows/firebase-hosting-pull-request.yml` - Optimized with caching

## Best Practices Implemented

1. **Use frozen lockfile**: `pnpm install --frozen-lockfile`
2. **Disable telemetry**: `NEXT_TELEMETRY_DISABLED=1`
3. **Upload artifacts**: Build artifacts shared between jobs
4. **Code coverage upload**: Codecov integration for visibility
5. **Playwright report upload**: Debug failed E2E tests easily

## Monitoring

- Check GitHub Actions tab for pipeline timing
- Review cache hit rates in job logs
- Monitor Codecov for coverage trends

## Troubleshooting

### Cache Not Restoring
```bash
# Check cache keys in logs
# Ensure pnpm-lock.yaml hasn't changed unexpectedly
```

### Parallel Jobs Failing
```bash
# Check job dependencies
# Ensure install job completes before quality checks
```

### E2E Tests Flaky
```bash
# Review Playwright reports in artifacts
# Consider retry configuration
```
