/**
 * ProducibilityAnalyzerAgent - وكيل تحليل قابلية الإنتاج
 * يطبق النمط القياسي: RAG → Self-Critique → Constitutional → Uncertainty → Hallucination → Debate
 * يحلل قابلية الإنتاج: الميزانية، المتطلبات اللوجستية، التحديات، الحلول العملية.
 */

import { TaskType } from '../core/enums';
import { BaseAgent } from '../shared/BaseAgent';
import {
  StandardAgentInput,
  StandardAgentOutput,
} from '../core/types';
import { PRODUCIBILITY_ANALYZER_AGENT_CONFIG } from './config';

export class ProducibilityAnalyzerAgent extends BaseAgent {
  constructor() {
    super(
      "ProductionOracle AI",
      TaskType.PRODUCIBILITY_ANALYZER,
      PRODUCIBILITY_ANALYZER_AGENT_CONFIG.systemPrompt || ""
    );

    this.confidenceFloor = 0.75;
  }

  /**
   * بناء الـ prompt من المدخلات
   */
  protected buildPrompt(input: StandardAgentInput): string {
    const { input: userInput, context } = input;

    // Extract production context
    const contextObj =
      typeof context === 'object' && context !== null ? context : {};
    const projectType = (contextObj as any)?.projectType || 'فيلم';
    const targetBudget = (contextObj as any)?.targetBudget || 'غير محدد';
    const productionScale = (contextObj as any)?.productionScale || 'متوسط';

    let prompt = `## مهمة تحليل قابلية الإنتاج

### السياق الإنتاجي:
- **نوع المشروع**: ${projectType}
- **الميزانية المستهدفة**: ${targetBudget}
- **نطاق الإنتاج**: ${productionScale}

### النص/المشروع المراد تحليله:
${userInput}

### محاور التحليل المطلوبة:

1. **تقدير الميزانية المطلوبة**:
   - تصنيف الميزانية: منخفضة (Low Budget)، متوسطة (Medium Budget)، عالية (High Budget).
   - تفصيل التكاليف المتوقعة:
     * تكاليف ما قبل الإنتاج (Pre-production).
     * تكاليف التصوير (Production).
     * تكاليف ما بعد الإنتاج (Post-production).
   - مقارنة الميزانية المقدرة مع الميزانية المستهدفة.

2. **المتطلبات اللوجستية**:
   - **المواقع (Locations)**:
     * عدد المواقع المطلوبة.
     * نوعية المواقع (طبيعية، استوديو، أماكن تاريخية).
     * صعوبة الوصول والتصاريح.
   - **الديكورات والمناظر (Sets & Props)**:
     * هل يحتاج المشروع لبناء ديكورات خاصة؟
     * المؤثرات العملية (Practical Effects) المطلوبة.
   - **المؤثرات البصرية (VFX)**:
     * مستوى التعقيد (بسيط، متوسط، معقد).
     * نسبة المشاهد التي تحتاج لمؤثرات.

3. **التحديات الإنتاجية المتوقعة والحلول البديلة**:
   - التحديات التقنية (Technical Challenges).
   - التحديات اللوجستية (الطقس، المواقع النائية).
   - التحديات الفنية (مشاهد خطرة، كومبارس كبير).
   - الحلول البديلة والخطط الاحتياطية (Plan B).

4. **الجدوى الزمنية للتصوير**:
   - تقدير مدة التصوير (عدد الأيام/الأسابيع).
   - الجدول الزمني الواقعي لكل مرحلة.
   - العوامل التي قد تؤثر على الجدول (الطقس، توفر الممثلين).

5. **الحلول المبتكرة لخفض التكاليف**:
   - كيف يمكن خفض التكاليف دون المساس بالجودة؟
   - استخدام التقنيات الحديثة (Virtual Production، LED Walls).
   - الاستفادة من المواقع المحلية.
   - التصوير الذكي (Smart Shooting) والجدولة الفعالة.

## التنسيق المطلوب:

قدم تحليلاً عملياً وواقعياً.
كن محدداً في التقديرات (استخدم أرقام ونطاقات).
ركز على الحلول العملية والبدائل الإبداعية.
لا تستخدم JSON.
`;

    return prompt;
  }

  /**
   * استجابة احتياطية
   */
  protected override async getFallbackResponse(
    input: StandardAgentInput
  ): Promise<string> {
    return `# تحليل قابلية الإنتاج (احتياطي)

تحليل أولي لقابلية الإنتاج:

1. **الميزانية**: المشروع يبدو أنه يتطلب ميزانية متوسطة إلى مرتفعة، يُنصح بإعداد تقدير تفصيلي.
2. **المتطلبات اللوجستية**: هناك متطلبات لوجستية ملحوظة، خطط مبكراً للمواقع والديكورات.
3. **التحديات**: توقع تحديات في التنسيق والجدولة، ضع خطط احتياطية.
4. **التوصية**: ركز على التخطيط المسبق الدقيق، واستكشف الحلول التقنية الحديثة لتوفير التكاليف.`;
  }
}

// Export singleton instance
export const producibilityAnalyzerAgent = new ProducibilityAnalyzerAgent();
