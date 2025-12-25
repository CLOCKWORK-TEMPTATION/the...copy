import 'module-alias/register';

// Initialize OpenTelemetry tracing (MUST be before any other imports)
import { initTracing } from '@/config/tracing';
initTracing();

import express, { Application } from 'express';
import { createServer } from 'http';
import type { Server } from 'http';
import cookieParser from 'cookie-parser';
import { env } from '@/config/env';
import { initializeSentry } from '@/config/sentry';
import { setupMiddleware, errorHandler } from '@/middleware';
import { sentryRequestHandler, sentryTracingHandler, sentryErrorHandler, trackError, trackPerformance } from '@/middleware/sentry.middleware';
import { logAuthAttempts, logRateLimitViolations } from '@/middleware/security-logger.middleware';
import { wafMiddleware, getWAFStats, getWAFEvents, blockIP, unblockIP, getBlockedIPs, updateWAFConfig, getWAFConfig } from '@/middleware/waf.middleware';
import { metricsMiddleware, metricsEndpoint } from '@/middleware/metrics.middleware';
import { csrfProtection, setCsrfToken } from '@/middleware/csrf.middleware';
import { AnalysisController } from '@/controllers/analysis.controller';
import { HealthController } from '@/controllers/health.controller';
import { authController } from '@/controllers/auth.controller';
import { projectsController } from '@/controllers/projects.controller';
import { scenesController } from '@/controllers/scenes.controller';
import { charactersController } from '@/controllers/characters.controller';
import { shotsController } from '@/controllers/shots.controller';
import { aiController } from '@/controllers/ai.controller';
import { realtimeController } from '@/controllers/realtime.controller';
import { authMiddleware } from '@/middleware/auth.middleware';
import { logger } from '@/utils/logger';
import { closeDatabase } from '@/db';

import { initializeWorkers, shutdownQueues } from '@/queues';
import { setupBullBoard, getAuthenticatedBullBoardRouter } from '@/middleware/bull-board.middleware';
import { queueController } from '@/controllers/queue.controller';
import { metricsController } from '@/controllers/metrics.controller';
import { websocketService } from '@/services/websocket.service';
import { sseService } from '@/services/sse.service';

// Initialize Sentry monitoring (must be first)
initializeSentry();

const app: Application = express();
// Create HTTP server for WebSocket integration
const httpServer: Server = createServer(app);
const analysisController = new AnalysisController();
const healthController = new HealthController();

// Sentry request handling (must be first middleware)
app.use(sentryRequestHandler);
app.use(sentryTracingHandler);
app.use(trackError);
app.use(trackPerformance);

// Prometheus metrics tracking
app.use(metricsMiddleware);

// WAF (Web Application Firewall) - must be early in the chain
app.use(wafMiddleware);

// Security logging middleware
app.use(logAuthAttempts);
app.use(logRateLimitViolations);

// Initialize cookie parser (required for CSRF token cookie handling)
// SECURITY: cookieParser is required before csrfProtection middleware below
app.use(cookieParser());

// CSRF Protection - Implements Double Submit Cookie pattern
// SECURITY: This middleware provides CSRF protection by:
// 1. Setting CSRF tokens in cookies for GET requests
// 2. Validating CSRF tokens in headers for state-changing requests
// 3. Additional Origin/Referer header validation for browser-based requests
app.use(csrfProtection);

// CSRF Protection middleware - validates Origin header for state-changing requests
// This is the recommended approach for API-based applications instead of traditional CSRF tokens
// SECURITY FIX: Now requires Origin or Referer header for browser-based requests
app.use((req, res, next) => {
  // Only check state-changing methods
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    return next();
  }

  // Skip CSRF check for health endpoints and other safe paths
  const safePaths = ['/health', '/api/health', '/metrics'];
  if (safePaths.some(path => req.path.startsWith(path))) {
    return next();
  }

  const origin = req.get('Origin');
  const referer = req.get('Referer');
  const contentType = req.get('Content-Type') || '';
  const userAgent = req.get('User-Agent') || '';

  const allowedOrigins = [
    env.CORS_ORIGIN,
    'http://localhost:5000',
    'http://localhost:3000',
    `http://localhost:${env.PORT}`,
  ].filter(Boolean);

  // For API requests, check Origin or Referer header
  if (origin) {
    if (!allowedOrigins.some(allowed => origin === allowed || origin.startsWith(allowed as string))) {
      logger.warn('CSRF: Origin mismatch', { origin, path: req.path, method: req.method });
      return res.status(403).json({
        success: false,
        error: 'طلب غير مصرح به',
        code: 'CSRF_ORIGIN_MISMATCH'
      });
    }
  } else if (referer) {
    try {
      const refererUrl = new URL(referer);
      const refererOrigin = `${refererUrl.protocol}//${refererUrl.host}`;
      if (!allowedOrigins.some(allowed => refererOrigin === allowed || refererOrigin.startsWith(allowed as string))) {
        logger.warn('CSRF: Referer mismatch', { referer, path: req.path, method: req.method });
        return res.status(403).json({
          success: false,
          error: 'طلب غير مصرح به',
          code: 'CSRF_REFERER_MISMATCH'
        });
      }
    } catch {
      logger.warn('CSRF: Invalid Referer URL', { referer, path: req.path });
      return res.status(403).json({
        success: false,
        error: 'طلب غير مصرح به',
        code: 'CSRF_INVALID_REFERER'
      });
    }
  } else {
    // SECURITY: If neither Origin nor Referer is present, check if it looks like a browser request
    // Browser requests with form submissions or JSON payloads should always include these headers
    const isBrowserRequest =
      contentType.includes('application/x-www-form-urlencoded') ||
      contentType.includes('multipart/form-data') ||
      (contentType.includes('application/json') && userAgent.toLowerCase().includes('mozilla'));

    if (isBrowserRequest) {
      logger.warn('CSRF: Missing Origin/Referer for browser request', {
        path: req.path,
        method: req.method,
        contentType,
        userAgent: userAgent.substring(0, 100)
      });
      return res.status(403).json({
        success: false,
        error: 'طلب غير مصرح به',
        code: 'CSRF_MISSING_ORIGIN'
      });
    }
    // Allow API clients that don't send Origin/Referer (e.g., server-to-server requests)
    // These are authenticated via JWT tokens anyway
  }

  next();
});

// Setup middleware
setupMiddleware(app);


// Initialize WebSocket service
try {
  websocketService.initialize(httpServer);
  logger.info('WebSocket service initialized');
} catch (error) {
  logger.error('Failed to initialize WebSocket service:', error);
}



// Initialize background job workers (BullMQ)
(async () => {
  try {
    await initializeWorkers();
    logger.info('Background job workers initialized');
  } catch (error) {
    logger.error('Failed to initialize job workers:', error);
    // Continue without workers - app can still function
  }
})();

// Setup Bull Board dashboard for queue monitoring (with authentication)
// Access at: http://localhost:3000/admin/queues
try {
  setupBullBoard();
  const authenticatedBullBoardRouter = getAuthenticatedBullBoardRouter();
  app.use('/admin/queues', authenticatedBullBoardRouter);
  logger.info('Bull Board dashboard available at /admin/queues (authenticated)');
} catch (error) {
  logger.error('Failed to setup Bull Board:', error);
}

// Health check endpoints for Blue-Green deployment
app.get('/api/health', healthController.getHealth.bind(healthController));
app.get('/health', healthController.getHealth.bind(healthController));
app.get('/health/live', healthController.getLiveness.bind(healthController));
app.get('/health/ready', healthController.getReadiness.bind(healthController));
app.get('/health/startup', healthController.getStartup.bind(healthController));
app.get('/health/detailed', healthController.getDetailedHealth.bind(healthController));

// Prometheus metrics endpoint
app.get('/metrics', metricsEndpoint);

// Gemini cost monitoring endpoint (protected - admin only)
app.get('/api/gemini/cost-summary', authMiddleware, async (req, res) => {
  try {
    const { geminiCostTracker } = await import('@/services/gemini-cost-tracker.service');
    const summary = await geminiCostTracker.getCostSummary();
    res.json({
      success: true,
      data: summary,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to get cost summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve cost summary',
    });
  }
});

// Auth endpoints (public) - CSRF token is set after successful authentication
app.post('/api/auth/signup', authController.signup.bind(authController), setCsrfToken);
app.post('/api/auth/login', authController.login.bind(authController), setCsrfToken);
app.post('/api/auth/logout', authController.logout.bind(authController));
app.post('/api/auth/refresh', authController.refresh.bind(authController), setCsrfToken);
app.get('/api/auth/me', authMiddleware, authController.getCurrentUser.bind(authController));

// Seven Stations Pipeline endpoints (protected)
app.post('/api/analysis/seven-stations', authMiddleware, analysisController.runSevenStationsPipeline.bind(analysisController));
app.get('/api/analysis/stations-info', authMiddleware, analysisController.getStationDetails.bind(analysisController));

// Directors Studio - Projects endpoints (protected)
app.get('/api/projects', authMiddleware, projectsController.getProjects.bind(projectsController));
app.get('/api/projects/:id', authMiddleware, projectsController.getProject.bind(projectsController));
app.post('/api/projects', authMiddleware, projectsController.createProject.bind(projectsController));
app.put('/api/projects/:id', authMiddleware, projectsController.updateProject.bind(projectsController));
app.delete('/api/projects/:id', authMiddleware, projectsController.deleteProject.bind(projectsController));
app.post('/api/projects/:id/analyze', authMiddleware, projectsController.analyzeScript.bind(projectsController));

// Directors Studio - Scenes endpoints (protected)
app.get('/api/projects/:projectId/scenes', authMiddleware, scenesController.getScenes.bind(scenesController));
app.get('/api/scenes/:id', authMiddleware, scenesController.getScene.bind(scenesController));
app.post('/api/scenes', authMiddleware, scenesController.createScene.bind(scenesController));
app.put('/api/scenes/:id', authMiddleware, scenesController.updateScene.bind(scenesController));
app.delete('/api/scenes/:id', authMiddleware, scenesController.deleteScene.bind(scenesController));

// Directors Studio - Characters endpoints (protected)
app.get('/api/projects/:projectId/characters', authMiddleware, charactersController.getCharacters.bind(charactersController));
app.get('/api/characters/:id', authMiddleware, charactersController.getCharacter.bind(charactersController));
app.post('/api/characters', authMiddleware, charactersController.createCharacter.bind(charactersController));
app.put('/api/characters/:id', authMiddleware, charactersController.updateCharacter.bind(charactersController));
app.delete('/api/characters/:id', authMiddleware, charactersController.deleteCharacter.bind(charactersController));

// Directors Studio - Shots endpoints (protected)
app.get('/api/scenes/:sceneId/shots', authMiddleware, shotsController.getShots.bind(shotsController));
app.get('/api/shots/:id', authMiddleware, shotsController.getShot.bind(shotsController));
app.post('/api/shots', authMiddleware, shotsController.createShot.bind(shotsController));
app.put('/api/shots/:id', authMiddleware, shotsController.updateShot.bind(shotsController));
app.delete('/api/shots/:id', authMiddleware, shotsController.deleteShot.bind(shotsController));
app.post('/api/shots/suggestion', authMiddleware, shotsController.generateShotSuggestion.bind(shotsController));

// AI endpoints (protected)
app.post('/api/ai/chat', authMiddleware, aiController.chat.bind(aiController));
app.post('/api/ai/shot-suggestion', authMiddleware, aiController.getShotSuggestion.bind(aiController));

// Queue Management endpoints (protected)
app.get('/api/queue/jobs/:jobId', authMiddleware, queueController.getJobStatus.bind(queueController));
app.get('/api/queue/stats', authMiddleware, queueController.getQueueStats.bind(queueController));
app.get('/api/queue/:queueName/stats', authMiddleware, queueController.getSpecificQueueStats.bind(queueController));
app.post('/api/queue/jobs/:jobId/retry', authMiddleware, queueController.retryJob.bind(queueController));
app.post('/api/queue/:queueName/clean', authMiddleware, queueController.cleanQueue.bind(queueController));

// Metrics Dashboard endpoints (protected)
app.get('/api/metrics/snapshot', authMiddleware, metricsController.getSnapshot.bind(metricsController));
app.get('/api/metrics/latest', authMiddleware, metricsController.getLatest.bind(metricsController));
app.get('/api/metrics/range', authMiddleware, metricsController.getRange.bind(metricsController));
app.get('/api/metrics/database', authMiddleware, metricsController.getDatabaseMetrics.bind(metricsController));
app.get('/api/metrics/redis', authMiddleware, metricsController.getRedisMetrics.bind(metricsController));
app.get('/api/metrics/queue', authMiddleware, metricsController.getQueueMetrics.bind(metricsController));
app.get('/api/metrics/api', authMiddleware, metricsController.getApiMetrics.bind(metricsController));
app.get('/api/metrics/resources', authMiddleware, metricsController.getResourceMetrics.bind(metricsController));
app.get('/api/metrics/gemini', authMiddleware, metricsController.getGeminiMetrics.bind(metricsController));
app.get('/api/metrics/report', authMiddleware, metricsController.generateReport.bind(metricsController));
app.get('/api/metrics/health', authMiddleware, metricsController.getHealth.bind(metricsController));
app.get('/api/metrics/dashboard', authMiddleware, metricsController.getDashboardSummary.bind(metricsController));

// Cache-specific Metrics endpoints (protected)
app.get('/api/metrics/cache/snapshot', authMiddleware, metricsController.getCacheSnapshot.bind(metricsController));
app.get('/api/metrics/cache/realtime', authMiddleware, metricsController.getCacheRealtime.bind(metricsController));
app.get('/api/metrics/cache/health', authMiddleware, metricsController.getCacheHealth.bind(metricsController));
app.get('/api/metrics/cache/report', authMiddleware, metricsController.getCacheReport.bind(metricsController));

// APM (Application Performance Monitoring) endpoints (protected)
app.get('/api/metrics/apm/dashboard', authMiddleware, metricsController.getApmDashboard.bind(metricsController));
app.get('/api/metrics/apm/config', authMiddleware, metricsController.getApmConfig.bind(metricsController));
app.post('/api/metrics/apm/reset', authMiddleware, metricsController.resetApmMetrics.bind(metricsController));
app.get('/api/metrics/apm/alerts', authMiddleware, metricsController.getApmAlerts.bind(metricsController));

// WAF Management endpoints (protected - admin only)
app.get('/api/waf/stats', authMiddleware, (req, res) => {
  try {
    const stats = getWAFStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    logger.error('Failed to get WAF stats:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve WAF stats' });
  }
});

app.get('/api/waf/events', authMiddleware, (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const events = getWAFEvents(limit);
    res.json({ success: true, data: events });
  } catch (error) {
    logger.error('Failed to get WAF events:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve WAF events' });
  }
});

app.get('/api/waf/config', authMiddleware, (req, res) => {
  try {
    const config = getWAFConfig();
    res.json({ success: true, data: config });
  } catch (error) {
    logger.error('Failed to get WAF config:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve WAF config' });
  }
});

app.put('/api/waf/config', authMiddleware, (req, res) => {
  try {
    updateWAFConfig(req.body);
    res.json({ success: true, message: 'WAF configuration updated' });
  } catch (error) {
    logger.error('Failed to update WAF config:', error);
    res.status(500).json({ success: false, error: 'Failed to update WAF config' });
  }
});

app.get('/api/waf/blocked-ips', authMiddleware, (req, res) => {
  try {
    const ips = getBlockedIPs();
    res.json({ success: true, data: ips });
  } catch (error) {
    logger.error('Failed to get blocked IPs:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve blocked IPs' });
  }
});

app.post('/api/waf/block-ip', authMiddleware, (req, res) => {
  try {
    const { ip, reason } = req.body;
    if (!ip) {
      return res.status(400).json({ success: false, error: 'IP address required' });
    }
    blockIP(ip, reason);
    return res.json({ success: true, message: `IP ${ip} blocked successfully` });
  } catch (error) {
    logger.error('Failed to block IP:', error);
    return res.status(500).json({ success: false, error: 'Failed to block IP' });
  }
});

app.post('/api/waf/unblock-ip', authMiddleware, (req, res) => {
  try {
    const { ip } = req.body;
    if (!ip) {
      return res.status(400).json({ success: false, error: 'IP address required' });
    }
    unblockIP(ip);
    return res.json({ success: true, message: `IP ${ip} unblocked successfully` });
  } catch (error) {
    logger.error('Failed to unblock IP:', error);
    return res.status(500).json({ success: false, error: 'Failed to unblock IP' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'المسار غير موجود',
  });
});

// Sentry error handler (must be before other error handlers)
app.use(sentryErrorHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server with automatic port fallback if the selected port is in use
let runningServer: Server | null = null;
const startPort = Number(process.env.PORT) || env.PORT;

function startListening(port: number): void {
  // Use httpServer instead of app.listen to support WebSocket
  httpServer.listen(port, () => {
    runningServer = httpServer;
    logger.info(`Server running on port ${port}`, {
      environment: env.NODE_ENV,
      port,
      websocket: 'enabled',
      sse: 'enabled',
    });
  });

  httpServer.on('error', (error: any) => {
    if (error && error.code === 'EADDRINUSE') {
      const nextPort = port + 1;
      logger.warn(`Port ${port} is in use. Trying ${nextPort}...`);
      startListening(nextPort);
      return;
    }
    throw error;
  });
}

startListening(startPort);

// Graceful shutdown
process.on('SIGTERM', async (): Promise<void> => {
  logger.info('SIGTERM received, shutting down gracefully');

  // Shutdown real-time services
  try {
    sseService.shutdown();
    await websocketService.shutdown();
    logger.info('Real-time services shut down');
  } catch (error) {
    logger.error('Error shutting down real-time services:', error);
  }

  // Close queues
  try {
    await shutdownQueues();
  } catch (error) {
    logger.error('Error shutting down queues:', error);
  }

  // Close database connections
  await closeDatabase();

  if (runningServer) {
    runningServer.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

process.on('SIGINT', async (): Promise<void> => {
  logger.info('SIGINT received, shutting down gracefully');

  // Shutdown real-time services
  try {
    sseService.shutdown();
    await websocketService.shutdown();
    logger.info('Real-time services shut down');
  } catch (error) {
    logger.error('Error shutting down real-time services:', error);
  }

  // Close queues
  try {
    await shutdownQueues();
  } catch (error) {
    logger.error('Error shutting down queues:', error);
  }

  // Close database connections
  await closeDatabase();

  if (runningServer) {
    runningServer.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

export { app, httpServer };
export default app;