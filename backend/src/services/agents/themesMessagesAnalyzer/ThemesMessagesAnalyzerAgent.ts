/**
 * ThemesMessagesAnalyzerAgent - وكيل تحليل الموضوعات والرسائل
 * يطبق النمط القياسي: RAG → Self-Critique → Constitutional → Uncertainty → Hallucination → Debate
 * يحلل الموضوعات والرسائل الفلسفية: الطبقات المعنوية، الرسائل المضمرة، العمق الفكري.
 */

import { TaskType } from '../core/enums';
import { BaseAgent } from '../shared/BaseAgent';
import {
  StandardAgentInput,
  StandardAgentOutput,
} from '../core/types';
import { THEMES_MESSAGES_ANALYZER_AGENT_CONFIG } from './config';

export class ThemesMessagesAnalyzerAgent extends BaseAgent {
  constructor() {
    super(
      "PhilosophyMiner AI",
      TaskType.THEMES_MESSAGES_ANALYZER,
      THEMES_MESSAGES_ANALYZER_AGENT_CONFIG.systemPrompt || ""
    );

    this.confidenceFloor = 0.75;
  }

  /**
   * بناء الـ prompt من المدخلات
   */
  protected buildPrompt(input: StandardAgentInput): string {
    const { input: userInput, context } = input;

    // Extract thematic context
    const contextObj =
      typeof context === 'object' && context !== null ? context : {};
    const workTitle = (contextObj as any)?.workTitle || 'العمل الأدبي';
    const genre = (contextObj as any)?.genre || 'عام';

    let prompt = `## مهمة تحليل الموضوعات والرسائل الفلسفية

### العمل: ${workTitle}
### النوع: ${genre}

### النص المراد تحليله:
${userInput}

### محاور التحليل المطلوبة:

1. **الموضوعات الرئيسية والفرعية (Themes)**:
   - ما هي الموضوعات الكبرى (Major Themes) المحورية في العمل؟
   - الموضوعات الفرعية (Minor Themes) وكيف تدعم الموضوعات الرئيسية.
   - العلاقة بين الموضوعات المختلفة (Thematic Web).

2. **الرسائل الصريحة والمضمرة**:
   - الرسائل المباشرة (Explicit Messages) التي يطرحها العمل.
   - الرسائل الضمنية (Implicit Messages) والمعاني المبطنة.
   - الأسئلة الفلسفية المطروحة دون إجابات واضحة.

3. **التناقضات الفلسفية والإشكاليات**:
   - الثنائيات المتناقضة (Dichotomies) في العمل (خير/شر، حرية/قيود).
   - الصراعات الأخلاقية والمعضلات الفلسفية.
   - كيف يتعامل العمل مع هذه التناقضات؟

4. **العمق الفكري والأصالة المفاهيمية**:
   - مدى عمق الطرح الفلسفي (Philosophical Depth).
   - الأصالة في المعالجة مقابل الأفكار المستهلكة.
   - المراجع الفلسفية أو الفكرية المحتملة.

5. **التماسك الفلسفي عبر السرد**:
   - هل تتطور الموضوعات بشكل متسق عبر العمل؟
   - هل هناك تضارب أو تشتت في الرسائل؟
   - مدى وضوح الرؤية الفلسفية الشاملة.

## التنسيق المطلوب:

قدم تحليلاً فلسفياً عميقاً ودقيقاً.
استخدم التحليل الهرمنوطيقي لكشف المعاني الخفية.
ركز على "لماذا" و"كيف" يطرح العمل هذه الأفكار.
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
    return `# تحليل موضوعات ورسائل (احتياطي)

تحليل أولي للطبقات المعنوية:

1. **الموضوعات**: يبدو أن هناك موضوعات واضحة ولكن تحتاج لتعميق أكثر.
2. **الرسائل**: الرسائل الصريحة موجودة، لكن المعاني المضمرة تحتاج لاستكشاف أدق.
3. **التماسك الفلسفي**: يُنصح بتوضيح الرؤية الفلسفية الشاملة وربط الموضوعات ببعضها بشكل أقوى.
4. **التوصية**: حاول طرح أسئلة فلسفية أعمق دون تقديم إجابات جاهزة، واترك مساحة للتفكير.`;
  }
}

// Export singleton instance
export const themesMessagesAnalyzerAgent = new ThemesMessagesAnalyzerAgent();
