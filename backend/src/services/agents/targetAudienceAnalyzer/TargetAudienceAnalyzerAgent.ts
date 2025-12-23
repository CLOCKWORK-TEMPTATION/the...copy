/**
 * TargetAudienceAnalyzerAgent - وكيل تحليل الجمهور المستهدف
 * يطبق النمط القياسي: RAG → Self-Critique → Constitutional → Uncertainty → Hallucination → Debate
 * يحلل الجمهور المستهدف: الديموغرافيا، السيكوغرافيا، التفضيلات، القابلية التسويقية.
 */

import { TaskType } from '../core/enums';
import { BaseAgent } from '../shared/BaseAgent';
import {
  StandardAgentInput,
  StandardAgentOutput,
} from '../core/types';
import { TARGET_AUDIENCE_ANALYZER_AGENT_CONFIG } from './config';

export class TargetAudienceAnalyzerAgent extends BaseAgent {
  constructor() {
    super(
      "AudienceCompass AI",
      TaskType.TARGET_AUDIENCE_ANALYZER,
      TARGET_AUDIENCE_ANALYZER_AGENT_CONFIG.systemPrompt || ""
    );

    this.confidenceFloor = 0.75;
  }

  /**
   * بناء الـ prompt من المدخلات
   */
  protected buildPrompt(input: StandardAgentInput): string {
    const { input: userInput, context } = input;

    // Extract audience context
    const contextObj =
      typeof context === 'object' && context !== null ? context : {};
    const genre = (contextObj as any)?.genre || 'عام';
    const contentRating = (contextObj as any)?.contentRating || 'غير محدد';
    const marketRegion = (contextObj as any)?.marketRegion || 'عالمي';

    let prompt = `## مهمة تحليل الجمهور المستهدف

### السياق التسويقي:
- **النوع (Genre)**: ${genre}
- **التصنيف العمري (Rating)**: ${contentRating}
- **المنطقة السوقية**: ${marketRegion}

### المشروع المراد تحليله:
${userInput}

### محاور التحليل المطلوبة:

1. **الفئات العمرية المستهدفة**:
   - الفئة العمرية الأساسية (Primary Target Age Group).
   - الفئات العمرية الثانوية (Secondary Target Groups).
   - لماذا هذه الفئات بالتحديد؟ (استناداً لمحتوى وموضوعات العمل).

2. **الخصائص الديموغرافية والسيكوغرافية**:
   - **الديموغرافيا (Demographics)**:
     * الجنس (Gender Distribution).
     * المستوى التعليمي.
     * الدخل والطبقة الاجتماعية.
     * المنطقة الجغرافية (حضر/ريف).
   - **السيكوغرافيا (Psychographics)**:
     * القيم والمعتقدات.
     * الاهتمامات والهوايات.
     * نمط الحياة (Lifestyle).
     * السلوك الاستهلاكي للمحتوى.

3. **التفضيلات الثقافية والترفيهية**:
   - ما هي أنواع المحتوى المفضلة لدى الجمهور المستهدف؟
   - الأعمال المشابهة التي قد تجذب نفس الجمهور (Comparable Titles).
   - الاتجاهات الثقافية الحالية (Cultural Trends) التي يتماشى معها العمل.

4. **المحتوى الحساس المحتمل لشرائح معينة**:
   - المواضيع أو المشاهد التي قد تكون حساسة لفئات معينة.
   - التحذيرات المحتملة (Content Warnings).
   - كيف يمكن تخفيف الحساسية دون المساس بالرسالة؟

5. **القابلية التسويقية والجاذبية الجماهيرية**:
   - **نقاط البيع الفريدة (Unique Selling Points - USPs)**:
     * ما الذي يميز هذا العمل؟
   - **العوامل الجاذبة (Hook Elements)**:
     * الحبكة، الشخصيات، المواضيع، الأسلوب.
   - **التحديات التسويقية**:
     * الجوانب التي قد تصعّب التسويق.
     * الحلول المقترحة.

6. **المنصات المثالية للنشر**:
   - **السينما (Theatrical Release)**:
     * هل يناسب العمل العرض السينمائي؟
   - **التلفزيون (TV Broadcast/Cable)**:
     * القنوات أو الشبكات المناسبة.
   - **المنصات الرقمية (Streaming Platforms)**:
     * أي منصات؟ (Netflix, Amazon Prime, Disney+, إلخ).
     * لماذا هذه المنصات بالتحديد؟
   - **الهجين (Multi-Platform Strategy)**:
     * استراتيجية توزيع متعددة المنصات.

## التنسيق المطلوب:

قدم تحليلاً تسويقياً دقيقاً ومدعماً بالبيانات السلوكية.
استخدم التسويق النفسي (Psychographic Marketing) والبيانات الديموغرافية.
كن محدداً في تحديد الجمهور والمنصات.
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
    return `# تحليل الجمهور المستهدف (احتياطي)

تحليل أولي للجمهور المستهدف:

1. **الفئة العمرية**: يبدو أن العمل يستهدف جمهوراً واسعاً، حدد بدقة أكبر الفئة الأساسية.
2. **الخصائص**: ركز على السيكوغرافيا بجانب الديموغرافيا لفهم أعمق لدوافع الجمهور.
3. **المنصات**: العمل يصلح لمنصات متعددة، حدد الأولوية بناءً على الجمهور المستهدف.
4. **التوصية**: أجرِ بحث سوقي دقيق، واستخدم بيانات الجمهور من أعمال مشابهة لتحسين الاستهداف.`;
  }
}

// Export singleton instance
export const targetAudienceAnalyzerAgent = new TargetAudienceAnalyzerAgent();
