/**
 * Multi-Agent Orchestrator - Backend
 * Orchestrates multiple agents to work together on complex analysis tasks
 */

import { TaskType } from './core/enums';
import { StandardAgentInput, StandardAgentOutput } from './core/types';
import { agentRegistry } from './registry';
import { logger } from '@/utils/logger';

export interface OrchestrationInput {
  fullText: string;
  projectName: string;
  taskTypes: TaskType[];
  context?: Record<string, any>;
  options?: {
    parallel?: boolean;
    timeout?: number;
    includeMetadata?: boolean;
  };
}

export interface OrchestrationOutput {
  results: Map<TaskType, StandardAgentOutput>;
  summary: {
    totalExecutionTime: number;
    successfulTasks: number;
    failedTasks: number;
    averageConfidence: number;
  };
  metadata?: {
    startedAt: string;
    finishedAt: string;
    tasksExecuted: TaskType[];
  };
}

export class MultiAgentOrchestrator {
  private static instance: MultiAgentOrchestrator;

  private constructor() {}

  public static getInstance(): MultiAgentOrchestrator {
    if (!MultiAgentOrchestrator.instance) {
      MultiAgentOrchestrator.instance = new MultiAgentOrchestrator();
    }
    return MultiAgentOrchestrator.instance;
  }

  /**
   * Execute multiple agents in sequence or parallel
   */
  async executeAgents(input: OrchestrationInput): Promise<OrchestrationOutput> {
    const startTime = Date.now();
    const results = new Map<TaskType, StandardAgentOutput>();
    const { fullText, taskTypes, context, options } = input;

    logger.info(`Starting multi-agent orchestration for ${taskTypes.length} tasks`);

    try {
      if (options?.parallel) {
        // Execute agents in parallel
        await this.executeInParallel(fullText, taskTypes, context, results);
      } else {
        // Execute agents sequentially
        await this.executeSequentially(fullText, taskTypes, context, results);
      }

      // Calculate summary statistics
      const endTime = Date.now();
      const successfulTasks = Array.from(results.values()).filter(
        (r) => r.confidence > 0.5
      ).length;
      const failedTasks = taskTypes.length - successfulTasks;
      const averageConfidence =
        Array.from(results.values()).reduce((sum, r) => sum + r.confidence, 0) /
        Math.max(results.size, 1);

      const orchestrationOutput: OrchestrationOutput = {
        results,
        summary: {
          totalExecutionTime: endTime - startTime,
          successfulTasks,
          failedTasks,
          averageConfidence,
        },
      };

      if (options?.includeMetadata) {
        orchestrationOutput.metadata = {
          startedAt: new Date(startTime).toISOString(),
          finishedAt: new Date(endTime).toISOString(),
          tasksExecuted: taskTypes,
        };
      }

      logger.info(
        `Multi-agent orchestration completed: ${successfulTasks}/${taskTypes.length} successful`
      );

      return orchestrationOutput;
    } catch (error) {
      logger.error('Multi-agent orchestration failed:', error);
      throw error;
    }
  }

  /**
   * Execute agents in parallel
   */
  private async executeInParallel(
    fullText: string,
    taskTypes: TaskType[],
    context: Record<string, any> | undefined,
    results: Map<TaskType, StandardAgentOutput>
  ): Promise<void> {
    const promises = taskTypes.map(async (taskType) => {
      const agent = agentRegistry.getAgent(taskType);
      if (!agent) {
        logger.warn(`Agent not found for task type: ${taskType}`);
        return;
      }

      try {
        const agentInput: StandardAgentInput = {
          input: fullText,
          context: context || {},
          options: {
            enableRAG: true,
            enableSelfCritique: true,
            enableConstitutional: true,
            enableUncertainty: true,
            enableHallucination: true,
          },
        };

        const output = await agent.executeTask(agentInput);
        results.set(taskType, output);
      } catch (error) {
        logger.error(`Agent execution failed for ${taskType}:`, error);
        // Store error result
        results.set(taskType, {
          text: 'فشل في تنفيذ التحليل',
          confidence: 0,
          notes: [`خطأ: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`],
        });
      }
    });

    await Promise.all(promises);
  }

  /**
   * Execute agents sequentially
   */
  private async executeSequentially(
    fullText: string,
    taskTypes: TaskType[],
    context: Record<string, any> | undefined,
    results: Map<TaskType, StandardAgentOutput>
  ): Promise<void> {
    for (const taskType of taskTypes) {
      const agent = agentRegistry.getAgent(taskType);
      if (!agent) {
        logger.warn(`Agent not found for task type: ${taskType}`);
        continue;
      }

      try {
        const agentInput: StandardAgentInput = {
          input: fullText,
          context: {
            ...(context || {}),
            previousResults: Object.fromEntries(results),
          },
          options: {
            enableRAG: true,
            enableSelfCritique: true,
            enableConstitutional: true,
            enableUncertainty: true,
            enableHallucination: true,
          },
        };

        const output = await agent.executeTask(agentInput);
        results.set(taskType, output);

        logger.info(
          `Agent ${taskType} completed with confidence: ${output.confidence}`
        );
      } catch (error) {
        logger.error(`Agent execution failed for ${taskType}:`, error);
        // Store error result
        results.set(taskType, {
          text: 'فشل في تنفيذ التحليل',
          confidence: 0,
          notes: [`خطأ: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`],
        });
      }
    }
  }

  /**
   * Execute a single agent
   */
  async executeSingleAgent(
    taskType: TaskType,
    input: string,
    context?: Record<string, any>
  ): Promise<StandardAgentOutput> {
    const agent = agentRegistry.getAgent(taskType);
    if (!agent) {
      throw new Error(`Agent not found for task type: ${taskType}`);
    }

    const agentInput: StandardAgentInput = {
      input,
      context: context || {},
      options: {
        enableRAG: true,
        enableSelfCritique: true,
        enableConstitutional: true,
        enableUncertainty: true,
        enableHallucination: true,
      },
    };

    return await agent.executeTask(agentInput);
  }

  /**
   * Get recommended agents for a given project type
   */
  getRecommendedAgents(projectType: 'film' | 'series' | 'stage'): TaskType[] {
    const commonAgents = [
      TaskType.CHARACTER_DEEP_ANALYZER,
      TaskType.DIALOGUE_ADVANCED_ANALYZER,
      TaskType.THEMES_MESSAGES_ANALYZER,
    ];

    switch (projectType) {
      case 'film':
        return [
          ...commonAgents,
          TaskType.VISUAL_CINEMATIC_ANALYZER,
          TaskType.PRODUCIBILITY_ANALYZER,
          TaskType.TARGET_AUDIENCE_ANALYZER,
        ];
      case 'series':
        return [
          ...commonAgents,
          TaskType.CULTURAL_HISTORICAL_ANALYZER,
          TaskType.TARGET_AUDIENCE_ANALYZER,
        ];
      case 'stage':
        return [
          ...commonAgents,
          TaskType.CULTURAL_HISTORICAL_ANALYZER,
        ];
      default:
        return commonAgents;
    }
  }
}

/**
 * Singleton instance export
 */
export const multiAgentOrchestrator = MultiAgentOrchestrator.getInstance();
