/**
 * VisualCinematicAnalyzerAgent - وكيل التحليل البصري السينمائي
 * يطبق النمط القياسي: RAG → Self-Critique → Constitutional → Uncertainty → Hallucination → Debate
 * يحلل العناصر البصرية والسينمائية: الرمزية، التصوير، الأجواء، الإضاءة، حركة الكاميرا.
 */

import { TaskType } from '../core/enums';
import { BaseAgent } from '../shared/BaseAgent';
import {
  StandardAgentInput,
  StandardAgentOutput,
} from '../core/types';
import { VISUAL_CINEMATIC_ANALYZER_AGENT_CONFIG } from './config';

export class VisualCinematicAnalyzerAgent extends BaseAgent {
  constructor() {
    super(
      "CinemaVision AI",
      TaskType.VISUAL_CINEMATIC_ANALYZER,
      VISUAL_CINEMATIC_ANALYZER_AGENT_CONFIG.systemPrompt || ""
    );

    this.confidenceFloor = 0.75;
  }

  /**
   * بناء الـ prompt من المدخلات
   */
  protected buildPrompt(input: StandardAgentInput): string {
    const { input: userInput, context } = input;

    // Extract visual context
    const contextObj =
      typeof context === 'object' && context !== null ? context : {};
    const sceneDescription = (contextObj as any)?.sceneDescription || 'المشهد المراد تحليله';
    const genre = (contextObj as any)?.genre || 'عام';

    let prompt = `## مهمة التحليل البصري السينمائي

### النوع (Genre):
${genre}

### المشهد/النص المراد تحليله:
${userInput}

${sceneDescription !== 'المشهد المراد تحليله' ? `### وصف المشهد:\n${sceneDescription}\n` : ''}

### محاور التحليل المطلوبة:

1. **الرمزية البصرية والاستعارات المرئية**:
   - ما هي الرموز البصرية المحتملة في المشهد؟
   - كيف يمكن ترجمة المشاعر والمعاني إلى عناصر مرئية؟
   - الاستعارات المرئية (Visual Metaphors) المقترحة.

2. **قابلية التصوير والتنفيذ الإخراجي**:
   - مدى سهولة أو صعوبة تصوير المشهد.
   - الزوايا والإطارات (Framing) المقترحة.
   - التحديات الإخراجية والحلول الإبداعية.

3. **الأجواء البصرية (Mood and Atmosphere)**:
   - كيف يمكن خلق الجو المناسب بصرياً؟
   - لوحة الألوان (Color Palette) المقترحة.
   - العناصر البيئية المكملة (Props, Set Design).

4. **استخدام الضوء والظل والألوان**:
   - نوع الإضاءة المقترحة (Hard/Soft، Natural/Artificial).
   - كيف يمكن استخدام الظلال لتعزيز الدراما؟
   - دلالات الألوان ودورها في السرد البصري.

5. **حركة الكاميرا والتكوين البصري**:
   - حركات الكاميرا المقترحة (Pan, Tilt, Dolly, Tracking).
   - القاعدة الذهبية والتكوين (Rule of Thirds, Symmetry).
   - التركيز البؤري (Depth of Field) وأثره الدرامي.

## التنسيق المطلوب:

قدم تحليلاً بصرياً عملياً وقابلاً للتطبيق.
استخدم مصطلحات سينمائية دقيقة.
ركز على الجانب العملي للإخراج والتصوير.
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
    return `# تحليل بصري سينمائي (احتياطي)

تحليل أولي للعناصر البصرية:

1. **الإمكانية البصرية**: المشهد يحتوي على إمكانيات بصرية جيدة ولكن يحتاج لتحديد أوضح للعناصر المرئية.
2. **التحديات**: قد تواجه تحديات في التصوير، يُنصح بالتخطيط المسبق للإضاءة وحركة الكاميرا.
3. **التوصية**: حدد لوحة الألوان والمزاج البصري بوضوح قبل التصوير، واستخدم الإضاءة لتعزيز الحالة الدرامية.`;
  }
}

// Export singleton instance
export const visualCinematicAnalyzerAgent = new VisualCinematicAnalyzerAgent();
