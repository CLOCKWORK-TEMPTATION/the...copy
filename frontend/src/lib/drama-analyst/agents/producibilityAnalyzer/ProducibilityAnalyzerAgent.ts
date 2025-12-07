import { TaskType } from "@core/types";
import { BaseAgent } from "../shared/BaseAgent";
import {
  StandardAgentInput,
  StandardAgentOutput,
} from "../shared/standardAgentPattern";

/**
 * ProducibilityAnalyzerAgent - محلل القابلية للإنتاج
 * يطبق النمط القياسي: RAG → Self-Critique → Constitutional → Uncertainty → Hallucination → Debate
 * يحلل ويقدر متطلبات الإنتاج والتحديات والحلول
 */
export class ProducibilityAnalyzerAgent extends BaseAgent {
  constructor() {
    super(
      "ProductionOracle AI",
      TaskType.PRODUCIBILITY_ANALYZER,
      `أنت ProductionOracle AI - وحي الإنتاج الذكي. مهمتك هي تحليل النصوص الدرامية (سيناريوهات، مسرحيات) لتقييم قابلية إنتاجها بشكل شامل.

يجب أن تحلل النص بعمق وتحدد المتطلبات الإنتاجية اللازمة لتحويله إلى عمل فني متكامل.

تحليلك يجب أن يشمل الجوانب التالية:

1. **تحليل المشاهد والشخصيات**:
   - عدد المشاهد وتنوعها (داخلي/خارجي، نهار/ليل)
   - متطلبات المواقع وصعوبة توفيرها
   - عدد الشخصيات (رئيسية/ثانوية/كومبارس)
   - متطلبات خاصة بالشخصيات (ملابس تاريخية، مكياج، تدريب)

2. **التحليل الفني والتقني**:
   - المؤثرات الخاصة (SFX) والبصرية (VFX) وتعقيدها
   - متطلبات التصوير والإضاءة الخاصة
   - متطلبات الصوت والموسيقى
   - المعدات التقنية المطلوبة

3. **التحليل اللوجستي والإنتاجي**:
   - تقدير التكاليف (منخفضة/متوسطة/عالية/ضخمة)
   - تحديات الإنتاج المحتملة
   - اقتراح حلول وبدائل مبتكرة
   - استراتيجيات تحسين التكلفة

4. **الجدول الزمني**:
   - تقدير مدة التحضير (Pre-production)
   - تقدير مدة التصوير (Production)
   - تقدير مدة ما بعد الإنتاج (Post-production)
   - العوامل المؤثرة على الجدول

يجب أن يكون تقريرك منظماً وواضحاً، ويقدم رؤية شاملة للمنتجين وصناع القرار.

مخرجاتك يجب أن تكون نصية فقط، واضحة ومباشرة بدون أي JSON أو كتل كود.`
    );

    this.confidenceFloor = 0.75;
  }

  /**
   * بناء الـ prompt من المدخلات
   */
  protected buildPrompt(input: StandardAgentInput): string {
    const { input: userInput, context } = input;

    let prompt = `## مهمة تحليل القابلية للإنتاج

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

      if (previousStations.sceneBreakdown) {
        prompt += `\n### تفصيل المشاهد:\n${previousStations.sceneBreakdown}\n`;
      }

      if (previousStations.visualAnalysis) {
        prompt += `\n### التحليل البصري:\n${previousStations.visualAnalysis}\n`;
      }
    }

    prompt += `

## متطلبات تحليل الإنتاج:

1. **تحليل المشاهد**: حدد عدد المشاهد، أنواعها، وتعقيدها
2. **تقدير التكاليف**: قدّر نطاق الميزانية والعوامل المؤثرة في التكلفة
3. **المتطلبات التقنية**: حدد المعدات والخبرات المطلوبة
4. **تقييم صعوبة التصوير**: حلل التحديات واقترح حلول
5. **تحليل المواقع**: قدّر عدد ونوعية المواقع المطلوبة
6. **التخطيط الزمني**: قدّر المدة الإجمالية لكل مرحلة إنتاجية

## التنسيق المطلوب:

اكتب تحليلك في نص واضح ومنظم:
- استخدم العناوين والفقرات لتنظيم التحليل
- قدم تقديرات واقعية ومبررة
- اقترح بدائل وحلول مبتكرة للتحديات
- وضّح الأولويات والمجالات الحرجة
- تجنب تماماً أي JSON أو كتل كود

قدم تحليلاً إنتاجياً شاملاً يساعد صناع القرار على فهم المتطلبات والتحديات والفرص.`;

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

    // إضافة ملاحظة حول واقعية التحليل
    const enhancedNotes: string[] = [...(output.notes || [])];

    if (output.confidence >= 0.85) {
      enhancedNotes.push("تحليل إنتاجي شامل مع تقديرات واقعية");
    } else if (output.confidence >= 0.7) {
      enhancedNotes.push("تحليل جيد مع توصيات عملية");
    } else {
      enhancedNotes.push("تحليل أولي يحتاج مراجعة متخصصة");
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
    return `# تحليل القابلية للإنتاج - وضع الطوارئ

بناءً على المعلومات المتاحة، إليك تحليل أولي لمتطلبات الإنتاج:

## التقييم الإنتاجي الأولي

النص المقدم يتطلب تحليلاً شاملاً للمتطلبات الإنتاجية:

### تحليل المشاهد:
- **عدد المشاهد**: يحتاج تقدير دقيق
- **التنوع**: داخلي/خارجي، نهار/ليل
- **التعقيد**: مستوى الصعوبة التقنية

### تقدير التكاليف:
- **الميزانية المبدئية**: تحتاج تقييم مفصل
- **العوامل المؤثرة**: المواقع، المؤثرات، الكوادر
- **فرص التوفير**: بدائل أقل تكلفة

### المتطلبات التقنية:
- **المؤثرات الخاصة**: SFX/VFX المطلوبة
- **معدات التصوير**: كاميرات، إضاءة، معدات خاصة
- **الصوت والموسيقى**: تسجيلات، موسيقى تصويرية
- **الخبرات المطلوبة**: مهارات متخصصة

### التحديات المحتملة:
1. **اللوجستيات**: صعوبة الوصول للمواقع، تصاريح
2. **الطقس**: تأثير الظروف الجوية على التصوير الخارجي
3. **الجدول الزمني**: ضيق الوقت أو التأخيرات
4. **الميزانية**: محدودية الموارد المالية

### الجدول الزمني المبدئي:
- **التحضير**: أسابيع من التخطيط
- **التصوير**: حسب عدد المشاهد
- **ما بعد الإنتاج**: المونتاج والمعالجة

## التوصيات العامة:

- قم بجدول تفصيلي للمشاهد
- حدد أولويات الإنفاق
- ابحث عن بدائل اقتصادية
- خطط لطوارئ الإنتاج

ملاحظة: هذا تحليل أولي. يُنصح بإعادة التحليل مع تفاصيل أكثر عن المشاهد والمتطلبات التقنية.`;
  }
}

// Export singleton instance
export const producibilityAnalyzerAgent = new ProducibilityAnalyzerAgent();
