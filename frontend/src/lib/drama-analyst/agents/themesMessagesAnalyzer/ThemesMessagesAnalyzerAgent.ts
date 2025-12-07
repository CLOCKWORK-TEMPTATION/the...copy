import { TaskType } from "@core/types";
import { BaseAgent } from "../shared/BaseAgent";
import {
  StandardAgentInput,
  StandardAgentOutput,
} from "../shared/standardAgentPattern";

/**
 * ThemesMessagesAnalyzerAgent - محلل الموضوعات والرسائل
 * يطبق النمط القياسي: RAG → Self-Critique → Constitutional → Uncertainty → Hallucination → Debate
 * يستخرج الطبقات المعنوية العميقة والرسائل الفلسفية المضمرة
 */
export class ThemesMessagesAnalyzerAgent extends BaseAgent {
  constructor() {
    super(
      "PhilosophyMiner AI",
      TaskType.THEMES_MESSAGES_ANALYZER,
      `أنت PhilosophyMiner AI، منقّب الفلسفة العميقة. مهمتك هي تحليل النصوص من خلال تطبيق الفلسفة الحاسوبية ونماذج التحليل الهرمنوطيقي الذكي.

وظائفك الأساسية:
1. **استخراج الطبقات المعنوية العميقة**: اكشف المعاني الخفية والرسائل الفلسفية المضمرة
2. **تحديد التناقضات الموضوعاتية**: اكتشف التوترات والتناقضات في الثيمات
3. **تحليل التماسك الفلسفي**: قيّم اتساق الفلسفة والرؤية الفكرية
4. **تقييم الأصالة الفكرية**: احكم على تفرد وعمق الأفكار المطروحة
5. **تحليل العمق المفاهيمي**: افحص مستوى التعقيد والعمق الفلسفي

يجب أن تعمل بدقة تحليلية عالية، مع التركيز على:
- الحجج الفلسفية الأساسية
- الافتراضات الضمنية
- الآثار والنتائج الفلسفية

قدم تحليلاً منظماً وواضحاً يوفر نظرة شاملة للمشهد الفلسفي للنص.

مخرجاتك يجب أن تكون نصية فقط، واضحة ومباشرة بدون أي JSON أو كتل كود.`
    );

    this.confidenceFloor = 0.75;
  }

  /**
   * بناء الـ prompt من المدخلات
   */
  protected buildPrompt(input: StandardAgentInput): string {
    const { input: userInput, context } = input;

    let prompt = `## مهمة تحليل الموضوعات والرسائل الفلسفية

${userInput}

`;

    // إضافة السياق من المحطات السابقة
    const contextObj =
      typeof context === "object" && context !== null ? context : {};
    const previousStations = (contextObj as any)?.previousStations;
    
    if (previousStations) {
      prompt += `## السياق من المحطات السابقة:\n`;

      if (previousStations.analysis) {
        prompt += `\n### التحليل الأولي:\n${previousStations.analysis}\n`;
      }

      if (previousStations.plotSummary) {
        prompt += `\n### ملخص الحبكة:\n${previousStations.plotSummary}\n`;
      }

      if (previousStations.characterThemes) {
        prompt += `\n### ثيمات الشخصيات:\n${previousStations.characterThemes}\n`;
      }
    }

    prompt += `

## متطلبات التحليل الفلسفي:

1. **استخراج الموضوعات**: حدد الثيمات الرئيسية والفرعية بوضوح
2. **كشف الرسائل الضمنية**: استخرج الرسائل الفلسفية المخفية
3. **تحليل التماسك**: قيّم اتساق الرؤية الفلسفية
4. **كشف التناقضات**: حدد التوترات والتناقضات الموضوعاتية
5. **تقييم الأصالة**: احكم على تفرد وعمق المعالجة الفكرية

## التنسيق المطلوب:

اكتب تحليلك في نص واضح ومنظم:
- استخدم العناوين والفقرات لتنظيم التحليل
- قدم أمثلة محددة من النص لدعم تحليلك
- اربط الثيمات بالسياق الفلسفي الأوسع
- وضّح العلاقات بين الموضوعات المختلفة
- تجنب تماماً أي JSON أو كتل كود

قدم تحليلاً فلسفياً عميقاً يكشف البنية المفاهيمية للنص وأبعاده الفكرية.`;

    return prompt;
  }

  /**
   * معالجة ما بعد التنفيذ - تنظيف المخرجات من JSON
   */
  protected override async postProcess(
    output: StandardAgentOutput
  ): Promise<StandardAgentOutput> {
    let cleanedText = output.text;

    // إزالة أي كتل JSON
    cleanedText = cleanedText.replace(/```json\s*\n[\s\S]*?\n```/g, "");
    cleanedText = cleanedText.replace(/```\s*\n[\s\S]*?\n```/g, "");

    // إزالة أي JSON objects ظاهرة
    cleanedText = cleanedText.replace(/\{[\s\S]*?"[^"]*"\s*:[\s\S]*?\}/g, "");

    // تنظيف المسافات الزائدة
    cleanedText = cleanedText.replace(/\n{3,}/g, "\n\n").trim();

    // إضافة ملاحظة حول عمق التحليل الفلسفي
    const enhancedNotes: string[] = [...(output.notes || [])];

    if (output.confidence >= 0.85) {
      enhancedNotes.push("تحليل فلسفي عميق مع رؤى مفاهيمية قوية");
    } else if (output.confidence >= 0.7) {
      enhancedNotes.push("تحليل جيد يكشف جوانب فلسفية مهمة");
    } else {
      enhancedNotes.push("تحليل أولي يحتاج تعميق فلسفي");
    }

    return {
      ...output,
      text: cleanedText,
      notes: enhancedNotes,
    };
  }

  /**
   * استجابة احتياطية في حالة الفشل
   */
  protected override async getFallbackResponse(
    input: StandardAgentInput
  ): Promise<string> {
    return `# تحليل الموضوعات والرسائل - وضع الطوارئ

بناءً على المعلومات المتاحة، إليك تحليل أولي للموضوعات والرسائل:

## المشهد الموضوعاتي

النص المقدم يحتوي على طبقات معنوية تستحق الاستكشاف الفلسفي:

### الموضوعات الظاهرة:
- الثيمات السطحية المباشرة
- الأفكار المصرح بها
- القضايا الواضحة

### الطبقات العميقة:
- الرسائل الفلسفية الضمنية
- الافتراضات الفكرية المخفية
- التوترات الموضوعاتية

### البنية المفاهيمية:
- العلاقات بين الموضوعات
- التماسك أو التناقض الفلسفي
- الأصالة الفكرية

## نقاط التحليل المقترحة:

### الثيمات الرئيسية:
1. استكشاف الهوية والانتماء
2. الصراع بين الفرد والمجتمع
3. البحث عن المعنى والهدف

### الرسائل الضمنية:
- القيم الأخلاقية المطروحة
- الرؤية الفلسفية للعالم
- الموقف من القضايا الوجودية

## التوصيات:

- تعمّق في استكشاف الافتراضات الفلسفية
- ابحث عن الترابط بين الموضوعات المختلفة
- قيّم الأصالة والعمق المفاهيمي
- ادرس التأثير الفكري المحتمل

ملاحظة: هذا تحليل أولي. يُنصح بإعادة التحليل مع سياق أعمق للحصول على رؤى فلسفية أكثر تفصيلاً.`;
  }
}

// Export singleton instance
export const themesMessagesAnalyzerAgent = new ThemesMessagesAnalyzerAgent();
