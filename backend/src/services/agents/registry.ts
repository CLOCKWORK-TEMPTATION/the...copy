/**
 * سجل الوكلاء (Agent Registry)
 *
 * @description
 * السبب وراء هذا التصميم:
 * - توفير نقطة مركزية لتسجيل وإدارة جميع الوكلاء
 * - تسهيل الوصول للوكلاء عبر نوع المهمة
 * - ضمان تسجيل كل وكيل مرة واحدة فقط (Singleton)
 *
 * يحتوي على 27 وكيل موزعين على الفئات التالية:
 * - Core Agents (4): الوكلاء الأساسيين
 * - Analysis Agents (6): وكلاء التحليل
 * - Creative Agents (4): وكلاء الإبداع
 * - Predictive Agents (4): وكلاء التنبؤ
 * - Advanced Modules (9): الوحدات المتقدمة
 *
 * @module registry
 */

import { TaskType } from './core/enums';
import { BaseAgent } from './shared/BaseAgent';

// ===== Core Agents (4) - الوكلاء الأساسيين =====
import { analysisAgent } from './analysis/AnalysisAgent';
import { creativeAgent } from './creative/CreativeAgent';
import { integratedAgent } from './integrated/IntegratedAgent';
import { completionAgent } from './completion/CompletionAgent';

// ===== Analysis Agents (6) - وكلاء التحليل =====
import { rhythmMappingAgent } from './rhythmMapping/RhythmMappingAgent';
import { characterNetworkAgent } from './characterNetwork/CharacterNetworkAgent';
import { dialogueForensicsAgent } from './dialogueForensics/DialogueForensicsAgent';
import { thematicMiningAgent } from './thematicMining/ThematicMiningAgent';
import { styleFingerprintAgent } from './styleFingerprint/StyleFingerprintAgent';
import { conflictDynamicsAgent } from './conflictDynamics/ConflictDynamicsAgent';

// ===== Creative Agents (4) - وكلاء الإبداع =====
import { adaptiveRewritingAgent } from './adaptiveRewriting/AdaptiveRewritingAgent';
import { sceneGeneratorAgent } from './sceneGenerator/SceneGeneratorAgent';
import { characterVoiceAgent } from './characterVoice/CharacterVoiceAgent';
import { worldBuilderAgent } from './worldBuilder/WorldBuilderAgent';

// ===== Predictive Agents (4) - وكلاء التنبؤ =====
import { plotPredictorAgent } from './plotPredictor/PlotPredictorAgent';
import { tensionOptimizerAgent } from './tensionOptimizer/TensionOptimizerAgent';
import { audienceResonanceAgent } from './audienceResonance/AudienceResonanceAgent';
import { platformAdapterAgent } from './platformAdapter/PlatformAdapterAgent';

// ===== Advanced Modules (9) - الوحدات المتقدمة =====
import { characterDeepAnalyzerAgent } from './characterDeepAnalyzer/CharacterDeepAnalyzerAgent';
import { dialogueAdvancedAnalyzerAgent } from './dialogueAdvancedAnalyzer/DialogueAdvancedAnalyzerAgent';
import { visualCinematicAnalyzerAgent } from './visualCinematicAnalyzer/VisualCinematicAnalyzerAgent';
import { themesMessagesAnalyzerAgent } from './themesMessagesAnalyzer/ThemesMessagesAnalyzerAgent';
import { culturalHistoricalAnalyzerAgent } from './culturalHistoricalAnalyzer/CulturalHistoricalAnalyzerAgent';
import { producibilityAnalyzerAgent } from './producibilityAnalyzer/ProducibilityAnalyzerAgent';
import { targetAudienceAnalyzerAgent } from './targetAudienceAnalyzer/TargetAudienceAnalyzerAgent';
import { literaryQualityAnalyzerAgent } from './literaryQualityAnalyzer/LiteraryQualityAnalyzerAgent';
import { recommendationsGeneratorAgent } from './recommendationsGenerator/RecommendationsGeneratorAgent';

/**
 * فئة سجل الوكلاء
 *
 * @description
 * السبب: تطبيق نمط Singleton لضمان مركزية إدارة الوكلاء
 * وتجنب التكرار أو التضارب في التسجيل
 *
 * @example
 * ```typescript
 * const registry = AgentRegistry.getInstance();
 * const agent = registry.getAgent(TaskType.CHARACTER_DEEP_ANALYZER);
 * if (agent) {
 *   const result = await agent.executeTask(input);
 * }
 * ```
 */
export class AgentRegistry {
  /** النسخة الوحيدة من السجل */
  private static instance: AgentRegistry;
  /** خريطة الوكلاء: نوع المهمة → الوكيل */
  private agents: Map<TaskType, BaseAgent> = new Map();

  private constructor() {
    this.registerAgents();
  }

  /**
   * الحصول على نسخة السجل الوحيدة
   *
   * @description السبب: تطبيق نمط Singleton
   * @returns نسخة السجل
   */
  public static getInstance(): AgentRegistry {
    if (!AgentRegistry.instance) {
      AgentRegistry.instance = new AgentRegistry();
    }
    return AgentRegistry.instance;
  }

  /**
   * تسجيل جميع الوكلاء المتاحين
   *
   * @description
   * السبب: تجميع كل عمليات التسجيل في مكان واحد
   * لسهولة الصيانة وإضافة وكلاء جدد
   */
  private registerAgents(): void {
    // ===== Core Agents (4) - الوكلاء الأساسيين =====
    this.agents.set(TaskType.ANALYSIS, analysisAgent);
    this.agents.set(TaskType.CREATIVE, creativeAgent);
    this.agents.set(TaskType.INTEGRATED, integratedAgent);
    this.agents.set(TaskType.COMPLETION, completionAgent);

    // ===== Analysis Agents (6) - وكلاء التحليل =====
    this.agents.set(TaskType.RHYTHM_MAPPING, rhythmMappingAgent);
    this.agents.set(TaskType.CHARACTER_NETWORK, characterNetworkAgent);
    this.agents.set(TaskType.DIALOGUE_FORENSICS, dialogueForensicsAgent);
    this.agents.set(TaskType.THEMATIC_MINING, thematicMiningAgent);
    this.agents.set(TaskType.STYLE_FINGERPRINT, styleFingerprintAgent);
    this.agents.set(TaskType.CONFLICT_DYNAMICS, conflictDynamicsAgent);

    // ===== Creative Agents (4) - وكلاء الإبداع =====
    this.agents.set(TaskType.ADAPTIVE_REWRITING, adaptiveRewritingAgent);
    this.agents.set(TaskType.SCENE_GENERATOR, sceneGeneratorAgent);
    this.agents.set(TaskType.CHARACTER_VOICE, characterVoiceAgent);
    this.agents.set(TaskType.WORLD_BUILDER, worldBuilderAgent);

    // ===== Predictive Agents (4) - وكلاء التنبؤ =====
    this.agents.set(TaskType.PLOT_PREDICTOR, plotPredictorAgent);
    this.agents.set(TaskType.TENSION_OPTIMIZER, tensionOptimizerAgent);
    this.agents.set(TaskType.AUDIENCE_RESONANCE, audienceResonanceAgent);
    this.agents.set(TaskType.PLATFORM_ADAPTER, platformAdapterAgent);

    // ===== Advanced Modules (9) - الوحدات المتقدمة =====
    this.agents.set(TaskType.CHARACTER_DEEP_ANALYZER, characterDeepAnalyzerAgent);
    this.agents.set(TaskType.DIALOGUE_ADVANCED_ANALYZER, dialogueAdvancedAnalyzerAgent);
    this.agents.set(TaskType.VISUAL_CINEMATIC_ANALYZER, visualCinematicAnalyzerAgent);
    this.agents.set(TaskType.THEMES_MESSAGES_ANALYZER, themesMessagesAnalyzerAgent);
    this.agents.set(TaskType.CULTURAL_HISTORICAL_ANALYZER, culturalHistoricalAnalyzerAgent);
    this.agents.set(TaskType.PRODUCIBILITY_ANALYZER, producibilityAnalyzerAgent);
    this.agents.set(TaskType.TARGET_AUDIENCE_ANALYZER, targetAudienceAnalyzerAgent);
    this.agents.set(TaskType.LITERARY_QUALITY_ANALYZER, literaryQualityAnalyzerAgent);
    this.agents.set(TaskType.RECOMMENDATIONS_GENERATOR, recommendationsGeneratorAgent);
  }

  /**
   * الحصول على وكيل بنوع المهمة
   *
   * @description السبب: نقطة الوصول الرئيسية للوكلاء
   * @param taskType - نوع المهمة
   * @returns الوكيل أو undefined إذا لم يُعثر عليه
   */
  public getAgent(taskType: TaskType): BaseAgent | undefined {
    return this.agents.get(taskType);
  }

  /**
   * الحصول على جميع الوكلاء المسجلين
   *
   * @description السبب: مفيد للعمليات الجماعية مثل المناظرة
   * @returns نسخة من خريطة الوكلاء
   */
  public getAllAgents(): Map<TaskType, BaseAgent> {
    return new Map(this.agents);
  }

  /**
   * التحقق من وجود وكيل لنوع مهمة معين
   *
   * @description السبب: التحقق قبل محاولة الوصول
   * @param taskType - نوع المهمة
   * @returns true إذا وُجد الوكيل
   */
  public hasAgent(taskType: TaskType): boolean {
    return this.agents.has(taskType);
  }

  /**
   * الحصول على قائمة أنواع المهام المتاحة
   *
   * @description السبب: معرفة الخيارات المتاحة للمستخدم
   * @returns مصفوفة أنواع المهام
   */
  public getAvailableTaskTypes(): TaskType[] {
    return Array.from(this.agents.keys());
  }

  /**
   * الحصول على عدد الوكلاء المسجلين
   *
   * @description السبب: إحصائيات ومراقبة صحة النظام
   * @returns عدد الوكلاء
   */
  public getAgentCount(): number {
    return this.agents.size;
  }
}

/**
 * نسخة Singleton للتصدير
 *
 * @description السبب: تسهيل الاستيراد والاستخدام المباشر
 *
 * @example
 * ```typescript
 * import { agentRegistry } from './registry';
 *
 * const agent = agentRegistry.getAgent(TaskType.CHARACTER_DEEP_ANALYZER);
 * ```
 */
export const agentRegistry = AgentRegistry.getInstance();
