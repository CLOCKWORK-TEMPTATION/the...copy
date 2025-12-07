import { TaskType } from "@core/types";
import { BaseAgent } from "../shared/BaseAgent";
import {
  StandardAgentInput,
  StandardAgentOutput,
} from "../shared/standardAgentPattern";

/**
 * CulturalHistoricalAnalyzerAgent - محلل السياق الثقافي والتاريخي
 * يطبق النمط القياسي: RAG → Self-Critique → Constitutional → Uncertainty → Hallucination → Debate
 * يحلل الدقة الثقافية والتاريخية والحساسية الاجتماعية
 */
export class CulturalHistoricalAnalyzerAgent extends BaseAgent {
  constructor() {
    super(
      "ChronoContext AI",
      TaskType.CULTURAL_HISTORICAL_ANALYZER,
      `أنت ChronoContext AI، محلل سياق ثقافي وتاريخي متطور. مهمتك الأساسية هي تحليل السرديات والشخصيات والإعدادات لضمان الدقة الثقافية والتاريخية والأصالة والحساسية.

أنت مزود بـ:
- قواعد بيانات تاريخية شاملة
- نماذج كشف التحيزات الثقافية
- خوارزميات تحليل الحساسية الاجتماعية

يجب أن يكون تحليلك:
- **عميقاً**: متعدد الطبقات ومفصل
- **دقيقاً**: مبني على الأدلة والحقائق
- **قابلاً للتنفيذ**: يوفر رؤى عملية للمبدعين

حدد:
- التناقضات الزمنية المحتملة (Anachronisms)
- الصور النمطية (Stereotypes)
- التمثيل المغلوط أو المسيء
- مجالات عدم الحساسية الثقافية

قيّم:
- الأصالة التاريخية
- التمثيل الثقافي
- ردود الفعل المجتمعية المحتملة
- التفسيرات المتنوعة

هدفك هو تمكين المبدعين من بناء عوالم غنية وقابلة للتصديق ومحترمة تتردد أصداؤها بأصالة مع جماهير متنوعة.

مخرجاتك يجب أن تكون نصية فقط، واضحة ومباشرة بدون أي JSON أو كتل كود.`
    );

    this.confidenceFloor = 0.75;
  }

  /**
   * بناء الـ prompt من المدخلات
   */
  protected buildPrompt(input: StandardAgentInput): string {
    const { input: userInput, context } = input;

    let prompt = `## مهمة تحليل السياق الثقافي والتاريخي

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

      if (previousStations.setting) {
        prompt += `\n### الإعداد الزماني والمكاني:\n${previousStations.setting}\n`;
      }

      if (previousStations.culturalElements) {
        prompt += `\n### العناصر الثقافية:\n${previousStations.culturalElements}\n`;
      }
    }

    prompt += `

## متطلبات التحليل الثقافي والتاريخي:

1. **تحديد الفترة التاريخية**: حدد الزمان والمكان وخصائصهما
2. **تحليل الدقة الثقافية**: قيّم صحة التمثيل الثقافي
3. **كشف التحيزات**: حدد أنواع التحيزات المحتملة وتأثيرها
4. **تقييم الحساسية**: حلل كيفية معالجة القضايا الحساسة
5. **تحليل التأثير الاجتماعي**: توقع ردود الفعل والجدل المحتمل

## التنسيق المطلوب:

اكتب تحليلك في نص واضح ومنظم:
- استخدم العناوين والفقرات لتنظيم التحليل
- قدم أمثلة محددة من النص
- اربط التحليل بالحقائق التاريخية والثقافية
- قدم توصيات بناءة للتحسين
- تجنب تماماً أي JSON أو كتل كود

قدم تحليلاً شاملاً يضمن الأصالة والاحترام والحساسية الثقافية.`;

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

    // إضافة ملاحظة حول دقة التحليل
    const enhancedNotes: string[] = [...(output.notes || [])];

    if (output.confidence >= 0.85) {
      enhancedNotes.push("تحليل ثقافي-تاريخي شامل ودقيق");
    } else if (output.confidence >= 0.7) {
      enhancedNotes.push("تحليل جيد مع توصيات مفيدة");
    } else {
      enhancedNotes.push("تحليل أولي يحتاج مراجعة معمقة");
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
    return `# التحليل الثقافي والتاريخي - وضع الطوارئ

بناءً على المعلومات المتاحة، إليك تحليل أولي للسياق الثقافي والتاريخي:

## التقييم الأولي

النص المقدم يتطلب فحصاً دقيقاً من منظور ثقافي وتاريخي:

### الدقة التاريخية:
- التحقق من دقة الأحداث والتواريخ
- مطابقة العادات والتقاليد للفترة الزمنية
- ضمان توافق التقنيات والأدوات مع العصر

### التمثيل الثقافي:
- صحة تصوير العادات والتقاليد
- احترام الخصوصيات الثقافية
- تجنب التعميمات المخلة

### الحساسية الاجتماعية:
- معالجة القضايا الحساسة بحذر
- تجنب الصور النمطية الضارة
- احترام التنوع والاختلاف

### التحيزات المحتملة:
- التحيز الثقافي أو العرقي
- التحيز الجنساني
- التحيز التاريخي

## نقاط التحذير العامة:

1. **التناقضات الزمنية**: تأكد من عدم وجود عناصر لا تنتمي للفترة الزمنية
2. **الصور النمطية**: تجنب التمثيل السطحي للثقافات
3. **الحساسية**: عالج القضايا الحساسة بوعي وتعمق
4. **التنوع**: ضمن تمثيلاً عادلاً ومتوازناً

## التوصيات:

- ابحث بعمق في الفترة التاريخية المعنية
- استشر خبراء من الثقافات المعنية
- راجع التمثيل من منظور متنوع
- كن واعياً للتأثير الاجتماعي المحتمل

ملاحظة: هذا تحليل أولي. يُنصح بإعادة التحليل مع معلومات أكثر تفصيلاً عن السياق الثقافي والتاريخي.`;
  }
}

// Export singleton instance
export const culturalHistoricalAnalyzerAgent = new CulturalHistoricalAnalyzerAgent();
