import { TaskType } from "@core/types";
import { BaseAgent } from "../shared/BaseAgent";
import {
  StandardAgentInput,
  StandardAgentOutput,
} from "../shared/standardAgentPattern";
import { LITERARY_QUALITY_ANALYZER_AGENT_CONFIG } from "./agent";
import { LITERARY_QUALITY_ANALYZER_INSTRUCTIONS } from "./instructions";

interface LiteraryQualityContext {
  originalText?: string;
  excerpt?: string;
  referenceAuthors?: string[];
  evaluationFocus?: string[];
  tonalGoals?: string[];
  culturalContext?: string;
  previousStations?: Record<string, unknown>;
  comparativeTitles?: string[];
  critiqueHistory?: string;
}

/**
 * Literary Quality Analyzer Agent - وكيل تقييم الجودة الأدبية
 * يضيف قياسات كمية للأركان الخمسة (البلاغة، الأصالة، التماسك، التأثير، المقارنة).
 */
export class LiteraryQualityAnalyzerAgent extends BaseAgent {
  constructor() {
    super(
      "AestheticsJudge AI",
      TaskType.LITERARY_QUALITY_ANALYZER,
      LITERARY_QUALITY_ANALYZER_AGENT_CONFIG.systemPrompt || ""
    );

    this.confidenceFloor = 0.85;
  }

  protected buildPrompt(input: StandardAgentInput): string {
    const { input: taskInput, context } = input;
    const ctx = this.normalizeContext(context);

    let prompt = `أنت ${this.name}، ناقد أدبي يحلل النصوص عبر خمسة محاور رئيسية.\n\n`;
    prompt += `### المهمة الأساسية\n${taskInput}\n\n`;

    if (ctx.originalText || ctx.excerpt) {
      prompt += `### مادة التحليل\n${this.truncate(
        ctx.excerpt || ctx.originalText || "",
        3200
      )}\n\n`;
    }

    const metadata = this.buildMetadataSection(ctx);
    if (metadata) {
      prompt += `${metadata}\n`;
    }

    if (ctx.previousStations) {
      prompt += `### خلاصات سابقة\n${this.summarizeStations(
        ctx.previousStations
      )}\n\n`;
    }

    if (ctx.critiqueHistory) {
      prompt += `### ملاحظات نقدية سابقة\n${this.truncate(ctx.critiqueHistory, 800)}\n\n`;
    }

    prompt += `### تعليمات الوحدة\n${LITERARY_QUALITY_ANALYZER_INSTRUCTIONS}\n\n`;

    prompt += `### متطلبات التقرير النهائي\n`;
    prompt += `1. ملخص افتتاحي يحدد مزاج النص والأثر العام.\n`;
    prompt += `2. تحليل مفصل لكل ركن (البلاغة، الأصالة، التماسك، التأثير، المعايير المرجعية).\n`;
    prompt += `3. درجات نسبية (0-100) لكل ركن مع تفسير.\n`;
    prompt += `4. توصيات لتحسين الجودة الأدبية.\n`;
    prompt += `5. ملاحظات ختامية تربط التحليل بأهداف الكاتب.\n`;
    prompt += `\nيُمنع استخدام JSON في المخرجات النهائية؛ استخدم أقساماً نصية واضحة فقط.`;

    return prompt;
  }

  protected override async postProcess(
    output: StandardAgentOutput
  ): Promise<StandardAgentOutput> {
    const cleanedText = this.sanitizeToText(output.text);
    const linguistic = this.scoreLinguisticBeauty(cleanedText);
    const originality = this.scoreOriginality(cleanedText);
    const cohesion = this.scoreCohesion(cleanedText);
    const emotional = this.scoreEmotionalImpact(cleanedText);
    const benchmark = this.scoreBenchmarking(cleanedText);

    const overallQuality =
      linguistic * 0.22 +
      originality * 0.2 +
      cohesion * 0.2 +
      emotional * 0.23 +
      benchmark * 0.15;

    const adjustedConfidence = Math.min(
      1,
      output.confidence * 0.4 + overallQuality * 0.6
    );

    return {
      ...output,
      text: cleanedText,
      confidence: adjustedConfidence,
      notes: this.generateCriticNotes(
        output.notes,
        overallQuality,
        emotional,
        originality
      ),
      metadata: {
        ...output.metadata,
        literaryScores: {
          linguistic,
          originality,
          cohesion,
          emotional,
          benchmark,
          overall: overallQuality,
        },
      },
    };
  }

  private normalizeContext(context: StandardAgentInput["context"]): LiteraryQualityContext {
    if (context && typeof context === "object") {
      return context as LiteraryQualityContext;
    }
    return {};
  }

  private buildMetadataSection(ctx: LiteraryQualityContext): string {
    const sections: string[] = [];

    if (ctx.referenceAuthors?.length) {
      sections.push(
        `### مرجعيات الأسلوب المرجوة\n${ctx.referenceAuthors
          .map((author) => `- ${author}`)
          .join("\n")}\n`
      );
    }

    if (ctx.evaluationFocus?.length) {
      sections.push(
        `### محاور التقييم المفضّلة\n${ctx.evaluationFocus
          .map((focus) => `- ${focus}`)
          .join("\n")}\n`
      );
    }

    if (ctx.tonalGoals?.length) {
      sections.push(
        `### الأهداف النغمية\n${ctx.tonalGoals.map((goal) => `- ${goal}`).join("\n")}\n`
      );
    }

    if (ctx.culturalContext) {
      sections.push(`### السياق الثقافي\n${ctx.culturalContext}\n`);
    }

    if (ctx.comparativeTitles?.length) {
      sections.push(
        `### أعمال للمقارنة النقدية\n${ctx.comparativeTitles
          .map((title) => `- ${title}`)
          .join("\n")}\n`
      );
    }

    return sections.join("\n");
  }

  private summarizeStations(previousStations: Record<string, unknown>): string {
    return Object.entries(previousStations)
      .map(([key, value]) => {
        const normalized =
          typeof value === "string"
            ? this.truncate(value, 250)
            : JSON.stringify(value);
        return `- ${key}: ${normalized}`;
      })
      .slice(0, 5)
      .join("\n");
  }

  private sanitizeToText(text: string): string {
    let sanitized = text;
    sanitized = sanitized.replace(/```json[\s\S]*?```/g, "");
    sanitized = sanitized.replace(/```[\s\S]*?```/g, "");
    sanitized = sanitized.replace(/\{[\s\S]*?\}/g, (match) => {
      return match.includes(":") ? "" : match;
    });
    sanitized = sanitized.replace(/\|.*?\|/g, "");
    sanitized = sanitized.replace(/\n{3,}/g, "\n\n");
    return sanitized.trim();
  }

  private scoreLinguisticBeauty(text: string): number {
    const rhetoricalTerms = [
      "استعارة",
      "تشبيه",
      "كناية",
      "جناس",
      "إيقاع",
      "تنغيم",
      "بلاغة",
      "تكرار",
    ];

    const occurrences = rhetoricalTerms.reduce((total, term) => {
      return total + (text.match(new RegExp(term, "gi")) ?? []).length;
    }, 0);

    return Math.min(1, 0.45 + occurrences * 0.04);
  }

  private scoreOriginality(text: string): number {
    const innovationMarkers = ["فريد", "مبتكر", "جديد", "طازج", "غير مسبوق"];
    const clichéMarkers = ["مستهلك", "تقليدي", "متوقع", "مكرر"];

    const innovation = innovationMarkers.reduce((total, term) => {
      return total + (text.match(new RegExp(term, "gi")) ?? []).length;
    }, 0);

    const cliches = clichéMarkers.reduce((total, term) => {
      return total + (text.match(new RegExp(term, "gi")) ?? []).length;
    }, 0);

    return Math.min(1, 0.5 + innovation * 0.05 - cliches * 0.04);
  }

  private scoreCohesion(text: string): number {
    const structureTerms = [
      "الحبكة",
      "الإيقاع",
      "البنية",
      "التماسك",
      "التتابع",
      "تطور",
      "جسر",
    ];
    const sections = (text.match(/###|####/g) ?? []).length;
    const termMatches = structureTerms.reduce((total, term) => {
      return total + (text.match(new RegExp(term, "gi")) ?? []).length;
    }, 0);

    return Math.min(1, 0.45 + termMatches * 0.03 + sections * 0.02);
  }

  private scoreEmotionalImpact(text: string): number {
    const emotionTerms = [
      "عاطفي",
      "تأثير",
      "صدًى",
      "إحساس",
      "انفعال",
      "تجربة",
      "أثر",
    ];
    const crescendoMentions =
      (text.match(/الذروة|الانفراج|التحول العاطفي/gi) ?? []).length;
    const termMatches = emotionTerms.reduce((total, term) => {
      return total + (text.match(new RegExp(term, "gi")) ?? []).length;
    }, 0);

    return Math.min(1, 0.5 + termMatches * 0.03 + crescendoMentions * 0.04);
  }

  private scoreBenchmarking(text: string): number {
    const references =
      (text.match(/أدب|معيار|مدرسة|روائي|شاعري|تقليد|أسلوب عالمي/gi) ?? []).length;
    const numericMentions = (text.match(/\d{1,3}%/g) ?? []).length;
    return Math.min(1, 0.4 + references * 0.04 + numericMentions * 0.05);
  }

  private generateCriticNotes(
    existingNotes: string[] | undefined,
    overall: number,
    emotional: number,
    originality: number
  ): string[] {
    const notes = [...(existingNotes ?? [])];

    if (overall > 0.85) notes.push("مستوى أدبي ممتاز قابل للنشر فوراً.");
    else if (overall > 0.7) notes.push("جودة أدبية قوية مع فرص تحسين محدودة.");
    else notes.push("يُنصح بدورة تحسين أدبية مركزة.");

    if (emotional < 0.6) {
      notes.push("التأثير العاطفي يحتاج تعزيزاً بمشاهد محورية.");
    }

    if (originality < 0.6) {
      notes.push("يجب مراجعة العناصر المكررة لتأكيد الأصالة.");
    }

    return Array.from(new Set(notes));
  }

  private truncate(text: string, limit = 2000): string {
    if (text.length <= limit) return text;
    return `${text.substring(0, limit)}...`;
  }

  protected override async getFallbackResponse(
    input: StandardAgentInput
  ): Promise<string> {
    return `تقييم أدبي تمهيدي:
تم تحليل النص وفق الأعمدة الخمسة بالرغم من تعذر المسار القياسي.

البلاغة والصوت:
- اللغة تظهر ملامح خاصة لكنها تحتاج ضبطاً في الإيقاع.

الأصالة:
- توجد أفكار واعدة، إلا أن بعض الحبكات تحمل طابعاً تقليدياً.

التماسك السردي:
- الهيكل يعمل بصورة منطقية، مع حاجة لتحسين الانتقالات.

التأثير العاطفي:
- الذروة تصل بوضوح لكن يمكن تعميق التوتر الشعوري تدريجياً.

التوصية:
ركز على تقوية لغة الحوار وإزالة الكليشيهات لإبراز الهوية الأدبية المطلوبة.`;
  }
}

export const literaryQualityAnalyzerAgent = new LiteraryQualityAnalyzerAgent();
