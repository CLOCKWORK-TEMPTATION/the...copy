/**
 * ProductionReadinessAnalyzerAgent - وكيل تحليل جاهزية الإنتاج
 * يطبق النمط القياسي: RAG → Self-Critique → Constitutional → Uncertainty → Hallucination → Debate
 * يقوم بتحليل بيانات الإنتاج وإعداد تقرير شامل بالعربية يقيم جاهزية أنظمة الإنتاج للعمليات.
 */

import { TaskType } from '../core/enums';
import { BaseAgent } from '../shared/BaseAgent';
import {
  StandardAgentInput,
  StandardAgentOutput,
} from '../core/types';
import { PRODUCTION_READINESS_ANALYZER_CONFIG } from './config';

export class ProductionReadinessAnalyzerAgent extends BaseAgent {
  constructor() {
    super(
      "ProductionReadiness AI",
      TaskType.PRODUCTION_READINESS_ANALYZER,
      PRODUCTION_READINESS_ANALYZER_CONFIG.systemPrompt || ""
    );

    this.confidenceFloor = 0.85;
  }

  /**
   * بناء الـ prompt من المدخلات
   */
  protected buildPrompt(input: StandardAgentInput): string {
    const { input: userInput, context } = input;

    // Extract context information
    const contextObj =
      typeof context === 'object' && context !== null ? context : {};
    const reportDate = (contextObj as any)?.reportDate || new Date().toISOString().split('T')[0];
    const facilityName = (contextObj as any)?.facilityName || 'غير محدد';
    const reportingPeriod = (contextObj as any)?.reportingPeriod || 'غير محدد';

    let prompt = `## تقرير جاهزية الإنتاج (Production Readiness Report)

### معلومات التقرير:
- **تاريخ التقرير**: ${reportDate}
- **اسم المنشأة/المشروع**: ${facilityName}
- **فترة التقرير**: ${reportingPeriod}

### بيانات الإنتاج المراد تحليلها:
${userInput}

---

## هيكل التقرير المطلوب:

يرجى إعداد تقرير شامل بالعربية يتضمن الأقسام التالية:

### 1. معلومات عامة (General Information)
- تاريخ التقرير
- اسم المنشأة/المشروع (إذا ذُكر)
- فترة التقرير

### 2. حالة المعدات والآلات (Equipment and Machinery Status)
قيّم:
- حالة وتوفر معدات الإنتاج
- حالة الصيانة (الصيانة الدورية، الصيانة التصحيحية)
- المشاكل التقنية المعروفة
- معدل توفر المعدات (Equipment Availability Rate)
- أي احتياجات للترقية أو الاستبدال

### 3. الموارد البشرية (Human Resources)
قيّم:
- مستويات التوظيف (هل الفريق مكتمل؟)
- حالة التدريب والمهارات
- جاهزية القوى العاملة
- معدل الحضور والغياب
- أي احتياجات تدريبية أو توظيفية

### 4. المواد الخام والمخزون (Raw Materials and Inventory)
راجع:
- توفر المواد الخام الأساسية
- مستويات المخزون (كافية/منخفضة/حرجة)
- حالة سلسلة التوريد
- جودة المواد المخزنة
- أي مخاطر في التوريد

### 5. الجودة والسلامة (Quality and Safety)
قيّم:
- إجراءات مراقبة الجودة المطبقة
- بروتوكولات السلامة المهنية
- الامتثال للمعايير والمواصفات
- معدل العيوب والشكاوى
- حوادث السلامة (إن وجدت)

### 6. البنية التحتية (Infrastructure)
قيّم:
- حالة المرافق (المباني، الأرضيات، الإضاءة)
- المرافق العامة (الكهرباء، المياه، التكييف)
- البنية التحتية الداعمة (الشبكات، الاتصالات)
- أي مشاكل في البنية التحتية

### 7. التحديات والمخاطر (Challenges and Risks)
حدد:
- العقبات الحالية أو المحتملة
- المخاطر التشغيلية
- المشاكل التي قد تؤثر على جاهزية الإنتاج
- تقييم مستوى الخطورة (منخفض/متوسط/عالي)

### 8. التوصيات (Recommendations)
قدم:
- توصيات محددة لمعالجة أي فجوات
- إجراءات تحسين الجاهزية
- أولويات العمل (عاجل/مهم/عادي)
- خطة عمل مقترحة (إن أمكن)

### 9. التقييم العام (Overall Assessment)
قدم:
- تصنيف شامل للجاهزية:
  * **جاهز تماماً** (Fully Ready): جميع الأنظمة جاهزة للإنتاج
  * **جاهز مع ملاحظات** (Ready with Notes): جاهز مع بعض التحفظات البسيطة
  * **غير جاهز** (Not Ready): هناك مشاكل جوهرية تمنع البدء
- تبرير التقييم بناءً على التحليل أعلاه
- النسبة المئوية للجاهزية (إن أمكن)

---

## إرشادات الكتابة:

1. استخدم **لغة عربية احترافية وواضحة**
2. استخدم **عناوين واضحة** لكل قسم
3. **اعتمد بدقة** على المعلومات المتوفرة في بيانات الإنتاج
4. إذا لم تكن بعض المعلومات متوفرة، **أذكر ذلك صراحة** في القسم ذي الصلة (مثال: "لا توجد معلومات متوفرة عن...")
5. استخدم **نقاط وقوائم** لتنظيم المعلومات
6. كن **موضوعياً وواقعياً** في التقييم
7. قدم **أمثلة محددة** من البيانات عند الإمكان
8. **لا تستخدم JSON أو تنسيقات برمجية** - نص عربي واضح فقط

أعد تقريراً كاملاً ومنظماً يمكن تقديمه للإدارة أو أصحاب المصلحة.
`;

    return prompt;
  }

  /**
   * استجابة احتياطية
   */
  protected override async getFallbackResponse(
    input: StandardAgentInput
  ): Promise<string> {
    const contextObj =
      typeof input.context === 'object' && input.context !== null ? input.context : {};
    const reportDate = (contextObj as any)?.reportDate || new Date().toISOString().split('T')[0];

    return `# تقرير جاهزية الإنتاج (احتياطي)

**تاريخ التقرير**: ${reportDate}

## ملاحظة
نعتذر، لم نتمكن من إعداد التقرير الكامل بسبب مشكلة تقنية.

## ملخص عام
بناءً على المعلومات المتوفرة، يُنصح بإجراء تقييم شامل لجاهزية الإنتاج يشمل:

1. **المعدات**: مراجعة حالة جميع المعدات والآلات
2. **الموارد البشرية**: التأكد من جاهزية الفريق وتدريبه
3. **المواد الخام**: التحقق من توفر المخزون الكافي
4. **السلامة**: مراجعة بروتوكولات السلامة والجودة
5. **البنية التحتية**: فحص المرافق والبنية التحتية

## التوصية
يُرجى إعادة المحاولة أو التواصل مع الفريق التقني للحصول على تقرير مفصل.`;
  }
}

// Export singleton instance
export const productionReadinessAnalyzerAgent = new ProductionReadinessAnalyzerAgent();
