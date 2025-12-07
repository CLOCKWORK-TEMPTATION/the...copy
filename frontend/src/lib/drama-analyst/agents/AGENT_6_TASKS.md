# مهام الوكيل السادس - Agent 6 Tasks

> **المسؤولية**: ترقية **2 وكيل**  
> **الحالة**: ⏳ قيد الانتظار

---

## 🎯 الوكلاء المطلوب ترقيتها

### 1. `literaryQualityAnalyzer` - محلل الجودة الأدبية

| الخاصية | القيمة |
|---------|--------|
| **TaskType** | `TaskType.LITERARY_QUALITY_ANALYZER` |
| **الأولوية** | 🟡 متوسطة |

### 2. `recommendationsGenerator` - مولد التوصيات

| الخاصية | القيمة |
|---------|--------|
| **TaskType** | `TaskType.RECOMMENDATIONS_GENERATOR` |
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

### 1. LiteraryQualityAnalyzerAgent

**المسار**: `frontend/src/lib/drama-analyst/agents/literaryQualityAnalyzer/`

**Context Structure المتوقع**:
```typescript
interface LiteraryQualityAnalyzerContext {
  originalText?: string;
  literaryStandards?: any;
  genreContext?: string;
  styleAnalysis?: any;
  previousAnalyses?: {
    characterAnalysis?: string;
    thematicAnalysis?: string;
    plotAnalysis?: string;
  };
}
```

**buildPrompt()**: يجب أن يركز على:
- تقييم الجودة الأدبية الشاملة
- تحليل الأسلوب الأدبي
- تقييم الاستخدام اللغوي
- مقارنة بالمعايير الأدبية
- تقييم الابتكار والإبداع

---

### 2. RecommendationsGeneratorAgent

**المسار**: `frontend/src/lib/drama-analyst/agents/recommendationsGenerator/`

**Context Structure المتوقع**:
```typescript
interface RecommendationsGeneratorContext {
  originalText?: string;
  analysisResults?: {
    analysis?: string;
    characterAnalysis?: string;
    thematicAnalysis?: string;
    plotAnalysis?: string;
    qualityAnalysis?: string;
  };
  improvementAreas?: string[];
  priorityLevel?: 'high' | 'medium' | 'low';
}
```

**buildPrompt()**: يجب أن يركز على:
- توليد توصيات عملية وقابلة للتطبيق
- ترتيب التوصيات حسب الأولوية
- ربط التوصيات بنتائج التحليل
- تقديم توصيات محددة وواضحة
- تجنب التوصيات العامة

---

## ✅ قائمة التحقق

### LiteraryQualityAnalyzerAgent
- [ ] إنشاء `LiteraryQualityAnalyzerAgent.ts`
- [ ] إنشاء `LiteraryQualityAnalyzerAgent.test.ts`
- [ ] تحديث `agent.ts`
- [ ] تحديث `upgradedAgents.ts`
- [ ] الاختبارات والتحقق

### RecommendationsGeneratorAgent
- [ ] إنشاء `RecommendationsGeneratorAgent.ts`
- [ ] إنشاء `RecommendationsGeneratorAgent.test.ts`
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

- يمكن تنفيذ الوكلاء بالتوازي أو بالتسلسل حسب التفضيل
- كل وكيل مستقل عن الآخر
- استخدم نفس النمط القياسي لجميع الوكلاء
- الثقة المتوقعة: ≥0.75 لكل وكيل
- `RecommendationsGeneratorAgent` يعتمد على نتائج الوكلاء الأخرى، لذا يجب التأكد من استقبال السياق بشكل صحيح

---

**آخر تحديث**: تم إنشاء الملف  
**الحالة**: ⏳ جاهز للتنفيذ
