# تدفق تنفيذ الوكلاء - من دخول السيناريو حتى النتيجة
## Complete Agent Execution Flow

---

## 📊 الخطوات التفصيلية

### المرحلة 1: دخول السيناريو (Entry Point)

```
Frontend (Brain Storm AI Page)
    ↓
brain-storm-content.tsx
    ↓
handleStartSession() / executeAgentDebate()
    ↓
multiAgentDebate.conductDebate()
```

**الملفات:**
- `frontend/src/app/(main)/brain-storm-ai/brain-storm-content.tsx`
- `frontend/src/lib/drama-analyst/orchestration/multiAgentDebate.ts`

---

### المرحلة 2: استدعاء Backend API

```
Frontend → HTTP Request
    ↓
Backend API Endpoint
    ↓
/api/agents/execute (مثال)
```

**الملفات المتوقعة:**
- `backend/src/controllers/agentsController.ts` (إذا كان موجود)
- أو استدعاء مباشر من Frontend

---

### المرحلة 3: Orchestrator - تنسيق الوكلاء

```
📁 backend/src/services/agents/orchestrator.ts

MultiAgentOrchestrator.executeAgents()
    ↓
    ├─→ executeInParallel() (إذا parallel: true)
    │   └─→ Promise.all([agent1, agent2, ...])
    │
    └─→ executeSequentially() (الافتراضي)
        └─→ for loop على كل وكيل
```

**الكود الرئيسي:**
```typescript
// orchestrator.ts - السطر 53
async executeAgents(input: OrchestrationInput): Promise<OrchestrationOutput> {
  const { fullText, taskTypes, context, options } = input;
  
  if (options?.parallel) {
    await this.executeInParallel(fullText, taskTypes, context, results);
  } else {
    await this.executeSequentially(fullText, taskTypes, context, results);
  }
}
```

---

### المرحلة 4: Registry - استرجاع الوكيل

```
📁 backend/src/services/agents/registry.ts

agentRegistry.getAgent(taskType)
    ↓
Map<TaskType, BaseAgent>
    ↓
إرجاع instance الوكيل المطلوب
```

**الكود الرئيسي:**
```typescript
// orchestrator.ts - السطر 118
const agent = agentRegistry.getAgent(taskType);

if (!agent) {
  logger.warn(`Agent not found for task type: ${taskType}`);
  return;
}
```

---

### المرحلة 5: تنفيذ الوكيل (Agent Execution)

```
📁 backend/src/services/agents/shared/BaseAgent.ts

agent.executeTask(agentInput)
    ↓
buildPrompt() (في الوكيل المحدد)
    ↓
executeStandardAgentPattern()
    ↓
    ├─→ 1. RAG (Retrieval)
    ├─→ 2. Self-Critique
    ├─→ 3. Constitutional AI
    ├─→ 4. Uncertainty Detection
    ├─→ 5. Hallucination Check
    └─→ 6. Multi-Agent Debate
```

**الكود الرئيسي:**
```typescript
// BaseAgent.ts - السطر 31
async executeTask(input: StandardAgentInput): Promise<StandardAgentOutput> {
  const prompt = this.buildPrompt(input);
  
  const result = await executeStandardAgentPattern({
    prompt,
    systemPrompt: this.systemPrompt,
    options: input.options,
    context: input.context,
  });
  
  return result;
}
```

---

### المرحلة 6: Standard Agent Pattern

```
📁 backend/src/services/agents/shared/standardAgentPattern.ts

executeStandardAgentPattern()
    ↓
    ┌─────────────────────────────────────┐
    │ 1. RAG Module                       │
    │    - استرجاع معلومات من قاعدة      │
    │      البيانات أو السياق            │
    └─────────────────────────────────────┘
    ↓
    ┌─────────────────────────────────────┐
    │ 2. Self-Critique Module             │
    │    - نقد ذاتي للإجابة              │
    │    - تحسين الجودة                   │
    └─────────────────────────────────────┘
    ↓
    ┌─────────────────────────────────────┐
    │ 3. Constitutional AI                │
    │    - التحقق من الأخلاقيات           │
    │    - الالتزام بالقواعد              │
    └─────────────────────────────────────┘
    ↓
    ┌─────────────────────────────────────┐
    │ 4. Uncertainty Detection            │
    │    - قياس درجة اليقين               │
    │    - تحديد نقاط الضعف               │
    └─────────────────────────────────────┘
    ↓
    ┌─────────────────────────────────────┐
    │ 5. Hallucination Check              │
    │    - التحقق من الهلوسة              │
    │    - التأكد من الدقة                │
    └─────────────────────────────────────┘
    ↓
    ┌─────────────────────────────────────┐
    │ 6. Multi-Agent Debate               │
    │    - نقاش بين وكلاء متعددة          │
    │    - توافق على الإجابة النهائية     │
    └─────────────────────────────────────┘
```

---

### المرحلة 7: Gemini AI Service

```
📁 backend/src/services/gemini.service.ts

geminiService.generateContent(prompt)
    ↓
Google Gemini API
    ↓
AI Response (نص)
```

**الكود الرئيسي:**
```typescript
// standardAgentPattern.ts
const aiResponse = await geminiService.generateContent(finalPrompt);
```

---

### المرحلة 8: معالجة النتيجة

```
StandardAgentOutput {
  text: string,        // النص النهائي
  confidence: number,  // درجة الثقة (0-1)
  notes: string[]      // ملاحظات إضافية
}
    ↓
إرجاع للـ Orchestrator
    ↓
تجميع نتائج جميع الوكلاء
```

---

### المرحلة 9: إرجاع النتيجة النهائية

```
OrchestrationOutput {
  results: Map<TaskType, StandardAgentOutput>,
  summary: {
    totalExecutionTime,
    successfulTasks,
    failedTasks,
    averageConfidence
  }
}
    ↓
Backend Response
    ↓
Frontend
    ↓
عرض النتائج للمستخدم
```

---

## 🗺️ خريطة الملفات الكاملة

### Backend - الملفات الأساسية

```
backend/src/services/agents/
│
├── orchestrator.ts              ← منسق الوكلاء الرئيسي
├── registry.ts                  ← سجل الوكلاء (27 وكيل)
├── index.ts                     ← تحميل ديناميكي للوكلاء
│
├── core/
│   ├── types.ts                 ← الأنواع الأساسية
│   └── enums.ts                 ← TaskType, TaskCategory
│
├── shared/
│   ├── BaseAgent.ts             ← الكلاس الأساسي لجميع الوكلاء
│   ├── standardAgentPattern.ts  ← النمط القياسي (6 خطوات)
│   ├── selfCritiqueModule.ts    ← وحدة النقد الذاتي
│   └── safe-regexp.ts           ← دوال آمنة للـ RegExp
│
└── [27 Agent Folders]/
    ├── analysis/
    ├── creative/
    ├── integrated/
    ├── completion/
    ├── characterDeepAnalyzer/
    ├── dialogueAdvancedAnalyzer/
    └── ... (باقي الوكلاء)
```

### Frontend - الملفات الأساسية

```
frontend/src/
│
├── app/(main)/brain-storm-ai/
│   ├── page.tsx                 ← نقطة الدخول
│   └── brain-storm-content.tsx  ← المكون الرئيسي
│
└── lib/drama-analyst/
    ├── services/
    │   └── brainstormAgentRegistry.ts  ← سجل الوكلاء (Frontend)
    │
    └── orchestration/
        └── multiAgentDebate.ts         ← نظام النقاش المتعدد
```

---

## 🔍 مثال تنفيذ كامل

### السيناريو: تحليل سيناريو درامي

```typescript
// 1. المستخدم يرفع سيناريو في Frontend
const scenario = "نص السيناريو الدرامي...";

// 2. Frontend يستدعي multiAgentDebate
const debateResult = await multiAgentDebate.conductDebate(
  "تحليل السيناريو",
  { scenario },
  ["analysis", "character-deep-analyzer", "dialogue-advanced-analyzer"]
);

// 3. Backend - Orchestrator يستقبل الطلب
const orchestrationInput = {
  fullText: scenario,
  projectName: "تحليل سيناريو",
  taskTypes: [
    TaskType.ANALYSIS,
    TaskType.CHARACTER_DEEP_ANALYZER,
    TaskType.DIALOGUE_ADVANCED_ANALYZER
  ],
  options: { parallel: false }
};

// 4. Orchestrator ينفذ الوكلاء بالتسلسل
const result = await multiAgentOrchestrator.executeAgents(orchestrationInput);

// 5. كل وكيل ينفذ النمط القياسي
// AnalysisAgent → buildPrompt() → executeStandardAgentPattern()
//   ↓
// RAG → Self-Critique → Constitutional → Uncertainty → Hallucination → Debate
//   ↓
// Gemini AI → AI Response
//   ↓
// StandardAgentOutput { text, confidence, notes }

// 6. تجميع النتائج
const finalOutput = {
  results: Map {
    "analysis" → { text: "تحليل نقدي...", confidence: 0.92 },
    "character-deep-analyzer" → { text: "تحليل الشخصيات...", confidence: 0.88 },
    "dialogue-advanced-analyzer" → { text: "تحليل الحوار...", confidence: 0.85 }
  },
  summary: {
    totalExecutionTime: 15000,
    successfulTasks: 3,
    failedTasks: 0,
    averageConfidence: 0.88
  }
};

// 7. إرجاع للـ Frontend
// 8. عرض النتائج للمستخدم
```

---

## 📝 ملاحظات مهمة

### نقاط القوة
- ✅ نمط موحد لجميع الوكلاء (Standard Pattern)
- ✅ 6 طبقات من التحقق والتحسين
- ✅ دعم التنفيذ المتوازي والمتسلسل
- ✅ نظام تسجيل شامل (Registry)

### نقاط الضعف الحالية
- ❌ أخطاء TypeScript تمنع التشغيل
- ❌ مسارات الاستيراد غير صحيحة
- ❌ عدم اكتمال التكامل بين Frontend و Backend

---

## 🎯 الخطوة التالية

إصلاح أخطاء TypeScript لتفعيل التدفق الكامل ✅
