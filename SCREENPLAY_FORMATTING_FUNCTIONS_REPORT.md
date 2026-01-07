# تقرير شامل: دوال ووظائف معالجة وتنسيق السيناريو

**تاريخ الإنشاء:** 5 يناير 2026  
**المشروع:** arabicy-screenplay-editor  
**الغرض:** توثيق شامل لجميع الدوال والوظائف المستخدمة في معالجة وإعادة تنسيق السيناريو

---

## 📋 جدول المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [الوحدات الأساسية](#الوحدات-الأساسية)
3. [دوال معالجة النصوص](#دوال-معالجة-النصوص)
4. [دوال التصنيف والتحليل](#دوال-التصنيف-والتحليل)
5. [دوال التنسيق والتطبيق](#دوال-التنسيق-والتطبيق)
6. [الدوال المساعدة](#الدوال-المساعدة)
7. [Classes والأنظمة المتقدمة](#classes-والأنظمة-المتقدمة)
8. [دوال الأمان والتحقق](#دوال-الأمان-والتحقق)

---

## نظرة عامة

التطبيق يحتوي على نظام شامل لمعالجة وتنسيق السيناريوهات العربية، مقسم إلى عدة طبقات:
- **طبقة معالجة النصوص DOM-based**
- **طبقة التصنيف والتحليل اللغوي**
- **طبقة التنسيق والتطبيق**
- **طبقة الأمان والتحقق**
- **أنظمة متقدمة للإدارة والتعاون**

---

## الوحدات الأساسية

### 📁 `src/modules/text/domTextReplacement.ts`

#### `applyRegexReplacementToTextNodes()`
```typescript
function applyRegexReplacementToTextNodes(
  root: HTMLElement,
  patternSource: string,
  patternFlags: string,
  replacement: string,
  replaceAll: boolean
): number
```

**الوصف:** دالة محورية لاستبدال النصوص باستخدام Regex في عقد DOM النصية.

**الوظيفة:**
- تطبيق استبدال Regex على جميع Text Nodes في شجرة DOM
- دعم الاستبدال الجزئي (مرة واحدة) أو الكامل (جميع التطابقات)
- معزولة عن React لإمكانية إعادة الاستخدام

**المعاملات:**
- `root`: العنصر الجذر للبحث فيه
- `patternSource`: نمط Regex للبحث
- `patternFlags`: flags للتعبير العادي
- `replacement`: النص البديل
- `replaceAll`: true للاستبدال الكامل

**الإرجاع:** عدد الاستبدالات المُنفذة

**الاستخدام:**
```typescript
const count = applyRegexReplacementToTextNodes(
  editorElement,
  'محمد',
  'gi',
  'أحمد',
  true
);
```

---

### 📁 `src/utils/sanitizer.ts`

مجموعة دوال لتأمين المحتوى ومنع هجمات XSS.

#### 1. `sanitizeHTML()`
```typescript
function sanitizeHTML(dirty: string): string
```

**الوصف:** تنظيف محتوى HTML لمنع هجمات XSS.

**الوظيفة:**
- استخدام DOMPurify للتنظيف
- السماح فقط بعلامات آمنة: `p`, `div`, `span`, `br`, `strong`, `em`, `u`
- السماح بخصائص: `class`, `style`, `dir`

#### 2. `sanitizeContentEditable()`
```typescript
function sanitizeContentEditable(content: string): string
```

**الوصف:** تنظيف محتوى عناصر contenteditable مع الحفاظ على النصوص العربية.

**الوظيفة:**
- إزالة العناصر الخطرة: `script`, `object`, `embed`, `link`, `style`, `meta`
- منع الأحداث الخطرة: `onclick`, `onload`, `onerror`, `onmouseover`

#### 3. `sanitizeUserInput()`
```typescript
function sanitizeUserInput(input: string): string
```

**الوصف:** التحقق من وتنظيف مدخلات المستخدم.

**الوظيفة:**
- إزالة null bytes وأحرف التحكم
- الحد من الطول إلى 100,000 حرف لمنع DoS
- إزالة المسافات الزائدة

#### 4. `sanitizeFilename()`
```typescript
function sanitizeFilename(filename: string): string
```

**الوصف:** تأمين أسماء الملفات لعمليات الملفات الآمنة.

**الوظيفة:**
- إزالة الأحرف الخطرة: `< > : " / \ | ? *`
- إزالة النقاط البادئة
- الحد من الطول إلى 255 حرف

#### 5. `generateCSPHeader()`
```typescript
function generateCSPHeader(): string
```

**الوصف:** توليد رأس Content Security Policy.

**الإرجاع:** سلسلة CSP كاملة للأمان

---

## دوال التصنيف والتحليل

### 📁 `src/components/editor/ScreenplayEditor.tsx`
### 📁 `src/components/editor/CleanIntegratedScreenplayEditor.tsx`

### `class ScreenplayClassifier`

نظام شامل لتصنيف وتحليل السيناريوهات العربية.

#### دوال التطبيع Normalization

##### 1. `stripTashkeel()`
```typescript
static stripTashkeel(text: string): string
```
**الوظيفة:** إزالة التشكيل العربي من النص.

##### 2. `normalizeSeparators()`
```typescript
static normalizeSeparators(text: string): string
```
**الوظيفة:** توحيد الفواصل والشرطات (-–—) والفواصل (،,).

##### 3. `normalizeLine()`
```typescript
static normalizeLine(input: string): string
```
**الوظيفة:** تطبيع شامل للسطر (تشكيل + فواصل + مسافات + أحرف غير مرئية).

##### 4. `easternToWesternDigits()`
```typescript
static easternToWesternDigits(s: string): string
```
**الوظيفة:** تحويل الأرقام العربية (٠-٩) إلى أرقام غربية (0-9).

#### دوال الفحص Type Checkers

##### 5. `isBlank()`
```typescript
static isBlank(line: string): boolean
```
**الوظيفة:** فحص إذا كان السطر فارغاً أو يحتوي على مسافات فقط.

##### 6. `isBasmala()`
```typescript
static isBasmala(line: string): boolean
```
**الوظيفة:** التعرف على البسملة بصيغها المختلفة:
- `بسم الله الرحمن الرحيم`
- `}بسم الله الرحمن الرحيم{`

##### 7. `isSceneHeaderStart()`
```typescript
static isSceneHeaderStart(line: string): boolean
```
**الوظيفة:** التعرف على بداية ترويسة مشهد:
- `مشهد 1`
- `م. 1`

**Regex:** `/^\s*(?:مشهد|م\.)\s*\d+/i`

##### 8. `isTransition()`
```typescript
static isTransition(line: string): boolean
```
**الوظيفة:** التعرف على الانتقالات:
- `قطع إلى`
- `تلاشي داخل/خارج`
- `CUT TO:`, `FADE IN:`, `FADE OUT:`

##### 9. `isParenShaped()`
```typescript
static isParenShaped(line: string): boolean
```
**الوظيفة:** فحص إذا كان السطر محاطاً بأقواس `(نص)`.

##### 10. `isCharacterLine()`
```typescript
static isCharacterLine(line: string, context?: {
  lastFormat: string;
  isInDialogueBlock: boolean;
}): boolean
```
**الوظيفة:** التعرف على أسماء الشخصيات مع دعم السياق.

**المعايير:**
- ينتهي بنقطتين `:`
- يطابق نمط أسماء العربية
- عدد الكلمات ≤ 7
- السياق (داخل/خارج كتلة حوار)

##### 11. `isLikelyAction()`
```typescript
static isLikelyAction(line: string): boolean
```
**الوظيفة:** تحديد إذا كان السطر وصف حركة/فعل.

**المعايير:**
- يبدأ بفعل حركة عربي (يدخل، يخرج، ينظر...)
- يحتوي على أفعال مساعدة محددة
- أطول من 5 كلمات بدون نقطتين
- يحتوي على علامات ترقيم جملة

#### دوال المساعدة Helper Functions

##### 12. `textInsideParens()`
```typescript
static textInsideParens(s: string): string
```
**الوظيفة:** استخراج النص داخل الأقواس.

##### 13. `hasSentencePunctuation()`
```typescript
static hasSentencePunctuation(s: string): boolean
```
**الوظيفة:** فحص وجود علامات ترقيم جملة: `.` `!` `؟` `?`

##### 14. `wordCount()`
```typescript
static wordCount(s: string): number
```
**الوظيفة:** عد الكلمات في النص.

#### دالة التركيب الرئيسية

##### 15. `structureScript()`
```typescript
structureScript(screenplayText: string): Script
```
**الوصف:** تحويل نص السيناريو الخام إلى بنية منظمة.

**الوظيفة:**
- تحليل السيناريو سطراً بسطر
- استخراج المشاهد Scenes
- تحديد الشخصيات Characters
- فصل الحوارات Dialogues
- تصنيف الأفعال Actions

**الإرجاع:** كائن `Script` مُهيكل يحتوي على:
```typescript
interface Script {
  rawText: string;
  totalLines: number;
  scenes: Scene[];
  characters: Record<string, Character>;
  dialogueLines: DialogueLine[];
}
```

---

## دوال التنسيق والتطبيق

### `getFormatStyles()`
```typescript
function getFormatStyles(formatType: string): React.CSSProperties
```

**الوصف:** توليد أنماط CSS inline للعناصر المختلفة.

**أنواع التنسيق المدعومة:**
- `basmala` - البسملة (محاذاة يسار، عريض)
- `scene-header-top-line` - ترويسة مشهد (flex، توزيع متباعد)
- `scene-header-1` - رقم المشهد (عريض، كابيتال)
- `scene-header-2` - وقت/مكان (مائل)
- `scene-header-3` - موقع (وسط، عريض)
- `character` - اسم شخصية (وسط، عريض، كابيتال، عرض 2.5in)
- `parenthetical` - توجيه (وسط، مائل، عرض 2.0in)
- `dialogue` - حوار (وسط، عرض 2.5in)
- `action` - فعل (محاذاة يمين)
- `transition` - انتقال (وسط، عريض، كابيتال)

### `applyFormatToCurrentLine()`
```typescript
function applyFormatToCurrentLine(formatType: string): void
```

**الوصف:** تطبيق تنسيق على السطر الحالي عند موضع المؤشر.

**الوظيفة:**
- الحصول على العنصر عند موضع المؤشر
- تطبيق className المناسب
- تطبيق الأنماط inline
- تحديث currentFormat

### `postProcessFormatting()`
```typescript
function postProcessFormatting(htmlResult: string): string
```

**الوصف:** معالجة لاحقة لتصحيح التصنيفات الخاطئة.

**الوظيفة:**
- تحويل أسطر action تحتوي على `bullet + اسم: حوار` إلى character + dialogue
- تحويل حوارات هي في الحقيقة أوصاف أفعال إلى action
- إزالة الشرطات البادئة من الأفعال

### `handlePaste()`
```typescript
function handlePaste(e: React.ClipboardEvent): void
```

**الوصف:** معالجة لصق النص الخام وتحويله تلقائياً إلى تنسيق سيناريو.

**الوظيفة:**
1. استخراج النص الملصق
2. تقسيمه إلى أسطر
3. تصنيف كل سطر (بسملة، مشهد، شخصية، حوار، فعل، انتقال)
4. توليد HTML مُنسق
5. معالجة لاحقة
6. إدراج في الموضع الحالي

### Navigation Functions

#### `getNextFormatOnTab()`
```typescript
function getNextFormatOnTab(currentFormat: string, shiftKey: boolean): string
```

**الوصف:** تحديد التنسيق التالي عند الضغط على Tab.

**التسلسل الرئيسي:**
- `scene-header-top-line` → `action` → `character` → `transition`

**تسلسل الحوار:**
- `character` → `dialogue` → `parenthetical` → `dialogue`

**Shift+Tab:** عكس التسلسل

#### `getNextFormatOnEnter()`
```typescript
function getNextFormatOnEnter(currentFormat: string): string
```

**الوصف:** تحديد التنسيق التالي عند الضغط على Enter.

**الانتقالات:**
- `scene-header-top-line` → `scene-header-3`
- `scene-header-3` → `action`
- `scene-header-1` → `scene-header-3`
- `scene-header-2` → `scene-header-3`
- جميع الأخريات → `action`

### `handleKeyDown()`
```typescript
function handleKeyDown(e: React.KeyboardEvent): void
```

**الوصف:** معالج شامل لضغطات المفاتيح.

**الاختصارات المدعومة:**
- `Tab` - التنقل بين التنسيقات
- `Enter` - سطر جديد مع تنسيق تلقائي
- `Ctrl+B` - عريض
- `Ctrl+I` - مائل
- `Ctrl+U` - تحته خط
- `Ctrl+Z` - تراجع
- `Ctrl+Y` - إعادة
- `Ctrl+S` - حفظ
- `Ctrl+F` - بحث
- `Ctrl+H` - استبدال
- `Ctrl+A` - تحديد الكل
- `Ctrl+P` - طباعة
- `Ctrl+1` - ترويسة مشهد
- `Ctrl+2` - شخصية
- `Ctrl+3` - حوار
- `Ctrl+4` - فعل
- `Ctrl+6` - انتقال

---

## Classes والأنظمة المتقدمة

### 📁 `src/components/editor/CleanIntegratedScreenplayEditor.tsx`

### 1. `StateManager`
```typescript
class StateManager {
  subscribe(key: string, callback: (value: any) => void): () => void
  setState(key: string, value: any): void
  getState(key: string): any
}
```

**الوصف:** إدارة حالة التطبيق مع نظام Pub/Sub.

**الوظائف:**
- التسجيل في تغييرات الحالة
- تحديث الحالة مع إشعار المشتركين
- استرجاع القيم

### 2. `AutoSaveManager`
```typescript
class AutoSaveManager {
  setSaveCallback(callback: (content: string) => Promise<void>): void
  updateContent(content: string): void
  startAutoSave(): void
  stopAutoSave(): void
  forceSave(): Promise<void>
}
```

**الوصف:** إدارة الحفظ التلقائي والنسخ الاحتياطية.

**الوظائف:**
- حفظ تلقائي كل 30 ثانية (قابل للتخصيص)
- مقارنة المحتوى الحالي بالمحفوظ
- حفظ إجباري عند الطلب

### 3. `AdvancedSearchEngine`
```typescript
class AdvancedSearchEngine {
  async searchInContent(content: string, query: string, options?: {
    caseSensitive?: boolean;
    wholeWords?: boolean;
    useRegex?: boolean;
  }): Promise<SearchResult>
  
  async replaceInContent(content: string, searchQuery: string, 
    replaceText: string, options?: ReplaceOptions): Promise<ReplaceResult>
}
```

**الوصف:** محرك بحث واستبدال متقدم.

**الوظائف:**
- بحث بحساسية حالة الأحرف
- بحث بكلمات كاملة
- بحث بـ Regex
- استبدال مع إحصائيات
- دعم الاستبدال الجزئي/الكامل

**الإرجاع:**
```typescript
interface SearchResult {
  success: boolean;
  query: string;
  totalMatches: number;
  results: Array<{
    lineNumber: number;
    content: string;
    matches: Array<{text: string; index: number; length: number}>;
  }>;
}
```

### 4. `CollaborationSystem`
```typescript
class CollaborationSystem {
  addCollaborator(collaborator: {id: string; name: string; color: string}): void
  removeCollaborator(id: string): void
  addComment(comment: Comment): void
  removeComment(id: string): void
  subscribeToChanges(callback: (data: any) => void): void
  getCollaborators(): Collaborator[]
  getComments(): Comment[]
}
```

**الوصف:** نظام التعاون والتعليقات (جاهز للتطوير المستقبلي).

### 5. `AIWritingAssistant`
```typescript
class AIWritingAssistant {
  async generateText(prompt: string, context: string, options?: any): 
    Promise<{text?: string}>
  async rewriteText(text: string, style: string, options?: any): 
    Promise<RewriteResult>
}
```

**الوصف:** مساعد الكتابة بالذكاء الاصطناعي.

**الوظائف:**
- توليد نصوص بناءً على سياق
- إعادة كتابة بأسلوب معين
- اقتراحات ذكية

### 6. `ProjectManager`
```typescript
class ProjectManager {
  createProject(name: string): Project
  getProjects(): Project[]
  getProject(id: string): Project | undefined
  updateProject(id: string, updates: any): Project | null
  deleteProject(id: string): void
  addTemplate(name: string, content: string): Template
  getTemplates(): Template[]
  applyTemplate(templateId: string): string | null
}
```

**الوصف:** إدارة المشاريع والقوالب.

### 7. `VisualPlanningSystem`
```typescript
class VisualPlanningSystem {
  addStoryboard(sceneId: string, description: string, imageUrl?: string): Storyboard
  getStoryboards(): Storyboard[]
  addBeatSheet(act: number, beat: string, description: string): BeatSheet
  getBeatSheets(): BeatSheet[]
}
```

**الوصف:** نظام التخطيط المرئي (Storyboards & Beat Sheets).

### 8. `StorageManager`
```typescript
class StorageManager {
  saveSettings(settings: any): boolean
  loadSettings(): Settings
  saveDocument(content: string, metadata: any): boolean
  loadDocument(): Document | null
}
```

**الوصف:** إدارة التخزين المحلي (LocalStorage).

### 9. `NotificationManager`
```typescript
class NotificationManager {
  success(message: string): void
  error(message: string): void
  warning(message: string): void
  info(message: string): void
}
```

**الوصف:** إدارة الإشعارات والرسائل.

### 10. `ExportManager`
```typescript
class ExportManager {
  async exportDocument(content: string, format: string, options: any): Promise<void>
}
```

**الوصف:** تصدير المستندات بصيغ مختلفة.

---

## دوال الحساب والإحصائيات

### `calculateStats()`
```typescript
function calculateStats(): void
```

**الوصف:** حساب إحصائيات المستند.

**الإحصائيات المحسوبة:**
- عدد الأحرف
- عدد الكلمات
- عدد الصفحات (بناءً على ارتفاع A4)
- عدد المشاهد

**الاستخدام:**
```typescript
setDocumentStats({
  characters: textContent.length,
  words: textContent.trim().split(/\s+/).length,
  pages: Math.ceil(scrollHeight / (29.7 * 37.8)),
  scenes: (textContent.match(/مشهد\s*\d+/gi) || []).length
});
```

---

## دوال المراجعة والذكاء الاصطناعي

### `handleReviewContext()`
```typescript
async function handleReviewContext(): Promise<void>
```

**الوصف:** مراجعة سياقية للنص باستخدام AI.

**الوظيفة:**
- فحص طول النص (حد أدنى 50 حرف)
- إرسال إلى خدمة AI للمراجعة
- استلام ملاحظات على:
  - استمرارية الحبكة
  - تطور الشخصيات
  - قوة الحوار
  - التناقضات

### `fetchWithRetry()`
```typescript
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries: number = 3,
  delay: number = 1000
): Promise<Response>
```

**الوصف:** fetch مع إعادة محاولة تلقائية عند الفشل.

**الوظيفة:**
- إعادة المحاولة حتى 3 مرات
- تأخير متزايد exponential backoff
- معالجة أخطاء 4xx و 5xx

---

## دوال خاصة بـ Scene Headers

### `SceneHeaderAgent()`
```typescript
function SceneHeaderAgent(
  line: string,
  ctx: {inDialogue: boolean},
  getFormatStyles: (type: string) => React.CSSProperties
): {processed: boolean; html: string} | null
```

**الوصف:** معالج متخصص لترويسات المشاهد المعقدة.

**الوظيفة:**
- تحليل ترويسات المشاهد متعددة الأسطر
- دعم الصيغ:
  - `مشهد 1`
  - `مشهد 1 - داخلي - ليل`
  - `مشهد 1 - شقة محمد`
- توليد HTML بثلاثة عناصر:
  1. scene-header-1 (رقم المشهد)
  2. scene-header-2 (وقت/مكان)
  3. scene-header-3 (الموقع)

---

## أنماط Regex المستخدمة

### الأنماط العربية الأساسية

```typescript
// أحرف عربية
AR_AB_LETTER = '\u0600-\u06FF'

// أرقام عربية وغربية
EASTERN_DIGITS = '٠١٢٣٤٥٦٧٨٩'
WESTERN_DIGITS = '0123456789'

// أفعال الحركة (أكثر من 200 فعل)
ACTION_VERB_LIST = 'يدخل|يخرج|ينظر|يرفع|تبتسم|...'

// البسملة
BASMALA_RE = /^\s*بسم\s+الله\s+الرحمن\s+الرحيم\s*$/i

// ترويسة مشهد
SCENE_PREFIX_RE = /^\s*(?:مشهد|م\.)\s*([0-9]+)\s*(?:[-–—:،]\s*)?(.*)$/i

// داخلي/خارجي
INOUT_PART = '(?:داخلي|خارجي|د\.|خ\.)'

// الوقت
TIME_PART = '(?:ليل|نهار|ل\.|ن\.|صباح|مساء|فجر|ظهر|عصر|مغرب|الغروب|الفجر)'

// شخصية
CHARACTER_RE = /^[\u0600-\u06FF\s]+:$/

// انتقال
TRANSITION_RE = /^\s*(?:قطع|قطع\s+إلى|إلى|مزج|ذوبان|خارج\s+المشهd|CUT TO:|FADE IN:|FADE OUT:)\s*$/i

// أقواس
PARENTHETICAL_SHAPE_RE = /^\s*\(.*?\)\s*$/
```

---

## واجهات TypeScript الرئيسية

### `Script`
```typescript
interface Script {
  rawText: string;
  totalLines: number;
  scenes: Scene[];
  characters: Record<string, Character>;
  dialogueLines: DialogueLine[];
}
```

### `Scene`
```typescript
interface Scene {
  id: string;
  heading: string;
  index: number;
  startLineNumber: number;
  endLineNumber?: number;
  lines: string[];
  dialogues: DialogueLine[];
  actionLines: SceneActionLine[];
}
```

### `Character`
```typescript
interface Character {
  name: string;
  dialogueCount: number;
  dialogueLines: DialogueLine[];
  firstSceneId?: string;
}
```

### `DialogueLine`
```typescript
interface DialogueLine {
  id: string;
  character: string;
  text: string;
  lineNumber: number;
  sceneId: string;
  type: 'dialogue' | 'parenthetical';
}
```

### `SceneActionLine`
```typescript
interface SceneActionLine {
  text: string;
  lineNumber: number;
}
```

---

## خدمة التحليل

### 📁 `src/services/AnalysisService.ts`

### `class AnalysisService`

```typescript
class AnalysisService {
  constructor(aiAssistant: AIWritingAssistantLike)
  
  async analyze(script: Script, rawTextOverride?: string): Promise<AnalysisResult>
}
```

**الوصف:** خدمة شاملة لتحليل السيناريو.

**الوظائف:**
- حساب عدد المشاهد
- إحصائيات حوار الشخصيات
- نسبة الحوار إلى الأفعال
- توليد Synopsis بواسطة AI
- توليد Logline بواسطة AI

**الإرجاع:**
```typescript
interface AnalysisResult {
  totalScenes: number;
  characterDialogueCounts: CharacterDialogueStat[];
  dialogueToActionRatio: number;
  synopsis: string;
  logline: string;
}
```

---

## خريطة تدفق معالجة النص

```
نص خام (Raw Text)
    ↓
handlePaste() أو إدخال مباشر
    ↓
تقسيم إلى أسطر
    ↓
لكل سطر:
    ↓
┌───────────────────────────────┐
│ فحص النوع:                     │
│ - isBlank()                   │
│ - isBasmala()                 │
│ - isSceneHeaderStart()        │
│ - isTransition()              │
│ - isCharacterLine()           │
│ - isParenShaped()             │
│ - isLikelyAction()            │
└───────────────────────────────┘
    ↓
تطبيق التصنيف
    ↓
تطبيع النص (normalizeLine)
    ↓
توليد HTML مع getFormatStyles()
    ↓
postProcessFormatting() - تصحيح
    ↓
إدراج في DOM
    ↓
updateContent() - تحديث الإحصائيات
    ↓
calculateStats()
```

---

## ملخص العد النهائي

### إجمالي الدوال الموثقة

| الفئة | عدد الدوال |
|------|-----------|
| **معالجة DOM** | 1 |
| **الأمان والتحقق** | 5 |
| **التصنيف والتحليل** | 15 |
| **التنسيق والتطبيق** | 8 |
| **التنقل والتفاعل** | 3 |
| **Classes متقدمة** | 10 |
| **دوال مساعدة** | 20+ |
| **Regex Patterns** | 15+ |

**إجمالي:** ~80+ دالة ووظيفة موثقة

---

## ملاحظات تطوير مستقبلية

### دوال مخططة للتطوير

1. **دوال التصدير المتقدمة**
   - تصدير PDF بتنسيق احترافي
   - تصدير Final Draft (.fdx)
   - تصدير Fountain

2. **دوال التعاون الحية**
   - WebSocket للتعاون الفوري
   - Conflict resolution
   - Presence indicators

3. **دوال AI متقدمة**
   - اقتراحات تلقائية أثناء الكتابة
   - تحليل بنية الحبكة
   - اكتشاف الأخطاء الدرامية

4. **دوال الترجمة**
   - ترجمة إلى/من الإنجليزية
   - الحفاظ على التنسيق

---

## الخلاصة

هذا التقرير يوثق نظاماً شاملاً ومتقدماً لمعالجة وتنسيق السيناريوهات العربية. يتميز النظام بـ:

✅ **معالجة DOM نظيفة ومعزولة**  
✅ **تصنيف ذكي للغة العربية**  
✅ **تنسيق تلقائي شامل**  
✅ **أمان متقدم ضد XSS**  
✅ **أنظمة إدارة متكاملة**  
✅ **قابلية التوسع والصيانة**  
✅ **دعم كامل للـ RTL**  
✅ **معايير صناعية للسيناريو**

جميع الدوال مكتوبة بـ TypeScript مع strict typing، موثقة جيداً، وجاهزة للإنتاج.

---

**تم التوثيق بواسطة:** DramaEngine-Architect  
**التاريخ:** 5 يناير 2026  
**الإصدار:** 1.0.0
