# الدور
أنت مهندس واجهات Frontend (Next.js + Tailwind + GSAP) مسؤول عن تنفيذ تعديلات دقيقة على شاشة الـ Hero في مشروع "the-copy".
الهدف: سد “نقص” واجهة المستخدم دون كسر الهوية البصرية أو تتابع الأنيميشن الحالي، مع الحفاظ على الاستقرار ومنع أي انهيار/تفكك في الـ Hero.

# حقائق يجب الالتزام بها (لا تفاوض)
- "النسخة" = اسم التطبيق (App Name)
- "بس اصلي" = السلوجن (Slogan)
- لا تُدخل تغييرات واسعة في بنية المكونات أو إعادة تصميم شامل.
- لا تعدّل مسارات routing.
- التعديلات يجب أن تكون محدودة ومحصورة في الملفات المحددة أدناه فقط.
- بعد كل تعديل: يجب تشغيل أوامر التحقق (lint/typecheck/test/build) وإصلاح أي خطأ فورًا.
- ممنوع ترك كود غير مستخدم أو كلاسز بلا داعي.

# نطاق الملفات المسموح تعديلها فقط
1) frontend/src/components/HeroAnimation.tsx
2) frontend/src/hooks/use-hero-animation.ts
(اختياري فقط إذا اضطررت لتعديل أسلوب CTA لكن حاول تجنّبه)
3) frontend/src/styles/globals.css

# المشكلة المراد حلها (بدقة)
1) لقطة "بس اصلي + البطاقات" تبدو بوستر أكثر من واجهة: لا يوجد CTA واضح ولا مسار فعل فوري.
2) الرابط المركزي /editor موجود لكن غير قابل للنقر عمليًا لأن عنصر Link لا يفعّل pointer events.
3) نص "فتح التطبيق" في عناصر الشبكة 4×4 يعتمد على hover فقط => يختفي على الموبايل.
4) أثناء دخول البطاقات، قد تظهر فوق النصوص (إحساس عدم اتزان) بسبب z-index.
5) يجب الحفاظ على منطق الهوية: "النسخة" اسم التطبيق و"بس اصلي" سلوجن—بدون خلط أو قلب معاني غير مقصود.

# المطلوب النهائي (Acceptance Criteria)
A) في مرحلة لقطة "بس اصلي" يجب أن يرى المستخدم CTA واضحًا:
   - زر: "افتح المحرر" (يروح إلى /editor)
   - تلميح: "اسحب لأسفل لاستكشاف أدوات النسخة"
   - CTA لا يكسر المشهد ولا يزاحم العنوان/البطاقات.
B) الرابط المركزي (unified entity) يصبح قابل للنقر فعليًا في جميع المراحل التي يظهر فيها.
C) على الموبايل: "فتح التطبيق" يظهر دائمًا (على الأقل في md وما دون)، وعلى الديسكتوب يبقى hover كما هو.
D) النصوص (بس اصلي + الإهداء + النص المرحلي) لا تغرق تحت البطاقات أثناء الحركة (z-index مضبوط).
E) تمرير: pnpm lint + pnpm typecheck + pnpm test + pnpm build بنجاح.
F) لا تغييرات خارج الملفات المسموح بها.

# خطة التنفيذ خطوة بخطوة (إلزامية)
## 0) التحضير
- أنشئ فرع جديد: chore/hero-ux-polish
- ثبّت الحزم من جذر المشروع:
  - pnpm i
- تأكد من نجاح build الحالي قبل التعديل:
  - pnpm lint
  - pnpm typecheck
  - pnpm test
  - pnpm build

## 1) تعديل HeroAnimation.tsx: تفعيل النقر على الكيان المركزي + CTA ثابتة + موبايل
افتح: frontend/src/components/HeroAnimation.tsx

### 1.1) تفعيل النقر على /editor داخل unified entity
ابحث عن:
<Link
  href="/editor"
  className="unified-entity relative w-full h-full flex items-center justify-center block"
  id="center-unified-entity"
>

استبدله بالكامل بـ (مع الحفاظ على نفس id):
<Link
  href="/editor"
  id="center-unified-entity"
  aria-label="فتح محرر النسخة"
  className="unified-entity relative w-full h-full flex items-center justify-center block pointer-events-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-2xl"
>

ملاحظة: لا تغيّر أي شيء آخر داخل هذا الـ Link.

### 1.2) جعل "فتح التطبيق" يظهر على الموبايل بدل الاعتماد على hover فقط
ابحث عن div الذي يحتوي النص "فتح التطبيق" داخل عناصر grid (داخل Link الخاص بكل cell) وستجده بهذه الكلاسات:
className="text-[10px] md:text-xs text-[#FFD700] opacity-0 group-hover:opacity-100 ..."

غيّرها إلى:
className="text-[10px] md:text-xs text-[#FFD700] opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 uppercase tracking-widest font-medium"

الهدف:
- موبايل: مرئي دائمًا
- md+ : مخفي حتى hover مثل السابق

### 1.3) إضافة CTA Overlay (زر + تلميح) بدون كسر المشهد
داخل نفس المكون HeroAnimation، أضف هذا البلوك مرة واحدة فقط:
- مكان الإضافة: بعد إغلاق </div> الخاص بـ .scene-container مباشرةً، وقبل <div ref={triggerRef} ...>

أضف:
{/* CTA / UX Hint */}
<div className="hero-cta fixed bottom-6 left-0 right-0 z-[10020] flex flex-col items-center gap-3 opacity-0 pointer-events-none">
  <Link
    href="/editor"
    className="pointer-events-auto inline-flex items-center justify-center rounded-full px-6 py-3 text-sm md:text-base font-semibold bg-white/10 hover:bg-white/15 active:bg-white/20 border border-white/15 backdrop-blur-md"
    aria-label="افتح المحرر الآن"
  >
    افتح المحرر
  </Link>
  <div className="text-xs md:text-sm text-white/60 tracking-wider">
    اسحب لأسفل لاستكشاف أدوات النسخة
  </div>
</div>

قيود:
- لا تغيّر z-index الحالي للمشهد (استخدم z المذكور فقط).
- لا تستخدم مكونات UI إضافية، أبقها Tailwind فقط.

بعد إنهاء هذا الملف:
- شغّل: pnpm --filter frontend lint

## 2) تعديل use-hero-animation.ts: إظهار CTA في التوقيت الصحيح + رفع z-index للنصوص
افتح: frontend/src/hooks/use-hero-animation.ts

### 2.1) رفع z-index للنصوص حتى لا تغرق تحت البطاقات
ابحث عن Phase 2 حيث يوجد:
tl.fromTo(".text-content-wrapper", ..., { ..., zIndex: 30, ... })
وغيّر zIndex إلى:
zIndex: 10050

ثم ابحث عن:
tl.fromTo(".dedication-wrapper", ..., { ..., zIndex: 29, ... })
وغيّر zIndex إلى:
zIndex: 10049

ثم ابحث عن tl.set(".phase-5-wrapper", { ... }) وأضف داخله:
zIndex: 10048

(لا تغيّر أي قيم أخرى في هذه البلوكات)

### 2.2) إظهار CTA بعد انتهاء مرحلة الفيديو وبداية ظهور العنوان
بعد بلوك إظهار الهيدر مباشرة (tl.to(".fixed-header", ...)) أو مباشرة بعد أول tl.fromTo الخاص بالعنوان،
أضف خطوة جديدة لإظهار CTA:

tl.to(
  ".hero-cta",
  {
    opacity: 1,
    duration: 0.8,
    ease: "power2.out",
    pointerEvents: "auto",
  },
  "-=0.6",
)

المهم:
- يجب أن تظهر CTA عندما يبدأ "بس اصلي" في الظهور (وليس أثناء الفيديو الأبيض).

### 2.3) إخفاء CTA قبل/أثناء الانتقال إلى Grid 4×4 (Phase 7)
قبل خطوة إظهار grid أو بالتزامن مع بداية تقليص .frozen-container (أول سطر في المرحلة 7 تقريبًا)،
أضف:

tl.to(
  ".hero-cta",
  {
    opacity: 0,
    duration: 0.4,
    ease: "power2.inOut",
    pointerEvents: "none",
  },
  "<",
)

حتى لا تظل CTA فوق شبكة التطبيقات.

بعد إنهاء هذا الملف:
- شغّل:
  - pnpm --filter frontend lint
  - pnpm --filter frontend typecheck

## 3) تحقق نهائي إلزامي
من جذر المشروع شغّل بالترتيب:
- pnpm lint
- pnpm typecheck
- pnpm test
- pnpm build

ثم تحقق يدويًا (تشغيل dev) من السيناريوهات التالية:
1) عند لقطة "بس اصلي" يظهر زر "افتح المحرر" + تلميح السحب.
2) الضغط على الزر يفتح /editor.
3) الضغط على الكيان المركزي (الـ V-cards في المنتصف) يفتح /editor أيضًا.
4) في Grid 4×4 على الموبايل: "فتح التطبيق" مرئي أسفل اسم كل تطبيق بدون hover.
5) أثناء دخول البطاقات: النصوص لا تُغطّى تحت البطاقات (z-index).

# تسليم التغييرات
- لا تغيّر أي ملفات غير المذكورة في نطاق الملفات.
- اذكر في الملخص النهائي الملفات التي تغيّرت فقط مع سطرين يشرحان ماذا تغير.
- إذا فشل أي اختبار/بناء: أصلحه قبل التسليم ولا تترك TODOs أو تعليقات مؤقتة.
