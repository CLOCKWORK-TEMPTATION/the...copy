# مهام الوكيل الثاني - Agent 2 Tasks

> **المسؤولية**: ترقية **1 وكيل**  
> **الحالة**: ⏳ قيد الانتظار

---

## 🎯 الوكيل المطلوب ترقيته

### `integrated` - المنسق التركيبي الذكي

| الخاصية | القيمة |
|---------|--------|
| **TaskType** | `TaskType.INTEGRATED` |
| **الاسم** | SynthesisOrchestrator AI |
| **الوصف** | وكيل أوركسترالي متقدم يستخدم تقنيات الذكاء الجمعي لتنسيق وتكامل عمليات التحليل والإبداع |
| **الأولوية** | 🔴 عالية |

---

## 📁 الملفات المطلوبة

### 1. إنشاء `IntegratedAgent.ts`

**المسار**: `frontend/src/lib/drama-analyst/agents/integrated/IntegratedAgent.ts`

**المتطلبات**:
- يمد `BaseAgent`
- يستخدم `TaskType.INTEGRATED`
- يستخدم `systemPrompt` من `INTEGRATED_AGENT_CONFIG`
- يطبق `buildPrompt()` لبناء موجه منظم
- يطبق `postProcess()` لتنظيف المخرجات

**المرجع**: استخدم `CharacterVoiceAgent.ts` كقالب

---

### 2. إنشاء `IntegratedAgent.test.ts`

**المسار**: `frontend/src/lib/drama-analyst/agents/integrated/IntegratedAgent.test.ts`

**المتطلبات**:
- تغطية ≥80%
- اختبارات: Configuration, Success Path, Low Confidence, Hallucination, Post-Processing, Error Handling, Advanced Options, Integration

**المرجع**: استخدم `CharacterVoiceAgent.test.ts` كقالب

---

### 3. تحديث `agent.ts`

**المسار**: `frontend/src/lib/drama-analyst/agents/integrated/agent.ts`

**المطلوب**: إضافة تصدير للوكيل الجديد:

```typescript
export { IntegratedAgent as default } from './IntegratedAgent';
```

---

### 4. تحديث `upgradedAgents.ts`

**المسار**: `frontend/src/lib/drama-analyst/agents/upgradedAgents.ts`

**المطلوب**: إضافة الوكيل إلى السجل:

```typescript
import { integratedAgent } from './integrated/IntegratedAgent';

UPGRADED_AGENTS.set(TaskType.INTEGRATED, integratedAgent);
```

---

## 🔍 تفاصيل الوكيل

### System Prompt

الموجه موجود في `integrated/agent.ts` في `INTEGRATED_AGENT_CONFIG.systemPrompt`

### Context Structure المتوقع

```typescript
interface IntegratedContext {
  originalText?: string;
  analysisResults?: any;
  creativeResults?: any;
  previousStations?: {
    analysis?: string;
    creative?: string;
  };
  orchestrationMode?: 'sequential' | 'parallel' | 'adaptive';
}
```

### buildPrompt() المتوقع

يجب أن:
1. يستخرج `analysisResults` و `creativeResults` من السياق
2. يحدد `orchestrationMode` (افتراضي: 'adaptive')
3. يبني موجه منظم يتضمن:
   - النتائج من الوكلاء المختلفة
   - تعليمات التكامل والتركيب
   - المهمة المطلوبة
   - تعليمات ضمان التماسك

### postProcess() المتوقع

يجب أن:
1. ينظف المخرجات من JSON
2. يتحقق من التماسك الشامل
3. يعدل الثقة حسب جودة التكامل

---

## ✅ قائمة التحقق

- [ ] قراءة `shared/AgentUpgradeTemplate.txt`
- [ ] قراءة `characterVoice/CharacterVoiceAgent.ts` كمثال
- [ ] إنشاء `IntegratedAgent.ts`
- [ ] إنشاء `IntegratedAgent.test.ts`
- [ ] تحديث `agent.ts`
- [ ] تحديث `upgradedAgents.ts`
- [ ] تشغيل `pnpm test` بنجاح
- [ ] تشغيل `pnpm typecheck` بنجاح
- [ ] تشغيل `pnpm lint` بنجاح
- [ ] تحديث `AGENTS_STATUS.md`
- [ ] تحديث `AGENTS_UPGRADE_DISTRIBUTION.md`

---

## 📝 ملاحظات

- هذا الوكيل منسق رئيسي ويستخدمه النظام بشكل واسع
- يجب التأكد من جودة عالية في التكامل
- الثقة المتوقعة: ≥0.87
- يجب أن يكون المخرج نصياً فقط بدون JSON
- يجب أن يضمن التماسك بين مخرجات الوكلاء المختلفة

---

**آخر تحديث**: تم إنشاء الملف  
**الحالة**: ⏳ جاهز للتنفيذ
