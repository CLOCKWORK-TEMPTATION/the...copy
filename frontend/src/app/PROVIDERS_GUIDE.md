# 📚 دليل استخدام Providers Pattern

> **الغرض:** شرح شامل لكيفية استخدام وتوسيع نمط Providers في المشروع

---

## 🎯 مقدمة

ملف `providers.tsx` يعمل كـ **مركز مركزي** لجميع Context providers التي تحتاج إلى إحاطة التطبيق بالكامل.

### مثال بسيط:

```tsx
// ✅ جميع المكونات لديها إمكانية الوصول لـ QueryClient
<Providers>
  <App /> → يمكنها استخدام useQuery ✓
</Providers>
```

---

## 📁 البنية الحالية

```typescript
// frontend/src/app/providers.tsx

'use client';

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,        // البيانات طازجة لمدة 1 دقيقة
      gcTime: 1000 * 60 * 5,       // احتفظ بالبيانات 5 دقائق بعد عدم الاستخدام
      retry: 1,                    // حاول مرة واحدة إذا فشل الطلب
      refetchOnWindowFocus: true,  // أعد جلب البيانات عند العودة للتطبيق
      refetchOnReconnect: true,    // أعد جلب عند العودة الاتصال
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

---

## ➕ إضافة Providers جديد

### المثال 1: إضافة Theme Provider

```typescript
// frontend/src/app/providers.tsx

'use client';

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';  // ← جديد
import { Toaster } from '@/components/ui/toaster';

const queryClient = new QueryClient({
  // ... نفس الإعدادات
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        {children}
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
```

**ملاحظة مهمة:** ترتيب الـ providers مهم!

- Providers الخارجي يغلف الداخلي
- الـ children يجب أن يكون في النهاية دائماً

---

### المثال 2: إضافة Redux Provider

```typescript
// frontend/src/app/providers.tsx

'use client';

import { ReactNode } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { store } from '@/lib/redux/store';  // ← Redux store
import { Toaster } from '@/components/ui/toaster';

const queryClient = new QueryClient({
  // ...
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light">
          {children}
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
}
```

---

### المثال 3: Providers معقد مع Sentry

```typescript
// frontend/src/app/providers.tsx

'use client';

import { ReactNode, useEffect } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import * as Sentry from '@sentry/nextjs';
import { store } from '@/lib/redux/store';
import { Toaster } from '@/components/ui/toaster';

// تهيئة Sentry
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
  });
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      gcTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  useEffect(() => {
    // تهيئة إضافية عند الحاجة
    console.log('[Providers] Initialized');
  }, []);

  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light">
          {children}
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
}
```

---

## 🏗️ نمط متقدم: Providers منفصلة

إذا أصبح الملف معقداً جداً، يمكنك تقسيمه:

```typescript
// frontend/src/app/providers.tsx

'use client';

import { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReduxProvider } from './providers/redux.provider';
import { ThemeProvider } from './providers/theme.provider';
import { SentryProvider } from './providers/sentry.provider';
import { ToasterProvider } from './providers/toaster.provider';
import { queryClient } from '@/lib/query-client';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SentryProvider>
      <ReduxProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            {children}
            <ToasterProvider />
          </ThemeProvider>
        </QueryClientProvider>
      </ReduxProvider>
    </SentryProvider>
  );
}
```

ثم أنشئ ملفات منفصلة:

```typescript
// frontend/src/app/providers/redux.provider.tsx
'use client';
import { Provider } from 'react-redux';
import { store } from '@/lib/redux/store';

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
```

```typescript
// frontend/src/app/providers/theme.provider.tsx
'use client';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light">
      {children}
    </NextThemesProvider>
  );
}
```

---

## ⚙️ تكوين QueryClient

### الإعدادات الافتراضية الحالية:

```typescript
{
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,           // 1 دقيقة
      gcTime: 1000 * 60 * 5,          // 5 دقائق
      retry: 1,                       // محاولة واحدة
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  }
}
```

### تخصيص لحالات استخدام محددة:

```typescript
// استعلام بطيء (API خارجي):
useQuery({
  queryKey: ["external-api"],
  queryFn: () => fetch("https://api.example.com/data"),
  staleTime: 1000 * 60 * 30, // 30 دقيقة (لا يتغير كثيراً)
});

// استعلام سريع (API محلي):
useQuery({
  queryKey: ["local-data"],
  queryFn: () => apiClient.getData(),
  staleTime: 0, // دائماً جلب جديد
  refetchInterval: 5000, // أعد كل 5 ثوان
});

// استعلام حساس:
useQuery({
  queryKey: ["user-profile"],
  queryFn: () => apiClient.getProfile(),
  staleTime: 1000 * 60 * 60, // 1 ساعة
  retry: 3, // حاول 3 مرات
});
```

---

## 🚀 التطبيق في layout.tsx

```typescript
// frontend/src/app/layout.tsx

import type { Metadata } from "next";
import "../styles/globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "تطبيقي",
  description: "وصف التطبيق",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

---

## 🧪 اختبار Providers

### اختبار أن Provider يعمل:

```typescript
// frontend/src/components/__tests__/with-providers.test.tsx

import { render, screen } from '@testing-library/react';
import { Providers } from '@/app/providers';

function TestComponent() {
  // هذا المكون يستخدم useQuery
  const { data } = useQuery({
    queryKey: ['test'],
    queryFn: async () => 'test data',
  });

  return <div>{data}</div>;
}

describe('Providers', () => {
  it('should provide QueryClient to children', () => {
    render(
      <Providers>
        <TestComponent />
      </Providers>
    );

    expect(screen.getByText('test data')).toBeInTheDocument();
  });

  it('should not throw error when using useQuery', () => {
    expect(() => {
      render(
        <Providers>
          <TestComponent />
        </Providers>
      );
    }).not.toThrow();
  });
});
```

---

## ❌ الأخطاء الشائعة

### ❌ خطأ 1: نسيان 'use client'

```typescript
// ❌ خطأ
import { QueryClientProvider } from '@tanstack/react-query';

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

```typescript
// ✅ صحيح
'use client';  // ← ضروري!

import { QueryClientProvider } from '@tanstack/react-query';

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

---

### ❌ خطأ 2: إنشاء QueryClient في كل render

```typescript
// ❌ خطأ - QueryClient جديد في كل render
export function Providers({ children }) {
  const queryClient = new QueryClient();  // ❌ يعيد الإنشاء في كل مرة

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

```typescript
// ✅ صحيح - QueryClient واحد فقط
const queryClient = new QueryClient({...});  // خارج الدالة

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

---

### ❌ خطأ 3: ترتيب خاطئ للـ Providers

```typescript
// ❌ خطأ - Toaster بدون Provider
export function Providers({ children }) {
  return (
    <Toaster />  {/* ❌ قد لا يعمل بشكل صحيح */}
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

```typescript
// ✅ صحيح - Toaster داخل Provider
export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster />  {/* ✅ في النهاية أو داخل */}
    </QueryClientProvider>
  );
}
```

---

## 📋 قائمة مراجعة للإضافة

عند إضافة provider جديد:

- [ ] هل أضفت `'use client'` في بداية الملف؟
- [ ] هل استوردت الـ Provider من المكتبة الصحيحة؟
- [ ] هل الترتيب منطقي (Outer → Inner)؟
- [ ] هل الـ children في المكان الصحيح؟
- [ ] هل اختبرت أن التطبيق يعمل؟
- [ ] هل حدثت الـ documentation؟

---

## 🔗 الموارد

- [React Query Official Docs](https://tanstack.com/query/latest)
- [Next.js App Router - Providers Pattern](https://nextjs.org/docs/app/building-your-application/rendering/client-components#context-providers)
- [React Context API](https://react.dev/reference/react/useContext)

---

## 📞 أسئلة متكررة

### س: هل يمكن استخدام Providers متعددة؟

**ج:** نعم! كل ما تحتاجه يمكن إضافته إلى ملف واحد أو تقسيمه إلى عدة ملفات.

### س: هل يؤثر ترتيب Providers على الأداء؟

**ج:** قليلاً. الـ providers الخارجية تُقيّم أولاً، لكن التأثير عادة ضئيل.

### س: هل يمكن استخدام Providers في صفحات فردية فقط؟

**ج:** نعم، لكن إذا كنت تحتاج في كل مكان فمن الأفضل في Root Layout.

### س: كيف أختبر أن Provider يعمل؟

**ج:** استخدم اختبار بسيط يتحقق من أن hooks الـ Provider تعمل بدون أخطاء.

---

**تم الإنشاء:** اليوم  
**آخر تحديث:** اليوم  
**التوافق:** Next.js 15+ | React 18+
