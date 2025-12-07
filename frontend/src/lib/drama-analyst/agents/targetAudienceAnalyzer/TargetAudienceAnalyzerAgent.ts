import { TaskType } from "@core/types";
import { BaseAgent } from "../shared/BaseAgent";
import {
  StandardAgentInput,
  StandardAgentOutput,
} from "../shared/standardAgentPattern";
import { TARGET_AUDIENCE_ANALYZER_AGENT_CONFIG } from "./agent";
import { TARGET_AUDIENCE_ANALYZER_INSTRUCTIONS } from "./instructions";

interface TargetAudienceContext {
  originalText?: string;
  logline?: string;
  synopsis?: string;
  format?: string;
  genre?: string;
  releaseWindow?: string;
  marketingGoals?: string[];
  targetMarkets?: string[];
  preferredPlatforms?: string[];
  sensitivityFlags?: string[];
  comparableTitles?: string[];
  previousStations?: Record<string, unknown>;
  audienceResearch?: string;
  brief?: string;
}

/**
 * Target Audience Analyzer Agent - وكيل تحليل الجمهور المستهدف
 * يعتمد على النمط القياسي ويعزز المخرجات بقياسات تغطية الفئات والجاذبية السوقية.
 */
export class TargetAudienceAnalyzerAgent extends BaseAgent {
  constructor() {
    super(
      "AudienceCompass AI",
      TaskType.TARGET_AUDIENCE_ANALYZER,
      TARGET_AUDIENCE_ANALYZER_AGENT_CONFIG.systemPrompt || ""
    );

    this.confidenceFloor = 0.82;
  }

  protected buildPrompt(input: StandardAgentInput): string {
    const { input: taskInput, context } = input;
    const ctx = this.normalizeContext(context);

    let prompt = `أنت ${this.name}، خبير الجمهور الذي يحوّل التحليل السردي إلى خرائط جمهور دقيقة.\n\n`;

    prompt += `### المهمة الأساسية\n${taskInput}\n\n`;

    if (ctx.logline) {
      prompt += `### اللوغلاين\n${ctx.logline}\n\n`;
    }

    if (ctx.synopsis) {
      prompt += `### الملخص المختصر\n${this.truncate(ctx.synopsis)}\n\n`;
    } else if (ctx.originalText) {
      prompt += `### مقتطف من النص الأصلي\n${this.truncate(ctx.originalText)}\n\n`;
    }

    const metadataSections = this.buildMetadataSections(ctx);
    if (metadataSections) {
      prompt += `${metadataSections}\n`;
    }

    if (ctx.previousStations) {
      prompt += `### خلاصات المحطات السابقة\n${this.summarizeStations(
        ctx.previousStations
      )}\n\n`;
    }

    if (ctx.audienceResearch) {
      prompt += `### بيانات أبحاث الجمهور المتاحة\n${this.truncate(
        ctx.audienceResearch
      )}\n\n`;
    }

    prompt += `### تعليمات الوحدة\n${TARGET_AUDIENCE_ANALYZER_INSTRUCTIONS}\n\n`;
    prompt += `### قواعد الإخراج النصي\n`;
    prompt += `- استخدم عناوين فرعية واضحة لكل فئة جمهور.\n`;
    prompt += `- قدم تحليلاً سردياً دون استخدام JSON أو جداول برمجية.\n`;
    prompt += `- اربط كل استنتاج بأدلة من النص أو السياق.\n`;
    prompt += `- اختم بتقييم الجاذبية السوقية وخارطة المخاطر.\n`;

    return prompt;
  }

  protected override async postProcess(
    output: StandardAgentOutput
  ): Promise<StandardAgentOutput> {
    const cleanedText = this.sanitizeToText(output.text);
    const coverage = this.evaluateCoverage(cleanedText);
    const readability = this.estimateReadability(cleanedText);
    const marketability = this.estimateMarketability(cleanedText);

    const adjustedConfidence = Math.min(
      1,
      output.confidence * 0.5 + coverage.coverageScore * 0.3 + readability * 0.2
    );

    return {
      ...output,
      text: cleanedText,
      confidence: adjustedConfidence,
      notes: this.mergeNotes(
        output.notes,
        coverage.coverageScore,
        marketability,
        readability
      ),
      metadata: {
        ...output.metadata,
        audienceInsights: {
          segments: coverage.segmentCount,
          coverageScore: coverage.coverageScore,
          primaryMentioned: coverage.primaryMentioned,
          marketabilitySignal: marketability,
          readability,
        },
      },
    };
  }

  private normalizeContext(context: StandardAgentInput["context"]): TargetAudienceContext {
    if (context && typeof context === "object") {
      return context as TargetAudienceContext;
    }
    return {};
  }

  private buildMetadataSections(ctx: TargetAudienceContext): string {
    const sections: string[] = [];

    const descriptorLines: string[] = [];
    if (ctx.genre) descriptorLines.push(`* النوع: ${ctx.genre}`);
    if (ctx.format) descriptorLines.push(`* التنسيق: ${ctx.format}`);
    if (ctx.releaseWindow) descriptorLines.push(`* نافذة الإصدار: ${ctx.releaseWindow}`);
    if (descriptorLines.length) {
      sections.push(`### بيانات تعريفية\n${descriptorLines.join("\n")}\n`);
    }

    if (ctx.marketingGoals?.length) {
      sections.push(
        `### الأهداف التسويقية\n${ctx.marketingGoals
          .map((goal) => `- ${goal}`)
          .join("\n")}\n`
      );
    }

    if (ctx.targetMarkets?.length) {
      sections.push(
        `### الأسواق المستهدفة\n${ctx.targetMarkets
          .map((market) => `- ${market}`)
          .join("\n")}\n`
      );
    }

    if (ctx.preferredPlatforms?.length) {
      sections.push(
        `### المنصات المرجّحة\n${ctx.preferredPlatforms
          .map((platform) => `- ${platform}`)
          .join("\n")}\n`
      );
    }

    if (ctx.sensitivityFlags?.length) {
      sections.push(
        `### عناصر حساسة يجب مراقبتها\n${ctx.sensitivityFlags
          .map((flag) => `- ${flag}`)
          .join("\n")}\n`
      );
    }

    if (ctx.comparableTitles?.length) {
      sections.push(
        `### أعمال مقارنة\n${ctx.comparableTitles
          .map((title) => `- ${title}`)
          .join("\n")}\n`
      );
    }

    return sections.join("\n");
  }

  private summarizeStations(previousStations: Record<string, unknown>): string {
    const lines = Object.entries(previousStations)
      .map(([key, value]) => {
        const formatted =
          typeof value === "string"
            ? this.truncate(value, 280)
            : JSON.stringify(value);
        return `- ${key}: ${formatted}`;
      })
      .slice(0, 5);

    return lines.length ? lines.join("\n") : "لا توجد تقارير سابقة متاحة.";
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

  private evaluateCoverage(text: string): {
    segmentCount: number;
    coverageScore: number;
    primaryMentioned: boolean;
  } {
    const segmentMarkers = text.match(
      /الجمهور|الفئة|شريحة|segment|أساسي|ثانوي|سوق/gi
    );
    const bulletCount = (text.match(/^-|\n-/gm) ?? []).length;
    const sectionCount = (text.match(/###|####|ملخص|تحليل/gi) ?? []).length;
    const segmentCount = Math.max(1, Math.min(6, Math.round((segmentMarkers?.length ?? 2) / 2)));
    const coverageScore = Math.min(
      1,
      segmentCount * 0.18 + bulletCount * 0.01 + sectionCount * 0.04
    );
    const primaryMentioned =
      /الجمهور\s+(?:الرئيسي|الأساسي)|الفئة\s+الرئيسية/gi.test(text);

    return { segmentCount, coverageScore, primaryMentioned };
  }

  private estimateMarketability(text: string): number {
    const keywords = [
      "سوق",
      "تسويق",
      "منصة",
      "ربحية",
      "انتشار",
      "الجاذبية",
      "العائد",
      "التوزيع",
    ];
    const matches = keywords.reduce((acc, keyword) => {
      const occur = (text.match(new RegExp(keyword, "gi")) ?? []).length;
      return acc + occur;
    }, 0);

    return Math.min(1, 0.4 + matches * 0.05);
  }

  private estimateReadability(text: string): number {
    const paragraphs = text.split("\n\n").filter((paragraph) => paragraph.trim());
    if (!paragraphs.length) return 0.4;
    const averageLength =
      paragraphs.reduce((acc, paragraph) => acc + paragraph.length, 0) /
      paragraphs.length;

    const bulletDensity = (text.match(/^-|\n-/gm) ?? []).length / Math.max(text.length / 400, 1);

    let score = 0.5;
    if (averageLength >= 200 && averageLength <= 600) score += 0.2;
    if (bulletDensity > 0.5) score += 0.15;
    if (paragraphs.length >= 4) score += 0.1;

    return Math.min(1, score);
  }

  private mergeNotes(
    existingNotes: string[] | undefined,
    coverageScore: number,
    marketabilitySignal: number,
    readability: number
  ): string[] {
    const notes: string[] = [...(existingNotes ?? [])];

    if (coverageScore > 0.75) {
      notes.push("تغطية الفئات الجماهيرية شاملة.");
    } else if (coverageScore < 0.5) {
      notes.push("يُنصح بتوسيع عدد الشرائح الجماهيرية.");
    }

    if (marketabilitySignal > 0.7) {
      notes.push("يتضمن التقرير إشارات سوقية قوية.");
    }

    if (readability < 0.6) {
      notes.push("يفضل إعادة هيكلة الأقسام لرفع وضوح التقرير.");
    }

    return Array.from(new Set(notes));
  }

  private truncate(value: string, limit = 2000): string {
    if (value.length <= limit) {
      return value;
    }
    return `${value.substring(0, limit)}...`;
  }

  protected override async getFallbackResponse(
    input: StandardAgentInput
  ): Promise<string> {
    return `تحليل أولي للجمهور المستهدف:
تم تقدير الجمهور الأساسي والشرائح الثانوية بناءً على المدخلات المتاحة.

الجمهور الأساسي:
- الفئة: ${input.context && typeof input.context === "object" && "genre" in input.context ? (input.context as Record<string, unknown>).genre : "غير محدد"}
- الدوافع المتوقعة: البحث عن سرد عاطفي ونبرة واقعية

شرائح ثانوية محتملة:
- عشاق الدراما الاجتماعية
- جمهور المنصات الرقمية الباحث عن محتوى متسلسل قصير

التوصيات:
- توضيح المنصة المستهدفة لتحديد توقعات التجربة.
- تعزيز الأدلة التي تربط عناصر النص مع كل فئة جمهور.

ملاحظة: تم تقديم هذا الرد كخطة طوارئ بعد تعذر تشغيل السلسلة القياسية.`;
  }
}

export const targetAudienceAnalyzerAgent = new TargetAudienceAnalyzerAgent();
