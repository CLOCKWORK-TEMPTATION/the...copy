import { TaskType } from "@core/types";
import {
  StandardAgentInput,
  StandardAgentOptions,
  StandardAgentOutput,
} from "./standardAgentPattern";
import { executeStandardAgentPattern } from "./standardAgentPattern";
import { geminiService } from "@/services/gemini.service";
import { logger } from "@/utils/logger";

/**
 * واجهة إعدادات الوكيل
 *
 * @description
 * تحدد الهيكل الأساسي لإعدادات كل وكيل في النظام.
 * السبب: توحيد معايير الإعدادات عبر جميع الوكلاء لضمان
 * التوافق والقابلية للتوسع في المستقبل.
 *
 * @example
 * ```typescript
 * const config: AgentConfig = {
 *   name: "محلل الشخصيات",
 *   taskType: TaskType.CHARACTER_ANALYSIS,
 *   confidenceFloor: 0.75,
 *   supportsRAG: true,
 *   supportsSelfCritique: true,
 *   supportsConstitutional: true,
 *   supportsUncertainty: true,
 *   supportsHallucination: true,
 *   supportsDebate: true
 * };
 * ```
 */
export interface AgentConfig {
  /**
   * اسم الوكيل المعرّف
   * السبب: يُستخدم للتتبع والتسجيل في سجلات النظام
   */
  name: string;

  /**
   * نوع المهمة التي يتخصص فيها الوكيل
   * السبب: يحدد دور الوكيل في سلسلة المعالجة ويُمكّن التوجيه الصحيح
   */
  taskType: TaskType;

  /**
   * الحد الأدنى المقبول لدرجة الثقة (0-1)
   * السبب: يحدد متى تُعتبر النتيجة موثوقة بما يكفي للقبول
   */
  confidenceFloor: number;

  /**
   * هل يدعم الوكيل تقنية RAG (الاسترجاع المعزز للتوليد)
   * السبب: RAG يحسّن جودة الإخراج باستخدام سياق إضافي من النص
   */
  supportsRAG: boolean;

  /**
   * هل يدعم الوكيل النقد الذاتي
   * السبب: النقد الذاتي يُمكّن تحسين الإخراج عبر دورات متعددة
   */
  supportsSelfCritique: boolean;

  /**
   * هل يدعم الوكيل التحقق من القواعد الدستورية
   * السبب: يضمن الالتزام بالمبادئ الأخلاقية والجودة
   */
  supportsConstitutional: boolean;

  /**
   * هل يدعم الوكيل قياس عدم اليقين
   * السبب: يوفر شفافية حول مدى ثقة النموذج في إجاباته
   */
  supportsUncertainty: boolean;

  /**
   * هل يدعم الوكيل كشف الهلوسة
   * السبب: يمنع الادعاءات غير المدعومة ويحافظ على الدقة
   */
  supportsHallucination: boolean;

  /**
   * هل يدعم الوكيل المناظرة متعددة الوكلاء
   * السبب: المناظرة تُحسّن النتائج عبر آراء متعددة متضاربة
   */
  supportsDebate: boolean;
}

/**
 * الفئة الأساسية للوكيل (BaseAgent)
 *
 * @description
 * السبب وراء هذا التصميم:
 * - توحيد نمط التنفيذ عبر جميع الـ 27 وكيل في النظام
 * - تطبيق سلسلة المعالجة القياسية تلقائياً
 * - ضمان جودة ثابتة ومتسقة في الإخراج
 *
 * سلسلة المعالجة:
 * RAG → Self-Critique → Constitutional → Uncertainty → Hallucination → Debate
 *
 * كل وكيل فرعي يجب أن:
 * 1. يرث من BaseAgent
 * 2. يُنفذ دالة buildPrompt() المجردة
 * 3. اختيارياً: يتجاوز postProcess() للمعالجة الخاصة
 * 4. اختيارياً: يتجاوز getFallbackResponse() للاستجابة الاحتياطية
 *
 * @example
 * ```typescript
 * // إنشاء وكيل جديد
 * class MyAnalyzerAgent extends BaseAgent {
 *   constructor() {
 *     super(
 *       "MyAnalyzer AI",
 *       TaskType.ANALYSIS,
 *       "أنت محلل متخصص..."
 *     );
 *     this.confidenceFloor = 0.8;
 *   }
 *
 *   protected buildPrompt(input: StandardAgentInput): string {
 *     return `حلل النص التالي: ${input.input}`;
 *   }
 * }
 *
 * // استخدام الوكيل
 * const agent = new MyAnalyzerAgent();
 * const result = await agent.executeTask({
 *   input: "نص للتحليل",
 *   context: { projectName: "مشروعي" }
 * });
 * ```
 *
 * @abstract
 */
export abstract class BaseAgent {
  /**
   * اسم الوكيل المعرّف
   * السبب: يُستخدم في التسجيل والتتبع وعرض الواجهة
   */
  protected name: string;

  /**
   * نوع المهمة التي يتخصص فيها الوكيل
   * السبب: يحدد كيفية تسجيل الوكيل في الـ Registry
   */
  protected taskType: TaskType;

  /**
   * تعليمات النظام الأساسية للوكيل
   * السبب: تحدد شخصية الوكيل وسلوكه وتخصصه
   */
  protected systemPrompt: string;

  /**
   * الحد الأدنى المقبول لدرجة الثقة (0-1)
   * السبب: النتائج أقل من هذا الحد قد تُرفض أو تُحال للمناظرة
   */
  protected confidenceFloor: number = 0.7;

  /**
   * منشئ الفئة الأساسية للوكيل
   *
   * @description
   * السبب: يُهيئ الوكيل بالإعدادات الأساسية المطلوبة للتشغيل.
   * كل وكيل فرعي يجب أن يستدعي super() مع هذه المعاملات.
   *
   * @param name - اسم الوكيل المعرّف (مثل: "CharacterDeepAnalyzer AI")
   * @param taskType - نوع المهمة من TaskType enum
   * @param systemPrompt - تعليمات النظام التي تحدد شخصية وسلوك الوكيل
   */
  constructor(name: string, taskType: TaskType, systemPrompt: string) {
    this.name = name;
    this.taskType = taskType;
    this.systemPrompt = systemPrompt;
  }

  /**
   * تنفيذ المهمة باستخدام النمط القياسي للوكيل
   *
   * @description
   * السبب وراء هذا التصميم:
   * - ضمان مرور كل طلب عبر سلسلة المعالجة الكاملة
   * - توفير معالجة أخطاء موحدة واستجابات احتياطية
   * - تسجيل جميع العمليات للتتبع والتحليل
   *
   * مراحل التنفيذ:
   * 1. بناء النص من buildPrompt()
   * 2. تطبيق سلسلة المعالجة القياسية
   * 3. تطبيق المعالجة اللاحقة من postProcess()
   * 4. إرجاع النتيجة أو الاستجابة الاحتياطية عند الفشل
   *
   * @param input - مدخلات تشمل النص والخيارات والسياق
   * @returns وعد بنتيجة التنفيذ: { text, confidence, notes, metadata }
   *
   * @example
   * ```typescript
   * const result = await agent.executeTask({
   *   input: "نص السيناريو للتحليل",
   *   context: { projectName: "فيلمي", genre: "drama" },
   *   options: { temperature: 0.7 }
   * });
   * console.log(result.text); // التحليل النصي
   * console.log(result.confidence); // 0.85
   * ```
   */
  async executeTask(input: StandardAgentInput): Promise<StandardAgentOutput> {
    logger.info(`بدء تنفيذ المهمة`, { agentName: this.name, taskType: this.taskType });

    try {
      // بناء النص الأساسي من المدخلات
      const basePrompt = this.buildPrompt(input);

      // دمج الخيارات مع القيم الافتراضية للوكيل
      const options: StandardAgentOptions = {
        temperature: input.options?.temperature ?? 0.7,
        maxTokens: input.options?.maxTokens ?? 48192,
        timeout: input.options?.timeout ?? 30000,
        retries: input.options?.retries ?? 2,
        enableCaching: input.options?.enableCaching ?? true,
        enableLogging: input.options?.enableLogging ?? true,
      };

      // تنفيذ النمط القياسي
      const result = await executeStandardAgentPattern(basePrompt, options, {
        ...(typeof input.context === "object" ? input.context : {}),
        taskType: this.taskType,
        agentName: this.name,
        systemPrompt: this.systemPrompt,
      });

      // تطبيق المعالجة اللاحقة الخاصة بالوكيل
      const processedResult = await this.postProcess(result);

      // تسجيل الإكمال
      logger.info(`اكتمل تنفيذ المهمة`, {
        agentName: this.name,
        confidence: processedResult.confidence,
      });

      return processedResult;
    } catch (error) {
      // تسجيل الخطأ بشكل آمن
      logger.error(`فشل في تنفيذ المهمة`, {
        agentName: this.name,
        error: error instanceof Error ? error.message : "خطأ غير معروف",
      });

      // إرجاع نتيجة احتياطية - نص بسيط مع ثقة منخفضة
      return {
        text: await this.getFallbackResponse(input),
        confidence: 0.3,
        notes: [
          `خطأ في التنفيذ: ${error instanceof Error ? error.message : "خطأ غير معروف"}`,
        ],
        metadata: {
          ragUsed: false,
          critiqueIterations: 0,
          constitutionalViolations: 0,
          uncertaintyScore: 1.0,
          hallucinationDetected: false,
          debateRounds: 0,
        },
      };
    }
  }

  /**
   * بناء النص من المدخلات
   *
   * @description
   * السبب: هذه الدالة المجردة تُجبر كل وكيل فرعي على تحديد
   * كيفية تحويل المدخلات إلى نص (prompt) يُرسل للنموذج.
   *
   * يجب أن تُراعي:
   * - تنسيق المدخلات بشكل مناسب لتخصص الوكيل
   * - إضافة التعليمات الخاصة بنوع التحليل
   * - استخراج المعلومات ذات الصلة من السياق
   *
   * @param input - مدخلات الوكيل تشمل النص والسياق
   * @returns النص المُبنى للإرسال إلى النموذج
   *
   * @example
   * ```typescript
   * protected buildPrompt(input: StandardAgentInput): string {
   *   const { input: userInput, context } = input;
   *   const projectName = context?.projectName || "المشروع";
   *   return `
   *     ## مهمة التحليل: ${projectName}
   *     ${userInput}
   *     ## المطلوب:
   *     - تحليل شامل للنص
   *   `;
   * }
   * ```
   */
  protected abstract buildPrompt(input: StandardAgentInput): string;

  /**
   * المعالجة اللاحقة للنتيجة
   *
   * @description
   * السبب: تُتيح للوكلاء الفرعية تخصيص النتيجة بعد سلسلة المعالجة.
   *
   * استخدامات شائعة:
   * - إضافة معلومات meta خاصة بنوع التحليل
   * - تنسيق النص بطريقة محددة
   * - تصفية أو إثراء النتيجة
   *
   * @param output - نتيجة المعالجة الأولية من سلسلة التنفيذ
   * @returns النتيجة بعد التخصيص (أو نفس النتيجة إذا لم يُتجاوز)
   *
   * @example
   * ```typescript
   * protected async postProcess(
   *   output: StandardAgentOutput
   * ): Promise<StandardAgentOutput> {
   *   return {
   *     ...output,
   *     metadata: {
   *       ...output.metadata,
   *       specialAnalysis: "تحليل خاص"
   *     }
   *   };
   * }
   * ```
   */
  protected async postProcess(
    output: StandardAgentOutput
  ): Promise<StandardAgentOutput> {
    // افتراضي: لا توجد معالجة لاحقة
    return output;
  }

  /**
   * توليد استجابة احتياطية عند فشل التنفيذ
   *
   * @description
   * السبب: ضمان تجربة مستخدم أفضل حتى في حالة الفشل.
   * بدلاً من إرجاع خطأ فارغ، يُقدم استجابة مفيدة قدر الإمكان.
   *
   * السلوك الافتراضي:
   * - يحاول توليد إجابة بسيطة باستخدام تعليمات النظام فقط
   * - يستخدم درجة حرارة منخفضة للاستقرار
   * - يُرجع رسالة عذر واضحة إذا فشل ذلك أيضاً
   *
   * @param input - مدخلات الوكيل الأصلية للسياق
   * @returns نص الاستجابة الاحتياطية
   *
   * @example
   * ```typescript
   * protected async getFallbackResponse(
   *   input: StandardAgentInput
   * ): Promise<string> {
   *   return `
   *     # تنبيه: استجابة احتياطية
   *     لم نتمكن من إجراء التحليل الكامل.
   *     يرجى التحقق من المدخلات والمحاولة مرة أخرى.
   *   `;
   * }
   * ```
   */
  protected async getFallbackResponse(
    input: StandardAgentInput
  ): Promise<string> {
    try {
      // محاولة التوليد البسيط باستخدام تعليمات النظام فقط
      const fallbackPrompt = `${this.systemPrompt}\n\nالمهمة: ${input.input}\n\nقدم إجابة مختصرة ومباشرة.`;

      const response = await geminiService.generateContent(fallbackPrompt, {
        temperature: 0.5,
        maxTokens: 4096,
      });

      return response || "عذراً، لم أتمكن من إكمال المهمة المطلوبة.";
    } catch {
      return "عذراً، حدث خطأ في معالجة الطلب. يرجى المحاولة مرة أخرى.";
    }
  }

  /**
   * الحصول على إعدادات الوكيل
   *
   * @description
   * السبب: يُمكّن الـ Orchestrator والـ Registry من التعرف على
   * قدرات الوكيل واتخاذ قرارات التوجيه المناسبة.
   *
   * يُرجع جميع الإعدادات والقدرات المدعومة لاستخدامها في:
   * - تسجيل الوكيل في النظام
   * - عرض معلومات الوكيل في الواجهة
   * - تحديد ما إذا كان الوكيل مناسباً لمهمة معينة
   *
   * @returns كائن إعدادات الوكيل الكامل
   */
  getConfig(): AgentConfig {
    return {
      name: this.name,
      taskType: this.taskType,
      confidenceFloor: this.confidenceFloor,
      supportsRAG: true,
      supportsSelfCritique: true,
      supportsConstitutional: true,
      supportsUncertainty: true,
      supportsHallucination: true,
      supportsDebate: true,
    };
  }

  /**
   * تعيين الحد الأدنى للثقة
   *
   * @description
   * السبب: يُتيح ضبط حساسية الوكيل ديناميكياً.
   * حد أعلى = نتائج أكثر موثوقية لكن قد تُرفض المزيد من الاستجابات.
   * حد أدنى = قبول المزيد من النتائج لكن قد تقل الجودة.
   *
   * @param threshold - قيمة الحد الأدنى للثقة (يُقيّد تلقائياً بين 0 و 1)
   */
  setConfidenceFloor(threshold: number): void {
    this.confidenceFloor = Math.max(0, Math.min(1, threshold));
  }
}
