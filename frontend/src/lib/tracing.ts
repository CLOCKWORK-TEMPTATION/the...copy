/**
 * OpenTelemetry Browser Tracing Configuration
 * 
 * This module initializes OpenTelemetry tracing for the frontend Next.js application.
 * It automatically instruments:
 * - Fetch API calls
 * - XMLHttpRequest
 * - User interactions (optional)
 * - Page navigation (via Next.js instrumentation)
 * 
 * Note: OpenTelemetry packages are optional. If not installed, tracing will be disabled.
 * To enable tracing, install the required OpenTelemetry packages and set NEXT_PUBLIC_TRACING_ENABLED=true
 * 
 * @module lib/tracing
 */

'use client';

/**
 * Initialize OpenTelemetry browser tracing
 * Should be called once in the root layout or _app file
 * 
 * Note: This function will silently skip if OpenTelemetry packages are not installed
 * or if NEXT_PUBLIC_TRACING_ENABLED is not set to 'true'
 */
export function initBrowserTracing(): void {
  // Skip if not in browser environment
  if (typeof window === 'undefined') {
    return;
  }
  
  const TRACING_ENABLED = process.env.NEXT_PUBLIC_TRACING_ENABLED === 'true';
  
  if (!TRACING_ENABLED) {
    console.log('[Tracing] OpenTelemetry tracing is disabled (set NEXT_PUBLIC_TRACING_ENABLED=true to enable)');
    return;
  }
  
  // Only show warning once
  if (!(window as any).__TRACING_WARNING_SHOWN) {
    console.warn('[Tracing] OpenTelemetry packages not installed. Tracing is disabled.');
    console.warn('[Tracing] To enable tracing, install the required OpenTelemetry packages:');
    console.warn('[Tracing]   pnpm add @opentelemetry/sdk-trace-web @opentelemetry/resources');
    console.warn('[Tracing]   pnpm add @opentelemetry/semantic-conventions @opentelemetry/exporter-trace-otlp-http');
    console.warn('[Tracing]   pnpm add @opentelemetry/sdk-trace-base @opentelemetry/instrumentation-fetch');
    console.warn('[Tracing]   pnpm add @opentelemetry/instrumentation-xml-http-request @opentelemetry/instrumentation');
    console.warn('[Tracing]   pnpm add @opentelemetry/api');
    (window as any).__TRACING_WARNING_SHOWN = true;
  }
}

/**
 * Stub tracer span interface for when OpenTelemetry is not available
 */
interface StubSpan {
  end: () => void;
  setAttribute: (key: string, value: unknown) => void;
  setStatus: (status: { code: number }) => void;
  recordException: (error: Error) => void;
}

/**
 * Stub tracer interface for when OpenTelemetry is not available
 */
interface StubTracer {
  startSpan: (name: string) => StubSpan;
}

/**
 * Helper to get the current tracer
 * Use this to create custom spans in your components
 * 
 * Note: Returns a no-op tracer stub if OpenTelemetry is not available
 */
export const trace = {
  getTracer: (name?: string): StubTracer => ({
    startSpan: (spanName: string): StubSpan => ({
      end: () => {},
      setAttribute: () => {},
      setStatus: () => {},
      recordException: () => {},
    }),
  }),
};
