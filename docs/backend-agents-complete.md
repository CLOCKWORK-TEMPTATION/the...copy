# دليل الوكلاء المُطبّقة في Backend
## Complete Backend Agents Documentation

---

## ✅ الحالة: جميع الـ 27 وكيل مُطبّقة ومُسجّلة

**الموقع:** `E:\the...copy\backend\src\services\agents\`

---

## 📊 الإحصائيات

| الفئة | العدد | النسبة |
|------|------|--------|
| **Core Agents** | 4 | 14.8% |
| **Analysis Agents** | 6 | 22.2% |
| **Creative Agents** | 4 | 14.8% |
| **Predictive Agents** | 4 | 14.8% |
| **Advanced Modules** | 9 | 33.3% |
| **الإجمالي** | **27** | **100%** |

---

## 🤖 الوكلاء الأساسيون (Core Agents) - 4

### 1. CritiqueArchitect AI - مهندس النقد
```typescript
// المسار: analysis/AnalysisAgent.ts
export const analysisAgent = new AnalysisAgent();

// التكوين
{
  id: TaskType.ANALYSIS,
  name: "CritiqueArchitect AI",
  category: TaskCategory.CORE,
  complexityScore: 0.95,
}
```
**الوظيفة:** التحليل النقدي المعماري - نظام هجين متعدد الوكلاء يدمج التفكير الجدلي مع التحليل الشعاعي العميق

---

### 2. MimesisGen AI - مولّد المحاكاة
```typescript
// المسار: creative/CreativeAgent.ts
export const creativeAgent = new CreativeAgent();

// التكوين
{
  id: TaskType.CREATIVE,
  name: "MimesisGen AI",
  category: TaskCategory.CORE,
  complexityScore: 0.88,
}
```
**الوظيفة:** المحاكاة التوليدية الإبداعية - نظام ذكي متقدم يستخدم تقنيات نقل الأسلوب العصبي

---

### 3. SynthesisOrchestrator AI - المنسق التركيبي
```typescript
// المسار: integrated/IntegratedAgent.ts
export const integratedAgent = new IntegratedAgent();

// التكوين
{
  id: TaskType.INTEGRATED,
  name: "SynthesisOrchestrator AI",
  category: TaskCategory.CORE,
  complexityScore: 0.92,
}
```
**الوظيفة:** التنسيق والتكامل - وكيل أوركسترالي متقدم يستخدم تقنيات الذكاء الجمعي

---

### 4. NarrativeContinuum AI - مواصل السرد
```typescript
// المسار: completion/CompletionAgent.ts
export const completionAgent = new CompletionAgent();

// التكوين
{
  id: TaskType.COMPLETION,
  name: "NarrativeContinuum AI",
  category: TaskCategory.CORE,
  complexityScore: 0.85,
}
```
**الوظيفة:** استكمال السرد - نظام تنبؤي متطور يستخدم نماذج الانتباه متعددة الرؤوس

---

## 🔍 وكلاء التحليل (Analysis Agents) - 6

### 5. TemporalDynamics AI - محلل الإيقاع
```typescript
// المسار: rhythmMapping/RhythmMappingAgent.ts
export const rhythmMappingAgent = new RhythmMappingAgent();

// التكوين
{
  id: TaskType.RHYTHM_MAPPING,
  name: "TemporalDynamics AI",
  category: TaskCategory.ANALYSIS,
  complexityScore: 0.75,
}
```
**الوظيفة:** رسم الإيقاع الزمني - محلل متطور يستخدم تقنيات معالجة الإشارات الرقمية

---

### 6. SocialGraph AI - محلل الشبكات
```typescript
// المسار: characterNetwork/CharacterNetworkAgent.ts
export const characterNetworkAgent = new CharacterNetworkAgent();

// التكوين
{
  id: TaskType.CHARACTER_NETWORK,
  name: "SocialGraph AI",
  category: TaskCategory.ANALYSIS,
  complexityScore: 0.80,
}
```
**الوظيفة:** شبكات الشخصيات الاجتماعية - محلل متقدم يطبق نظرية الرسوم البيانية

---

### 7. Voiceprint AI - محلل البصمة الصوتية
```typescript
// المسار: dialogueForensics/DialogueForensicsAgent.ts
export const dialogueForensicsAgent = new DialogueForensicsAgent();

// التكوين
{
  id: TaskType.DIALOGUE_FORENSICS,
  name: "Voiceprint AI",
  category: TaskCategory.ANALYSIS,
  complexityScore: 0.82,
}
```
**الوظيفة:** التحليل الجنائي للحوار - محلل لغوي متطور يستخدم تقنيات NLP المتقدمة

---

### 8. ConceptMiner AI - منقّب المفاهيم
```typescript
// المسار: thematicMining/ThematicMiningAgent.ts
export const thematicMiningAgent = new ThematicMiningAgent();

// التكوين
{
  id: TaskType.THEMATIC_MINING,
  name: "ConceptMiner AI",
  category: TaskCategory.ANALYSIS,
  complexityScore: 0.88,
}
```
**الوظيفة:** التنقيب المفاهيمي العميق - محرك ذكي يستخدم تقنيات التعلم غير المراقب

---

### 9. AuthorDNA AI - محلل البصمة الأدبية
```typescript
// المسار: styleFingerprint/StyleFingerprintAgent.ts
export const styleFingerprintAgent = new StyleFingerprintAgent();

// التكوين
{
  id: TaskType.STYLE_FINGERPRINT,
  name: "AuthorDNA AI",
  category: TaskCategory.ANALYSIS,
  complexityScore: 0.90,
}
```
**الوظيفة:** البصمة الأدبية للمؤلف - نظام تحليل أسلوبي متطور يستخدم تقنيات Stylometry

---

### 10. TensionField AI - محلل حقول التوتر
```typescript
// المسار: conflictDynamics/ConflictDynamicsAgent.ts
export const conflictDynamicsAgent = new ConflictDynamicsAgent();

// التكوين
{
  id: TaskType.CONFLICT_DYNAMICS,
  name: "TensionField AI",
  category: TaskCategory.ANALYSIS,
  complexityScore: 0.85,
}
```
**الوظيفة:** ديناميكيات الصراع - محلل ديناميكي متطور يطبق نظريات ميكانيكا الموائع

---

## 🎨 وكلاء الإبداع (Creative Agents) - 4

### 11. ContextTransformer AI - محوّل السياق
```typescript
// المسار: adaptiveRewriting/AdaptiveRewritingAgent.ts
export const adaptiveRewritingAgent = new AdaptiveRewritingAgent();

// التكوين
{
  id: TaskType.ADAPTIVE_REWRITING,
  name: "ContextTransformer AI",
  category: TaskCategory.CREATIVE,
  complexityScore: 0.82,
}
```
**الوظيفة:** إعادة الكتابة التكيفية - نظام إعادة صياغة متقدم يعتمد على بنية Transformer

---

### 12. SceneArchitect AI - معمار المشاهد
```typescript
// المسار: sceneGenerator/SceneGeneratorAgent.ts
export const sceneGeneratorAgent = new SceneGeneratorAgent();

// التكوين
{
  id: TaskType.SCENE_GENERATOR,
  name: "SceneArchitect AI",
  category: TaskCategory.CREATIVE,
  complexityScore: 0.80,
}
```
**الوظيفة:** توليد المشاهد الدرامية - مولد مشاهد متطور يستخدم تقنيات التخطيط الهرمي

---

### 13. PersonaSynth AI - مركّب الشخصيات
```typescript
// المسار: characterVoice/CharacterVoiceAgent.ts
export const characterVoiceAgent = new CharacterVoiceAgent();

// التكوين
{
  id: TaskType.CHARACTER_VOICE,
  name: "PersonaSynth AI",
  category: TaskCategory.CREATIVE,
  complexityScore: 0.85,
}
```
**الوظيفة:** تركيب صوت الشخصية - محرك متطور لمحاكاة الأصوات الشخصية

---

### 14. CosmosForge AI - حدّاد الأكوان
```typescript
// المسار: worldBuilder/WorldBuilderAgent.ts
export const worldBuilderAgent = new WorldBuilderAgent();

// التكوين
{
  id: TaskType.WORLD_BUILDER,
  name: "CosmosForge AI",
  category: TaskCategory.CREATIVE,
  complexityScore: 0.90,
}
```
**الوظيفة:** بناء العوالم الدرامية - بانٍ عوالم متطور يستخدم تقنيات الذكاء الاصطناعي التوليدي

---

## 🔮 وكلاء التنبؤ (Predictive Agents) - 4

### 15. NarrativeOracle AI - عرّاف الحبكة
```typescript
// المسار: plotPredictor/PlotPredictorAgent.ts
export const plotPredictorAgent = new PlotPredictorAgent();

// التكوين
{
  id: TaskType.PLOT_PREDICTOR,
  name: "NarrativeOracle AI",
  category: TaskCategory.PREDICTIVE,
  complexityScore: 0.88,
}
```
**الوظيفة:** التنبؤ بمسار الحبكة - متنبئ حبكة متطور يستخدم نماذج Transformer المتخصصة

---

### 16. DramaEngine AI - محرك الدراما
```typescript
// المسار: tensionOptimizer/TensionOptimizerAgent.ts
export const tensionOptimizerAgent = new TensionOptimizerAgent();

// التكوين
{
  id: TaskType.TENSION_OPTIMIZER,
  name: "DramaEngine AI",
  category: TaskCategory.PREDICTIVE,
  complexityScore: 0.82,
}
```
**الوظيفة:** تحسين التوتر الدرامي - محسن توتر متطور يستخدم خوارزميات التحسين التطورية

---

### 17. EmpathyMatrix AI - مصفوفة التعاطف
```typescript
// المسار: audienceResonance/AudienceResonanceAgent.ts
export const audienceResonanceAgent = new AudienceResonanceAgent();

// التكوين
{
  id: TaskType.AUDIENCE_RESONANCE,
  name: "EmpathyMatrix AI",
  category: TaskCategory.PREDICTIVE,
  complexityScore: 0.80,
}
```
**الوظيفة:** صدى الجمهور العاطفي - محلل صدى متطور يستخدم نماذج علم النفس الجماعي

---

### 18. MediaTransmorph AI - محوّل المنصات
```typescript
// المسار: platformAdapter/PlatformAdapterAgent.ts
export const platformAdapterAgent = new PlatformAdapterAgent();

// التكوين
{
  id: TaskType.PLATFORM_ADAPTER,
  name: "MediaTransmorph AI",
  category: TaskCategory.PREDICTIVE,
  complexityScore: 0.75,
}
```
**الوظيفة:** التكيف مع المنصات - محول منصات ذكي يستخدم تقنيات التحليل الوسائطي

---

## 🚀 الوحدات المتقدمة (Advanced Modules) - 9

### 19. PsycheScope AI - مجهر النفسية (Module 3)
```typescript
// المسار: characterDeepAnalyzer/CharacterDeepAnalyzerAgent.ts
export const characterDeepAnalyzerAgent = new CharacterDeepAnalyzerAgent();

// التكوين
{
  id: TaskType.CHARACTER_DEEP_ANALYZER,
  name: "PsycheScope AI",
  category: TaskCategory.ADVANCED_MODULES,
  complexityScore: 0.92,
}
```
**الوظيفة:** التحليل النفسي العميق - محلل شخصيات متقدم يستخدم نماذج علم النفس الحاسوبي

---

### 20. ConversationLens AI - عدسة المحادثة (Module 4)
```typescript
// المسار: dialogueAdvancedAnalyzer/DialogueAdvancedAnalyzerAgent.ts
export const dialogueAdvancedAnalyzerAgent = new DialogueAdvancedAnalyzerAgent();

// التكوين
{
  id: TaskType.DIALOGUE_ADVANCED_ANALYZER,
  name: "ConversationLens AI",
  category: TaskCategory.ADVANCED_MODULES,
  complexityScore: 0.85,
}
```
**الوظيفة:** التحليل المتقدم للحوار - محلل حوار متطور يستخدم تقنيات اللسانيات الحاسوبية

---

### 21. CinemaVision AI - بصيرة السينما (Module 5)
```typescript
// المسار: visualCinematicAnalyzer/VisualCinematicAnalyzerAgent.ts
export const visualCinematicAnalyzerAgent = new VisualCinematicAnalyzerAgent();

// التكوين
{
  id: TaskType.VISUAL_CINEMATIC_ANALYZER,
  name: "CinemaVision AI",
  category: TaskCategory.ADVANCED_MODULES,
  complexityScore: 0.80,
}
```
**الوظيفة:** التحليل السينمائي البصري - محلل بصري سينمائي متطور

---

### 22. PhilosophyMiner AI - منقّب الفلسفة (Module 6)
```typescript
// المسار: themesMessagesAnalyzer/ThemesMessagesAnalyzerAgent.ts
export const themesMessagesAnalyzerAgent = new ThemesMessagesAnalyzerAgent();

// التكوين
{
  id: TaskType.THEMES_MESSAGES_ANALYZER,
  name: "PhilosophyMiner AI",
  category: TaskCategory.ADVANCED_MODULES,
  complexityScore: 0.95,
}
```
**الوظيفة:** تحليل المواضيع والرسائل - محلل موضوعات ورسائل متطور

---

### 23. ChronoContext AI - سياق الزمن (Module 7)
```typescript
// المسار: culturalHistoricalAnalyzer/CulturalHistoricalAnalyzerAgent.ts
export const culturalHistoricalAnalyzerAgent = new CulturalHistoricalAnalyzerAgent();

// التكوين
{
  id: TaskType.CULTURAL_HISTORICAL_ANALYZER,
  name: "ChronoContext AI",
  category: TaskCategory.ADVANCED_MODULES,
  complexityScore: 0.88,
}
```
**الوظيفة:** التحليل الثقافي التاريخي - محلل سياق ثقافي تاريخي متطور

---

### 24. ProductionOracle AI - وحي الإنتاج (Module 8)
```typescript
// المسار: producibilityAnalyzer/ProducibilityAnalyzerAgent.ts
export const producibilityAnalyzerAgent = new ProducibilityAnalyzerAgent();

// التكوين
{
  id: TaskType.PRODUCIBILITY_ANALYZER,
  name: "ProductionOracle AI",
  category: TaskCategory.ADVANCED_MODULES,
  complexityScore: 0.78,
}
```
**الوظيفة:** تحليل قابلية الإنتاج - محلل قابلية إنتاج متطور

---

### 25. AudienceCompass AI - بوصلة الجمهور (Module 9)
```typescript
// المسار: targetAudienceAnalyzer/TargetAudienceAnalyzerAgent.ts
export const targetAudienceAnalyzerAgent = new TargetAudienceAnalyzerAgent();

// التكوين
{
  id: TaskType.TARGET_AUDIENCE_ANALYZER,
  name: "AudienceCompass AI",
  category: TaskCategory.ADVANCED_MODULES,
  complexityScore: 0.82,
}
```
**الوظيفة:** تحليل الجمهور المستهدف - محلل جمهور مستهدف متطور

---

### 26. AestheticsJudge AI - قاضي الجماليات (Module 10)
```typescript
// المسار: literaryQualityAnalyzer/LiteraryQualityAnalyzerAgent.ts
export const literaryQualityAnalyzerAgent = new LiteraryQualityAnalyzerAgent();

// التكوين
{
  id: TaskType.LITERARY_QUALITY_ANALYZER,
  name: "AestheticsJudge AI",
  category: TaskCategory.ADVANCED_MODULES,
  complexityScore: 0.90,
}
```
**الوظيفة:** تحليل الجودة الأدبية - محلل جودة أدبية متطور

---

### 27. WisdomSynthesizer AI - مركّب الحكمة (Module 11)
```typescript
// المسار: recommendationsGenerator/RecommendationsGeneratorAgent.ts
export const recommendationsGeneratorAgent = new RecommendationsGeneratorAgent();

// التكوين
{
  id: TaskType.RECOMMENDATIONS_GENERATOR,
  name: "WisdomSynthesizer AI",
  category: TaskCategory.ADVANCED_MODULES,
  complexityScore: 0.88,
}
```
**الوظيفة:** توليد التوصيات والتحسينات - مولد توصيات وتحسينات متطور

---

## 📋 التسجيل في Registry

جميع الوكلاء مُسجّلة في:
- **`registry.ts`** - للاستخدام المباشر عبر BaseAgent
- **`index.ts`** - للتحميل الديناميكي عبر AIAgentConfig

```typescript
// registry.ts
export class AgentRegistry {
  private registerAgents(): void {
    // Core (4)
    this.agents.set(TaskType.ANALYSIS, analysisAgent);
    this.agents.set(TaskType.CREATIVE, creativeAgent);
    this.agents.set(TaskType.INTEGRATED, integratedAgent);
    this.agents.set(TaskType.COMPLETION, completionAgent);
    
    // Analysis (6)
    this.agents.set(TaskType.RHYTHM_MAPPING, rhythmMappingAgent);
    // ... والباقي
    
    // Creative (4)
    // Predictive (4)
    // Advanced (9)
  }
}
```

---

## ✅ الخلاصة

- ✅ **27 وكيل مُطبّقة بالكامل**
- ✅ **جميع الوكلاء مُسجّلة في Registry**
- ✅ **جميع الوكلاء مُسجّلة في Index**
- ✅ **جميع الوكلاء تعمل بشكل صحيح**

النظام جاهز للاستخدام الكامل!
