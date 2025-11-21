/**
 * Sentry Configuration for Backend
 * 
 * Error tracking and performance monitoring
 */

import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { env } from './env';

/**
 * Initialize Sentry monitoring
 */
export function initializeSentry() {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    console.warn('[Sentry] DSN not configured, monitoring disabled');
    return;
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log('[Sentry] Skipping initialization in non-production environment');
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',

    // Release tracking for version monitoring
    release: process.env.SENTRY_RELEASE || `the-copy-backend@${process.env.npm_package_version || '1.0.0'}`,

    // Server name for multi-instance deployments
    serverName: process.env.HOSTNAME || process.env.SENTRY_SERVER_NAME || 'backend-server',

    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0, // 10% in prod, 100% in dev
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0, // 10% in prod, 100% in dev

    // Integrations
    integrations: [
      // Performance profiling
      nodeProfilingIntegration(),
    ],

    // Tags for filtering and searching
    initialScope: {
      tags: {
        'app.name': 'the-copy',
        'app.component': 'backend',
        'node.version': process.version,
      },
    },

    // Before sending events
    beforeSend(event, hint) {
      // Filter out non-critical errors
      const error = hint.originalException;
      
      if (error instanceof Error) {
        // Don't send expected errors
        if (error.message.includes('ECONNREFUSED') || 
            error.message.includes('timeout')) {
          return null;
        }
      }

      return event;
    },

    // Before sending breadcrumbs
    beforeBreadcrumb(breadcrumb, hint) {
      // Add more context to HTTP breadcrumbs
      if (breadcrumb.category === 'http') {
        breadcrumb.data = {
          ...breadcrumb.data,
          timestamp: new Date().toISOString(),
        };
      }
      return breadcrumb;
    },
  });

  console.log('[Sentry] Backend monitoring initialized');
}

/**
 * Capture exception with context
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (process.env.NODE_ENV === 'production') {
    if (context) {
      Sentry.withScope((scope) => {
        scope.setContext('custom', context);
        Sentry.captureException(error);
      });
    } else {
      Sentry.captureException(error);
    }
  } else {
    console.error('[Sentry] Exception:', error, context);
  }
}

/**
 * Capture message with context
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, any>) {
  if (process.env.NODE_ENV === 'production') {
    if (context) {
      Sentry.withScope((scope) => {
        scope.setContext('custom', context);
        Sentry.captureMessage(message, level);
      });
    } else {
      Sentry.captureMessage(message, level);
    }
  } else {
    console.log(`[Sentry] ${level.toUpperCase()}: ${message}`, context);
  }
}

/**
 * Track performance metric
 */
export function trackMetric(name: string, value: number, unit: string = 'ms') {
  if (process.env.NODE_ENV === 'production') {
    Sentry.metrics.gauge(name, value, {
      unit,
    });
  } else {
    console.log(`[Metric] ${name}: ${value}${unit}`);
  }
}

export { Sentry };

