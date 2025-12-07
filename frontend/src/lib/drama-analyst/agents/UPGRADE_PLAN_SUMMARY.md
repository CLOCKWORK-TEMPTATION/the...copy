# ملخص خطة ترقية الوكلاء - Agents Upgrade Plan Summary

> **التاريخ**: تم إنشاء الخطة  
> **الحالة**: ⏳ جاهز للتنفيذ  
> **الوكلاء المطلوب ترقيتها**: 13 وكيل  
> **عدد الوكلاء المكلفين**: 6 وكلاء

---

## 📊 التوزيع الكامل

```
┌─────────────────────────────────────────────────────────────┐
│                    خطة التوزيع                              │
└─────────────────────────────────────────────────────────────┘

Agent 1 (1 وكيل)     → analysis
Agent 2 (1 وكيل)     → integrated
Agent 3 (3 وكلاء)    → audienceResonance, platformAdapter, characterDeepAnalyzer
Agent 4 (3 وكلاء)    → dialogueAdvancedAnalyzer, visualCinematicAnalyzer, themesMessagesAnalyzer
Agent 5 (3 وكلاء)    → culturalHistoricalAnalyzer, producibilityAnalyzer, targetAudienceAnalyzer
Agent 6 (2 وكيل)     → literaryQualityAnalyzer, recommendationsGenerator

المجموع: 1 + 1 + 3 + 3 + 3 + 2 = 13 وكيل ✅
```

---

## 📋 جدول التوزيع التفصيلي

| الوكيل المكلف | عدد الوكلاء | الوكلاء المطلوب ترقيتها | ملف المهام |
|---------------|------------|------------------------|------------|
| **Agent 1** | 1 | `analysis` | `AGENT_1_TASKS.md` |
| **Agent 2** | 1 | `integrated` | `AGENT_2_TASKS.md` |
| **Agent 3** | 3 | `audienceResonance`<br>`platformAdapter`<br>`characterDeepAnalyzer` | `AGENT_3_TASKS.md` |
| **Agent 4** | 3 | `dialogueAdvancedAnalyzer`<br>`visualCinematicAnalyzer`<br>`themesMessagesAnalyzer` | `AGENT_4_TASKS.md` |
| **Agent 5** | 3 | `culturalHistoricalAnalyzer`<br>`producibilityAnalyzer`<br>`targetAudienceAnalyzer` | `AGENT_5_TASKS.md` |
| **Agent 6** | 2 | `literaryQualityAnalyzer`<br>`recommendationsGenerator` | `AGENT_6_TASKS.md` |

---

## 🎯 قائمة الوكلاء المطلوب ترقيتها

### المجموعة الأولى (Agent 1 & 2) - وكلاء أساسية 🔴
1. ✅ `analysis` - CritiqueArchitect AI
2. ✅ `integrated` - SynthesisOrchestrator AI

### المجموعة الثانية (Agent 3) - وكلاء تحليلية 🟡
3. ⏳ `audienceResonance` - رنين الجمهور
4. ⏳ `platformAdapter` - محول المنصة
5. ⏳ `characterDeepAnalyzer` - محلل الشخصيات العميق

### المجموعة الثالثة (Agent 4) - وكلاء تحليلية متخصصة 🟡
6. ⏳ `dialogueAdvancedAnalyzer` - محلل الحوار المتقدم
7. ⏳ `visualCinematicAnalyzer` - محلل البصري السينمائي
8. ⏳ `themesMessagesAnalyzer` - محلل الرسائل والمواضيع

### المجموعة الرابعة (Agent 5) - وكلاء تحليلية عملية 🟡
9. ⏳ `culturalHistoricalAnalyzer` - محلل الثقافي والتاريخي
10. ⏳ `producibilityAnalyzer` - محلل قابلية الإنتاج
11. ⏳ `targetAudienceAnalyzer` - محلل الجمهور المستهدف

### المجموعة الخامسة (Agent 6) - وكلاء نهائية 🟡
12. ⏳ `literaryQualityAnalyzer` - محلل الجودة الأدبية
13. ⏳ `recommendationsGenerator` - مولد التوصيات

---

## 📁 الملفات المرجعية

### ملفات التوزيع
- `AGENTS_UPGRADE_DISTRIBUTION.md` - خطة التوزيع الشاملة
- `AGENT_1_TASKS.md` - مهام Agent 1
- `AGENT_2_TASKS.md` - مهام Agent 2
- `AGENT_3_TASKS.md` - مهام Agent 3
- `AGENT_4_TASKS.md` - مهام Agent 4
- `AGENT_5_TASKS.md` - مهام Agent 5
- `AGENT_6_TASKS.md` - مهام Agent 6

### ملفات القوالب والأمثلة
- `shared/AgentUpgradeTemplate.txt` - قالب الترقية
- `shared/BaseAgent.ts` - الفئة الأساسية
- `shared/standardAgentPattern.ts` - النمط القياسي
- `characterVoice/CharacterVoiceAgent.ts` - مثال مرقّى
- `characterVoice/CharacterVoiceAgent.test.ts` - مثال اختبارات

### ملفات الحالة
- `AGENTS_STATUS.md` - حالة الوكلاء الحالية
- `upgradedAgents.ts` - سجل الوكلاء المرقّاة

---

## 🏗️ النمط القياسي المطلوب

جميع الوكلاء يجب أن تطبق:

```
RAG → Self-Critique → Constitutional → Uncertainty → Hallucination → (Debate)
```

### المتطلبات الأساسية

1. **الوراثة من BaseAgent**
2. **تنفيذ buildPrompt()**
3. **تنفيذ postProcess()** (اختياري)
4. **اختبارات شاملة** (≥80% تغطية)
5. **مخرجات نصية فقط** (لا JSON)

---

## ✅ قائمة التحقق الشاملة

### لكل وكيل:
- [ ] إنشاء `*Agent.ts`
- [ ] إنشاء `*Agent.test.ts`
- [ ] تحديث `agent.ts`
- [ ] تحديث `upgradedAgents.ts`
- [ ] الاختبارات والتحقق

### التحقق النهائي:
- [ ] جميع الاختبارات تمر
- [ ] `pnpm typecheck` ناجح
- [ ] `pnpm lint` ناجح
- [ ] `pnpm build` ناجح
- [ ] تحديث `AGENTS_STATUS.md`
- [ ] تحديث `AGENTS_UPGRADE_DISTRIBUTION.md`

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

**التقدم الإجمالي**: 0/13 (0%)

---

## 🚀 سير العمل المقترح

### المرحلة 1: الإعداد (لجميع الوكلاء)
1. قراءة `AGENTS_UPGRADE_DISTRIBUTION.md`
2. قراءة ملف المهام الخاص بك (`AGENT_X_TASKS.md`)
3. قراءة `shared/AgentUpgradeTemplate.txt`
4. فحص مثال مرقّى (`CharacterVoiceAgent.ts`)

### المرحلة 2: التنفيذ (لكل وكيل)
1. إنشاء `*Agent.ts`
2. إنشاء `*Agent.test.ts`
3. تحديث `agent.ts`
4. تحديث `upgradedAgents.ts`

### المرحلة 3: التحقق (لكل وكيل)
1. `pnpm test`
2. `pnpm typecheck`
3. `pnpm lint`
4. اختبار يدوي

### المرحلة 4: التوثيق (بعد كل وكيل)
1. تحديث `AGENTS_STATUS.md`
2. تحديث `AGENTS_UPGRADE_DISTRIBUTION.md`
3. تحديث هذا الملف

---

## 📝 ملاحظات مهمة

1. **الأولوية**: Agent 1 و Agent 2 لهما أولوية عالية (🔴) لأنها وكلاء أساسية
2. **الاستقلالية**: كل وكيل مستقل ويمكن تنفيذه بالتوازي
3. **النمط الموحد**: جميع الوكلاء يجب أن تتبع نفس النمط القياسي
4. **الجودة**: الثقة المتوقعة ≥0.75 لكل وكيل
5. **المخرجات**: يجب أن تكون نصية فقط بدون JSON

---

## 🔗 روابط سريعة

- [خطة التوزيع الكاملة](./AGENTS_UPGRADE_DISTRIBUTION.md)
- [مهام Agent 1](./AGENT_1_TASKS.md)
- [مهام Agent 2](./AGENT_2_TASKS.md)
- [مهام Agent 3](./AGENT_3_TASKS.md)
- [مهام Agent 4](./AGENT_4_TASKS.md)
- [مهام Agent 5](./AGENT_5_TASKS.md)
- [مهام Agent 6](./AGENT_6_TASKS.md)
- [حالة الوكلاء](./AGENTS_STATUS.md)

---

**آخر تحديث**: تم إنشاء الخطة  
**الحالة**: ⏳ جاهز للتنفيذ  
**الخطوة التالية**: كل وكيل يبدأ بتنفيذ مهامه حسب ملف المهام الخاص به
