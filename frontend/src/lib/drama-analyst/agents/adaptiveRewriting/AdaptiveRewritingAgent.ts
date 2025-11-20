import { TaskType } from "@core/types";
import { BaseAgent } from "../shared/BaseAgent";
import {
  StandardAgentInput,
  StandardAgentOutput,
} from "../shared/standardAgentPattern";
import { ADAPTIVE_REWRITING_AGENT_CONFIG } from "./agent";
import { safeCountMultipleTerms } from "@/lib/security/safe-regexp";

interface AdaptiveRewritingContext {
  originalText?: string;
  analysisReport?: any;
  rewritingGoals?: string[];
  targetAudience?: string;
  targetTone?: string;
  targetLength?: string; // 'shorter', 'same', 'longer'
  preserveElements?: string[];
  improvementFocus?: string[]; // ['pacing', 'dialogue', 'description', 'clarity', 'impact']
  styleGuide?: string;
  constraints?: string[];
}

/**
 * Adaptive Rewriting Agent - وكيل إعادة الكتابة التكيفية
 * يطبق النمط القياسي: RAG → Self-Critique → Constitutional → Uncertainty → Hallucination → Debate
 * إخراج نصي فقط - لا JSON
 */
export class AdaptiveRewritingAgent extends BaseAgent {
  constructor() {
    super(
      "RewriteMaster AI",
      TaskType.ADAPTIVE_REWRITING,
      ADAPTIVE_REWRITING_AGENT_CONFIG.systemPrompt || ""
    );

    this.confidenceFloor = 0.8;
  }

  protected buildPrompt(input: StandardAgentInput): string {
    const { input: taskInput, context } = input;
    const ctx = context as AdaptiveRewritingContext;

    const originalText = ctx?.originalText || "";
    const rewritingGoals = ctx?.rewritingGoals || [];
    const targetAudience = ctx?.targetAudience || "عام";
    const targetTone = ctx?.targetTone || "";
    const targetLength = ctx?.targetLength || "same";
    const preserveElements = ctx?.preserveElements || [];
    const improvementFocus = ctx?.improvementFocus || ["pacing", "clarity"];
    const styleGuide = ctx?.styleGuide || "";
    const constraints = ctx?.constraints || [];

    let prompt = `مهمة إعادة الكتابة التكيفية والتحسين\n\n`;

    if (originalText) {
      prompt += `النص الأصلي المراد إعادة كتابته:\n${originalText.substring(0, 3000)}...\n\n`;
    }

    prompt += `معايير إعادة الكتابة:\n`;
    if (rewritingGoals.length > 0) {
      prompt += `أهداف إعادة الكتابة:\n`;
      rewritingGoals.forEach((goal, idx) => {
        prompt += `${idx + 1}. ${goal}\n`;
      });
      prompt += "\n";
    }

    prompt += `- الجمهور المستهدف: ${targetAudience}\n`;
    if (targetTone) prompt += `- النبرة المستهدفة: ${targetTone}\n`;
    prompt += `- الطول المستهدف: ${this.translateLength(targetLength)}\n`;

    if (improvementFocus.length > 0) {
      prompt += `- مجالات التحسين: ${improvementFocus.map(this.translateFocus).join("، ")}\n`;
    }

    if (preserveElements.length > 0) {
      prompt += `\nعناصر يجب الحفاظ عليها:\n`;
      preserveElements.forEach((elem, idx) => {
        prompt += `${idx + 1}. ${elem}\n`;
      });
      prompt += "\n";
    }

    if (styleGuide) {
      prompt += `دليل الأسلوب:\n${styleGuide}\n\n`;
    }

    if (constraints.length > 0) {
      prompt += `القيود والمحددات:\n`;
      constraints.forEach((constraint, idx) => {
        prompt += `${idx + 1}. ${constraint}\n`;
      });
      prompt += "\n";
    }

    prompt += `المهمة المطلوبة:\n${taskInput}\n\n`;

    prompt += `التعليمات:

1. **التحليل الأولي** (2-3 جمل):
   - حدد نقاط القوة في النص الأصلي
   - حدد المجالات التي تحتاج تحسين
   - لخص الاستراتيجية العامة لإعادة الكتابة

2. **النص المُعاد كتابته**:
   اكتب النص الجديد كاملاً مع مراعاة:
   - تحقيق الأهداف المحددة
   - الحفاظ على العناصر المطلوبة
   - تحسين مجالات التركيز
   - الالتزام بالطول المستهدف
   - مناسبة الجمهور المستهدف

3. **ملاحظات التحسين**:
   اشرح بإيجاز التغييرات الرئيسية وأسبابها:
   - ما الذي تم تحسينه وكيف
   - لماذا تخدم هذه التغييرات الأهداف
   - ما الذي تم الحفاظ عليه من النص الأصلي

4. **مقارنة سريعة**:
   - قبل/بعد لمقطع رئيسي (اختياري)
   - التأثير المتوقع للتغييرات

اكتب النص المُعاد كتابته بشكل كامل ومباشر.
لا تستخدم JSON أو علامات برمجية.
قدم نصاً أدبياً صافياً جاهزاً للاستخدام.`;

    return prompt;
  }

  protected override async postProcess(
    output: StandardAgentOutput
  ): Promise<StandardAgentOutput> {
    let processedText = this.cleanupRewrittenText(output.text);

    const goalAchievement = await this.assessGoalAchievement(processedText);
    const qualityImprovement =
      await this.assessQualityImprovement(processedText);
    const coherence = await this.assessCoherence(processedText);
    const creativity = await this.assessCreativity(processedText);

    const qualityScore =
      goalAchievement * 0.35 +
      qualityImprovement * 0.3 +
      coherence * 0.2 +
      creativity * 0.15;

    const adjustedConfidence = output.confidence * 0.5 + qualityScore * 0.5;

    return {
      ...output,
      text: processedText,
      confidence: adjustedConfidence,
      notes: this.generateRewritingNotes(
        output,
        goalAchievement,
        qualityImprovement,
        coherence,
        creativity
      ),
      metadata: {
        ...output.metadata,
        rewritingQuality: {
          overall: qualityScore,
          goalAchievement,
          qualityImprovement,
          coherence,
          creativity,
        },
        rewrittenLength: processedText.length,
        improvementsApplied: this.countImprovements(processedText),
      } as any,
    };
  }

  private cleanupRewrittenText(text: string): string {
    text = text.replace(/```json[\s\S]*?```/g, "");
    text = text.replace(/```[\s\S]*?```/g, "");
    text = text.replace(/\{[\s\S]*?\}/g, (match) => {
      if (match.includes('"') && match.includes(":")) return "";
      return match;
    });

    return text.replace(/\n{3,}/g, "\n\n").trim();
  }

  private async assessGoalAchievement(text: string): Promise<number> {
    let score = 0.6;

    const achievementTerms = [
      "تم تحسين",
      "تم تطوير",
      "الآن",
      "بشكل أفضل",
      "أوضح",
      "أقوى",
      "أكثر",
    ];
    // SECURITY FIX: Use safe RegExp utility to prevent injection
    const termCount = safeCountMultipleTerms(text, achievementTerms);
    score += Math.min(0.25, termCount * 0.03);

    if (text.length > 500) score += 0.15;

    return Math.min(1, score);
  }

  private async assessQualityImprovement(text: string): Promise<number> {
    let score = 0.6;

    const qualityIndicators = [
      "دقة",
      "وضوح",
      "تماسك",
      "قوة",
      "فعالية",
      "جودة",
      "تحسن",
    ];
    // SECURITY FIX: Use safe RegExp utility to prevent injection
    const qualityCount = safeCountMultipleTerms(text, qualityIndicators);
    score += Math.min(0.25, qualityCount * 0.04);

    const hasExplanation = text.includes("التحسين") || text.includes("التغيير");
    if (hasExplanation) score += 0.15;

    return Math.min(1, score);
  }

  private async assessCoherence(text: string): Promise<number> {
    let score = 0.7;

    const connectiveWords = [
      "ثم",
      "بعد",
      "لذلك",
      "وهكذا",
      "بالإضافة",
      "كما",
      "أيضاً",
    ];
    // SECURITY FIX: Use safe RegExp utility to prevent injection
    const connectiveCount = safeCountMultipleTerms(text, connectiveWords);
    score += Math.min(0.2, connectiveCount * 0.03);

    const paragraphs = text.split("\n\n").filter((p) => p.trim().length > 50);
    if (paragraphs.length >= 2) score += 0.1;

    return Math.min(1, score);
  }

  private async assessCreativity(text: string): Promise<number> {
    let score = 0.5;

    const creativeWords = ["مبتكر", "جديد", "فريد", "مميز", "إبداعي", "أصيل"];
    // SECURITY FIX: Use safe RegExp utility to prevent injection
    const creativeCount = safeCountMultipleTerms(text, creativeWords);
    score += Math.min(0.3, creativeCount * 0.1);

    const hasVariety = text.includes("بينما") || text.includes("من جهة أخرى");
    if (hasVariety) score += 0.2;

    return Math.min(1, score);
  }

  private countImprovements(text: string): number {
    const improvementMarkers = text.match(
      /تحسين|تطوير|إضافة|تعديل|تعزيز|تقوية/gi
    );
    return improvementMarkers ? Math.min(improvementMarkers.length, 10) : 0;
  }

  private generateRewritingNotes(
    output: StandardAgentOutput,
    goalAchievement: number,
    qualityImprovement: number,
    coherence: number,
    creativity: number
  ): string[] {
    const notesList: string[] = [];

    const avg =
      (goalAchievement + qualityImprovement + coherence + creativity) / 4;
    if (avg > 0.8) notesList.push("إعادة كتابة ممتازة");
    else if (avg > 0.65) notesList.push("إعادة كتابة جيدة");
    else notesList.push("تحتاج مزيد من التحسين");

    if (goalAchievement > 0.8) notesList.push("الأهداف محققة");
    if (qualityImprovement > 0.8) notesList.push("تحسين واضح");
    if (coherence > 0.8) notesList.push("تماسك ممتاز");
    if (creativity > 0.7) notesList.push("إبداع جيد");

    if (goalAchievement < 0.6) notesList.push("الأهداف غير محققة بالكامل");
    if (qualityImprovement < 0.5) notesList.push("التحسين محدود");

    if (output.notes) notesList.push(...output.notes);

    return notesList;
  }

  private translateLength(length: string): string {
    const lengths: Record<string, string> = {
      shorter: "أقصر من الأصل",
      same: "نفس الطول تقريباً",
      longer: "أطول من الأصل",
      double: "ضعف الطول",
      half: "نصف الطول",
    };
    return lengths[length] || length;
  }

  private translateFocus(focus: string): string {
    const focuses: Record<string, string> = {
      pacing: "الإيقاع",
      dialogue: "الحوار",
      description: "الوصف",
      clarity: "الوضوح",
      impact: "التأثير",
      characterization: "رسم الشخصيات",
      atmosphere: "الأجواء",
      tension: "التوتر",
    };
    return focuses[focus] || focus;
  }

  protected override async getFallbackResponse(
    input: StandardAgentInput
  ): Promise<string> {
    return `التحليل الأولي:
النص الأصلي يحتوي على عناصر قوية يمكن البناء عليها، مع مجالات تحتاج تحسين في الوضوح والإيقاع.

النص المُعاد كتابته:
[هنا يجب أن يكون النص المُعاد كتابته بالكامل - حالياً غير متاح بسبب خطأ مؤقت]

ملاحظات التحسين:
- تم تحسين الوضوح من خلال إعادة صياغة الجمل المعقدة
- تم تعزيز الإيقاع بتنويع طول الجمل والفقرات
- تم الحفاظ على الصوت الأصلي والعناصر المطلوبة

ملاحظة: يُرجى تفعيل الخيارات المتقدمة وتوفير أهداف محددة وواضحة لإعادة الكتابة للحصول على نص محسّن بشكل أفضل يحقق الأهداف المطلوبة.`;
  }
}

export const adaptiveRewritingAgent = new AdaptiveRewritingAgent();
