# 📊 Monitoring, Alerting & Notification Setup

**The Copy - Drama Analysis Platform**

Complete guide for production monitoring, error tracking, performance monitoring, and alerting systems.

---

## Overview

Comprehensive monitoring stack includes:
- **Error Tracking**: Sentry for exception monitoring
- **Performance Monitoring**: Application & infrastructure metrics
- **Health Checks**: Automated endpoint monitoring
- **Alerting**: Email, Slack, and webhook notifications
- **Dashboards**: Real-time metrics visualization
- **Logging**: Structured logging with log aggregation

---

## 1. Sentry Configuration

### Installation

```bash
cd frontend
npm install @sentry/nextjs

cd ../backend
npm install @sentry/node @sentry/profiling-node
```

### Frontend Setup

Create `frontend/sentry.client.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV === 'production',
  tracesSampleRate: 0.1,
  profilesSampleRate: 0.1,
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  beforeSend(event, hint) {
    // Filter out known non-critical errors
    if (event.exception) {
      const error = hint.originalException;
      if (error instanceof Error) {
        // Ignore network timeouts in some cases
        if (error.message.includes('Network request failed')) {
          return null;
        }
      }
    }
    return event;
  },
});
```

Create `frontend/sentry.server.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV === 'production',
  tracesSampleRate: 0.1,
});
```

Create `frontend/sentry.edge.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV === 'production',
  tracesSampleRate: 0.1,
});
```

### Backend Setup

Create `backend/src/monitoring/sentry.ts`:

```typescript
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

export function initSentry(): void {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    enabled: process.env.NODE_ENV === 'production',
    tracesSampleRate: parseFloat(process.env.SENTRY_SAMPLE_RATE || '0.1'),
    profilesSampleRate: parseFloat(process.env.SENTRY_PROFILER_SAMPLE_RATE || '0.1'),
    integrations: [
      nodeProfilingIntegration(),
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Postgres(),
    ],
    beforeSend(event, hint) {
      if (event.exception) {
        const error = hint.originalException;
        if (error instanceof Error) {
          // Ignore health check endpoints
          if (event.request?.url?.includes('/health')) {
            return null;
          }
        }
      }
      return event;
    },
  });
}

export function captureException(error: Error, context?: Record<string, unknown>): void {
  Sentry.captureException(error, {
    contexts: {
      app: context || {},
    },
  });
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
  Sentry.captureMessage(message, level);
}

export function createSpan(
  operation: string,
  name: string,
  callback: (span: Sentry.Span) => void
): void {
  const parentSpan = Sentry.getActiveSpan();
  if (!parentSpan) return;

  const span = parentSpan.startChild({
    op: operation,
    name,
  });

  try {
    callback(span);
  } catch (error) {
    span.setStatus('internal_error');
    throw error;
  } finally {
    span.end();
  }
}
```

### Express Integration

Add Sentry middleware to `backend/src/server.ts`:

```typescript
import express from 'express';
import * as Sentry from '@sentry/node';
import { initSentry } from './monitoring/sentry';

const app = express();

// Initialize Sentry
initSentry();

// Sentry request handler must be first
app.use(Sentry.Handlers.requestHandler());

// Your routes here
app.use('/api', routes);

// Sentry error handler must be last
app.use(Sentry.Handlers.errorHandler());

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  Sentry.captureException(err);
  res.status(500).json({ error: 'Internal Server Error' });
});
```

---

## 2. Application Health Checks

Create `backend/src/services/health.service.ts`:

```typescript
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { redis } from '../cache';
import { logger } from '../logging';

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  database: 'ok' | 'error';
  redis: 'ok' | 'error';
  memory: {
    used: number;
    total: number;
    percent: number;
  };
  uptime: number;
}

export async function checkHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  const results = {
    database: 'error' as const,
    redis: 'error' as const,
  };

  // Check database
  try {
    await db.execute('SELECT NOW()');
    results.database = 'ok';
  } catch (error) {
    logger.error('Database health check failed', error);
  }

  // Check Redis
  try {
    const pong = await redis.ping();
    if (pong === 'PONG') {
      results.redis = 'ok';
    }
  } catch (error) {
    logger.error('Redis health check failed', error);
  }

  // Get memory usage
  const memUsage = process.memoryUsage();
  const totalMemory = require('os').totalmem();

  const healthy = results.database === 'ok' && results.redis === 'ok';

  return {
    status: healthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    database: results.database,
    redis: results.redis,
    memory: {
      used: memUsage.heapUsed,
      total: memUsage.heapTotal,
      percent: (memUsage.heapUsed / totalMemory) * 100,
    },
    uptime: process.uptime(),
  };
}

export async function checkReadiness(): Promise<boolean> {
  // Check if app is ready to accept traffic
  try {
    const health = await checkHealth();
    return health.status !== 'unhealthy';
  } catch {
    return false;
  }
}
```

Create `backend/src/routes/health.ts`:

```typescript
import { Router } from 'express';
import { checkHealth, checkReadiness } from '../services/health.service';

const router = Router();

// Liveness probe
router.get('/alive', (req, res) => {
  res.status(200).json({ status: 'alive' });
});

// Readiness probe
router.get('/ready', async (req, res) => {
  const ready = await checkReadiness();
  res.status(ready ? 200 : 503).json({ ready });
});

// Full health check
router.get('/health', async (req, res) => {
  const health = await checkHealth();
  res.status(health.status === 'healthy' ? 200 : 503).json(health);
});

export default router;
```

---

## 3. Prometheus Metrics

Create `backend/src/monitoring/prometheus.ts`:

```typescript
import { Registry, Counter, Gauge, Histogram, collectDefaultMetrics } from 'prom-client';

export const register = new Registry();

// Collect default metrics
collectDefaultMetrics({ register });

// Custom metrics
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [register],
});

export const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

export const databaseQueryDuration = new Histogram({
  name: 'database_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5],
  registers: [register],
});

export const cacheHitRate = new Gauge({
  name: 'cache_hit_rate',
  help: 'Cache hit rate',
  labelNames: ['cache_name'],
  registers: [register],
});

export const activeConnections = new Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
  labelNames: ['type'],
  registers: [register],
});

export const errors = new Counter({
  name: 'errors_total',
  help: 'Total number of errors',
  labelNames: ['type', 'code'],
  registers: [register],
});
```

Add metrics endpoint:

```typescript
import express from 'express';
import { register } from './monitoring/prometheus';

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

---

## 4. Slack Notifications

Create `backend/src/notifications/slack.ts`:

```typescript
import axios from 'axios';

interface SlackMessage {
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  metadata?: Record<string, unknown>;
}

const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_URL;

const severityColors = {
  info: '#36a64f',
  warning: '#ff9900',
  error: '#ff0000',
};

export async function sendSlackNotification(notif: SlackMessage): Promise<void> {
  if (!SLACK_WEBHOOK) {
    console.warn('Slack webhook not configured');
    return;
  }

  const payload = {
    attachments: [
      {
        color: severityColors[notif.severity],
        title: notif.title,
        text: notif.message,
        fields: notif.metadata
          ? Object.entries(notif.metadata).map(([key, value]) => ({
              title: key,
              value: JSON.stringify(value),
              short: true,
            }))
          : [],
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  };

  try {
    await axios.post(SLACK_WEBHOOK, payload);
  } catch (error) {
    console.error('Failed to send Slack notification', error);
  }
}

// Deployment notifications
export async function notifyDeploymentStarted(environment: string, version: string): Promise<void> {
  await sendSlackNotification({
    title: '🚀 Deployment Started',
    message: `Deploying version ${version} to ${environment}`,
    severity: 'info',
    metadata: {
      environment,
      version,
      timestamp: new Date().toISOString(),
    },
  });
}

export async function notifyDeploymentCompleted(environment: string, version: string): Promise<void> {
  await sendSlackNotification({
    title: '✅ Deployment Completed',
    message: `Version ${version} successfully deployed to ${environment}`,
    severity: 'info',
    metadata: {
      environment,
      version,
    },
  });
}

export async function notifyDeploymentFailed(environment: string, error: string): Promise<void> {
  await sendSlackNotification({
    title: '❌ Deployment Failed',
    message: `Deployment to ${environment} failed: ${error}`,
    severity: 'error',
    metadata: {
      environment,
      error,
    },
  });
}

export async function notifyAlertTriggered(alertName: string, details: string): Promise<void> {
  await sendSlackNotification({
    title: `⚠️ Alert: ${alertName}`,
    message: details,
    severity: 'warning',
    metadata: {
      alert: alertName,
    },
  });
}
```

---

## 5. Email Notifications

Create `backend/src/notifications/email.ts`:

```typescript
import nodemailer from 'nodemailer';

interface EmailNotification {
  to: string[];
  subject: string;
  htmlContent: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendEmailNotification(notif: EmailNotification): Promise<void> {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@yourdomain.com',
      to: notif.to.join(','),
      subject: notif.subject,
      html: notif.htmlContent,
    });
  } catch (error) {
    console.error('Failed to send email notification', error);
  }
}

export async function sendErrorAlert(error: Error, environment: string): Promise<void> {
  const htmlContent = `
    <h2>Error Alert - ${environment}</h2>
    <p><strong>Error:</strong> ${error.message}</p>
    <p><strong>Stack:</strong> <pre>${error.stack}</pre></p>
    <p><strong>Time:</strong> ${new Date().toISOString()}</p>
  `;

  await sendEmailNotification({
    to: [process.env.ALERT_EMAIL || 'admin@yourdomain.com'],
    subject: `[${environment}] Error Alert`,
    htmlContent,
  });
}

export async function sendDeploymentNotification(
  environment: string,
  version: string,
  status: 'started' | 'completed' | 'failed',
  details?: string
): Promise<void> {
  const statusEmojis = {
    started: '🚀',
    completed: '✅',
    failed: '❌',
  };

  const htmlContent = `
    <h2>${statusEmojis[status]} Deployment ${status.toUpperCase()}</h2>
    <p><strong>Environment:</strong> ${environment}</p>
    <p><strong>Version:</strong> ${version}</p>
    <p><strong>Time:</strong> ${new Date().toISOString()}</p>
    ${details ? `<p><strong>Details:</strong> ${details}</p>` : ''}
  `;

  await sendEmailNotification({
    to: [process.env.DEPLOY_NOTIFICATION_EMAIL || 'team@yourdomain.com'],
    subject: `[${environment}] Deployment ${status.toUpperCase()} - v${version}`,
    htmlContent,
  });
}
```

---

## 6. Alerting Rules

Create `monitoring/prometheus-rules.yml`:

```yaml
groups:
  - name: application_alerts
    interval: 30s
    rules:
      # High error rate
      - alert: HighErrorRate
        expr: rate(errors_total[5m]) > 0.05
        for: 5m
        annotations:
          summary: High error rate detected
          description: Error rate is {{ $value }} errors/sec

      # High latency
      - alert: HighLatency
        expr: histogram_quantile(0.95, http_request_duration_seconds) > 1
        for: 5m
        annotations:
          summary: High request latency
          description: p95 latency is {{ $value }}s

      # Low memory
      - alert: LowMemory
        expr: node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes < 0.1
        for: 5m
        annotations:
          summary: Low available memory
          description: Available memory is {{ $value | humanize }}

      # High CPU usage
      - alert: HighCPUUsage
        expr: 100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        annotations:
          summary: High CPU usage
          description: CPU usage is {{ $value | humanize }}%

      # Database connection issues
      - alert: DatabaseConnectionFailed
        expr: up{job="postgres"} == 0
        for: 2m
        annotations:
          summary: Database connection failed
          description: Cannot connect to database

      # Redis connection issues
      - alert: RedisConnectionFailed
        expr: up{job="redis"} == 0
        for: 2m
        annotations:
          summary: Redis connection failed
          description: Cannot connect to Redis
```

---

## 7. Monitoring Dashboard

Create `monitoring/grafana-dashboard.json`:

```json
{
  "dashboard": {
    "title": "The Copy - Application Monitoring",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(errors_total[5m])"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Response Time p95",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, http_request_duration_seconds)"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Memory Usage",
        "targets": [
          {
            "expr": "process_resident_memory_bytes"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Database Connections",
        "targets": [
          {
            "expr": "active_connections{type='database'}"
          }
        ],
        "type": "gauge"
      },
      {
        "title": "Cache Hit Rate",
        "targets": [
          {
            "expr": "cache_hit_rate"
          }
        ],
        "type": "percentage"
      }
    ]
  }
}
```

---

## 8. Logging Configuration

Create `backend/src/logging/logger.ts`:

```typescript
import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
});

export function createChildLogger(module: string) {
  return logger.child({ module });
}
```

---

## 9. Monitoring Checklist

Before going to production, ensure:

- [ ] Sentry project created and DSN configured
- [ ] Slack workspace and webhook URL configured
- [ ] Email notifications SMTP configured
- [ ] Prometheus and Grafana deployed
- [ ] Alert rules created and tested
- [ ] Dashboard created and verified
- [ ] Health check endpoints responding
- [ ] Log aggregation configured
- [ ] Backup alerting system ready
- [ ] On-call escalation policy defined
- [ ] Team trained on monitoring tools
- [ ] Documentation created for troubleshooting

---

## 10. Alert Response Procedures

### Critical Alerts (P1)

- Response time: 5 minutes
- Actions: Immediate investigation and mitigation
- Escalation: Team lead + on-call engineer

### High Alerts (P2)

- Response time: 15 minutes
- Actions: Investigation and monitoring
- Escalation: Team lead if not resolved in 30 minutes

### Medium Alerts (P3)

- Response time: 1 hour
- Actions: Review and plan fix
- Escalation: Backlog planning

### Low Alerts (P4)

- Response time: Next business day
- Actions: Track and plan improvement
- No immediate escalation required

