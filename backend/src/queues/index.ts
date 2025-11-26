/**
 * Queue System Entry Point
 *
 * Initializes all workers and exports queue utilities
 */

import { registerAIAnalysisWorker } from './jobs/ai-analysis.job';
import { registerDocumentProcessingWorker } from './jobs/document-processing.job';
import { registerCacheWarmingWorker } from './jobs/cache-warming.job';
import { queueManager } from './queue.config';
import { checkRedisVersion } from '@/config/redis.config';
import { logger } from '@/utils/logger';

let queueSystemEnabled = false;

/**
 * Initialize all workers
 */
export async function initializeWorkers(): Promise<void> {
  console.log('[QueueSystem] Initializing workers...');

  // Check Redis version compatibility
  const versionCheck = await checkRedisVersion();

  if (!versionCheck.compatible) {
    logger.warn(
      `[QueueSystem] Redis version ${versionCheck.version} is not compatible with BullMQ. ` +
      `Minimum required version: ${versionCheck.minVersion}. ` +
      `Reason: ${versionCheck.reason}. ` +
      `Queue system will be disabled. The application will continue to work without background jobs.`
    );
    console.warn(
      `\n⚠️  REDIS VERSION INCOMPATIBILITY DETECTED ⚠️\n` +
      `   Current Redis version: ${versionCheck.version}\n` +
      `   Required minimum version: ${versionCheck.minVersion}\n` +
      `   Reason: ${versionCheck.reason}\n` +
      `   \n` +
      `   The queue system (BullMQ) has been disabled.\n` +
      `   Background jobs will not be processed.\n` +
      `   \n` +
      `   To enable the queue system:\n` +
      `   - Upgrade Redis to version ${versionCheck.minVersion} or higher\n` +
      `   - On Windows: Use WSL2 with Redis or Memurai (https://www.memurai.com/)\n` +
      `   - Or use a cloud Redis service (e.g., Redis Cloud, AWS ElastiCache)\n` +
      `\n`
    );
    queueSystemEnabled = false;
    return;
  }

  logger.info(
    `[QueueSystem] Redis version ${versionCheck.version} is compatible with BullMQ`
  );

  // Register all job processors
  registerAIAnalysisWorker();
  registerDocumentProcessingWorker();
  registerCacheWarmingWorker();

  queueSystemEnabled = true;
  console.log('[QueueSystem] All workers initialized');
}

/**
 * Check if queue system is enabled
 */
export function isQueueSystemEnabled(): boolean {
  return queueSystemEnabled;
}

/**
 * Shutdown all workers and queues
 */
export async function shutdownQueues(): Promise<void> {
  console.log('[QueueSystem] Shutting down...');
  await queueManager.close();
  console.log('[QueueSystem] Shutdown complete');
}

// Export queue manager and job functions
export { queueManager, QueueName } from './queue.config';
export { queueAIAnalysis } from './jobs/ai-analysis.job';
export { queueDocumentProcessing } from './jobs/document-processing.job';
export { queueCacheWarming } from './jobs/cache-warming.job';

export default {
  initializeWorkers,
  shutdownQueues,
  queueManager,
  isQueueSystemEnabled,
};
