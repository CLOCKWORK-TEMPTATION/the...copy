/**
 * منسق الوكلاء المتعدد (Multi-Agent Orchestrator)
 *
 * @description
 * السبب وراء هذا التصميم:
 * - إدارة تنفيذ الوكلاء المتعددين على نفس النص/المشروع
 * - دعم التنفيذ المتوازي والتسلسلي حسب الحاجة
 * - تجميع النتائج وحساب الإحصائيات الموحدة
 * - دعم نظام المناظرة لتحسين النتائج منخفضة الثقة
 *
 * يدعم:
 * - تنفيذ الوكلاء بشكل متوازي (parallel) أو تسلسلي (sequential)
 * - نظام المناظرة متعدد الوكلاء (المرحلة 3)
 * - نظام سير العمل (Workflow System)
 *
 * @module orchestrator
 */

import { TaskType } from './core/enums';
import { StandardAgentInput, StandardAgentOutput } from './core/types';
import { agentRegistry } from './registry';
import { logger } from '@/utils/logger';
import { startDebate } from './debate';
import { DebateConfig } from './debate/types';
import { BaseAgent } from './shared/BaseAgent';
import { workflowExecutor } from './core/workflow-executor';
import { 
  WorkflowConfig, 
  WorkflowStatus, 
  AgentExecutionResult, 
  WorkflowMetrics 
} from './core/workflow-types';
import { getPresetWorkflow, PresetWorkflowName } from './core/workflow-presets';

/**
 * واجهة مدخلات التنسيق
 *
 * @description
 * السبب: توحيد شكل المدخلات لجميع عمليات التنسيق
 */
export interface OrchestrationInput {
  /** النص الكامل للتحليل */
  fullText: string;
  /** اسم المشروع للتتبع */
  projectName: string;
  /** أنواع المهام المطلوب تنفيذها */
  taskTypes: TaskType[];
  /** سياق إضافي للوكلاء */
  context?: Record<string, unknown>;
  /** خيارات التنفيذ */
  options?: {
    /** هل يُنفذ الوكلاء بشكل متوازي؟ */
    parallel?: boolean;
    /** حد الوقت الأقصى بالميلي ثانية */
    timeout?: number;
    /** هل يُضمّن البيانات الوصفية؟ */
    includeMetadata?: boolean;
  };
}

/**
 * واجهة مخرجات التنسيق
 *
 * @description
 * السبب: توفير هيكل موحد للنتائج مع إحصائيات مفيدة
 */
export interface OrchestrationOutput {
  /** خريطة النتائج: نوع المهمة → النتيجة */
  results: Map<TaskType, StandardAgentOutput>;
  /** ملخص إحصائي للتنفيذ */
  summary: {
    /** إجمالي وقت التنفيذ بالميلي ثانية */
    totalExecutionTime: number;
    /** عدد المهام الناجحة */
    successfulTasks: number;
    /** عدد المهام الفاشلة */
    failedTasks: number;
    /** متوسط درجة الثقة */
    averageConfidence: number;
  };
  /** بيانات وصفية اختيارية */
  metadata?: {
    /** وقت بدء التنفيذ (ISO) */
    startedAt: string;
    /** وقت انتهاء التنفيذ (ISO) */
    finishedAt: string;
    /** قائمة المهام المُنفذة */
    tasksExecuted: TaskType[];
  };
}

/**
 * فئة منسق الوكلاء المتعدد
 *
 * @description
 * السبب: تطبيق نمط Singleton لضمان وجود منسق واحد فقط
 * في النظام بأكمله، مما يمنع التضارب في الموارد.
 *
 * @example
 * ```typescript
 * const orchestrator = MultiAgentOrchestrator.getInstance();
 * const result = await orchestrator.executeAgents({
 *   fullText: "نص السيناريو",
 *   projectName: "مشروعي",
 *   taskTypes: [TaskType.CHARACTER_DEEP_ANALYZER]
 * });
 * ```
 */
export class MultiAgentOrchestrator {
  private static instance: MultiAgentOrchestrator;

  private constructor() {}

  /**
   * الحصول على نسخة المنسق الوحيدة
   *
   * @description السبب: تطبيق نمط Singleton
   * @returns نسخة المنسق
   */
  public static getInstance(): MultiAgentOrchestrator {
    if (!MultiAgentOrchestrator.instance) {
      MultiAgentOrchestrator.instance = new MultiAgentOrchestrator();
    }
    return MultiAgentOrchestrator.instance;
  }

  /**
   * تنفيذ وكلاء متعددين بشكل متوازي أو تسلسلي
   *
   * @description
   * السبب: نقطة الدخول الرئيسية لتنفيذ مجموعة من الوكلاء على نص واحد
   *
   * @param input - مدخلات التنسيق
   * @returns مخرجات التنسيق مع جميع النتائج والإحصائيات
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
      logger.error('فشل في تنسيق الوكلاء المتعدد', {
        error: error instanceof Error ? error.message : 'خطأ غير معروف',
        taskTypes,
        projectName: input.projectName,
      });
      throw error;
    }
  }

  /**
   * تنفيذ الوكلاء بشكل متوازي
   *
   * @description
   * السبب: تسريع التنفيذ عندما لا تعتمد المهام على بعضها البعض
   *
   * @param fullText - النص الكامل للتحليل
   * @param taskTypes - أنواع المهام
   * @param context - السياق الإضافي
   * @param results - خريطة النتائج للتعبئة
   */
  private async executeInParallel(
    fullText: string,
    taskTypes: TaskType[],
    context: Record<string, unknown> | undefined,
    results: Map<TaskType, StandardAgentOutput>
  ): Promise<void> {
    const promises = taskTypes.map(async (taskType) => {
      const agent = agentRegistry.getAgent(taskType);
      if (!agent) {
        logger.warn(`لم يُعثر على وكيل لنوع المهمة: ${taskType}`);
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
        logger.error(`فشل تنفيذ الوكيل ${taskType}`, {
          error: error instanceof Error ? error.message : 'خطأ غير معروف',
        });
        // تخزين نتيجة الخطأ
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
   * تنفيذ الوكلاء بشكل تسلسلي
   *
   * @description
   * السبب: يُتيح لكل وكيل الاستفادة من نتائج الوكلاء السابقين
   * مفيد عندما تعتمد التحليلات على بعضها البعض
   *
   * @param fullText - النص الكامل للتحليل
   * @param taskTypes - أنواع المهام
   * @param context - السياق الإضافي
   * @param results - خريطة النتائج للتعبئة
   */
  private async executeSequentially(
    fullText: string,
    taskTypes: TaskType[],
    context: Record<string, unknown> | undefined,
    results: Map<TaskType, StandardAgentOutput>
  ): Promise<void> {
    for (const taskType of taskTypes) {
      const agent = agentRegistry.getAgent(taskType);
      if (!agent) {
        logger.warn(`لم يُعثر على وكيل لنوع المهمة: ${taskType}`);
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

        logger.info(`اكتمل الوكيل ${taskType} بدرجة ثقة: ${output.confidence}`);
      } catch (error) {
        logger.error(`فشل تنفيذ الوكيل ${taskType}`, {
          error: error instanceof Error ? error.message : 'خطأ غير معروف',
        });
        // تخزين نتيجة الخطأ
        results.set(taskType, {
          text: 'فشل في تنفيذ التحليل',
          confidence: 0,
          notes: [`خطأ: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`],
        });
      }
    }
  }

  /**
   * تنفيذ وكيل واحد
   *
   * @description
   * السبب: واجهة مبسطة لتنفيذ وكيل واحد فقط
   *
   * @param taskType - نوع المهمة
   * @param input - النص المدخل
   * @param context - السياق الإضافي
   * @returns نتيجة التنفيذ
   * @throws Error إذا لم يُعثر على الوكيل
   */
  async executeSingleAgent(
    taskType: TaskType,
    input: string,
    context?: Record<string, unknown>
  ): Promise<StandardAgentOutput> {
    const agent = agentRegistry.getAgent(taskType);
    if (!agent) {
      throw new Error(`لم يُعثر على وكيل لنوع المهمة: ${taskType}`);
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
   * الحصول على الوكلاء الموصى بها لنوع مشروع معين
   *
   * @description
   * السبب: تقديم توصيات ذكية بناءً على نوع العمل الفني
   * كل نوع مشروع له احتياجات تحليل مختلفة
   *
   * @param projectType - نوع المشروع: فيلم، مسلسل، أو مسرح
   * @returns قائمة أنواع المهام الموصى بها
   */
  getRecommendedAgents(projectType: 'film' | 'series' | 'stage'): TaskType[] {
    // الوكلاء الأساسيين لجميع أنواع المشاريع
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

  /**
   * تشغيل مناظرة متعددة الوكلاء على موضوع معين
   *
   * @description
   * السبب: المرحلة 3 من نظام الوكلاء - المناظرة
   * تُحسّن جودة النتائج عبر تضارب الآراء والوصول لتوافق
   *
   * متى تُستخدم:
   * - عندما تكون الثقة في النتائج منخفضة
   * - للمواضيع المعقدة التي تحتاج آراء متعددة
   * - عندما يُطلب تحليل شامل ومتوازن
   *
   * @param topic - موضوع المناظرة
   * @param taskTypes - أنواع الوكلاء المشاركين (اختياري)
   * @param context - سياق إضافي للمناظرة
   * @param config - إعدادات المناظرة
   * @param confidenceThreshold - حد الثقة الأدنى لتفعيل المناظرة
   * @returns نتيجة المناظرة الموحدة
   */
  async debateAgents(
    topic: string,
    taskTypes?: TaskType[],
    context?: string,
    config?: Partial<DebateConfig>,
    confidenceThreshold: number = 0.6
  ): Promise<StandardAgentOutput> {
    logger.info(`بدء مناظرة متعددة الوكلاء حول: ${topic}`);

    try {
      // الحصول على الوكلاء المتاحين
      let availableAgents: BaseAgent[];

      if (taskTypes && taskTypes.length > 0) {
        // استخدام أنواع المهام المحددة
        availableAgents = taskTypes
          .map(taskType => agentRegistry.getAgent(taskType))
          .filter((agent): agent is BaseAgent => agent !== undefined);
      } else {
        // استخدام جميع الوكلاء المتاحين
        const allAgents = agentRegistry.getAllAgents();
        availableAgents = Array.from(allAgents.values());
      }

      if (availableAgents.length === 0) {
        throw new Error('لا توجد وكلاء متاحة للمناظرة');
      }

      logger.info(`تم اختيار ${availableAgents.length} وكيل للمناظرة`);

      // دمج الإعدادات مع القيم الافتراضية
      const debateConfig: Partial<DebateConfig> = {
        confidenceThreshold,
        ...config,
      };

      // بدء المناظرة
      const result = await startDebate(
        topic,
        availableAgents,
        context,
        debateConfig
      );

      logger.info(`اكتملت المناظرة بدرجة ثقة: ${result.confidence}`);

      return result;
    } catch (error) {
      logger.error('فشلت المناظرة متعددة الوكلاء', {
        error: error instanceof Error ? error.message : 'خطأ غير معروف',
        topic,
      });

      // إرجاع نتيجة احتياطية
      return {
        text: `فشلت المناظرة: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`,
        confidence: 0.3,
        notes: ['فشل في إتمام المناظرة'],
        metadata: {
          debateRounds: 0,
        },
      };
    }
  }

  /**
   * تنفيذ الوكلاء مع مناظرة اختيارية
   *
   * @description
   * السبب: تفعيل المناظرة تلقائياً عندما تكون الثقة منخفضة
   * هذا يضمن جودة أعلى للنتائج دون تدخل يدوي
   *
   * @param input - مدخلات التنسيق
   * @param enableDebate - هل يُفعّل المناظرة للنتائج منخفضة الثقة؟
   * @param debateConfig - إعدادات المناظرة
   * @returns مخرجات التنسيق مع نتائج المناظرة إن وُجدت
   */
  async executeWithDebate(
    input: OrchestrationInput,
    enableDebate: boolean = true,
    debateConfig?: Partial<DebateConfig>
  ): Promise<OrchestrationOutput> {
    // أولاً: تنفيذ عادي
    const result = await this.executeAgents(input);

    // التحقق من الحاجة للمناظرة
    if (enableDebate && result.summary.averageConfidence < 0.7) {
      logger.info(
        `الثقة المتوسطة منخفضة (${result.summary.averageConfidence.toFixed(2)})، تفعيل المناظرة`
      );

      try {
        // الحصول على الوكلاء المشاركين
        const participatingTaskTypes = Array.from(result.results.keys());
        const agents = participatingTaskTypes
          .map(taskType => agentRegistry.getAgent(taskType))
          .filter((agent): agent is BaseAgent => agent !== undefined);

        // تشغيل المناظرة لتحسين النتائج
        const debateTopic = `تحسين تحليل المشروع: ${input.projectName}`;
        const debateResult = await startDebate(
          debateTopic,
          agents,
          input.fullText,
          debateConfig
        );

        // إضافة نتيجة المناظرة
        result.results.set(TaskType.INTEGRATED, debateResult);

        // تحديث الملخص
        result.summary.successfulTasks += 1;
        const allConfidences = Array.from(result.results.values()).map(
          r => r.confidence
        );
        result.summary.averageConfidence =
          allConfidences.reduce((sum, c) => sum + c, 0) / allConfidences.length;

        logger.info(
          `اكتملت المناظرة، متوسط الثقة الجديد: ${result.summary.averageConfidence.toFixed(2)}`
        );
      } catch (error) {
        logger.error('فشل تنفيذ المناظرة', {
          error: error instanceof Error ? error.message : 'خطأ غير معروف',
        });
        // الاستمرار بالنتائج الأصلية
      }
    }

    return result;
  }

  /**
   * تنفيذ سير عمل مُعرّف مسبقاً
   *
   * @description
   * السبب: توفير سير عمل جاهزة للاستخدام المتكرر
   * تُبسط العملية للمستخدمين الذين يحتاجون تحليلاً قياسياً
   *
   * @param workflowName - اسم سير العمل المُعرّف مسبقاً
   * @param input - مدخلات الوكيل القياسية
   * @returns حالة سير العمل والنتائج والمقاييس
   */
  async executeWorkflow(
    workflowName: PresetWorkflowName,
    input: StandardAgentInput
  ): Promise<{
    status: WorkflowStatus;
    results: Map<string, AgentExecutionResult>;
    metrics: WorkflowMetrics;
  }> {
    logger.info(`تنفيذ سير العمل المُعرّف: ${workflowName}`);
    
    const workflow = getPresetWorkflow(workflowName);
    return await workflowExecutor.execute(workflow, input);
  }

  /**
   * تنفيذ سير عمل مُخصص
   *
   * @description
   * السبب: إتاحة المرونة للمستخدمين لتصميم سير عمل خاص بهم
   * مفيد للحالات المعقدة التي لا تُغطيها سير العمل المُعرّفة
   *
   * @param config - إعدادات سير العمل المُخصص
   * @param input - مدخلات الوكيل القياسية
   * @returns حالة سير العمل والنتائج والمقاييس
   */
  async executeCustomWorkflow(
    config: WorkflowConfig,
    input: StandardAgentInput
  ): Promise<{
    status: WorkflowStatus;
    results: Map<string, AgentExecutionResult>;
    metrics: WorkflowMetrics;
  }> {
    logger.info(`تنفيذ سير العمل المُخصص: ${config.name}`);
    
    return await workflowExecutor.execute(config, input);
  }
}

/**
 * نسخة Singleton للتصدير
 *
 * @description
 * السبب: ضمان استخدام نفس نسخة المنسق في جميع أنحاء التطبيق
 *
 * @example
 * ```typescript
 * import { multiAgentOrchestrator } from './orchestrator';
 *
 * const result = await multiAgentOrchestrator.executeAgents({
 *   fullText: "نص السيناريو",
 *   projectName: "مشروعي",
 *   taskTypes: [TaskType.CHARACTER_DEEP_ANALYZER]
 * });
 * ```
 */
export const multiAgentOrchestrator = MultiAgentOrchestrator.getInstance();
