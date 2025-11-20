# دليل استخدام مكون الجسيمات المحسن

## الاستبدال السريع 🔄

لاستخدام المكون المحسن بدلاً من الأصلي:

```tsx
// استبدال هذا السطر
// import V0ParticleAnimation from './particle-background';

// بهذا السطر
import OptimizedParticleAnimation from "./particle-background-optimized";
```

## الاستخدام في المكون الأب 👨‍👩‍👧‍👦

```tsx
import OptimizedParticleAnimation from "./particle-background-optimized";

export default function MyPage() {
  return (
    <div className="relative">
      {/* مكون الجسيمات المحسن */}
      <OptimizedParticleAnimation />

      {/* محتوى إضافي */}
      <div className="absolute top-10 left-10 text-white">
        <h1>محتوى فوق الجسيمات</h1>
      </div>
    </div>
  );
}
```

## التخصيص والإعدادات 🎨

### تغيير نوع التأثير

```tsx
// في ملف particle-background-optimized.tsx، غيّر هذا السطر:
const currentEffect: Effect = "spark"; // أو "wave" أو "vortex" أو "default"
```

### تعديل عدد الجسيمات

```tsx
// في ملف PARTICLE_CONFIG
const PARTICLE_CONFIG = {
  DESKTOP: { count: 10000, batchSize: 800 }, // زيادة العدد
  MOBILE: { count: 2000, batchSize: 300 }, // تقليل العدد
  TABLET: { count: 6000, batchSize: 600 },
};
```

### تخصيص حجم النقاط والألوان

```tsx
// في_material configuration_
const material = new THREE.PointsMaterial({
  size: 0.012, // حجم النقاط (أكبر = 0.012، أصغر = 0.004)
  sizeAttenuation: true,
  vertexColors: true,
  transparent: true,
  opacity: 0.9, // الشفافية (0.0 = شفاف، 1.0 = معتم)
});
```

## مراقبة الأداء 📊

### إضافة logs للمراقبة

```tsx
// في دالة generateParticlesInBatches
console.log(`📈 تم توليد ${generatedCount} جسيم في ${attempts} محاولة`);
console.log(
  `💾 استخدام الذاكرة: ${(performance.memory?.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`
);
```

### قياس FPS

```tsx
// إضافة عداد FPS
let fps = 0;
let lastTime = performance.now();

const animate = () => {
  const now = performance.now();
  const delta = now - lastTime;

  if (delta >= 1000) {
    fps = Math.round((frames * 1000) / delta);
    console.log(`FPS: ${fps}`);
    frames = 0;
    lastTime = now;
  }

  frames++;
  // باقي الكود...
};
```

## استكشاف الأخطاء 🐛

### مشكلة: الجسيمات لا تظهر

```tsx
// تحقق من:
1. تحميل مكتبة Three.js بشكل صحيح
2. عدم وجود أخطاء في وحدة التحكم
3. حجم canvas مناسب (width, height)
```

### مشكلة: أداء بطيء

```tsx
// حلول:
1. تقليل عدد الجسيمات في PARTICLE_CONFIG
2. زيادة حجم الدفعات (batchSize)
3. تقليل حجم النقاط (size)
```

### مشكلة: استهلاك ذاكرة عالي

```tsx
// حلول:
1. تمكين التنظيف التلقائي
2. تقليل العدد الأقصى للجسيمات
3. إضافة فحص دوري للذاكرة
```

## متطلبات النظام 📋

### المتصفحات المدعومة

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11.1+
- ✅ Edge 79+

### المكتبات المطلوبة

```json
{
  "three": "^0.160.0",
  "react": "^18.0.0",
  "typescript": "^5.0.0"
}
```

## أمثلة للاستخدام المتقدم 🚀

### استخدام مع React Suspense

```tsx
import { Suspense } from "react";
import OptimizedParticleAnimation from "./particle-background-optimized";

export default function App() {
  return (
    <Suspense fallback={<div>جاري تحميل الجسيمات...</div>}>
      <OptimizedParticleAnimation />
    </Suspense>
  );
}
```

### استخدام مع CSS متقدم

```tsx
<div className="relative h-screen w-full overflow-hidden">
  <OptimizedParticleAnimation />

  {/* تأثيرات CSS إضافية */}
  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none" />
</div>
```

### دمج مع مكتبات الرسوم المتحركة

```tsx
import { motion } from "framer-motion";

export default function AnimatedParticleScene() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="relative"
    >
      <OptimizedParticleAnimation />
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        className="absolute bottom-10 left-10 text-white"
      >
        عنوان متحرك
      </motion.div>
    </motion.div>
  );
}
```

## نصائح للأداء الأمثل 💡

1. **استخدم الكود المحسن في الإنتاج**
2. **راقب الأداء بانتظام**
3. **اضبط الإعدادات حسب جهازك**
4. **استخدم Chrome DevTools لمراقبة الذاكرة**
5. **فعّل التنظيف التلقائي للذاكرة**

## الدعم والمساعدة 📞

إذا واجهت أي مشاكل:

1. تحقق من وحدة تحكم المطور للأخطاء
2. راجع ملف `PARTICLE_OPTIMIZATION_SUMMARY.md`
3. استخدم ملف `particle-tests.ts` لاختبار الوظائف
