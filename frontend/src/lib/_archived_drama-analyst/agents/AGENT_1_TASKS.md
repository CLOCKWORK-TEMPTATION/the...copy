# مهام الوكيل الأول - Agent 1 Tasks

> **المسؤولية**: ترقية **1 وكيل**  
> **الحالة**: ⏳ قيد الانتظار

---

## 🎯 الوكيل المطلوب ترقيته

### `analysis` - وكيل التحليل النقدي

| الخاصية | القيمة |
|---------|--------|
| **TaskType** | `TaskType.ANALYSIS` |
| **الاسم** | CritiqueArchitect AI |
| **الوصف** | وكيل التحليل النقدي المعماري: نظام هجين متعدد الوكلاء يدمج التفكير الجدلي مع التحليل الشعاعي العميق |
| **الأولوية** | 🔴 عالية |

---

## 📁 الملفات المطلوبة

### 1. إنشاء `AnalysisAgent.ts`

**المسار**: `frontend/src/lib/drama-analyst/agents/analysis/AnalysisAgent.ts`

**المتطلبات**:
- يمد `BaseAgent`
- يستخدم `TaskType.ANALYSIS`
- يستخدم `systemPrompt` من `ANALYSIS_AGENT_CONFIG`
- يطبق `buildPrompt()` لبناء موجه منظم
- يطبق `postProcess()` لتنظيف المخرجات

**المرجع**: استخدم `CharacterVoiceAgent.ts` كقالب

---

### 2. إنشاء `AnalysisAgent.test.ts`

**المسار**: `frontend/src/lib/drama-analyst/agents/analysis/AnalysisAgent.test.ts`

**المتطلبات**:
- تغطية ≥80%
- اختبارات: Configuration, Success Path, Low Confidence, Hallucination, Post-Processing, Error Handling, Advanced Options, Integration

**المرجع**: استخدم `CharacterVoiceAgent.test.ts` كقالب

---

### 3. تحديث `agent.ts`

**المسار**: `frontend/src/lib/drama-analyst/agents/analysis/agent.ts`

**المطلوب**: إضافة تصدير للوكيل الجديد:

```typescript
export { AnalysisAgent as default } from './AnalysisAgent';
```

---

### 4. تحديث `upgradedAgents.ts`

**المسار**: `frontend/src/lib/drama-analyst/agents/upgradedAgents.ts`

**المطلوب**: إضافة الوكيل إلى السجل:

```typescript
import { analysisAgent } from './analysis/AnalysisAgent';

UPGRADED_AGENTS.set(TaskType.ANALYSIS, analysisAgent);
```

---

## 🔍 تفاصيل الوكيل

### System Prompt

الموجه موجود في `analysis/agent.ts` في `ANALYSIS_AGENT_CONFIG.systemPrompt`

### Context Structure المتوقع

```typescript
interface AnalysisContext {
  originalText?: string;
  analysisReport?: any;
  previousStations?: {
    characterAnalysis?: string;
    thematicAnalysis?: string;
    plotAnalysis?: string;
  };
}
```

### buildPrompt() المتوقع

يجب أن:
1. يستخرج `originalText` من السياق
2. يستخرج `previousStations` إن وجدت
3. يبني موجه منظم يتضمن:
   - النص الأصلي
   - نتائج المحطات السابقة (إن وجدت)
   - المهمة المطلوبة
   - تعليمات التحليل النقدي

### postProcess() المتوقع

يجب أن:
1. ينظف المخرجات من JSON
2. يتحقق من وجود الأقسام المطلوبة (Executive Summary, Central Dialectic, Structural Integrity, Character Network, Recommendations)
3. يعدل الثقة حسب جودة التحليل

---

## ✅ قائمة التحقق

- [ ] قراءة `shared/AgentUpgradeTemplate.txt`
- [ ] قراءة `characterVoice/CharacterVoiceAgent.ts` كمثال
- [ ] إنشاء `AnalysisAgent.ts`
- [ ] إنشاء `AnalysisAgent.test.ts`
- [ ] تحديث `agent.ts`
- [ ] تحديث `upgradedAgents.ts`
- [ ] تشغيل `pnpm test` بنجاح
- [ ] تشغيل `pnpm typecheck` بنجاح
- [ ] تشغيل `pnpm lint` بنجاح
- [ ] تحديث `AGENTS_STATUS.md`
- [ ] تحديث `AGENTS_UPGRADE_DISTRIBUTION.md`

---

## 📝 ملاحظات

- هذا الوكيل أساسي جداً ويستخدمه وكلاء آخرون
- يجب التأكد من جودة عالية في التحليل
- الثقة المتوقعة: ≥0.85
- يجب أن يكون المخرج نصياً فقط بدون JSON

---

**آخر تحديث**: تم إنشاء الملف  
**الحالة**: ⏳ جاهز للتنفيذ
