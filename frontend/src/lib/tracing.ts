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
 * @module lib/tracing
 */

'use client';

import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { Resource } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
  ATTR_DEPLOYMENT_ENVIRONMENT,
} from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { registerInstrumentations } from '@opentelemetry/instrumentation';

/**
 * Environment variables for tracing configuration
 */
const TRACING_ENABLED =
  process.env.NEXT_PUBLIC_TRACING_ENABLED === 'true';
const OTEL_EXPORTER_OTLP_ENDPOINT =
  process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT ||
  'http://localhost:4318/v1/traces';
const SERVICE_NAME =
  process.env.NEXT_PUBLIC_SERVICE_NAME || 'theeeecopy-frontend';
const SERVICE_VERSION =
  process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';
const ENVIRONMENT =
  process.env.NEXT_PUBLIC_ENVIRONMENT || 'development';

let isInitialized = false;

/**
 * Initialize OpenTelemetry browser tracing
 * Should be called once in the root layout or _app file
 */
export function initBrowserTracing(): void {
  if (!TRACING_ENABLED) {
    console.log('📊 Browser tracing is disabled');
    return;
  }

  if (isInitialized) {
    console.log('📊 Browser tracing already initialized');
    return;
  }

  if (typeof window === 'undefined') {
    console.log('📊 Skipping browser tracing in SSR context');
    return;
  }

  console.log('🚀 Initializing browser tracing...');
  console.log(`   📍 Service: ${SERVICE_NAME}`);
  console.log(`   📦 Version: ${SERVICE_VERSION}`);
  console.log(`   🌍 Environment: ${ENVIRONMENT}`);
  console.log(`   🔗 Exporter: ${OTEL_EXPORTER_OTLP_ENDPOINT}`);

  try {
    // Create resource with service metadata
    const resource = Resource.default().merge(
      new Resource({
        [ATTR_SERVICE_NAME]: SERVICE_NAME,
        [ATTR_SERVICE_VERSION]: SERVICE_VERSION,
        [ATTR_DEPLOYMENT_ENVIRONMENT]: ENVIRONMENT,
      })
    );

    // Create tracer provider
    const provider = new WebTracerProvider({
      resource,
    });

    // Create OTLP exporter
    const exporter = new OTLPTraceExporter({
      url: OTEL_EXPORTER_OTLP_ENDPOINT,
      // Optional: Add headers for authentication
      // headers: {
      //   'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OTEL_AUTH_TOKEN}`,
      // },
    });

    // Add batch span processor for efficient export
    provider.addSpanProcessor(new BatchSpanProcessor(exporter));

    // Register the provider
    provider.register();

    // Register auto-instrumentations
    registerInstrumentations({
      instrumentations: [
        new FetchInstrumentation({
          // Ignore health checks and tracing endpoints
          ignoreUrls: [
            /\/health$/,
            /\/metrics$/,
            /v1\/traces$/,
          ],
          // Propagate trace context to backend
          propagateTraceHeaderCorsUrls: [
            new RegExp(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'),
          ],
          // Clear timing resources
          clearTimingResources: true,
        }),
        new XMLHttpRequestInstrumentation({
          ignoreUrls: [
            /\/health$/,
            /\/metrics$/,
            /v1\/traces$/,
          ],
          propagateTraceHeaderCorsUrls: [
            new RegExp(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'),
          ],
        }),
      ],
    });

    isInitialized = true;
    console.log('✅ Browser tracing initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize browser tracing:', error);
  }
}

/**
 * Helper to get the current tracer
 * Use this to create custom spans in your components
 */
export { trace } from '@opentelemetry/api';
