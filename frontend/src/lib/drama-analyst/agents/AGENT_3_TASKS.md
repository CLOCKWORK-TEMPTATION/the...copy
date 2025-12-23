# مهام الوكيل الثالث - Agent 3 Tasks

> **المسؤولية**: ترقية **3 وكلاء**  
> **الحالة**: ⏳ قيد الانتظار

---

## 🎯 الوكلاء المطلوب ترقيتها

### 1. `audienceResonance` - رنين الجمهور

| الخاصية | القيمة |
|---------|--------|
| **TaskType** | `TaskType.AUDIENCE_RESONANCE` |
| **الأولوية** | 🟡 متوسطة |

### 2. `platformAdapter` - محول المنصة

| الخاصية | القيمة |
|---------|--------|
| **TaskType** | `TaskType.PLATFORM_ADAPTER` |
| **الأولوية** | 🟡 متوسطة |

### 3. `characterDeepAnalyzer` - محلل الشخصيات العميق

| الخاصية | القيمة |
|---------|--------|
| **TaskType** | `TaskType.CHARACTER_DEEP_ANALYZER` |
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

### 1. AudienceResonanceAgent

**المسار**: `frontend/src/lib/drama-analyst/agents/audienceResonance/`

**Context Structure المتوقع**:
```typescript
interface AudienceResonanceContext {
  originalText?: string;
  targetAudience?: string;
  demographicData?: any;
  previousAnalysis?: string;
}
```

**buildPrompt()**: يجب أن يركز على:
- تحليل رنين النص مع الجمهور المستهدف
- تقييم التأثير العاطفي
- توصيات لتحسين الرنين

---

### 2. PlatformAdapterAgent

**المسار**: `frontend/src/lib/drama-analyst/agents/platformAdapter/`

**Context Structure المتوقع**:
```typescript
interface PlatformAdapterContext {
  originalText?: string;
  targetPlatform?: string;
  platformConstraints?: any;
  formatRequirements?: any;
}
```

**buildPrompt()**: يجب أن يركز على:
- تحويل المحتوى ليتناسب مع المنصة المستهدفة
- مراعاة قيود المنصة
- الحفاظ على الجوهر مع التكيف

---

### 3. CharacterDeepAnalyzerAgent

**المسار**: `frontend/src/lib/drama-analyst/agents/characterDeepAnalyzer/`

**Context Structure المتوقع**:
```typescript
interface CharacterDeepAnalyzerContext {
  originalText?: string;
  characterName?: string;
  characterProfile?: any;
  sceneContext?: string;
}
```

**buildPrompt()**: يجب أن يركز على:
- تحليل عميق للشخصيات
- فهم الدوافع والصراعات الداخلية
- تقييم العمق النفسي

---

## ✅ قائمة التحقق

### AudienceResonanceAgent
- [ ] إنشاء `AudienceResonanceAgent.ts`
- [ ] إنشاء `AudienceResonanceAgent.test.ts`
- [ ] تحديث `agent.ts`
- [ ] تحديث `upgradedAgents.ts`
- [ ] الاختبارات والتحقق

### PlatformAdapterAgent
- [ ] إنشاء `PlatformAdapterAgent.ts`
- [ ] إنشاء `PlatformAdapterAgent.test.ts`
- [ ] تحديث `agent.ts`
- [ ] تحديث `upgradedAgents.ts`
- [ ] الاختبارات والتحقق

### CharacterDeepAnalyzerAgent
- [ ] إنشاء `CharacterDeepAnalyzerAgent.ts`
- [ ] إنشاء `CharacterDeepAnalyzerAgent.test.ts`
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

---

**آخر تحديث**: تم إنشاء الملف  
**الحالة**: ⏳ جاهز للتنفيذ
