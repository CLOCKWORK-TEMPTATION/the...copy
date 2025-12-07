# مهام الوكيل الخامس - Agent 5 Tasks

> **المسؤولية**: ترقية **3 وكلاء**  
> **الحالة**: ⏳ قيد الانتظار

---

## 🎯 الوكلاء المطلوب ترقيتها

### 1. `culturalHistoricalAnalyzer` - محلل الثقافي والتاريخي

| الخاصية | القيمة |
|---------|--------|
| **TaskType** | `TaskType.CULTURAL_HISTORICAL_ANALYZER` |
| **الأولوية** | 🟡 متوسطة |

### 2. `producibilityAnalyzer` - محلل قابلية الإنتاج

| الخاصية | القيمة |
|---------|--------|
| **TaskType** | `TaskType.PRODUCIBILITY_ANALYZER` |
| **الأولوية** | 🟡 متوسطة |

### 3. `targetAudienceAnalyzer` - محلل الجمهور المستهدف

| الخاصية | القيمة |
|---------|--------|
| **TaskType** | `TaskType.TARGET_AUDIENCE_ANALYZER` |
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

### 1. CulturalHistoricalAnalyzerAgent

**المسار**: `frontend/src/lib/drama-analyst/agents/culturalHistoricalAnalyzer/`

**Context Structure المتوقع**:
```typescript
interface CulturalHistoricalAnalyzerContext {
  originalText?: string;
  culturalContext?: string;
  historicalPeriod?: string;
  regionalContext?: string;
  socialContext?: any;
}
```

**buildPrompt()**: يجب أن يركز على:
- تحليل السياق الثقافي
- تحليل السياق التاريخي
- تقييم الدقة التاريخية
- ربط النص بسياقه الثقافي

---

### 2. ProducibilityAnalyzerAgent

**المسار**: `frontend/src/lib/drama-analyst/agents/producibilityAnalyzer/`

**Context Structure المتوقع**:
```typescript
interface ProducibilityAnalyzerContext {
  originalText?: string;
  budgetConstraints?: any;
  technicalRequirements?: any;
  locationRequirements?: any;
  castRequirements?: any;
}
```

**buildPrompt()**: يجب أن يركز على:
- تقييم قابلية الإنتاج
- تحليل المتطلبات التقنية
- تقييم التكاليف المتوقعة
- توصيات لتحسين القابلية للإنتاج

---

### 3. TargetAudienceAnalyzerAgent

**المسار**: `frontend/src/lib/drama-analyst/agents/targetAudienceAnalyzer/`

**Context Structure المتوقع**:
```typescript
interface TargetAudienceAnalyzerContext {
  originalText?: string;
  demographicData?: any;
  psychographicData?: any;
  marketResearch?: any;
}
```

**buildPrompt()**: يجب أن يركز على:
- تحديد الجمهور المستهدف
- تحليل البيانات الديموغرافية
- تحليل البيانات النفسية
- تقييم جاذبية المحتوى للجمهور

---

## ✅ قائمة التحقق

### CulturalHistoricalAnalyzerAgent
- [ ] إنشاء `CulturalHistoricalAnalyzerAgent.ts`
- [ ] إنشاء `CulturalHistoricalAnalyzerAgent.test.ts`
- [ ] تحديث `agent.ts`
- [ ] تحديث `upgradedAgents.ts`
- [ ] الاختبارات والتحقق

### ProducibilityAnalyzerAgent
- [ ] إنشاء `ProducibilityAnalyzerAgent.ts`
- [ ] إنشاء `ProducibilityAnalyzerAgent.test.ts`
- [ ] تحديث `agent.ts`
- [ ] تحديث `upgradedAgents.ts`
- [ ] الاختبارات والتحقق

### TargetAudienceAnalyzerAgent
- [ ] إنشاء `TargetAudienceAnalyzerAgent.ts`
- [ ] إنشاء `TargetAudienceAnalyzerAgent.test.ts`
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
- هذه الوكلاء متخصصة في تحليل جوانب عملية وتطبيقية

---

**آخر تحديث**: تم إنشاء الملف  
**الحالة**: ⏳ جاهز للتنفيذ
