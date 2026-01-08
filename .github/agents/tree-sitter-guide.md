# 🌲 دليل استخدام Tree-sitter MCP

## ✅ تم الإعداد بنجاح!

تم إنشاء ملف الإعدادات في:
```
C:\Users\Mohmed Aimen Raed\AppData\Roaming\Codeium\windsurf\mcp_settings.json
```

---

## 🔄 إعادة تشغيل Windsurf

**مهم جداً:** لتفعيل Tree-sitter، يجب إعادة تشغيل Windsurf:

1. أغلق Windsurf تماماً
2. افتحه من جديد
3. Tree-sitter سيكون متاح تلقائياً

---

## 🎯 كيفية الاستخدام

### **1. استخراج كل الـ Functions من ملف**

```typescript
// مثال: استخراج Functions من ScreenplayEditorEnhanced.tsx
tree_sitter.query({
  file: "frontend/src/app/(main)/editor/components/ScreenplayEditorEnhanced.tsx",
  query: "(function_declaration) @func"
})
```

**النتيجة:**
- `SceneHeaderAgent`
- `fetchWithRetry`
- `postProcessFormatting`
- `handlePaste`
- `handleKeyDown`
- إلخ...

---

### **2. استخراج كل الـ Classes**

```typescript
tree_sitter.query({
  file: "frontend/src/app/(main)/editor/components/ScreenplayEditorEnhanced.tsx",
  query: "(class_declaration) @class"
})
```

**النتيجة:**
- `ScreenplayClassifier`
- `StateManager`
- `AutoSaveManager`
- إلخ...

---

### **3. البحث عن استخدامات Function معينة**

```typescript
tree_sitter.query({
  file: "frontend/src/app/(main)/editor/components/ScreenplayEditorEnhanced.tsx",
  query: "(call_expression function: (identifier) @name (#eq? @name \"SceneHeaderAgent\"))"
})
```

**النتيجة:** كل الأماكن اللي استخدمت `SceneHeaderAgent`

---

### **4. استخراج كل الـ Imports**

```typescript
tree_sitter.query({
  file: "frontend/src/app/(main)/editor/components/ScreenplayEditorEnhanced.tsx",
  query: "(import_statement) @import"
})
```

**النتيجة:** كل الـ imports في الملف

---

### **5. استخراج كل الـ Regex Patterns**

```typescript
tree_sitter.query({
  file: "frontend/src/app/(main)/editor/components/ScreenplayEditorEnhanced.tsx",
  query: "(regex) @pattern"
})
```

**النتيجة:** كل الـ Regex patterns (مفيد لفحص ReDoS Protection)

---

### **6. استخراج كل الـ Types/Interfaces**

```typescript
tree_sitter.query({
  file: "frontend/src/app/(main)/editor/components/ScreenplayEditorEnhanced.tsx",
  query: "(interface_declaration) @interface"
})
```

**النتيجة:** كل الـ Interfaces المعرّفة

---

## 💡 حالات الاستخدام العملية

### **عند دمج ملفات كبيرة:**

بدلاً من:
```typescript
// قراءة 2193 سطر على دفعات
read_file(offset=1, limit=500)
read_file(offset=500, limit=500)
// ... إلخ
```

استخدم:
```typescript
// استخراج مباشر للبنية
tree_sitter.parse("screenplay-editor.tsx")
// يرجع البنية الكاملة بدون قراءة كل السطور!
```

---

### **عند Refactoring:**

```typescript
// ابحث عن كل استخدامات Function قبل تعديلها
tree_sitter.query({
  file: "**/*.tsx",
  query: "(call_expression function: (identifier) @name (#eq? @name \"postProcessFormatting\"))"
})
```

---

### **عند تحليل Dependencies:**

```typescript
// استخرج كل الـ imports لمعرفة Dependencies
tree_sitter.query({
  file: "frontend/src/app/(main)/editor/components/*.tsx",
  query: "(import_statement source: (string) @source)"
})
```

---

## 🚀 الفوائد

✅ **سرعة فائقة** - لا حاجة لقراءة الملف كاملاً
✅ **دقة عالية** - يفهم بنية TypeScript/JavaScript
✅ **استخراج ذكي** - يستخرج فقط ما تحتاجه
✅ **تحليل عميق** - يفهم العلاقات بين الأكواد

---

## 📝 ملاحظات مهمة

1. **Tree-sitter يعمل على ملفات محلية فقط** (لا يعمل على URLs)
2. **يدعم TypeScript, JavaScript, Python, Rust, Go, وغيرها**
3. **الـ Queries تستخدم Tree-sitter Query Language**
4. **يمكن استخدام Wildcards في المسارات**: `**/*.tsx`

---

## 🔗 مصادر إضافية

- [Tree-sitter Query Syntax](https://tree-sitter.github.io/tree-sitter/using-parsers#pattern-matching-with-queries)
- [Tree-sitter Playground](https://tree-sitter.github.io/tree-sitter/playground)
- [TypeScript Grammar](https://github.com/tree-sitter/tree-sitter-typescript)

---

## ✨ أمثلة متقدمة

### **استخراج كل الـ useState hooks:**

```typescript
tree_sitter.query({
  file: "frontend/src/app/(main)/editor/components/ScreenplayEditorEnhanced.tsx",
  query: "(call_expression function: (identifier) @name (#eq? @name \"useState\"))"
})
```

### **استخراج كل الـ useEffect hooks:**

```typescript
tree_sitter.query({
  file: "frontend/src/app/(main)/editor/components/ScreenplayEditorEnhanced.tsx",
  query: "(call_expression function: (identifier) @name (#eq? @name \"useEffect\"))"
})
```

### **استخراج كل الـ Event Handlers:**

```typescript
tree_sitter.query({
  file: "frontend/src/app/(main)/editor/components/ScreenplayEditorEnhanced.tsx",
  query: "(jsx_attribute (property_identifier) @attr (#match? @attr \"^on[A-Z]\"))"
})
```

---

**تم الإعداد بنجاح! 🎉**
