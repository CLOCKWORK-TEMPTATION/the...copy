import { TaskType } from "@core/types";
import { BaseAgent } from "../shared/BaseAgent";
import {
  StandardAgentInput,
  StandardAgentOutput,
} from "../shared/standardAgentPattern";

/**
 * DialogueAdvancedAnalyzerAgent - محلل الحوار المتطور
 * يطبق النمط القياسي: RAG → Self-Critique → Constitutional → Uncertainty → Hallucination → Debate
 * يحلل طبقات المعنى والإيقاع والنص الفرعي في الحوار
 */
export class DialogueAdvancedAnalyzerAgent extends BaseAgent {
  constructor() {
    super(
      "ConversationLens AI",
      TaskType.DIALOGUE_ADVANCED_ANALYZER,
      `أنت ConversationLens AI، محلل حوار متطور. مهمتك هي تشريح الحوار باستخدام اللسانيات الحاسوبية والتحليل البراغماتي. ستحدد النص الفرعي، وتحلل إيقاع الكلام، وتقيّم الطبيعية والتفرد الصوتي للشخصيات.

يجب أن يكون تحليلك:
- **مفصلاً**: اذهب إلى ما وراء التفسير السطحي
- **ثاقباً**: اكشف النوايا غير المصرح بها
- **قابلاً للتنفيذ**: قدم رؤى عملية للكاتب

ركز على:
1. **النص الفرعي**: المعاني الضمنية والمشاعر المخفية
2. **إيقاع الكلام**: تدفق ونغمة الحوار
3. **الطبيعية**: مدى واقعية الحوار
4. **التفرد الصوتي**: تمييز صوت كل شخصية
5. **تجنب الكليشيهات**: كشف العبارات المبتذلة

قدم تحليلاً متعدد الطبقات يوفر فهماً عميقاً لفعالية الحوار وتصوير الشخصيات.

مخرجاتك يجب أن تكون نصية فقط، واضحة ومباشرة بدون أي JSON أو كتل كود.`
    );

    this.confidenceFloor = 0.75;
  }

  /**
   * بناء الـ prompt من المدخلات
   */
  protected buildPrompt(input: StandardAgentInput): string {
    const { input: userInput, context } = input;

    let prompt = `## مهمة التحليل المتطور للحوار

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

      if (previousStations.characterAnalysis) {
        prompt += `\n### تحليل الشخصيات:\n${previousStations.characterAnalysis}\n`;
      }

      if (previousStations.dialogueSamples) {
        prompt += `\n### عينات من الحوار:\n${previousStations.dialogueSamples}\n`;
      }
    }

    prompt += `

## متطلبات التحليل المتطور:

1. **الأصوات المميزة**: قيّم تفرد صوت كل شخصية واتساقه
2. **كاشف النص الفرعي**: استخرج المعاني الضمنية والعواطف الخفية
3. **تقييم الطبيعية**: حلل مدى واقعية الحوار مقارنة بأنماط الكلام الحقيقية
4. **كاشف الكليشيهات**: حدد الحوار المبتذل واقترح بدائل
5. **تحليل الإيقاع اللغوي**: افحص التدفق والموسيقى في الكلام

## التنسيق المطلوب:

اكتب تحليلك في نص واضح ومنظم:
- استخدم العناوين والفقرات لتنظيم التحليل
- قدم أمثلة محددة من الحوار
- وضّح الأنماط والتناقضات
- اقترح تحسينات محددة
- تجنب تماماً أي JSON أو كتل كود

قدم تحليلاً لغوياً دقيقاً يكشف الطبقات العميقة في الحوار ويساعد على تحسينه.`;

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

    // إضافة ملاحظة حول جودة التحليل
    const enhancedNotes: string[] = [...(output.notes || [])];

    if (output.confidence >= 0.85) {
      enhancedNotes.push("تحليل لغوي متقدم مع رؤى عميقة للحوار");
    } else if (output.confidence >= 0.7) {
      enhancedNotes.push("تحليل جيد يكشف جوانب مهمة في الحوار");
    } else {
      enhancedNotes.push("تحليل أولي يحتاج مراجعة وتعميق");
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
    return `# التحليل المتطور للحوار - وضع الطوارئ

بناءً على المعلومات المتاحة، إليك تحليل أولي للحوار:

## التقييم الأولي للحوار

الحوار المقدم يحتاج إلى تحليل شامل من عدة زوايا لسانية ودرامية:

### جودة الحوار العامة:
- الوضوح والمباشرة في التواصل
- التوازن بين الواقعية والدرامية
- ملاءمة الحوار للشخصيات

### النص الفرعي والمعاني الضمنية:
- المعاني الخفية تحت السطح
- العواطف غير المصرح بها
- التوترات المكبوتة

### الإيقاع والطبيعية:
- تدفق الحوار وسلاسته
- واقعية أنماط الكلام
- تنوع البنية اللغوية

### التفرد الصوتي:
- تمييز أصوات الشخصيات المختلفة
- اتساق الصوت لكل شخصية
- تجنب التشابه المفرط

## التوصيات:

- ابحث عن فرص لتعميق النص الفرعي
- تجنب الحوار التوضيحي المباشر
- اهتم بالإيقاع والتنوع في البنية
- ميّز صوت كل شخصية بوضوح

ملاحظة: هذا تحليل أولي. يُنصح بإعادة التحليل مع عينات أكثر من الحوار للحصول على رؤى أعمق.`;
  }
}

// Export singleton instance
export const dialogueAdvancedAnalyzerAgent = new DialogueAdvancedAnalyzerAgent();
