import 'module-alias/register';
import express, { Application } from 'express';
import { createServer } from 'http';
import type { Server } from 'http';
import cookieParser from 'cookie-parser';
import { env } from '@/config/env';
import { initializeSentry } from '@/config/sentry';
import { setupMiddleware, errorHandler } from '@/middleware';
import { sentryRequestHandler, sentryTracingHandler, sentryErrorHandler, trackError, trackPerformance } from '@/middleware/sentry.middleware';
import { logAuthAttempts, logRateLimitViolations } from '@/middleware/security-logger.middleware';
import { metricsMiddleware, metricsEndpoint } from '@/middleware/metrics.middleware';
import { AnalysisController } from '@/controllers/analysis.controller';
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

// Sentry request handling (must be first middleware)
app.use(sentryRequestHandler);
app.use(sentryTracingHandler);
app.use(trackError);
app.use(trackPerformance);

// Prometheus metrics tracking
app.use(metricsMiddleware);

// Security logging middleware
app.use(logAuthAttempts);
app.use(logRateLimitViolations);

// Setup middleware
setupMiddleware(app);
app.use(cookieParser());

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

// Health check endpoint (legacy - kept for backward compatibility)
app.get('/api/health', async (req, res) => {
  const { getRedisStatus } = await import('@/utils/redis-health');
  const redisStatus = await getRedisStatus();

  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime(),
    services: {
      redis: redisStatus,
      database: 'connected'
    }
  });
});

// Liveness probe - simple check to verify the application is alive
app.get('/health/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Readiness probe - comprehensive check to verify all dependencies are healthy
app.get('/health/ready', async (req, res) => {
  try {
    const { performReadinessCheck } = await import('@/utils/health-checks');
    const result = await performReadinessCheck();

    const statusCode = result.status === 'ready' ? 200 : 503;

    res.status(statusCode).json(result);
  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(503).json({
      status: 'not_ready',
      error: error instanceof Error ? error.message : 'Health check failed',
      timestamp: new Date().toISOString(),
    });
  }
});

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

// Auth endpoints (public)
app.post('/api/auth/signup', authController.signup.bind(authController));
app.post('/api/auth/login', authController.login.bind(authController));
app.post('/api/auth/logout', authController.logout.bind(authController));
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