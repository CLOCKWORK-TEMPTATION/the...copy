import { TaskCategory, TaskType } from '../core/enums';
import { AIAgentConfig } from '../core/types';

export const PRODUCTION_READINESS_ANALYZER_CONFIG: AIAgentConfig = {
  id: TaskType.PRODUCTION_READINESS_ANALYZER,
  name: "ProductionReadiness AI",
  description:
    "محلل جاهزية الإنتاج المتخصص في تقييم جاهزية أنظمة الإنتاج، العمليات، أو المرافق للبدء أو الاستمرار في العمليات الإنتاجية. يقدم تقارير شاملة بالعربية تغطي حالة المعدات، الموارد البشرية، المواد الخام، الجودة والسلامة، البنية التحتية، التحديات والمخاطر، والتوصيات.",
  category: TaskCategory.TECHNICAL,
  capabilities: {
    multiModal: false,
    reasoningChains: true,
    toolUse: true,
    memorySystem: true,
    selfReflection: true,
    ragEnabled: true,
    vectorSearch: false,
    agentOrchestration: false,
    metacognitive: true,
    adaptiveLearning: true,
    complexityScore: 0.85,
    accuracyLevel: 0.90,
    processingSpeed: 0.50,
    resourceIntensity: 0.60,
    languageModeling: true,
    patternRecognition: true,
    analyticalReasoning: true,
    contextualUnderstanding: true,
    creativeGeneration: false,
    emotionalIntelligence: false,
  },
  collaboratesWith: [],
  dependsOn: [],
  enhances: [],
  systemPrompt: `أنت 'ProductionReadiness AI'، محلل متخصص في تقييم جاهزية الإنتاج.

مهمتك هي تحليل بيانات الإنتاج المقدمة وإعداد تقرير شامل بالعربية يتضمن:

1. **معلومات عامة**: تاريخ التقرير، اسم المنشأة/المشروع، فترة التقرير
2. **حالة المعدات والآلات**: تقييم حالة وتوفر معدات الإنتاج، حالة الصيانة، المشاكل التقنية
3. **الموارد البشرية**: تقييم مستويات التوظيف، حالة التدريب، جاهزية القوى العاملة
4. **المواد الخام والمخزون**: مراجعة توفر المواد الخام، مستويات المخزون، حالة سلسلة التوريد
5. **الجودة والسلامة**: تقييم إجراءات مراقبة الجودة، بروتوكولات السلامة، الامتثال للمعايير
6. **البنية التحتية**: تقييم المرافق، المرافق العامة، البنية التحتية الداعمة
7. **التحديات والمخاطر**: تحديد العقبات، المخاطر، أو المشاكل التي قد تؤثر على جاهزية الإنتاج
8. **التوصيات**: توفير توصيات محددة لمعالجة أي فجوات أو تحسين الجاهزية
9. **التقييم العام**: تقديم تصنيف شامل للجاهزية (جاهز تماماً/جاهز مع ملاحظات/غير جاهز) مع التبرير

استخدم لغة عربية احترافية وواضحة. قم بتنظيم التقرير بعناوين واضحة لكل قسم. اعتمد بدقة على المعلومات المتوفرة في بيانات الإنتاج. إذا لم تكن بعض المعلومات متوفرة، قم بالإشارة إلى ذلك في القسم ذي الصلة.`,
  fewShotExamples: [],
  chainOfThoughtTemplate: "لتقييم جاهزية الإنتاج، سأحلل البيانات المتوفرة وأقيم كل جانب من جوانب العمليات الإنتاجية...",
  cacheStrategy: "selective",
  parallelizable: true,
  confidenceThreshold: 0.85,
};
