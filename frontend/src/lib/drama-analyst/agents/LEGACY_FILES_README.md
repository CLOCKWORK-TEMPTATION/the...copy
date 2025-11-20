# ملفات الوكلاء القديمة (Legacy Agent Files)

## الهيكلية الحالية

كل مجلد وكيل يحتوي على:

- `agent.ts` - **ملف تراثي (Legacy)** - يحتوي فقط على AIAgentConfig
- `*Agent.ts` - **الملف الفعلي الجديد** - يمدّ BaseAgent ويطبق النمط القياسي
- `*Agent.test.ts` - اختبارات شاملة للوكيل الجديد
- `instructions.ts` - تعليمات إضافية (اختياري)

## الملفات التراثية (agent.ts)

الملفات التالية **تراثية** وتُستخدم فقط للتكوين الأساسي:

### الوكلاء المرقّاة (مجلد بملفين)

1. `adaptiveRewriting/agent.ts` + `AdaptiveRewritingAgent.ts` ✅
2. `characterNetwork/agent.ts` + `CharacterNetworkAgent.ts` ✅
3. `conflictDynamics/agent.ts` + `ConflictDynamicsAgent.ts` ✅
4. `dialogueForensics/agent.ts` + `DialogueForensicsAgent.ts` ✅
5. `plotPredictor/agent.ts` + `PlotPredictorAgent.ts` ✅
6. `rhythmMapping/agent.ts` + `RhythmMappingAgent.ts` ✅
7. `styleFingerprint/agent.ts` + `StyleFingerprintAgent.ts` ✅
8. `tensionOptimizer/agent.ts` + `TensionOptimizerAgent.ts` ✅
9. `thematicMining/agent.ts` + `ThematicMiningAgent.ts` ✅
10. `worldBuilder/agent.ts` + `WorldBuilderAgent.ts` ✅

## دور الملفات التراثية

ملفات `agent.ts` تُصدّر فقط `AIAgentConfig`:

```typescript
export const AGENT_NAME_CONFIG: AIAgentConfig = {
  id: TaskType.AGENT_NAME,
  name: "Agent Display Name",
  description: "...",
  systemPrompt: "...",
  // ... إلخ
};
```

هذه التكوينات تُستخدم في:

- `agents/index.ts` - للتحميل الديناميكي
- الواجهة الأمامية - لعرض معلومات الوكيل
- السجل التاريخي - للتوافق مع الكود القديم

## التنفيذ الفعلي

**جميع التنفيذ الفعلي يمر عبر**:

1. `upgradedAgents.ts` - السجل الموحد للوكلاء المرقّاة
2. `*Agent.ts` - الوكيل الفعلي الذي يمدّ BaseAgent
3. النمط القياسي: RAG → Self-Critique → Constitutional → Uncertainty → Hallucination → Debate

## التوافق

الملفات التراثية محفوظة لـ:

- ✅ التوافق مع الكود القديم
- ✅ عدم كسر الـ imports الموجودة
- ✅ الاستخدام في `loadAgentConfig()` في `index.ts`
- ✅ عرض البيانات الوصفية في الواجهة

## خطة التنظيف المستقبلية (اختيارية)

بعد تأكيد الاستقرار الكامل، يمكن:

1. دمج AIAgentConfig داخل `*Agent.ts`
2. تحديث `index.ts` للتحميل من الملفات الجديدة مباشرة
3. حذف ملفات `agent.ts` التراثية
4. تحديث جميع الـ imports

**حالياً**: الإبقاء على الهيكلية الحالية لضمان التوافق والاستقرار.

## ملخص

```
✅ agent.ts - تراثي، للتكوين فقط
✅ *Agent.ts - جديد، التنفيذ الفعلي
✅ لا تعارض - يعملان معاً
✅ التنفيذ يمر عبر upgradedAgents.ts
```

---

**تحديث أخير**: تم توثيق الهيكلية الحالية
**الحالة**: مقبول ومستقر
