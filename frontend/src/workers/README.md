# Web Workers للعمليات الثقيلة

## نظرة عامة

تم تنفيذ Web Workers لتحسين أداء نظام الجسيمات من خلال نقل العمليات الحسابية الثقيلة من الخيط الرئيسي (main thread) إلى خيوط عمل منفصلة (worker threads).

## الميزات الرئيسية

### 1. **Particle Generator Worker** (`particle-generator.worker.ts`)

يتعامل مع:

- توليد مواقع الجسيمات باستخدام Signed Distance Functions (SDF)
- Rejection sampling لإنشاء أشكال النص
- معالجة دفعات (batch processing) للحفاظ على استجابة الواجهة
- تقارير التقدم (progress reporting)

**الفوائد:**

- تحرير الخيط الرئيسي أثناء التوليد
- تحميل صفحة أسرع
- لا يوجد تجميد للواجهة

### 2. **Particle Physics Worker** (`particle-physics.worker.ts`)

يتعامل مع:

- حسابات الفيزياء لكل جسيم
- تطبيق التأثيرات (spark, wave, vortex)
- حساب الألوان الديناميكية
- تحديث السرعات والمواقع

**الفوائد:**

- أداء أفضل في الإطارات العالية (high FPS)
- حسابات موازية (parallel calculations)
- انخفاض الضغط على الخيط الرئيسي

### 3. **Worker Manager** (`worker-manager.ts`)

يدير:

- دورة حياة Workers (initialization, termination)
- التواصل بين الخيط الرئيسي والـ Workers
- معالجة الأخطاء
- Transferable objects لنقل البيانات الفعال

## كيفية الاستخدام

### استيراد المكون

```typescript
import WorkerParticleAnimation from '@/components/particle-background-worker';

// في المكون الخاص بك
<WorkerParticleAnimation />
```

### استخدام Worker Manager مباشرة

```typescript
import { ParticleWorkerManager } from "@/workers/worker-manager";

const manager = new ParticleWorkerManager();

// تهيئة Workers
await manager.initializeWorkers();

// توليد الجسيمات
const particles = await manager.generateParticles(
  {
    numParticles: 8000,
    thickness: 0.15,
    minX: -2.1,
    maxX: 5.6,
    minY: -0.4,
    maxY: 0.85,
    maxAttempts: 3000000,
    batchSize: 600,
  },
  (progress, count) => {
    console.log(`Progress: ${progress}%, Count: ${count}`);
  }
);

// تحديث الجسيمات
const updated = await manager.updateParticles({
  type: "update",
  positions: particlePositions,
  velocities: particleVelocities,
  originalPositions: originalPos,
  colors: particleColors,
  particleCount: count,
  config: {
    effect: "spark",
    effectRadius: 0.5,
    repelStrength: 0.08,
    attractStrength: 0.15,
    damping: 0.92,
    intersectionPoint: { x: 0, y: 0, z: 0 },
    time: Date.now() * 0.001,
  },
});

// تنظيف
manager.terminate();
```

## البنية

```
workers/
├── particle-generator.worker.ts   # Worker لتوليد الجسيمات
├── particle-physics.worker.ts     # Worker لحسابات الفيزياء
├── worker-manager.ts               # مدير Workers
├── types.ts                        # تعريفات TypeScript
└── README.md                       # هذا الملف
```

## الأداء

### قبل Web Workers:

- ❌ تجميد الواجهة أثناء التوليد (2-5 ثواني)
- ❌ انخفاض FPS أثناء التفاعلات (< 30 FPS)
- ❌ استهلاك عالي للـ CPU في الخيط الرئيسي

### بعد Web Workers:

- ✅ واجهة مستجيبة دائماً
- ✅ FPS عالي ومستقر (> 60 FPS)
- ✅ توزيع الحمل على عدة خيوط
- ✅ تحميل صفحة أسرع

## التكوين

### Next.js Configuration

تم تحديث `next.config.ts` لدعم Web Workers:

```typescript
// CSP Headers
("worker-src 'self' blob:",
  "child-src 'self' blob:",
  // Webpack config
  config.module.rules.push({
    test: /\.worker\.(ts|js)$/,
    use: {
      loader: "worker-loader",
      options: {
        filename: "static/[hash].worker.js",
        publicPath: "/_next/",
      },
    },
  }));
```

## مثال على تقارير التقدم

```typescript
const particles = await manager.generateParticles(config, (progress, count) => {
  // تحديث شريط التقدم
  setProgress(progress);
  console.log(`Generated ${count} particles (${progress}%)`);
});
```

## معالجة الأخطاء

```typescript
try {
  await manager.initializeWorkers();
  const particles = await manager.generateParticles(config);
} catch (error) {
  console.error("Worker error:", error);
  // استخدام fallback للتوليد في الخيط الرئيسي
}
```

## Transferable Objects

يتم استخدام Transferable Objects لنقل البيانات بكفاءة عالية:

```typescript
// نقل ملكية المصفوفات إلى Worker (zero-copy)
worker.postMessage(data, [
  data.positions.buffer,
  data.velocities.buffer,
  data.colors.buffer,
]);
```

## المتطلبات

- Next.js 14+
- TypeScript 5+
- Modern browsers with Web Worker support
- Three.js

## الأجهزة المدعومة

تم تحسين التكوين حسب الجهاز:

```typescript
const PARTICLE_CONFIG = {
  DESKTOP: { count: 8000, batchSize: 600 },
  MOBILE: { count: 3000, batchSize: 400 },
  TABLET: { count: 5000, batchSize: 500 },
};
```

## الأمان

- ✅ CSP headers محدثة لدعم Workers
- ✅ Same-origin policy
- ✅ Blob URLs آمنة
- ✅ لا توجد eval أو unsafe-eval في Workers

## الاختبار

```bash
# في frontend directory
npm run dev

# افتح المتصفح وافحص Console للتأكد من:
# 1. تهيئة Workers بنجاح
# 2. توليد الجسيمات بدون أخطاء
# 3. تحديثات سلسة للإطارات
```

## الملاحظات المهمة

1. **Worker Lifecycle**: تأكد من استدعاء `terminate()` عند التنظيف
2. **Memory Management**: Workers تستهلك ذاكرة إضافية
3. **Browser Support**: تحقق من دعم المتصفح للـ Web Workers
4. **Debugging**: استخدم Chrome DevTools > Sources > Workers

## المساهمة

عند إضافة ميزات جديدة للـ Workers:

1. أضف types في `types.ts`
2. حدّث Worker المناسب
3. حدّث `worker-manager.ts` إذا لزم الأمر
4. وثّق التغييرات في هذا الملف

## الموارد

- [MDN: Using Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)
- [Web Workers Best Practices](https://web.dev/workers-basics/)
- [Transferable Objects](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects)
