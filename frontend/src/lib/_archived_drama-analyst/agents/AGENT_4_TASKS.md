# مهام الوكيل الرابع - Agent 4 Tasks

> **المسؤولية**: ترقية **3 وكلاء**  
> **الحالة**: ⏳ قيد الانتظار

---

## 🎯 الوكلاء المطلوب ترقيتها

### 1. `dialogueAdvancedAnalyzer` - محلل الحوار المتقدم

| الخاصية | القيمة |
|---------|--------|
| **TaskType** | `TaskType.DIALOGUE_ADVANCED_ANALYZER` |
| **الأولوية** | 🟡 متوسطة |

### 2. `visualCinematicAnalyzer` - محلل البصري السينمائي

| الخاصية | القيمة |
|---------|--------|
| **TaskType** | `TaskType.VISUAL_CINEMATIC_ANALYZER` |
| **الأولوية** | 🟡 متوسطة |

### 3. `themesMessagesAnalyzer` - محلل الرسائل والمواضيع

| الخاصية | القيمة |
|---------|--------|
| **TaskType** | `TaskType.THEMES_MESSAGES_ANALYZER` |
| **الأولوية** | 🟡 متوسطة |

---

## 📁 الملفات المطلوبة لكل وكيل

### لكل وكيل، يجب إنشاء:

1. **`*Agent.ts`** - الوكيل الرئيسي
2. **`*Agent.test.ts`** - الاختبارات
3. **تحديث `agent.ts`** - إضافة التصدير
4. **تحديث `upgradedAgents.ts`** - إضافة إلى السجل

---

## 🔍 تفاصيل الوكلاء

### 1. DialogueAdvancedAnalyzerAgent

**المسار**: `frontend/src/lib/drama-analyst/agents/dialogueAdvancedAnalyzer/`

**Context Structure المتوقع**:
```typescript
interface DialogueAdvancedAnalyzerContext {
  originalText?: string;
  dialogueSamples?: string[];
  characterContext?: any;
  sceneContext?: string;
}
```

**buildPrompt()**: يجب أن يركز على:
- تحليل عمق الحوار
- تقييم الوضوح والطبيعية
- كشف الأنماط والثيمات في الحوار
- تقييم التأثير العاطفي

---

### 2. VisualCinematicAnalyzerAgent

**المسار**: `frontend/src/lib/drama-analyst/agents/visualCinematicAnalyzer/`

**Context Structure المتوقع**:
```typescript
interface VisualCinematicAnalyzerContext {
  originalText?: string;
  sceneDescriptions?: string[];
  visualElements?: any;
  cinematicTechniques?: string[];
}
```

**buildPrompt()**: يجب أن يركز على:
- تحليل العناصر البصرية
- تقييم التقنيات السينمائية
- تحليل التكوين والإضاءة
- تقييم التأثير البصري

---

### 3. ThemesMessagesAnalyzerAgent

**المسار**: `frontend/src/lib/drama-analyst/agents/themesMessagesAnalyzer/`

**Context Structure المتوقع**:
```typescript
interface ThemesMessagesAnalyzerContext {
  originalText?: string;
  identifiedThemes?: string[];
  messageAnalysis?: any;
  culturalContext?: string;
}
```

**buildPrompt()**: يجب أن يركز على:
- استخراج المواضيع الرئيسية
- تحليل الرسائل الضمنية والصريحة
- تقييم عمق المعنى
- ربط المواضيع بالسياق الثقافي

---

## ✅ قائمة التحقق

### DialogueAdvancedAnalyzerAgent
- [ ] إنشاء `DialogueAdvancedAnalyzerAgent.ts`
- [ ] إنشاء `DialogueAdvancedAnalyzerAgent.test.ts`
- [ ] تحديث `agent.ts`
- [ ] تحديث `upgradedAgents.ts`
- [ ] الاختبارات والتحقق

### VisualCinematicAnalyzerAgent
- [ ] إنشاء `VisualCinematicAnalyzerAgent.ts`
- [ ] إنشاء `VisualCinematicAnalyzerAgent.test.ts`
- [ ] تحديث `agent.ts`
- [ ] تحديث `upgradedAgents.ts`
- [ ] الاختبارات والتحقق

### ThemesMessagesAnalyzerAgent
- [ ] إنشاء `ThemesMessagesAnalyzerAgent.ts`
- [ ] إنشاء `ThemesMessagesAnalyzerAgent.test.ts`
- [ ] تحديث `agent.ts`
- [ ] تحديث `upgradedAgents.ts`
- [ ] الاختبارات والتحقق

### التحقق النهائي
- [ ] تشغيل `pnpm test` بنجاح
- [ ] تشغيل `pnpm typecheck` بنجاح
- [ ] تشغيل `pnpm lint` بنجاح
- [ ] تحديث `AGENTS_STATUS.md`
- [ ] تحديث `AGENTS_UPGRADE_DISTRIBUTION.md`

---

## 📝 ملاحظات

- يمكن تنفيذ الوكلاء الثلاثة بالتوازي أو بالتسلسل حسب التفضيل
- كل وكيل مستقل عن الآخر
- استخدم نفس النمط القياسي لجميع الوكلاء
- الثقة المتوقعة: ≥0.75 لكل وكيل
- هذه الوكلاء متخصصة في تحليل جوانب محددة من النص

---

**آخر تحديث**: تم إنشاء الملف  
**الحالة**: ⏳ جاهز للتنفيذ
