# Performance Budget

This document outlines the performance budget for the frontend application and how it is enforced in CI/CD.

## Overview

A performance budget is a set of limits imposed on metrics that affect site performance. By setting and enforcing these budgets, we ensure that our application delivers a fast and smooth user experience.

## Performance Budgets

### Resource Size Budgets

#### JavaScript

- **Total Bundle**: 350 KB (compressed)
- **Main Bundle**: 250 KB (compressed)
- **Vendor Bundle**: 200 KB (compressed)
- **Per Route**: 50 KB (compressed)

#### CSS

- **Total CSS**: 100 KB (compressed)
- **Critical CSS**: 20 KB (compressed)
- **Per Page**: 30 KB (compressed)

#### Images

- **Total Images per Page**: 500 KB
- **Hero/Banner Images**: 150 KB
- **Thumbnail Images**: 30 KB
- **Icon Images**: 10 KB

#### Fonts

- **Total Fonts**: 100 KB
- **Per Font File**: 30 KB

#### Total Page Weight

- **First Load**: 1000 KB (compressed)
- **Subsequent Loads**: 500 KB (compressed)
- **Total**: 1500 KB (compressed)

### Web Vitals Budgets

#### Core Web Vitals

1. **Largest Contentful Paint (LCP)**
   - Good: ≤ 2.5s
   - Needs Improvement: 2.5s - 4s
   - Poor: > 4s

2. **First Input Delay (FID)**
   - Good: ≤ 100ms
   - Needs Improvement: 100ms - 300ms
   - Poor: > 300ms

3. **Cumulative Layout Shift (CLS)**
   - Good: ≤ 0.1
   - Needs Improvement: 0.1 - 0.25
   - Poor: > 0.25

#### Other Performance Metrics

4. **First Contentful Paint (FCP)**
   - Good: ≤ 1.8s
   - Needs Improvement: 1.8s - 3s
   - Poor: > 3s

5. **Time to Interactive (TTI)**
   - Good: ≤ 3.8s
   - Needs Improvement: 3.8s - 7.3s
   - Poor: > 7.3s

6. **Total Blocking Time (TBT)**
   - Good: ≤ 200ms
   - Needs Improvement: 200ms - 600ms
   - Poor: > 600ms

7. **Speed Index**
   - Good: ≤ 3.4s
   - Needs Improvement: 3.4s - 5.8s
   - Poor: > 5.8s

### Lighthouse Scores

Minimum scores required:

- **Performance**: 90/100
- **Accessibility**: 95/100
- **Best Practices**: 95/100
- **SEO**: 95/100
- **PWA**: 80/100 (if applicable)

### Network Request Budgets

- **Total Requests**: 50
- **JavaScript Requests**: 15
- **CSS Requests**: 5
- **Image Requests**: 20
- **Font Requests**: 5
- **Third-Party Requests**: 10

### Timing Budgets

- **Server Response Time (TTFB)**: 500ms
- **DOMContentLoaded**: 2000ms
- **Load Event**: 4000ms
- **First Meaningful Paint**: 2500ms
- **Time to Interactive**: 3800ms

## CI/CD Enforcement

### Automated Checks

Performance budgets are automatically checked in the CI/CD pipeline:

1. **On Pull Requests**: Every PR triggers performance budget checks
2. **On Push to Main**: Deployments are validated against budgets
3. **Manual Trigger**: Can be run manually via workflow dispatch

### GitHub Actions Workflows

#### 1. Performance Budget Workflow

- **File**: `.github/workflows/performance-budget.yml`
- **Triggers**: PR, push to main, manual
- **Checks**:
  - JavaScript bundle size
  - CSS bundle size
  - Total page weight
  - Large file analysis
  - Performance report generation

#### 2. Lighthouse CI Workflow

- **File**: `.github/workflows/lighthouse-ci.yml`
- **Triggers**: PR, push to main
- **Checks**:
  - Lighthouse performance scores
  - Web Vitals metrics
  - Accessibility, Best Practices, SEO scores

#### 3. Main CI/CD Workflow

- **File**: `frontend/.github/workflows/ci-cd.yml`
- **Includes**: Performance budget check step
- **Integration**: Runs after build, before deployment

### Enforcement Levels

#### Strict (Build Fails)

- LCP exceeds needs improvement threshold
- CLS exceeds needs improvement threshold
- Performance score < 90
- Accessibility score < 95
- Total page weight > 1500 KB

#### Warnings (Build Continues)

- JavaScript bundle > 350 KB
- CSS bundle > 100 KB
- Total requests > 50
- Server response time > 500ms

#### Tracking (Informational)

- Duplicate dependencies count
- Cache hit rate
- Individual chunk sizes

## Local Development

### Running Budget Checks Locally

```bash
# Build and check performance budget
npm run budget:report

# Check budget without building
npm run budget:check

# Run Lighthouse CI locally
npm run lighthouse
```

### Scripts

#### Check Performance Budget

```bash
node scripts/check-performance-budget.js
```

This script:

- Analyzes JavaScript bundle size
- Checks CSS bundle size
- Validates total page weight
- Identifies large files
- Generates detailed report

#### Bundle Analysis

```bash
npm run analyze
```

Generates an interactive bundle analysis report.

## Configuration Files

### 1. Performance Budget Config

- **File**: `frontend/performance-budget.config.js`
- **Purpose**: Defines all performance budgets
- **Used by**: Check script, CI/CD workflows

### 2. Lighthouse RC

- **File**: `frontend/lighthouserc.json`
- **Purpose**: Configures Lighthouse CI
- **Includes**: Performance assertions, Web Vitals thresholds

### 3. Next.js Bundle Analyzer

- **Integration**: Via `@next/bundle-analyzer`
- **Usage**: `ANALYZE=true npm run build`

## Best Practices

### To Meet Performance Budgets

1. **Code Splitting**
   - Use dynamic imports for heavy components
   - Split routes into separate chunks
   - Lazy load non-critical features

2. **Tree Shaking**
   - Import only what you need
   - Use ES modules
   - Configure webpack/next.js for optimal tree shaking

3. **Image Optimization**
   - Use Next.js Image component
   - Serve modern formats (WebP, AVIF)
   - Implement lazy loading
   - Use appropriate image sizes

4. **Font Optimization**
   - Use font-display: swap
   - Subset fonts to include only needed characters
   - Preload critical fonts
   - Consider system fonts

5. **Third-Party Scripts**
   - Load scripts asynchronously
   - Use script strategy in Next.js
   - Consider self-hosting critical third-party code
   - Defer non-critical scripts

6. **CSS Optimization**
   - Remove unused CSS
   - Use CSS modules
   - Implement critical CSS
   - Minify and compress

7. **Caching Strategy**
   - Implement effective cache headers
   - Use service workers for offline support
   - Cache static assets aggressively

## Monitoring

### Production Monitoring

- **Sentry**: Tracks real user Web Vitals
- **Lighthouse CI**: Automated performance audits
- **GitHub Actions**: CI/CD enforcement

### Performance Reports

After each deployment, review:

1. Bundle size trends
2. Web Vitals metrics
3. Lighthouse scores
4. Performance regression alerts

### Alerts

The CI/CD pipeline will:

- ❌ Fail builds that exceed strict budgets
- ⚠️ Warn about approaching budget limits
- ℹ️ Track metrics for monitoring

## Troubleshooting

### Build Fails Due to Budget Exceeded

1. **Check the CI/CD logs** for specific failures
2. **Review the performance report** artifact
3. **Run locally**: `npm run budget:check`
4. **Analyze bundle**: `npm run analyze`

### Common Issues

#### JavaScript Bundle Too Large

- Check for duplicate dependencies
- Review and optimize third-party libraries
- Implement code splitting
- Use dynamic imports

#### CSS Bundle Too Large

- Remove unused styles
- Use CSS modules
- Implement critical CSS extraction
- Minify CSS

#### Page Weight Too Heavy

- Optimize images
- Remove unnecessary assets
- Implement lazy loading
- Check for redundant resources

## Resources

- [Web.dev - Performance Budgets](https://web.dev/performance-budgets-101/)
- [Google - Web Vitals](https://web.dev/vitals/)
- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)

## Updates

This performance budget should be reviewed and updated:

- Quarterly, as technology and best practices evolve
- When major features are added
- Based on real user metrics and feedback
- After significant architecture changes

Last updated: 2025-11-07
