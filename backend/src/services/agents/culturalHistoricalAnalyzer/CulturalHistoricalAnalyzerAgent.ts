/**
 * CulturalHistoricalAnalyzerAgent - وكيل التحليل الثقافي والتاريخي
 * يطبق النمط القياسي: RAG → Self-Critique → Constitutional → Uncertainty → Hallucination → Debate
 * يحلل السياق الثقافي والتاريخي: الدقة التاريخية، المصداقية الثقافية، الحساسية.
 */

import { TaskType } from '../core/enums';
import { BaseAgent } from '../shared/BaseAgent';
import {
  StandardAgentInput,
  StandardAgentOutput,
} from '../core/types';
import { CULTURAL_HISTORICAL_ANALYZER_AGENT_CONFIG } from './config';

export class CulturalHistoricalAnalyzerAgent extends BaseAgent {
  constructor() {
    super(
      "ChronoContext AI",
      TaskType.CULTURAL_HISTORICAL_ANALYZER,
      CULTURAL_HISTORICAL_ANALYZER_AGENT_CONFIG.systemPrompt || ""
    );

    this.confidenceFloor = 0.75;
  }

  /**
   * بناء الـ prompt من المدخلات
   */
  protected buildPrompt(input: StandardAgentInput): string {
    const { input: userInput, context } = input;

    // Extract cultural/historical context
    const contextObj =
      typeof context === 'object' && context !== null ? context : {};
    const timePeriod = (contextObj as any)?.timePeriod || 'غير محدد';
    const culturalSetting = (contextObj as any)?.culturalSetting || 'غير محدد';
    const geographicLocation = (contextObj as any)?.geographicLocation || 'غير محدد';

    let prompt = `## مهمة التحليل الثقافي والتاريخي

### السياق:
- **الفترة الزمنية**: ${timePeriod}
- **البيئة الثقافية**: ${culturalSetting}
- **الموقع الجغرافي**: ${geographicLocation}

### النص المراد تحليله:
${userInput}

### محاور التحليل المطلوبة:

1. **الدقة التاريخية للأحداث والتفاصيل**:
   - هل الأحداث والتواريخ المذكورة دقيقة تاريخياً؟
   - هل التفاصيل اليومية (الملابس، الطعام، العادات) تتوافق مع الفترة؟
   - أي أخطاء تاريخية (Anachronisms) محتملة؟

2. **المصداقية الثقافية والتمثيل العادل**:
   - هل يتم تمثيل الثقافات المختلفة بشكل دقيق ومحترم؟
   - هل هناك تبسيط مفرط أو تعميم للثقافات؟
   - مدى عمق الفهم الثقافي المعروض.

3. **التحيزات الثقافية المحتملة أو الصور النمطية**:
   - هل يوجد تحيز واضح أو ضمني تجاه ثقافة أو مجموعة معينة؟
   - الصور النمطية (Stereotypes) المحتملة وكيفية تجنبها.
   - التمثيل المتوازن للشخصيات من خلفيات متنوعة.

4. **الحساسية تجاه القضايا الاجتماعية والسياسية**:
   - القضايا الحساسة المطروحة (العرق، الدين، السياسة، الجندر).
   - كيف يتم معالجة هذه القضايا - بحساسية أم بشكل استفزازي؟
   - المخاطر المحتملة للإساءة أو سوء الفهم.

5. **التوقعات المحتملة لردود الفعل الجماهيرية**:
   - كيف قد يستقبل الجمهور من ثقافات مختلفة هذا العمل؟
   - المجموعات التي قد تتأثر إيجاباً أو سلباً.
   - التوصيات لتحسين الحساسية الثقافية.

## التنسيق المطلوب:

قدم تحليلاً موضوعياً ومتوازناً.
كن محترماً للثقافات المختلفة دون تحيز.
أشر إلى نقاط القوة والمخاوف بوضوح.
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
    return `# تحليل ثقافي وتاريخي (احتياطي)

تحليل أولي للسياق الثقافي والتاريخي:

1. **الدقة التاريخية**: يُنصح بالتحقق من التفاصيل التاريخية والتأكد من عدم وجود أخطاء زمنية.
2. **المصداقية الثقافية**: تأكد من تمثيل الثقافات بشكل دقيق ومحترم، وتجنب التعميمات.
3. **الحساسية**: راجع القضايا الحساسة المطروحة وتأكد من معالجتها بعناية واحترام.
4. **التوصية**: استشر خبراء ثقافيين أو مؤرخين لضمان الدقة والحساسية في التمثيل.`;
  }
}

// Export singleton instance
export const culturalHistoricalAnalyzerAgent = new CulturalHistoricalAnalyzerAgent();
