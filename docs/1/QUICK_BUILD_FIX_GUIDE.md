# 🚀 دليل الإصلاح السريع (Quick Build Fix Guide)

## ⚡ الملخص

**المشكلة:** `Error: No QueryClient set, use QueryClientProvider to set one`  
**السبب:** غياب `QueryClientProvider` في Root Layout  
**الحل:** تم إضافة ملف `providers.tsx` وتغليف التطبيق به  
**الحالة:** ✅ **تم الحل - البناء ينجح الآن**

---

## 📝 الملفات المعدلة

### 1. ✨ ملف جديد: `frontend/src/app/providers.tsx`
```tsx
'use client';

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      gcTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster />
    </QueryClientProvider>
  );
}
```

### 2. 📝 تعديل: `frontend/src/app/layout.tsx`
```tsx
import type { Metadata } from "next";
import "../styles/globals.css";
import { Providers } from "./providers";  // ← إضافة هذا

export const metadata: Metadata = {
  title: "النسخة - منصة الإبداع السينمائي",
  description: "منصة متكاملة للكتابة الإبداعية والتحليل الدرامي مدعومة بالذكاء الاصطناعي",
};

export const revalidate = 86400;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@200..1000&family=Tajawal:wght@200;300;400;500;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

### 3. 📝 تعديل: `frontend/src/app/(main)/metrics-dashboard/page.tsx`
```tsx
/**
 * System Metrics Dashboard Page
 *
 * Comprehensive system monitoring dashboard
 */

'use client';

import SystemMetricsDashboard from "@/components/ui/system-metrics-dashboard";

export default function MetricsDashboardPage() {
  return <SystemMetricsDashboard />;
}
```

---

## ✅ التحقق من النجاح

```bash
# 1. التحقق من النوع
pnpm typecheck
# ✓ لا توجد أخطاء

# 2. البناء
pnpm build
# ✓ Generating static pages (29/29) ✓

# 3. التشغيل محلياً
pnpm dev
# http://localhost:5000
```

---

## 🎯 ماذا تغيّر؟

| ما قبل | ما بعد |
|-------|--------|
| ❌ لا يوجد QueryClientProvider | ✅ QueryClientProvider في Root |
| ❌ صفحات لا تقدر على useQuery | ✅ جميع الصفحات تدعم React Query |
| ❌ فشل البناء في Prerendering | ✅ جميع الصفحات تُبنى بنجاح |
| ⚠️ force-dynamic مطلوب | ✅ Static Prerendering ممكن |

---

## 🔧 كيف يعمل؟

1. **RootLayout** يستخدم **Providers**
2. **Providers** يغلف التطبيق بـ **QueryClientProvider**
3. جميع المكونات (Components) يمكنها استخدام **useQuery** و hooks أخرى
4. البناء ينجح لأن QueryClient متاح في جميع الأوقات

---

## ⚠️ تحذيرات إضافية

### 1. تحذيرات ESLint (غير حرجة)
```
'error' is defined but never used
'posY' is assigned but never used
```
**الحل:** تنظيف الكود لاحقاً

### 2. مشاكل Sentry (إذا تم التفعيل)
```bash
# إذا ظهر خطأ:
pnpm update @sentry/nextjs @sentry/react
```

---

## 🚀 الخطوات التالية

```bash
# 1. التأكد من التغييرات
git status
# يجب أن تظهر:
# - frontend/src/app/providers.tsx (جديد)
# - frontend/src/app/layout.tsx (معدّل)
# - frontend/src/app/(main)/metrics-dashboard/page.tsx (معدّل)

# 2. دفع التغييرات
git add .
git commit -m "fix: add QueryClientProvider for React Query support"
git push

# 3. النشر
vercel --prod
```

---

## 📞 للمشاكل

| المشكلة | الحل |
|--------|-----|
| `QueryClient not found` | تأكد من وجود `<Providers>` في `layout.tsx` |
| `Build still fails` | شغّل `pnpm clean` ثم `pnpm install` و `pnpm build` |
| `Metrics page blank` | افتح DevTools وتحقق من الأخطاء في Console |

---

## 📚 المراجع

- **AGENTS.md** - معايير الكود الكاملة
- **BUILD_FIX_REPORT.md** - تقرير مفصّل (هذا الملف)
- [React Query Docs](https://tanstack.com/query/latest)
- [Next.js App Router](https://nextjs.org/docs/app)

---

**الحالة:** ✅ جاهز للنشر  
**آخر تحديث:** اليوم  
**الإصدار:** Next.js 15.4.7 | React 18.3.1