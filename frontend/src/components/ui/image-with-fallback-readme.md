# ImageWithFallback Component

مكون Next.js Image مع نظام fallback مدمج لسهولة التعامل مع الصور المفقودة.

## الميزات

- ✅ غلاف كامل لـ Next.js Image مع جميع الخصائص الأصلية
- ✅ نظام fallback تلقائي للصور المفقودة
- ✅ إعادة محاولة واحدة فقط لتجنب الحلقات اللانهائية
- ✅ دعم كامل لـ TypeScript
- ✅ تمرير جميع props Image الأصلية
- ✅ دعم ref للتكامل مع مكتبات أخرى

## الاستخدام

### الاستخدام الأساسي

```tsx
import { ImageWithFallback } from "@/components/ui/image-with-fallback";

<ImageWithFallback
  src="/path/to/image.jpg"
  alt="وصف الصورة"
  width={300}
  height={200}
/>;
```

### مع fallback مخصص

```tsx
<ImageWithFallback
  src="/path/to/problematic-image.jpg"
  fallbackSrc="/images/custom-fallback.jpg"
  alt="صورة مع fallback مخصص"
  width={400}
  height={300}
  className="rounded-lg shadow-lg"
/>
```

### مع event handlers

```tsx
<ImageWithFallback
  src="/path/to/image.jpg"
  alt="صورة"
  width={300}
  height={200}
  onLoad={() => console.log("تم تحميل الصورة")}
  onError={() => console.log("فشل في تحميل الصورة")}
/>
```

## الخصائص (Props)

### الخصائص الأساسية

- `src` (string): مسار الصورة المطلوبة
- `alt` (string): نص بديل للصورة

### الخصائص الاختيارية

- `fallbackSrc` (string): مسار صورة fallback مخصصة (افتراضي: `/images/fallback.jpg`)
- `fallbackClassName` (string): كلاس CSS للصورة عند استخدام fallback (غير مستخدم حالياً)
- جميع خصائص Next.js Image الأصلية (`width`, `height`, `className`, `priority`, `sizes`, إلخ)

### Event Handlers المدعومة

- `onLoad`: يتم استدعاؤها عند تحميل الصورة بنجاح
- `onError`: يتم استدعاؤها عند فشل تحميل الصورة بعد تجربة fallback

## آلية العمل

1. المكون يحاول تحميل الصورة من `src` المحدد
2. عند حدوث خطأ، يتم التحقق من:
   - لم يتم تجربة fallback من قبل (`hasTriedFallback === false`)
   - الصورة الحالية ليست هي صورة fallback بالفعل
3. إذا تحقق الشرطان، يتم تغيير `src` إلى `fallbackSrc`
4. إذا فشل fallback أيضاً، يتم استدعاء `onError` الأصلي
5. بمجرد تجربة fallback، لن يتم تجربة fallback أخرى لتجنب الحلقات اللانهائية

## متطلبات

- Next.js 13+
- React 18+
- TypeScript (اختياري لكن موصى به)

## موقع الملفات

- المكون: `src/components/ui/image-with-fallback.tsx`
- صورة Fallback: `public/images/fallback.jpg`
- مثال: `src/components/ui/image-with-fallback.example.tsx`
