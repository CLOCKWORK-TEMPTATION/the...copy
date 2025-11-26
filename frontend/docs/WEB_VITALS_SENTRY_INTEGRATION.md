# Web Vitals & Sentry Integration

## Overview

This document describes the integration of Core Web Vitals monitoring with Sentry for real-time performance tracking and alerting.

## What are Web Vitals?

Web Vitals are Google's initiative to provide unified guidance for quality signals that are essential to delivering a great user experience on the web.

### Core Web Vitals Metrics

| Metric                              | Description                                                    | Good    | Needs Improvement | Poor    |
| ----------------------------------- | -------------------------------------------------------------- | ------- | ----------------- | ------- |
| **LCP** (Largest Contentful Paint)  | Loading performance - time to render largest content element   | ≤ 2.5s  | 2.5s - 4s         | > 4s    |
| **INP** (Interaction to Next Paint) | Responsiveness - time from user interaction to visual feedback | ≤ 200ms | 200ms - 500ms     | > 500ms |
| **CLS** (Cumulative Layout Shift)   | Visual stability - unexpected layout shifts                    | ≤ 0.1   | 0.1 - 0.25        | > 0.25  |

### Additional Metrics

| Metric                           | Description                  | Good    | Needs Improvement | Poor     |
| -------------------------------- | ---------------------------- | ------- | ----------------- | -------- |
| **FCP** (First Contentful Paint) | Time to first content render | ≤ 1.8s  | 1.8s - 3s         | > 3s     |
| **TTFB** (Time to First Byte)    | Server response time         | ≤ 800ms | 800ms - 1800ms    | > 1800ms |

## Implementation

### 1. Web Vitals Collection

The implementation uses the `web-vitals` library to collect performance metrics:

```typescript
// frontend/src/lib/web-vitals.ts
import { onCLS, onINP, onFCP, onLCP, onTTFB } from "web-vitals";
import * as Sentry from "@sentry/react";

function sendToSentry(metric) {
  // Send as Sentry measurement
  Sentry.setMeasurement(metric.name, metric.value, "millisecond");

  // Add breadcrumb for context
  Sentry.addBreadcrumb({
    category: "web-vitals",
    message: `${metric.name}: ${metric.value}ms (${metric.rating})`,
    level:
      metric.rating === "good"
        ? "info"
        : metric.rating === "needs-improvement"
          ? "warning"
          : "error",
  });

  // Report poor metrics as events
  if (metric.rating === "poor") {
    Sentry.captureMessage(`Poor Web Vital: ${metric.name}`, "warning");
  }
}
```

### 2. Client-Side Integration

The `WebVitalsReporter` component initializes tracking:

```tsx
// frontend/src/components/WebVitalsReporter.tsx
"use client";

import { useEffect } from "react";
import { reportWebVitals } from "@/lib/web-vitals";

export default function WebVitalsReporter() {
  useEffect(() => {
    reportWebVitals();
  }, []);

  return null;
}
```

### 3. Layout Integration

The component is included in the root layout:

```tsx
// frontend/src/app/layout.tsx
import WebVitalsReporter from "@/components/WebVitalsReporter";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <WebVitalsReporter />
        {children}
      </body>
    </html>
  );
}
```

## Performance Budgets

### Resource Size Budgets

| Resource Type | Budget (KB) |
| ------------- | ----------- |
| JavaScript    | 350         |
| CSS           | 50          |
| Images        | 500         |
| Fonts         | 100         |
| Document      | 50          |
| **Total**     | **1000**    |

### Timing Budgets

| Metric                   | Budget (ms) |
| ------------------------ | ----------- |
| First Contentful Paint   | 1800        |
| Largest Contentful Paint | 2500        |
| Total Blocking Time      | 200         |
| Speed Index              | 3400        |
| Time to Interactive      | 3800        |
| Cumulative Layout Shift  | 0.1         |

### Lighthouse Quality Standards

| Category       | Minimum Score |
| -------------- | ------------- |
| Performance    | 90%           |
| Accessibility  | 95%           |
| Best Practices | 95%           |
| SEO            | 95%           |

These budgets and standards are enforced in:

- **Lighthouse CI**: `lighthouserc.json`
- **CI/CD Pipeline**: `.github/workflows/ci.yml`

## CI/CD Integration

### Performance Check Workflow

The CI/CD pipeline includes automated performance checks:

```yaml
- name: Check performance budgets
  run: |
    # Calculate bundle sizes
    JS_SIZE=$(find .next/static -name "*.js" -exec du -k {} + | awk '{s+=$1} END {print s}')

    # Compare against budgets
    if [ "$JS_SIZE" -gt "350" ]; then
      echo "❌ JavaScript size exceeds budget!"
      exit 1
    fi
```

### Lighthouse CI

Lighthouse runs on every PR to validate:

- Performance score ≥ 85%
- All Core Web Vitals within "Good" thresholds
- Resource budgets not exceeded

## Monitoring in Sentry

### Viewing Web Vitals

1. Go to **Performance** → **Web Vitals**
2. Filter by:
   - Time range
   - Page/route
   - Device type
   - Geographic location

### Setting Up Alerts

Create alerts for poor Web Vitals:

```javascript
// Alert configuration example
{
  "metric": "measurements.lcp",
  "threshold": 2500,
  "condition": "greater_than",
  "action": "send_notification"
}
```

### Dashboard Queries

Example queries for custom dashboards:

```sql
-- Average LCP by page
SELECT
  transaction,
  avg(measurements.lcp) as avg_lcp
FROM transactions
WHERE measurements.lcp IS NOT NULL
GROUP BY transaction
ORDER BY avg_lcp DESC

-- Poor Web Vitals count
SELECT
  count() as poor_vitals
FROM transactions
WHERE
  measurements.lcp > 4000 OR
  measurements.inp > 500 OR
  measurements.cls > 0.25
```

## Development Workflow

### Local Testing

Web Vitals are logged to console in development:

```bash
[Web Vitals] LCP: {
  value: 2345.67ms,
  rating: 'good',
  delta: 123.45ms
}
```

### Production Monitoring

In production, metrics are:

1. Sent to Sentry as measurements
2. Added as breadcrumbs for context
3. Reported as events if rating is 'poor'

## Best Practices

### 1. Improve LCP

- Optimize images (WebP, lazy loading)
- Use CDN for static assets
- Implement code splitting
- Reduce server response time

### 2. Improve INP

- Minimize JavaScript execution
- Use web workers for heavy computations
- Implement virtual scrolling for long lists
- Debounce/throttle event handlers

### 3. Improve CLS

- Reserve space for images/ads
- Avoid inserting content above existing content
- Use CSS animations instead of layout changes
- Set dimensions for media elements

### 4. General Optimizations

- Enable HTTP/2 or HTTP/3
- Use compression (Brotli/Gzip)
- Implement proper caching strategies
- Minimize third-party scripts

## Troubleshooting

### Metrics Not Appearing in Sentry

1. Check Sentry DSN is configured:

   ```bash
   echo $NEXT_PUBLIC_SENTRY_DSN
   ```

2. Verify Sentry is initialized:

   ```typescript
   import * as Sentry from "@sentry/react";
   console.log("Sentry initialized:", !!Sentry.getCurrentHub());
   ```

3. Check browser console for errors

### Performance Budget Failures

If CI fails due to budget violations:

1. Run bundle analyzer locally:

   ```bash
   cd frontend
   ANALYZE=true npm run build
   ```

2. Identify large bundles in report

3. Implement code splitting:
   ```typescript
   const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
     loading: () => <p>Loading...</p>
   });
   ```

## References

- [Web Vitals Documentation](https://web.dev/vitals/)
- [Sentry Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)

## Changelog

### 2025-11-07

- ✅ Integrated Web Vitals with Sentry
- ✅ Added INP metric (replaces FID)
- ✅ Implemented performance budgets in CI/CD
- ✅ Created automated performance reports
- ✅ Updated Lighthouse CI configuration
