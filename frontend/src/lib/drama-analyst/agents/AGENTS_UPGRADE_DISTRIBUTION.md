# خطة توزيع ترقية الوكلاء - Agents Upgrade Distribution Plan

> **التاريخ**: تم إنشاء الخطة  
> **الحالة**: جاهز للتنفيذ  
> **الوكلاء المطلوب ترقيتها**: 13 وكيل  
> **عدد الوكلاء المكلفين**: 6 وكلاء

---

## 📊 نظرة عامة

هذه الوثيقة تحدد توزيع مهمة ترقية 13 وكيل بين 6 وكلاء، حيث:
- **الوكيل الأول والثاني**: كل منهما سيرقي **وكيل واحد فقط**
- **الوكلاء 3-6**: كل منهم سيرقي **3 وكلاء**

---

## 🎯 التوزيع التفصيلي

### الوكيل الأول (Agent 1)
**المسؤولية**: ترقية **1 وكيل**

| # | الوكيل | TaskType | الحالة | الأولوية |
|---|--------|----------|--------|----------|
| 1 | `analysis` | `TaskType.ANALYSIS` | ⏳ قيد الانتظار | 🔴 عالية |

**الملفات المطلوبة**:
- `frontend/src/lib/drama-analyst/agents/analysis/AnalysisAgent.ts` (جديد)
- `frontend/src/lib/drama-analyst/agents/analysis/AnalysisAgent.test.ts` (جديد)
- تحديث `frontend/src/lib/drama-analyst/agents/analysis/agent.ts` (موجود)

---

### الوكيل الثاني (Agent 2)
**المسؤولية**: ترقية **1 وكيل**

| # | الوكيل | TaskType | الحالة | الأولوية |
|---|--------|----------|--------|----------|
| 1 | `integrated` | `TaskType.INTEGRATED` | ⏳ قيد الانتظار | 🔴 عالية |

**الملفات المطلوبة**:
- `frontend/src/lib/drama-analyst/agents/integrated/IntegratedAgent.ts` (جديد)
- `frontend/src/lib/drama-analyst/agents/integrated/IntegratedAgent.test.ts` (جديد)
- تحديث `frontend/src/lib/drama-analyst/agents/integrated/agent.ts` (موجود)

---

### الوكيل الثالث (Agent 3)
**المسؤولية**: ترقية **3 وكلاء**

| # | الوكيل | TaskType | الحالة | الأولوية |
|---|--------|----------|--------|----------|
| 1 | `audienceResonance` | `TaskType.AUDIENCE_RESONANCE` | ⏳ قيد الانتظار | 🟡 متوسطة |
| 2 | `platformAdapter` | `TaskType.PLATFORM_ADAPTER` | ⏳ قيد الانتظار | 🟡 متوسطة |
| 3 | `characterDeepAnalyzer` | `TaskType.CHARACTER_DEEP_ANALYZER` | ⏳ قيد الانتظار | 🟡 متوسطة |

**الملفات المطلوبة لكل وكيل**:
- `*Agent.ts` (جديد)
- `*Agent.test.ts` (جديد)
- تحديث `agent.ts` (موجود)

---

### الوكيل الرابع (Agent 4)
**المسؤولية**: ترقية **3 وكلاء**

| # | الوكيل | TaskType | الحالة | الأولوية |
|---|--------|----------|--------|----------|
| 1 | `dialogueAdvancedAnalyzer` | `TaskType.DIALOGUE_ADVANCED_ANALYZER` | ⏳ قيد الانتظار | 🟡 متوسطة |
| 2 | `visualCinematicAnalyzer` | `TaskType.VISUAL_CINEMATIC_ANALYZER` | ⏳ قيد الانتظار | 🟡 متوسطة |
| 3 | `themesMessagesAnalyzer` | `TaskType.THEMES_MESSAGES_ANALYZER` | ⏳ قيد الانتظار | 🟡 متوسطة |

**الملفات المطلوبة لكل وكيل**:
- `*Agent.ts` (جديد)
- `*Agent.test.ts` (جديد)
- تحديث `agent.ts` (موجود)

---

### الوكيل الخامس (Agent 5)
**المسؤولية**: ترقية **3 وكلاء**

| # | الوكيل | TaskType | الحالة | الأولوية |
|---|--------|----------|--------|----------|
| 1 | `culturalHistoricalAnalyzer` | `TaskType.CULTURAL_HISTORICAL_ANALYZER` | ⏳ قيد الانتظار | 🟡 متوسطة |
| 2 | `producibilityAnalyzer` | `TaskType.PRODUCIBILITY_ANALYZER` | ⏳ قيد الانتظار | 🟡 متوسطة |
| 3 | `targetAudienceAnalyzer` | `TaskType.TARGET_AUDIENCE_ANALYZER` | ⏳ قيد الانتظار | 🟡 متوسطة |

**الملفات المطلوبة لكل وكيل**:
- `*Agent.ts` (جديد)
- `*Agent.test.ts` (جديد)
- تحديث `agent.ts` (موجود)

---

### الوكيل السادس (Agent 6)
**المسؤولية**: ترقية **2 وكيل**

| # | الوكيل | TaskType | الحالة | الأولوية |
|---|--------|----------|--------|----------|
| 1 | `literaryQualityAnalyzer` | `TaskType.LITERARY_QUALITY_ANALYZER` | ⏳ قيد الانتظار | 🟡 متوسطة |
| 2 | `recommendationsGenerator` | `TaskType.RECOMMENDATIONS_GENERATOR` | ⏳ قيد الانتظار | 🟡 متوسطة |

**الملفات المطلوبة لكل وكيل**:
- `*Agent.ts` (جديد)
- `*Agent.test.ts` (جديد)
- تحديث `agent.ts` (موجود)

---

## 📋 ملخص التوزيع

| الوكيل المكلف | عدد الوكلاء المطلوب ترقيتها | الوكلاء |
|---------------|---------------------------|---------|
| Agent 1 | 1 | analysis |
| Agent 2 | 1 | integrated |
| Agent 3 | 3 | audienceResonance, platformAdapter, characterDeepAnalyzer |
| Agent 4 | 3 | dialogueAdvancedAnalyzer, visualCinematicAnalyzer, themesMessagesAnalyzer |
| Agent 5 | 3 | culturalHistoricalAnalyzer, producibilityAnalyzer, targetAudienceAnalyzer |
| Agent 6 | 2 | literaryQualityAnalyzer, recommendationsGenerator |
| **المجموع** | **13** | **13 وكيل** |

---

## 🏗️ النمط القياسي المطلوب تطبيقه

جميع الوكلاء يجب أن تطبق السلسلة الكاملة:

```
RAG → Self-Critique → Constitutional → Uncertainty → Hallucination → (Debate عند انخفاض الثقة)
```

### المتطلبات الأساسية

1. **الوراثة من BaseAgent**:
   ```typescript
   export class [AgentName]Agent extends BaseAgent {
     constructor() {
       super(
         "[Display Name]",
         TaskType.[TASK_TYPE],
         "[System Prompt]"
       );
       this.confidenceFloor = 0.75; // حسب الوكيل
     }
   }
   ```

2. **تنفيذ buildPrompt()**:
   - استخراج السياق من `input.context`
   - بناء موجه منظم وواضح
   - إضافة تعليمات محددة للوكيل

3. **تنفيذ postProcess()** (اختياري):
   - تنظيف المخرجات من JSON
   - تقييم الجودة
   - تعديل الثقة حسب الحاجة

4. **اختبارات شاملة**:
   - Configuration Tests
   - Success Path Tests
   - Low Confidence Tests
   - Hallucination Detection Tests
   - Post-Processing Tests
   - Error Handling Tests
   - Advanced Options Tests
   - Integration Tests

---

## 📝 قالب الترقية

### 1. إنشاء ملف `*Agent.ts`

استخدم القالب من `shared/AgentUpgradeTemplate.txt` مع التعديلات التالية:

- استبدل `[AGENT_NAME]` باسم الوكيل (مثل: `Analysis`)
- استبدل `[ARABIC_NAME]` بالاسم العربي (مثل: `التحليل النقدي`)
- استبدل `[TASK_TYPE]` بنوع المهمة (مثل: `TaskType.ANALYSIS`)
- استبدل `[SYSTEM_PROMPT]` بموجه النظام من `agent.ts`

### 2. إنشاء ملف `*Agent.test.ts`

استخدم نمط الاختبارات من الوكلاء المرقّاة سابقاً (مثل: `CharacterVoiceAgent.test.ts`)

### 3. تحديث `agent.ts`

احتفظ بـ `AIAgentConfig` فقط، وأضف تصدير للوكيل الجديد:

```typescript
export { AnalysisAgent as default } from './AnalysisAgent';
```

### 4. تحديث `upgradedAgents.ts`

أضف الوكيل الجديد إلى السجل:

```typescript
UPGRADED_AGENTS.set(TaskType.ANALYSIS, analysisAgent);
```

---

## ✅ قائمة التحقق لكل وكيل

قبل إكمال ترقية أي وكيل، تأكد من:

- [ ] إنشاء `*Agent.ts` يمد `BaseAgent`
- [ ] تنفيذ `buildPrompt()` بشكل صحيح
- [ ] تنفيذ `postProcess()` (إن لزم)
- [ ] إنشاء `*Agent.test.ts` مع تغطية ≥80%
- [ ] تحديث `agent.ts` للتصدير
- [ ] تحديث `upgradedAgents.ts`
- [ ] تحديث `index.ts` (إن لزم)
- [ ] تشغيل `pnpm test` بنجاح
- [ ] تشغيل `pnpm typecheck` بنجاح
- [ ] تشغيل `pnpm lint` بنجاح
- [ ] التحقق من عدم وجود JSON في المخرجات
- [ ] تحديث `AGENTS_STATUS.md`

---

## 🔄 سير العمل المقترح

### المرحلة 1: الإعداد
1. كل وكيل يفحص الوكلاء المكلف بها
2. قراءة `AgentUpgradeTemplate.txt`
3. فحص مثال من وكيل مرقّى (مثل: `CharacterVoiceAgent`)

### المرحلة 2: التنفيذ
1. إنشاء `*Agent.ts` لكل وكيل
2. إنشاء `*Agent.test.ts` لكل وكيل
3. تحديث الملفات التراثية

### المرحلة 3: التحقق
1. تشغيل الاختبارات
2. فحص النوع
3. فحص اللينتر
4. اختبار يدوي

### المرحلة 4: التوثيق
1. تحديث `AGENTS_STATUS.md`
2. تحديث هذا الملف (تغيير الحالة إلى ✅)

---

## 📊 تتبع التقدم

### Agent 1
- [ ] analysis

### Agent 2
- [ ] integrated

### Agent 3
- [ ] audienceResonance
- [ ] platformAdapter
- [ ] characterDeepAnalyzer

### Agent 4
- [ ] dialogueAdvancedAnalyzer
- [ ] visualCinematicAnalyzer
- [ ] themesMessagesAnalyzer

### Agent 5
- [ ] culturalHistoricalAnalyzer
- [ ] producibilityAnalyzer
- [ ] targetAudienceAnalyzer

### Agent 6
- [ ] literaryQualityAnalyzer
- [ ] recommendationsGenerator

---

## 📞 المراجع

- `shared/BaseAgent.ts` - الفئة الأساسية
- `shared/standardAgentPattern.ts` - النمط القياسي
- `shared/AgentUpgradeTemplate.txt` - قالب الترقية
- `characterVoice/CharacterVoiceAgent.ts` - مثال مرقّى
- `AGENTS_STATUS.md` - حالة الوكلاء الحالية

---

**آخر تحديث**: تم إنشاء الخطة  
**الحالة**: ⏳ جاهز للتنفيذ
