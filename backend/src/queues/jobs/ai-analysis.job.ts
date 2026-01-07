/**
 * AI Analysis Background Job Processor
 *
 * Handles long-running AI analysis tasks in the background
 */

import { Job } from 'bullmq';
import { queueManager, QueueName } from '@/queues/queue.config';

// Job data types
export interface AIAnalysisJobData {
  type: 'scene' | 'character' | 'shot' | 'project';
  entityId: string;
  userId: string;
  analysisType: 'full' | 'quick' | 'detailed';
  options?: Record<string, any>;
}

export interface AIAnalysisResult {
  entityId: string;
  entityType: string;
  analysis: any;
  generatedAt: Date;
  processingTime: number;
}

/**
 * Process AI analysis job
 */
async function processAIAnalysis(job: Job<AIAnalysisJobData>): Promise<AIAnalysisResult> {
  const startTime = Date.now();
  const { type, entityId, userId, analysisType, options } = job.data;

  console.log(`[AIAnalysis] Processing ${analysisType} analysis for ${type} ${entityId}`);

  // Update job progress
  await job.updateProgress(10);

  try {
    let analysis: any;

    // Route to appropriate analysis handler
    switch (type) {
      case 'scene':
        analysis = await analyzeScene(entityId, analysisType, options);
        break;
      case 'character':
        analysis = await analyzeCharacter(entityId, analysisType, options);
        break;
      case 'shot':
        analysis = await analyzeShot(entityId, analysisType, options);
        break;
      case 'project':
        analysis = await analyzeProject(entityId, analysisType, options);
        break;
      default:
        throw new Error(`Unknown analysis type: ${type}`);
    }

    await job.updateProgress(100);

    const processingTime = Date.now() - startTime;

    console.log(`[AIAnalysis] Completed in ${processingTime}ms`);

    return {
      entityId,
      entityType: type,
      analysis,
      generatedAt: new Date(),
      processingTime,
    };
  } catch (error) {
    console.error(`[AIAnalysis] Error processing job ${job.id}:`, error);
    throw error;
  }
}

/**
 * Get Gemini service instance (lazy load to avoid circular dependencies)
 */
async function getGeminiService() {
  const { GeminiService } = await import('@/services/gemini.service');
  return new GeminiService();
}

/**
 * Analyze a scene
 */
async function analyzeScene(
  sceneId: string,
  analysisType: string,
  options?: Record<string, any>
): Promise<any> {
  const gemini = await getGeminiService();

  // Fetch scene data (placeholder - replace with actual DB query)
  const sceneText = options?.text || `Scene ${sceneId} content`;

  // Use Gemini to analyze the scene
  const analysis = await gemini.analyzeText(sceneText, 'structure');

  return {
    sceneId,
    analysis: {
      raw: analysis,
      analyzedAt: new Date().toISOString(),
      analysisType,
    },
  };
}

/**
 * Analyze a character
 */
async function analyzeCharacter(
  characterId: string,
  analysisType: string,
  options?: Record<string, any>
): Promise<any> {
  const gemini = await getGeminiService();

  // Fetch character data (placeholder - replace with actual DB query)
  const characterText = options?.text || `Character ${characterId} information`;

  // Use Gemini to analyze the character
  const analysis = await gemini.analyzeText(characterText, 'characters');

  return {
    characterId,
    analysis: {
      raw: analysis,
      analyzedAt: new Date().toISOString(),
      analysisType,
    },
  };
}

/**
 * Analyze a shot
 */
async function analyzeShot(
  shotId: string,
  analysisType: string,
  options?: Record<string, any>
): Promise<any> {
  const gemini = await getGeminiService();

  // Fetch shot data (placeholder - replace with actual DB query)
  const shotText = options?.text || `Shot ${shotId} details`;

  // Use Gemini to analyze the shot
  const analysis = await gemini.analyzeText(shotText, analysisType);

  return {
    shotId,
    analysis: {
      raw: analysis,
      analyzedAt: new Date().toISOString(),
      analysisType,
    },
  };
}

/**
 * Analyze a project
 */
async function analyzeProject(
  projectId: string,
  analysisType: string,
  options?: Record<string, any>
): Promise<any> {
  const gemini = await getGeminiService();

  // Fetch project data (placeholder - replace with actual DB query)
  const projectText = options?.text || `Project ${projectId} overview`;

  // Use Gemini to analyze the entire project
  const analysis = await gemini.analyzeText(projectText, 'structure');

  return {
    projectId,
    analysis: {
      raw: analysis,
      analyzedAt: new Date().toISOString(),
      analysisType,
    },
  };
}

/**
 * Add AI analysis job to queue
 */
export async function queueAIAnalysis(data: AIAnalysisJobData): Promise<string> {
  const queue = queueManager.getQueue(QueueName.AI_ANALYSIS);

  const job = await queue.add('ai-analysis', data, {
    priority: data.analysisType === 'quick' ? 1 : 2,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  });

  console.log(`[AIAnalysis] Job ${job.id} queued for ${data.type} ${data.entityId}`);

  return job.id!;
}

/**
 * Register AI analysis worker
 */
export function registerAIAnalysisWorker(): void {
  queueManager.registerWorker(QueueName.AI_ANALYSIS, processAIAnalysis, {
    concurrency: 3, // Process 3 AI analyses concurrently
    limiter: {
      max: 5,
      duration: 1000, // Max 5 jobs per second
    },
  });

  console.log('[AIAnalysis] Worker registered');
}

export default {
  queueAIAnalysis,
  registerAIAnalysisWorker,
};
