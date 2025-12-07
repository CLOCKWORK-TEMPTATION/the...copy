import { TaskType } from "@core/types";
import { BaseAgent } from "../shared/BaseAgent";
import {
  StandardAgentInput,
  StandardAgentOutput,
} from "../shared/standardAgentPattern";

/**
 * CharacterDeepAnalyzerAgent - محلل الشخصيات العميق
 * يطبق النمط القياسي: RAG → Self-Critique → Constitutional → Uncertainty → Hallucination → Debate
 * يحلل الشخصيات بعمق نفسي وسلوكي متقدم
 */
export class CharacterDeepAnalyzerAgent extends BaseAgent {
  constructor() {
    super(
      "PsycheScope AI",
      TaskType.CHARACTER_DEEP_ANALYZER,
      `أنت 'PsycheScope AI'، محلل نفسي متقدم متخصص في تحليل الشخصيات الأدبية والدرامية. مهمتك هي الغوص في أعماق الشخصية المقدمة لك، وتفكيك طبقاتها النفسية المعقدة، والكشف عن دوافعها الواعية واللاواعية.

استخدم نماذج علم النفس الحاسوبي المتقدمة وتقنيات التحليل النفسي الذكي لتحليل:
- سمات الشخصية وخصائصها المميزة
- الصراعات الداخلية والخارجية
- نقاط الضعف والقوة
- التطور المحتمل عبر السرد
- الدوافع اللاواعية والواعية

يجب أن يشتمل تحليلك على نظريات نفسية راسخة مثل:
- التحليل الفرويدي
- علم النفس اليونغي (النماذج الأصلية)
- نظريات السمات الشخصية
- نظريات التطور والنمو الشخصي

قدم تحليلاً متماسكاً وعميقاً، مدعماً بأمثلة من النص (إذا توفر)، وركز على كشف الأنماط النفسية الخفية التي تحرك الشخصية.

مخرجاتك يجب أن تكون نصية فقط، واضحة ومباشرة بدون أي JSON أو كتل كود.`
    );

    this.confidenceFloor = 0.75;
  }

  /**
   * بناء الـ prompt من المدخلات
   */
  protected buildPrompt(input: StandardAgentInput): string {
    const { input: userInput, context } = input;

    let prompt = `## مهمة التحليل النفسي العميق للشخصية

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

      if (previousStations.characterBasics) {
        prompt += `\n### معلومات أساسية عن الشخصية:\n${previousStations.characterBasics}\n`;
      }

      if (previousStations.plotContext) {
        prompt += `\n### سياق الحبكة:\n${previousStations.plotContext}\n`;
      }
    }

    prompt += `

## متطلبات التحليل العميق:

1. **استخلاص الشخصيات**: حدد الشخصيات الرئيسية والثانوية مع الانطباع الأولي
2. **تحليل قوس الشخصية**: فحص تطور الشخصية من البداية للنهاية
3. **كشف العلاقات**: تحليل شبكة العلاقات بين الشخصيات
4. **التقييم النفسي**: استكشاف الدوافع والصراعات الداخلية
5. **تحليل التفرد**: تقييم مدى أصالة وتميز الشخصية

## التنسيق المطلوب:

اكتب تحليلك في نص واضح ومنظم:
- استخدم العناوين والفقرات لتنظيم التحليل
- قدم أمثلة محددة من النص لدعم تحليلك
- اربط التحليل بنظريات نفسية معروفة
- وضّح الأنماط النفسية الخفية
- تجنب تماماً أي JSON أو كتل كود

قدم تحليلاً نفسياً عميقاً ومبنياً على أسس علمية، مع التركيز على الطبقات المعقدة للشخصية.`;

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

    // إضافة ملاحظة حول عمق التحليل
    const enhancedNotes: string[] = [...(output.notes || [])];

    if (output.confidence >= 0.85) {
      enhancedNotes.push("تحليل نفسي عميق ومتماسك مع رؤى قوية");
    } else if (output.confidence >= 0.7) {
      enhancedNotes.push("تحليل جيد يحتاج تعميق في بعض الجوانب");
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
    return `# التحليل النفسي العميق - وضع الطوارئ

بناءً على المعلومات المتاحة، إليك تحليل أولي للشخصية:

## الملف النفسي الأساسي

الشخصية المقدمة تظهر طبقات معقدة تستحق التحليل العميق. يجب مراعاة الجوانب التالية:

### السمات الظاهرة:
- السلوكيات الواضحة والتفاعلات المباشرة
- الخيارات والقرارات الرئيسية
- أنماط التواصل مع الشخصيات الأخرى

### الطبقات الأعمق:
- الدوافع الخفية المحتملة
- الصراعات الداخلية غير المصرح بها
- المخاوف والرغبات المكبوتة

### نقاط التطور المحتملة:
- لحظات التحول والنمو
- التحديات التي تواجه الشخصية
- الإمكانيات المستقبلية للتطور

## التوصيات:

- ابحث عن الدوافع اللاواعية وراء الأفعال الظاهرة
- راقب أنماط التكرار في السلوك
- ادرس العلاقات كمرآة للنفس الداخلية
- اربط التطور الشخصي بالحبكة الدرامية

ملاحظة: هذا تحليل أولي. يُنصح بإعادة التحليل مع سياق أعمق عن الشخصية وعالمها الدرامي.`;
  }
}

// Export singleton instance
export const characterDeepAnalyzerAgent = new CharacterDeepAnalyzerAgent();
