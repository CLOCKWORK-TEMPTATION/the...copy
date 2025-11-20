/**
 * Web Vitals reporting
 */

import { onCLS, onFCP, onFID, onLCP, onTTFB } from "web-vitals";

export function reportWebVitals(onPerfEntry?: (metric: any) => void) {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    onCLS(onPerfEntry);
    onFCP(onPerfEntry);
    onFID(onPerfEntry);
    onLCP(onPerfEntry);
    onTTFB(onPerfEntry);
  }
}

/**
 * Initialize Web Vitals reporting with default logging
 */
export function initializeWebVitals() {
  reportWebVitals((metric) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[Web Vitals] ${metric.name}:`, metric.value);
    }
    // In production, you could send to analytics service
  });
}

// eslint-disable-next-line import/no-default-export
export default reportWebVitals;
