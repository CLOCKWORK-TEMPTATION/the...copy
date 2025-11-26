# دليل إعداد وتفعيل CDN (شبكة توزيع المحتوى)
# CDN Setup and Configuration Guide

<div dir="rtl">

## 📋 جدول المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [الفوائد](#الفوائد)
3. [متطلبات التفعيل](#متطلبات-التفعيل)
4. [خطوات الإعداد](#خطوات-الإعداد)
5. [مقدمو خدمات CDN المدعومون](#مقدمو-خدمات-cdn-المدعومون)
6. [أمثلة الاستخدام](#أمثلة-الاستخدام)
7. [استكشاف الأخطاء](#استكشاف-الأخطاء)
8. [الأسئلة الشائعة](#الأسئلة-شائعة)

---

## نظرة عامة

تم تجهيز مشروع The Copy لدعم شبكات توزيع المحتوى (CDN) لتحسين أداء تحميل الأصول الثابتة مثل:

- ✅ **الصور** (Images)
- ✅ **الخطوط** (Fonts)
- ✅ **ملفات JavaScript و CSS المجمعة**
- ✅ **ملفات PDF Worker**

### الأصول الثابتة في المشروع

| النوع | الحجم | الموقع |
|------|------|---------|
| الخطوط | 6 KB | `/frontend/public/fonts/` |
| الصور | 47 KB | `/frontend/public/images/` |
| Directors Studio | 1.2 MB | `/frontend/public/directors-studio/` |
| PDF Worker | 1.8 MB | `/frontend/public/pdf-worker/` |
| **المجموع** | **~4 MB** | - |

---

## الفوائد

### ✨ تحسينات الأداء

1. **تقليل زمن التحميل (Latency)**
   - خوادم موزعة جغرافياً أقرب للمستخدمين
   - تقليل المسافة بين المستخدم والخادم

2. **تحسين سرعة التحميل**
   - Bandwidth أكبر من خوادم CDN
   - ضغط تلقائي للأصول (Gzip/Brotli)

3. **تحسين التخزين المؤقت (Caching)**
   - Cache Headers محسّنة (max-age=31536000)
   - تخزين مؤقت على Edge Servers

4. **تقليل الحمل على الخادم الأساسي**
   - نقل حركة المرور للأصول الثابتة إلى CDN
   - توفير موارد الخادم للـ API والـ SSR

### 📊 تحسينات متوقعة

- **تقليل FCP (First Contentful Paint)**: ~30-50%
- **تقليل LCP (Largest Contentful Paint)**: ~40-60%
- **تحسين Lighthouse Score**: +10-20 نقطة

---

## متطلبات التفعيل

### المتطلبات الأساسية

- ✅ حساب على منصة CDN (Cloudflare, AWS CloudFront, etc.)
- ✅ رفع محتويات `/frontend/public/` إلى CDN
- ✅ إعداد متغيرات البيئة

### المتطلبات الاختيارية

- 🔄 إعداد Invalidation للتخزين المؤقت
- 🔒 SSL/TLS Certificate للـ CDN
- 📈 Analytics وتتبع الأداء

---

## خطوات الإعداد

### 1️⃣ اختيار مزود CDN

اختر أحد مقدمي الخدمات التاليين (أو أي مقدم آخر):

#### الخيار الأول: Cloudflare (مُوصى به - مجاني)

**المزايا:**
- ✅ خطة مجانية سخية
- ✅ سهولة الإعداد
- ✅ شبكة عالمية واسعة
- ✅ دعم عربي ممتاز

**خطوات التفعيل:**

```bash
# 1. إنشاء حساب على Cloudflare
https://dash.cloudflare.com/sign-up

# 2. إضافة موقعك
# Dashboard → Add Site → أدخل اسم النطاق

# 3. تفعيل Pages/R2 للأصول الثابتة
# Dashboard → R2 → Create Bucket → 'the-copy-assets'

# 4. رفع الأصول
pnpm install -g wrangler
wrangler r2 object put the-copy-assets/fonts/amiri-400.woff2 --file=public/fonts/amiri-400.woff2

# 5. الحصول على رابط CDN
# سيكون مثل: https://cdn.yourdomain.com
```

#### الخيار الثاني: AWS CloudFront

**المزايا:**
- ✅ تكامل مع AWS S3
- ✅ أداء ممتاز
- ✅ تحكم دقيق في الإعدادات

**خطوات التفعيل:**

```bash
# 1. إنشاء S3 Bucket
aws s3 mb s3://the-copy-assets --region us-east-1

# 2. رفع الأصول
aws s3 sync frontend/public/ s3://the-copy-assets/ --acl public-read

# 3. إنشاء CloudFront Distribution
aws cloudfront create-distribution \
  --origin-domain-name the-copy-assets.s3.amazonaws.com \
  --default-root-object index.html

# 4. انتظر حتى يتم النشر (~15 دقيقة)
# ستحصل على رابط مثل: https://d111111abcdef8.cloudfront.net
```

#### الخيار الثالث: Vercel Edge Network (تلقائي)

إذا كنت تستضيف على Vercel، فإن CDN يعمل تلقائياً:

```bash
# لا حاجة لإعدادات إضافية
# Vercel تستخدم Edge Network تلقائياً
# اترك المتغيرات فارغة

NEXT_PUBLIC_CDN_URL=
NEXT_PUBLIC_ENABLE_CDN=false
```

### 2️⃣ إعداد متغيرات البيئة

قم بتحديث ملف `.env.local`:

```bash
# نسخ ملف القالب
cp .env.example .env.local

# إضافة إعدادات CDN
nano .env.local
```

أضف المتغيرات التالية:

```env
# -------------------------------------------------------------------
# CDN Configuration
# -------------------------------------------------------------------

# رابط CDN الخاص بك (أمثلة)
NEXT_PUBLIC_CDN_URL=https://cdn.yourdomain.com

# أو Cloudflare R2
# NEXT_PUBLIC_CDN_URL=https://pub-xxxxxxxxxxxxxx.r2.dev

# أو AWS CloudFront
# NEXT_PUBLIC_CDN_URL=https://d111111abcdef8.cloudfront.net

# تفعيل CDN
NEXT_PUBLIC_ENABLE_CDN=true
```

### 3️⃣ رفع الأصول إلى CDN

#### باستخدام Cloudflare R2

```bash
# تثبيت Wrangler
pnpm install -g wrangler

# تسجيل الدخول
wrangler login

# رفع جميع الأصول
cd frontend
wrangler r2 object put the-copy-assets --file=public/ --recursive

# أو رفع مجلد محدد
wrangler r2 object put the-copy-assets/fonts --file=public/fonts/ --recursive
wrangler r2 object put the-copy-assets/images --file=public/images/ --recursive
wrangler r2 object put the-copy-assets/directors-studio --file=public/directors-studio/ --recursive
```

#### باستخدام AWS S3

```bash
# تثبيت AWS CLI
# https://aws.amazon.com/cli/

# رفع جميع الأصول
cd frontend
aws s3 sync public/ s3://the-copy-assets/ \
  --acl public-read \
  --cache-control "public, max-age=31536000, immutable"

# التحقق من الرفع
aws s3 ls s3://the-copy-assets/ --recursive
```

#### باستخدام سكريبت مخصص

أنشئ ملف `scripts/upload-to-cdn.sh`:

```bash
#!/bin/bash
# Upload assets to CDN

echo "🚀 Uploading assets to CDN..."

# تغيير المجلد إلى public
cd frontend/public

# رفع الخطوط
echo "📝 Uploading fonts..."
# أضف أمر الرفع حسب CDN المستخدم

# رفع الصور
echo "🖼️ Uploading images..."
# أضف أمر الرفع حسب CDN المستخدم

# رفع أصول Directors Studio
echo "🎬 Uploading directors-studio assets..."
# أضف أمر الرفع حسب CDN المستخدم

echo "✅ Upload complete!"
```

### 4️⃣ اختبار التفعيل

```bash
# بناء المشروع
cd frontend
pnpm build

# تشغيل في وضع الإنتاج
pnpm start

# فتح المتصفح
# افتح Developer Tools → Network
# تحقق من أن الأصول تُحمّل من CDN URL
```

التحقق في Console:

```javascript
// في Browser Console
import { cdnConfig } from '@/lib/cdn';
console.log(cdnConfig);

// النتيجة المتوقعة:
{
  url: 'https://cdn.yourdomain.com',
  enabled: true,
  isActive: true
}
```

---

## مقدمو خدمات CDN المدعومون

### 1. Cloudflare

| الميزة | التفاصيل |
|--------|---------|
| **السعر** | مجاني (خطة Free) |
| **التخزين** | Unlimited (R2: $0.015/GB) |
| **Bandwidth** | Unlimited |
| **Edge Locations** | 300+ موقع |
| **دعم عربي** | ✅ ممتاز |
| **التوثيق** | [docs.cloudflare.com](https://developers.cloudflare.com/r2/) |

**الإعداد:**
```env
NEXT_PUBLIC_CDN_URL=https://pub-xxxxxxxxxxxx.r2.dev
NEXT_PUBLIC_ENABLE_CDN=true
```

### 2. AWS CloudFront

| الميزة | التفاصيل |
|--------|---------|
| **السعر** | Pay-as-you-go (~$0.085/GB) |
| **التخزين** | S3 ($0.023/GB) |
| **Bandwidth** | حسب الاستخدام |
| **Edge Locations** | 450+ موقع |
| **دعم عربي** | ✅ جيد |
| **التوثيق** | [aws.amazon.com/cloudfront](https://aws.amazon.com/cloudfront/) |

**الإعداد:**
```env
NEXT_PUBLIC_CDN_URL=https://d111111abcdef8.cloudfront.net
NEXT_PUBLIC_ENABLE_CDN=true
```

### 3. Vercel Edge Network

| الميزة | التفاصيل |
|--------|---------|
| **السعر** | مضمّن في Vercel Hosting |
| **التخزين** | Automatic |
| **Bandwidth** | 100GB (Free), Unlimited (Pro) |
| **Edge Locations** | 70+ موقع |
| **دعم عربي** | ✅ جيد |
| **التوثيق** | [vercel.com/docs/edge-network](https://vercel.com/docs/edge-network) |

**الإعداد:**
```env
# لا حاجة للإعداد - يعمل تلقائياً
NEXT_PUBLIC_CDN_URL=
NEXT_PUBLIC_ENABLE_CDN=false
```

### 4. BunnyCDN

| الميزة | التفاصيل |
|--------|---------|
| **السعر** | $1/month + $0.01/GB |
| **التخزين** | $0.01/GB/month |
| **Bandwidth** | رخيص جداً |
| **Edge Locations** | 100+ موقع |
| **دعم عربي** | ⚠️ محدود |
| **التوثيق** | [bunny.net/docs](https://docs.bunny.net/) |

**الإعداد:**
```env
NEXT_PUBLIC_CDN_URL=https://the-copy.b-cdn.net
NEXT_PUBLIC_ENABLE_CDN=true
```

---

## أمثلة الاستخدام

### 1️⃣ استخدام الأصول في المكونات

#### مثال 1: صورة بسيطة

```tsx
import { getImageUrl } from '@/lib/cdn';

export function Logo() {
  return (
    <img
      src={getImageUrl('fallback.jpg')}
      alt="Logo"
      width={200}
      height={100}
    />
  );
}
```

#### مثال 2: استخدام next/image

```tsx
import Image from 'next/image';
import { getDirectorsStudioUrl } from '@/lib/cdn';

export function HeroImage() {
  return (
    <Image
      src={getDirectorsStudioUrl('Film_production_hero_image_6b2179d4.png')}
      alt="Hero"
      fill
      priority
      sizes="100vw"
      quality={85}
    />
  );
}
```

#### مثال 3: تحميل خط مسبقاً

```tsx
'use client';

import { useEffect } from 'react';
import { preloadAsset } from '@/lib/cdn';

export function FontPreloader() {
  useEffect(() => {
    // تحميل الخطوط المهمة مسبقاً
    preloadAsset('/fonts/amiri-400.woff2', 'font');
    preloadAsset('/fonts/cairo-400.woff2', 'font');
  }, []);

  return null;
}
```

#### مثال 4: أصل ديناميكي

```tsx
import { getAssetUrl } from '@/lib/cdn';

interface AssetProps {
  path: string;
  alt: string;
}

export function DynamicAsset({ path, alt }: AssetProps) {
  const assetUrl = getAssetUrl(path);

  return <img src={assetUrl} alt={alt} loading="lazy" />;
}
```

### 2️⃣ استخدام في CSS

#### في ملف CSS عادي

```css
/* globals.css */
@font-face {
  font-family: 'Amiri';
  font-display: swap;
  /* سيتم تحويل المسار تلقائياً بواسطة Next.js */
  src: url('/fonts/amiri-400.woff2') format('woff2');
}

.hero-background {
  background-image: url('/images/fallback.jpg');
}
```

#### في Tailwind CSS

```tsx
// tailwind.config.ts
export default {
  theme: {
    extend: {
      backgroundImage: {
        'hero': "url('/directors-studio/Film_production_hero_image_6b2179d4.png')",
      },
    },
  },
};

// في المكون
<div className="bg-hero">
  {/* المحتوى */}
</div>
```

### 3️⃣ استخدام في API Routes

```typescript
// app/api/assets/route.ts
import { getAssetUrl, isCdnEnabled } from '@/lib/cdn';
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    cdn: {
      enabled: isCdnEnabled(),
      logoUrl: getAssetUrl('/images/logo.png'),
      fonts: {
        amiri: getAssetUrl('/fonts/amiri-400.woff2'),
        cairo: getAssetUrl('/fonts/cairo-400.woff2'),
      },
    },
  });
}
```

---

## استكشاف الأخطاء

### المشكلة 1: الأصول لا تُحمّل من CDN

**الأعراض:**
- الأصول ما زالت تُحمّل من الخادم الأساسي
- Network tab يُظهر مسارات محلية

**الحلول:**

```bash
# 1. تحقق من متغيرات البيئة
cat .env.local | grep CDN

# 2. تأكد من إعادة تشغيل الخادم بعد تغيير .env
pnpm dev

# 3. تحقق من البناء
pnpm build
pnpm start

# 4. افحص في Console
# window.__NEXT_DATA__.buildId
```

### المشكلة 2: CORS Errors

**الأعراض:**
```
Access to font at 'https://cdn.yourdomain.com/fonts/amiri-400.woff2'
from origin 'https://yourdomain.com' has been blocked by CORS policy
```

**الحل:**

إضافة CORS Headers على CDN:

**Cloudflare:**
```javascript
// Workers Script
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const response = await fetch(request)
  const newResponse = new Response(response.body, response)

  newResponse.headers.set('Access-Control-Allow-Origin', '*')
  newResponse.headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')

  return newResponse
}
```

**AWS CloudFront:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCORS",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::the-copy-assets/*",
      "Condition": {
        "StringLike": {
          "aws:Referer": ["https://yourdomain.com/*"]
        }
      }
    }
  ]
}
```

### المشكلة 3: الخطوط لا تظهر

**الأعراض:**
- الخطوط العربية لا تُعرض بشكل صحيح
- Font fallback يُستخدم بدلاً من الخط المخصص

**الحلول:**

```css
/* تأكد من إضافة font-display */
@font-face {
  font-family: 'Amiri';
  src: url('/fonts/amiri-400.woff2') format('woff2');
  font-display: swap; /* مهم جداً */
  unicode-range: U+0600-06FF; /* نطاق الأحرف العربية */
}
```

```tsx
// تحميل الخط مسبقاً
import { preloadAsset } from '@/lib/cdn';

useEffect(() => {
  preloadAsset('/fonts/amiri-400.woff2', 'font');
}, []);
```

### المشكلة 4: الصور البطيئة

**الأعراض:**
- الصور تستغرق وقتاً طويلاً للتحميل
- LCP (Largest Contentful Paint) مرتفع

**الحلول:**

```tsx
// استخدم priority للصور المهمة
<Image
  src={getImageUrl('hero.jpg')}
  alt="Hero"
  priority // ⬅️ مهم للصور فوق Fold
  quality={85}
  sizes="(max-width: 768px) 100vw, 50vw"
/>

// استخدم loading="lazy" للصور الأخرى
<Image
  src={getImageUrl('gallery.jpg')}
  alt="Gallery"
  loading="lazy" // ⬅️ تحميل كسول
/>
```

---

## الأسئلة الشائعة

### س1: هل CDN مطلوب للمشروع؟

**ج:** لا، CDN اختياري تماماً. المشروع يعمل بشكل ممتاز بدون CDN. لكن CDN يُحسّن الأداء بشكل كبير خاصة للمستخدمين البعيدين جغرافياً.

### س2: كم تكلفة CDN؟

**ج:** يعتمد على المزود:
- **Cloudflare**: مجاني للخطة الأساسية
- **Vercel**: مضمّن في الاستضافة
- **AWS CloudFront**: ~$10-50/شهر حسب الاستخدام
- **BunnyCDN**: ~$1-5/شهر

### س3: هل يمكن استخدام أكثر من CDN؟

**ج:** نعم، يمكنك استخدام CDN مختلف لكل نوع أصل:

```typescript
// lib/cdn.ts
const FONT_CDN = 'https://fonts-cdn.yourdomain.com';
const IMAGE_CDN = 'https://images-cdn.yourdomain.com';

export function getFontUrl(fontName: string): string {
  return `${FONT_CDN}/fonts/${fontName}`;
}

export function getImageUrl(imagePath: string): string {
  return `${IMAGE_CDN}/images/${imagePath}`;
}
```

### س4: كيف أقيس الأداء بعد تفعيل CDN؟

**ج:** استخدم الأدوات التالية:

```bash
# 1. Lighthouse
npm install -g lighthouse
lighthouse https://yourdomain.com --view

# 2. WebPageTest
# زيارة: https://www.webpagetest.org/

# 3. Next.js Analytics (مدمج)
# pages/_app.tsx
import { Analytics } from '@vercel/analytics/react';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
```

### س5: ماذا يحدث عند تحديث الأصول؟

**ج:** تحتاج إلى:

1. **رفع الأصول الجديدة**:
```bash
aws s3 sync public/ s3://the-copy-assets/
```

2. **Invalidate Cache**:
```bash
# CloudFront
aws cloudfront create-invalidation \
  --distribution-id EXXXXXXXXXXXXX \
  --paths "/*"

# Cloudflare
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -d '{"purge_everything":true}'
```

3. **استخدم Versioning**:
```typescript
// أضف version query parameter
export function getAssetUrl(path: string): string {
  const version = process.env.NEXT_PUBLIC_ASSET_VERSION || Date.now();
  return `${CDN_URL}${path}?v=${version}`;
}
```

---

## الموارد الإضافية

### 📚 التوثيق الرسمي

- [Next.js Asset Prefix](https://nextjs.org/docs/app/api-reference/next-config-js/assetPrefix)
- [Next.js Image Optimization](https://nextjs.org/docs/pages/building-your-application/optimizing/images)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [AWS CloudFront Docs](https://docs.aws.amazon.com/cloudfront/)

### 🛠️ أدوات مفيدة

- [CDN Perf](https://www.cdnperf.com/) - مقارنة أداء CDNs
- [KeyCDN Tools](https://tools.keycdn.com/) - اختبار CDN
- [CDN Planet](https://www.cdnplanet.com/) - مراجعات CDN

### 📖 مقالات مفيدة

- [Why Use a CDN?](https://www.cloudflare.com/learning/cdn/what-is-a-cdn/)
- [CDN Best Practices](https://developer.mozilla.org/en-US/docs/Web/Performance)
- [Arabic Web Fonts Performance](https://web.dev/font-best-practices/)

---

## الدعم والمساهمة

إذا واجهت مشاكل أو لديك اقتراحات:

1. **فتح Issue**: [GitHub Issues](https://github.com/mohamedaminradyofficial/the-copy/issues)
2. **المساهمة**: راجع [CONTRIBUTING.md](../CONTRIBUTING.md)
3. **التواصل**: راجع [README.md](../README.md)

---

## الخلاصة

✅ **تم بنجاح**: إعداد دعم CDN الكامل
✅ **جاهز للاستخدام**: ابدأ بتفعيل CDN عبر `.env.local`
✅ **مرن**: يعمل مع أو بدون CDN
✅ **موثّق**: دليل شامل بالعربية والإنجليزية

**الخطوات التالية:**

1. اختر مزود CDN
2. رفع الأصول
3. إعداد متغيرات البيئة
4. اختبار الأداء

---

**آخر تحديث:** 2025-11-07
**الإصدار:** 1.0.0
**المؤلف:** The Copy Team

</div>
