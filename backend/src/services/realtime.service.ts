/**
 * Unified Real-time Service
 *
 * Central service that unifies WebSocket and SSE communication
 * Provides a single interface to broadcast events to both channels
 */

import { websocketService } from './websocket.service';
import { sseService } from './sse.service';
import { logger } from '@/utils/logger';
import {
  RealtimeEvent,
  RealtimeEventType,
  RealtimePayload,
  JobProgressPayload,
  JobStartedPayload,
  JobCompletedPayload,
  JobFailedPayload,
  AnalysisProgressPayload,
  StationCompletedPayload,
  SystemEventPayload,
  createRealtimeEvent,
  createRoomName,
  WebSocketRoom,
} from '@/types/realtime.types';

/**
 * Broadcast target options
 */
export enum BroadcastTarget {
  ALL = 'all', // Broadcast to both WebSocket and SSE
  WEBSOCKET = 'websocket', // Only WebSocket
  SSE = 'sse', // Only SSE
}

/**
 * Broadcast options
 */
export interface BroadcastOptions {
  target?: BroadcastTarget;
  room?: string;
  userId?: string;
  projectId?: string;
  queueName?: string;
  eventId?: string; // For SSE event tracking
}

/**
 * Unified Real-time Service
 * Provides a single interface to broadcast events via WebSocket and SSE
 */
class RealtimeService {
  /**
   * Broadcast event to all connected clients
   */
  broadcast<T extends RealtimePayload>(
    event: RealtimeEvent<T>,
    options: BroadcastOptions = {}
  ): void {
    const { target = BroadcastTarget.ALL, eventId } = options;

    try {
      if (target === BroadcastTarget.ALL || target === BroadcastTarget.WEBSOCKET) {
        websocketService.broadcast(event);
      }

      if (target === BroadcastTarget.ALL || target === BroadcastTarget.SSE) {
        sseService.broadcast(event, eventId);
      }

      logger.debug(
        `[Realtime] Broadcasted event: ${event.event} via ${target}`
      );
    } catch (error) {
      logger.error('[Realtime] Failed to broadcast event:', error);
    }
  }

  /**
   * Send event to specific room
   */
  toRoom<T extends RealtimePayload>(
    room: string,
    event: RealtimeEvent<T>,
    options: BroadcastOptions = {}
  ): void {
    const { target = BroadcastTarget.ALL, eventId } = options;

    try {
      if (target === BroadcastTarget.ALL || target === BroadcastTarget.WEBSOCKET) {
        websocketService.toRoom(room, event);
      }

      if (target === BroadcastTarget.ALL || target === BroadcastTarget.SSE) {
        sseService.sendToRoom(room, event, eventId);
      }

      logger.debug(
        `[Realtime] Sent event to room ${room}: ${event.event} via ${target}`
      );
    } catch (error) {
      logger.error(`[Realtime] Failed to send event to room ${room}:`, error);
    }
  }

  /**
   * Send event to specific user
   */
  toUser<T extends RealtimePayload>(
    userId: string,
    event: RealtimeEvent<T>,
    options: BroadcastOptions = {}
  ): void {
    const { target = BroadcastTarget.ALL, eventId } = options;

    try {
      if (target === BroadcastTarget.ALL || target === BroadcastTarget.WEBSOCKET) {
        websocketService.toUser(userId, event);
      }

      if (target === BroadcastTarget.ALL || target === BroadcastTarget.SSE) {
        sseService.sendToUser(userId, event, eventId);
      }

      logger.debug(
        `[Realtime] Sent event to user ${userId}: ${event.event} via ${target}`
      );
    } catch (error) {
      logger.error(`[Realtime] Failed to send event to user ${userId}:`, error);
    }
  }

  /**
   * Send event to specific project
   */
  toProject<T extends RealtimePayload>(
    projectId: string,
    event: RealtimeEvent<T>,
    options: BroadcastOptions = {}
  ): void {
    const projectRoom = createRoomName(WebSocketRoom.PROJECT, projectId);
    this.toRoom(projectRoom, event, options);
  }

  /**
   * Send event to specific queue
   */
  toQueue<T extends RealtimePayload>(
    queueName: string,
    event: RealtimeEvent<T>,
    options: BroadcastOptions = {}
  ): void {
    const queueRoom = createRoomName(WebSocketRoom.QUEUE, queueName);
    this.toRoom(queueRoom, event, options);
  }

  /**
   * Emit job started event
   */
  emitJobStarted(
    payload: Omit<JobStartedPayload, 'timestamp' | 'eventType'>,
    options: BroadcastOptions = {}
  ): void {
    const event = createRealtimeEvent<JobStartedPayload>(
      RealtimeEventType.JOB_STARTED,
      payload
    );

    // Send to queue room
    if (payload.queueName) {
      this.toQueue(payload.queueName, event, options);
    }

    // Send to user if available
    if (payload.userId) {
      this.toUser(payload.userId, event, options);
    }

    logger.info(`[Realtime] Job started: ${payload.jobId}`);
  }

  /**
   * Emit job progress event
   */
  emitJobProgress(
    payload: Omit<JobProgressPayload, 'timestamp' | 'eventType'>,
    options: BroadcastOptions = {}
  ): void {
    const event = createRealtimeEvent<JobProgressPayload>(
      RealtimeEventType.JOB_PROGRESS,
      payload
    );

    // Send to queue room
    if (payload.queueName) {
      this.toQueue(payload.queueName, event, options);
    }

    // Send to user if available
    if (payload.userId) {
      this.toUser(payload.userId, event, options);
    }

    logger.debug(
      `[Realtime] Job progress: ${payload.jobId} - ${payload.progress}%`
    );
  }

  /**
   * Emit job completed event
   */
  emitJobCompleted(
    payload: Omit<JobCompletedPayload, 'timestamp' | 'eventType'>,
    options: BroadcastOptions = {}
  ): void {
    const event = createRealtimeEvent<JobCompletedPayload>(
      RealtimeEventType.JOB_COMPLETED,
      payload
    );

    // Send to queue room
    if (payload.queueName) {
      this.toQueue(payload.queueName, event, options);
    }

    // Send to user if available
    if (payload.userId) {
      this.toUser(payload.userId, event, options);
    }

    logger.info(
      `[Realtime] Job completed: ${payload.jobId} in ${payload.duration}ms`
    );
  }

  /**
   * Emit job failed event
   */
  emitJobFailed(
    payload: Omit<JobFailedPayload, 'timestamp' | 'eventType'>,
    options: BroadcastOptions = {}
  ): void {
    const event = createRealtimeEvent<JobFailedPayload>(
      RealtimeEventType.JOB_FAILED,
      payload
    );

    // Send to queue room
    if (payload.queueName) {
      this.toQueue(payload.queueName, event, options);
    }

    // Send to user if available
    if (payload.userId) {
      this.toUser(payload.userId, event, options);
    }

    logger.error(
      `[Realtime] Job failed: ${payload.jobId} - ${payload.error}`
    );
  }

  /**
   * Emit analysis progress event
   */
  emitAnalysisProgress(
    payload: Omit<AnalysisProgressPayload, 'timestamp' | 'eventType'>,
    options: BroadcastOptions = {}
  ): void {
    const event = createRealtimeEvent<AnalysisProgressPayload>(
      RealtimeEventType.ANALYSIS_PROGRESS,
      payload
    );

    // Send to project room
    if (payload.projectId) {
      this.toProject(payload.projectId, event, options);
    }

    // Send to analysis-specific room
    const analysisRoom = `analysis:${payload.analysisId}`;
    this.toRoom(analysisRoom, event, options);

    // Send to user if available
    if (payload.userId) {
      this.toUser(payload.userId, event, options);
    }

    logger.debug(
      `[Realtime] Analysis progress: ${payload.analysisId} - Station ${payload.currentStation}/${payload.totalStations}`
    );
  }

  /**
   * Emit station completed event
   */
  emitStationCompleted(
    payload: Omit<StationCompletedPayload, 'timestamp' | 'eventType'>,
    options: BroadcastOptions = {}
  ): void {
    const event = createRealtimeEvent<StationCompletedPayload>(
      RealtimeEventType.ANALYSIS_STATION_COMPLETED,
      payload
    );

    // Send to project room
    if (payload.projectId) {
      this.toProject(payload.projectId, event, options);
    }

    // Send to analysis-specific room
    const analysisRoom = `analysis:${payload.analysisId}`;
    this.toRoom(analysisRoom, event, options);

    // Send to user if available
    if (payload.userId) {
      this.toUser(payload.userId, event, options);
    }

    logger.info(
      `[Realtime] Station completed: ${payload.stationName} in ${payload.duration}ms`
    );
  }

  /**
   * Emit system info event
   */
  emitSystemInfo(
    message: string,
    details?: any,
    options: BroadcastOptions = {}
  ): void {
    const event = createRealtimeEvent<SystemEventPayload>(
      RealtimeEventType.SYSTEM_INFO,
      {
        level: 'info',
        message,
        details,
      }
    );

    if (options.userId) {
      this.toUser(options.userId, event, options);
    } else if (options.room) {
      this.toRoom(options.room, event, options);
    } else {
      this.broadcast(event, options);
    }

    logger.info(`[Realtime] System info: ${message}`);
  }

  /**
   * Emit system warning event
   */
  emitSystemWarning(
    message: string,
    details?: any,
    options: BroadcastOptions = {}
  ): void {
    const event = createRealtimeEvent<SystemEventPayload>(
      RealtimeEventType.SYSTEM_WARNING,
      {
        level: 'warning',
        message,
        details,
      }
    );

    if (options.userId) {
      this.toUser(options.userId, event, options);
    } else if (options.room) {
      this.toRoom(options.room, event, options);
    } else {
      this.broadcast(event, options);
    }

    logger.warn(`[Realtime] System warning: ${message}`);
  }

  /**
   * Emit system error event
   */
  emitSystemError(
    message: string,
    details?: any,
    options: BroadcastOptions = {}
  ): void {
    const event = createRealtimeEvent<SystemEventPayload>(
      RealtimeEventType.SYSTEM_ERROR,
      {
        level: 'error',
        message,
        details,
      }
    );

    if (options.userId) {
      this.toUser(options.userId, event, options);
    } else if (options.room) {
      this.toRoom(options.room, event, options);
    } else {
      this.broadcast(event, options);
    }

    logger.error(`[Realtime] System error: ${message}`);
  }

  /**
   * Get comprehensive statistics
   */
  getStats(): {
    websocket: ReturnType<typeof websocketService.getStats>;
    sse: ReturnType<typeof sseService.getStats>;
    timestamp: string;
  } {
    return {
      websocket: websocketService.getStats(),
      sse: sseService.getStats(),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get health status
   */
  getHealth(): {
    websocket: {
      status: 'operational' | 'not_initialized';
      initialized: boolean;
    };
    sse: {
      status: 'operational';
      clients: number;
    };
    overall: 'healthy' | 'degraded' | 'down';
    timestamp: string;
  } {
    const wsIO = websocketService.getIO();
    const sseStats = sseService.getStats();

    const wsHealthy = !!wsIO;
    const sseHealthy = true; // SSE is always available

    let overall: 'healthy' | 'degraded' | 'down';
    if (wsHealthy && sseHealthy) {
      overall = 'healthy';
    } else if (wsHealthy || sseHealthy) {
      overall = 'degraded';
    } else {
      overall = 'down';
    }

    return {
      websocket: {
        status: wsIO ? 'operational' : 'not_initialized',
        initialized: !!wsIO,
      },
      sse: {
        status: 'operational',
        clients: sseStats.totalClients,
      },
      overall,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Stream data to SSE client
   * (WebSocket doesn't need explicit streaming, it's always connected)
   */
  streamToSSE(clientId: string, data: string, event?: string): boolean {
    try {
      return sseService.streamData(clientId, data, event);
    } catch (error) {
      logger.error(`[Realtime] Failed to stream to SSE client ${clientId}:`, error);
      return false;
    }
  }

  /**
   * Subscribe SSE client to room
   */
  subscribeSSEClientToRoom(clientId: string, room: string): void {
    try {
      sseService.subscribeToRoom(clientId, room);
      logger.info(`[Realtime] SSE client ${clientId} subscribed to room: ${room}`);
    } catch (error) {
      logger.error(
        `[Realtime] Failed to subscribe SSE client ${clientId} to room ${room}:`,
        error
      );
    }
  }

  /**
   * Unsubscribe SSE client from room
   */
  unsubscribeSSEClientFromRoom(clientId: string, room: string): void {
    try {
      sseService.unsubscribeFromRoom(clientId, room);
      logger.info(`[Realtime] SSE client ${clientId} unsubscribed from room: ${room}`);
    } catch (error) {
      logger.error(
        `[Realtime] Failed to unsubscribe SSE client ${clientId} from room ${room}:`,
        error
      );
    }
  }

  /**
   * Shutdown all real-time services
   */
  async shutdown(): Promise<void> {
    logger.info('[Realtime] Shutting down all services...');

    try {
      // Shutdown WebSocket
      await websocketService.shutdown();

      // Shutdown SSE
      sseService.shutdown();

      logger.info('[Realtime] All services shut down successfully');
    } catch (error) {
      logger.error('[Realtime] Error during shutdown:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const realtimeService = new RealtimeService();
