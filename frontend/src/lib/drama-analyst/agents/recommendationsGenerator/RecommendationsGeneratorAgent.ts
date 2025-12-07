import { TaskType } from "@core/types";
import { BaseAgent } from "../shared/BaseAgent";
import {
  StandardAgentInput,
  StandardAgentOutput,
} from "../shared/standardAgentPattern";
import { RECOMMENDATIONS_GENERATOR_AGENT_CONFIG } from "./agent";
import { RECOMMENDATIONS_GENERATOR_INSTRUCTIONS } from "./instructions";

interface RecommendationsContext {
  originalText?: string;
  synopsis?: string;
  constraints?: string[];
  priorities?: string[];
  successMetrics?: string[];
  deliveryConstraints?: string[];
  previousStations?: Record<string, unknown>;
  analysisBundles?: Array<{ source: string; findings: string }>;
  riskRegister?: string[];
  creativeBrief?: string;
}

type SectionDescriptor = {
  key: string;
  title: string;
  keywords: string[];
};

const REQUIRED_SECTIONS: SectionDescriptor[] = [
  {
    key: "priorities",
    title: "أولويات التحسين العليا",
    keywords: ["أولوية", "حرج", "قصير الأمد"],
  },
  {
    key: "structure",
    title: "اقتراحات البنية والإيقاع",
    keywords: ["البنية", "الإيقاع", "مشهد", "هيكل"],
  },
  {
    key: "characters",
    title: "تطوير الشخصيات",
    keywords: ["الشخصية", "القوس", "الدافع"],
  },
  {
    key: "dialogue",
    title: "تحسين الحوار",
    keywords: ["الحوار", "النبرة", "صوت"],
  },
  {
    key: "alternatives",
    title: "بدائل إبداعية",
    keywords: ["بديل", "سيناريو", "مسار"],
  },
  {
    key: "impact",
    title: "تأثير التوصيات",
    keywords: ["التأثير", "الأثر", "المخرجات"],
  },
];

/**
 * Recommendations Generator Agent - وكيل توصيات التحسين المتقدمة
 * يحوّل تحليلات الوكلاء الآخرين إلى خطة تحسين تنفيذية.
 */
export class RecommendationsGeneratorAgent extends BaseAgent {
  constructor() {
    super(
      "WisdomSynthesizer AI",
      TaskType.RECOMMENDATIONS_GENERATOR,
      RECOMMENDATIONS_GENERATOR_AGENT_CONFIG.systemPrompt || ""
    );

    this.confidenceFloor = 0.84;
  }

  protected buildPrompt(input: StandardAgentInput): string {
    const { input: taskInput, context } = input;
    const ctx = this.normalizeContext(context);

    let prompt = `أنت ${this.name}، تمتلك كامل مخرجات التحليل السابقة وتحتاج لتوليد خطة توصيات قابلة للتنفيذ.\n\n`;
    prompt += `### المهمة الأساسية\n${taskInput}\n\n`;

    if (ctx.synopsis || ctx.originalText) {
      prompt += `### نظرة على النص\n${this.truncate(
        ctx.synopsis || ctx.originalText || "",
        2000
      )}\n\n`;
    }

    if (ctx.priorities?.length) {
      prompt += `### أولويات العميل المعلنة\n${ctx.priorities
        .map((priority) => `- ${priority}`)
        .join("\n")}\n\n`;
    }

    if (ctx.constraints?.length || ctx.deliveryConstraints?.length) {
      prompt += `### قيود يجب احترامها\n${[
        ...(ctx.constraints ?? []),
        ...(ctx.deliveryConstraints ?? []),
      ]
        .map((constraint) => `- ${constraint}`)
        .join("\n")}\n\n`;
    }

    if (ctx.successMetrics?.length) {
      prompt += `### معايير النجاح المرجوة\n${ctx.successMetrics
        .map((metric) => `- ${metric}`)
        .join("\n")}\n\n`;
    }

    if (ctx.analysisBundles?.length) {
      prompt += `### خلاصات تحليلية واردة من وكلاء آخرين\n`;
      ctx.analysisBundles.slice(0, 4).forEach((bundle) => {
        prompt += `- ${bundle.source}: ${this.truncate(bundle.findings, 400)}\n`;
      });
      prompt += `\n`;
    }

    if (ctx.previousStations) {
      prompt += `### مخرجات المحطات السابقة\n${this.summarizeStations(
        ctx.previousStations
      )}\n\n`;
    }

    if (ctx.riskRegister?.length) {
      prompt += `### مخاطر يجب مراقبتها\n${ctx.riskRegister
        .map((risk) => `- ${risk}`)
        .join("\n")}\n\n`;
    }

    if (ctx.creativeBrief) {
      prompt += `### ملخص الرؤية الإبداعية\n${this.truncate(
        ctx.creativeBrief,
        800
      )}\n\n`;
    }

    prompt += `### تعليمات الوحدة\n${RECOMMENDATIONS_GENERATOR_INSTRUCTIONS}\n\n`;
    prompt += `### متطلبات الإخراج\n`;
    prompt += `- ابدأ بجدول أولويات لفظي (بدون استخدام جداول Markdown).\n`;
    prompt += `- استخدم عناوين الأقسام التالية بالترتيب: ${
      REQUIRED_SECTIONS.map((section) => section.title).join("، ")
    }.\n`;
    prompt += `- اربط كل توصية بالأثر المتوقع والجهد المطلوب.\n`;
    prompt += `- لا تستخدم JSON، بل قدم التوصيات كنص منظم مع قوائم نقطية واضحة.\n`;

    return prompt;
  }

  protected override async postProcess(
    output: StandardAgentOutput
  ): Promise<StandardAgentOutput> {
    const cleaned = this.sanitizeToText(output.text);
    const structured = this.ensureSectionPresence(cleaned);
    const coverage = this.computeCoverage(structured);
    const actionability = this.computeActionability(structured);

    const adjustedConfidence = Math.min(
      1,
      output.confidence * 0.45 +
        coverage.coverageRatio * 0.3 +
        actionability * 0.25
    );

    return {
      ...output,
      text: structured,
      confidence: adjustedConfidence,
      notes: this.composeNotes(output.notes, coverage, actionability),
      metadata: {
        ...output.metadata,
        recommendationsQuality: {
          coverage: coverage.coverageRatio,
          sectionsMissing: coverage.missingSections,
          actionability,
          recommendationsCount: coverage.recommendationsCount,
        },
      },
    };
  }

  private normalizeContext(context: StandardAgentInput["context"]): RecommendationsContext {
    if (context && typeof context === "object") {
      return context as RecommendationsContext;
    }
    return {};
  }

  private summarizeStations(previousStations: Record<string, unknown>): string {
    return Object.entries(previousStations)
      .map(([key, value]) => {
        const snippet =
          typeof value === "string"
            ? this.truncate(value, 220)
            : JSON.stringify(value);
        return `- ${key}: ${snippet}`;
      })
      .slice(0, 6)
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

  private ensureSectionPresence(text: string): string {
    let enriched = text;
    REQUIRED_SECTIONS.forEach((section) => {
      const pattern = new RegExp(section.title, "i");
      if (!pattern.test(enriched)) {
        enriched += `\n\n${section.title}:\n- لم يتم توفير تفاصيل كافية بعد.`;
      }
    });
    return enriched.trim();
  }

  private computeCoverage(text: string): {
    coverageRatio: number;
    missingSections: string[];
    recommendationsCount: number;
  } {
    const missing: string[] = [];
    let covered = 0;

    REQUIRED_SECTIONS.forEach((section) => {
      const hasSection = new RegExp(section.title, "i").test(text);
      const hasKeywords = section.keywords.some((keyword) =>
        new RegExp(keyword, "i").test(text)
      );

      if (hasSection && hasKeywords) {
        covered += 1;
      } else {
        missing.push(section.title);
      }
    });

    const recommendationBullets = (text.match(/^-|\n-/gm) ?? []).length;
    const coverageRatio = Math.min(
      1,
      covered / REQUIRED_SECTIONS.length + recommendationBullets * 0.01
    );

    return {
      coverageRatio,
      missingSections: missing,
      recommendationsCount: Math.max(recommendationBullets, 1),
    };
  }

  private computeActionability(text: string): number {
    const verbs = ["ينبغي", "يمكن", "يجب", "يتطلب", "يوصى", "إعادة", "تعزيز"];
    const verbHits = verbs.reduce((total, verb) => {
      return total + (text.match(new RegExp(verb, "gi")) ?? []).length;
    }, 0);

    const effortMarkers = (text.match(/منخفض|متوسط|مرتفع|أسبوع|يوم/gi) ?? []).length;
    const numbering = (text.match(/\d\./g) ?? []).length;

    return Math.min(1, 0.45 + verbHits * 0.03 + effortMarkers * 0.02 + numbering * 0.02);
  }

  private composeNotes(
    existingNotes: string[] | undefined,
    coverage: { coverageRatio: number; missingSections: string[] },
    actionability: number
  ): string[] {
    const notes = [...(existingNotes ?? [])];

    if (coverage.coverageRatio > 0.85) {
      notes.push("التوصيات تغطي جميع المحاور الأساسية.");
    } else if (coverage.missingSections.length) {
      notes.push(
        `أقسام بحاجة لزيادة التفاصيل: ${coverage.missingSections.join(", ")}`
      );
    }

    if (actionability > 0.75) {
      notes.push("الخطة شديدة القابلية للتنفيذ.");
    } else if (actionability < 0.55) {
      notes.push("يفضل تحديد جداول زمنية واضحة لكل توصية.");
    }

    return Array.from(new Set(notes));
  }

  private truncate(text: string, limit = 1800): string {
    if (text.length <= limit) return text;
    return `${text.substring(0, limit)}...`;
  }

  protected override async getFallbackResponse(
    input: StandardAgentInput
  ): Promise<string> {
    return `خطة توصيات تمهيدية:
1. أولويات عاجلة:
   - تثبيت خط سير الحبكة الرئيسية قبل إدخال تعديلات فرعية.
   - مراجعة أقواس الشخصيات لضمان تقدم واضح لكل منهم.

2. بنية وإيقاع:
   - إعادة توزيع الذروة في المنتصف لإبقاء التوتر أعلى.

3. تطوير الشخصيات:
   - منح الشخصية المحورية محفزاً خارجياً واضحاً يدفعها للقرار الأخير.

4. الحوار:
   - ضبط الاختلاف الصوتي بين الشخصيتين الرئيسيتين عبر مفردات خاصة.

5. بديل إبداعي:
   - التفكير في ختام مفتوح يعكس موضوع الالتباس الأخلاقي في النص.

ملاحظة: تم إنشاء هذه الخطة بالاعتماد على المدخلات الأساسية فقط.`;
  }
}

export const recommendationsGeneratorAgent = new RecommendationsGeneratorAgent();
