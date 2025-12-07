import { TaskType } from "@core/types";
import { BaseAgent } from "../shared/BaseAgent";
import {
  StandardAgentInput,
  StandardAgentOutput,
} from "../shared/standardAgentPattern";

/**
 * PlatformAdapterAgent - وكيل التحويل الإعلامي المتعدد
 * يطبق النمط القياسي: RAG → Self-Critique → Constitutional → Uncertainty → Hallucination → Debate
 * يحول المحتوى ليناسب منصات مختلفة مع الحفاظ على الجوهر الأساسي
 */
export class PlatformAdapterAgent extends BaseAgent {
  constructor() {
    super(
      "MediaTransmorph AI",
      TaskType.PLATFORM_ADAPTER,
      `أنت MediaTransmorph AI، وكيل متخصص في تحويل المحتوى لمختلف المنصات الإعلامية. مهمتك الأساسية هي أخذ المحتوى وتحويله بذكاء ليناسب متطلبات وقيود ومميزات المنصة المستهدفة.

التوجيهات الأساسية:
1. **تحليل المنصة المستهدفة**: ابدأ بتحليل شامل للمنصة المستهدفة. حدد خصائصها الرئيسية، بما في ذلك قيود الشكل (مثل عدد الأحرف، طول الفيديو)، توقعات الجمهور، أسلوب المحتوى، وقواعد التفاعل.

2. **تفكيك المحتوى المصدر**: حلل المحتوى المصدر إلى مكوناته الأساسية: الرسالة المركزية، المعلومات الرئيسية، النبرة، الأسلوب، والعناصر الوسائطية.

3. **التكيف الاستراتيجي**: أعد بناء المحتوى بشكل محسّن للمنصة المستهدفة. يجب أن تقوم بـ:
   * الحفاظ على الرسالة الأساسية: الجوهر والمعلومات الرئيسية يجب الاحتفاظ بها
   * تعديل النبرة والأسلوب: كيّف اللغة والنبرة والأسلوب لتتوافق مع جمهور المنصة وقواعدها
   * التحكم في الإيقاع والبنية: أعد هيكلة المحتوى ليناسب أنماط الاستهلاك النموذجية للمنصة
   * احترام القيود: التزم بشدة بجميع القيود الخاصة بالمنصة

4. **إنتاج المخرجات**: قدم المحتوى المُكيّف بشكل واضح ومباشر.

مخرجاتك يجب أن تكون نصية فقط، واضحة ومباشرة بدون أي JSON أو كتل كود.`
    );

    this.confidenceFloor = 0.78;
  }

  /**
   * بناء الـ prompt من المدخلات
   */
  protected buildPrompt(input: StandardAgentInput): string {
    const { input: userInput, context } = input;

    let prompt = `## مهمة تحويل المنصة

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

      if (previousStations.targetPlatform) {
        prompt += `\n### المنصة المستهدفة:\n${previousStations.targetPlatform}\n`;
      }

      if (previousStations.contentType) {
        prompt += `\n### نوع المحتوى:\n${previousStations.contentType}\n`;
      }
    }

    prompt += `

## متطلبات التحويل:

1. **تحليل المنصة المستهدفة**: حدد خصائص المنصة، قيودها، ومتطلباتها
2. **الحفاظ على الجوهر**: احتفظ بالرسالة الأساسية والمعلومات الرئيسية
3. **تكييف الأسلوب**: عدّل النبرة واللغة لتناسب جمهور المنصة
4. **إعادة الهيكلة**: نظّم المحتوى بما يتوافق مع أنماط الاستهلاك في المنصة
5. **احترام القيود**: التزم بجميع القيود التقنية للمنصة

## التنسيق المطلوب:

اكتب تحليلك وتوصياتك في نص واضح ومنظم:
- استخدم العناوين والفقرات لتنظيم التحليل
- وضّح التعديلات المقترحة بوضوح
- اشرح الأسباب وراء كل تكييف
- تجنب تماماً أي JSON أو كتل كود

قدم تحليلاً عملياً وقابلاً للتنفيذ يحترم المنصة المستهدفة ويحافظ على جوهر المحتوى.`;

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

    // إضافة ملاحظة حول جودة التكييف
    const enhancedNotes: string[] = [...(output.notes || [])];

    if (output.confidence >= 0.85) {
      enhancedNotes.push("تكييف عالي الجودة مناسب تماماً للمنصة المستهدفة");
    } else if (output.confidence >= 0.7) {
      enhancedNotes.push("تكييف جيد يحتاج مراجعة بسيطة");
    } else {
      enhancedNotes.push("تكييف أولي يتطلب مراجعة شاملة");
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
    return `# تحويل المنصة - وضع الطوارئ

بناءً على المعلومات المتاحة، إليك توصيات أولية لتكييف المحتوى:

## التحليل الأولي

المحتوى المقدم يحتاج إلى تكييف ليناسب متطلبات المنصة المستهدفة. يجب مراعاة الجوانب التالية:

### النقاط الرئيسية للتكييف:

1. **الحفاظ على الرسالة الأساسية**: تأكد من بقاء الفكرة المركزية واضحة
2. **تعديل الطول والشكل**: كيّف المحتوى ليناسب قيود المنصة
3. **ملاءمة النبرة**: اضبط الأسلوب ليتوافق مع توقعات الجمهور
4. **التحسين للتفاعل**: استخدم عناصر تشجع على التفاعل

## التوصيات العامة:

- قم بتقسيم المحتوى الطويل إلى أجزاء قابلة للهضم
- استخدم لغة واضحة ومباشرة
- أضف عناصر جاذبة مناسبة للمنصة
- احترم القيود التقنية والثقافية

ملاحظة: هذا تحليل أولي. يُنصح بإعادة المحاولة مع معلومات أكثر تفصيلاً عن المنصة المستهدفة.`;
  }
}

// Export singleton instance
export const platformAdapterAgent = new PlatformAdapterAgent();
