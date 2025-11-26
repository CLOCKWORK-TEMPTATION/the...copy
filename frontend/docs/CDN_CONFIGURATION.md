# CDN Configuration Guide (دليل تكوين شبكة توزيع المحتوى)

## نظرة عامة | Overview

يدعم The Copy استخدام شبكة توزيع المحتوى (CDN) لتحميل الأصول الثابتة بشكل أسرع. يتم تكوين CDN من خلال متغيرات البيئة ويعمل مع معظم مزودي CDN الشائعين.

The Copy supports using a Content Delivery Network (CDN) to serve static assets faster. CDN is configured through environment variables and works with most popular CDN providers.

---

## التكوين الأساسي | Basic Configuration

### 1. إعداد متغيرات البيئة | Setting Environment Variables

أضف هذه المتغيرات إلى ملف `.env.local`:

```bash
# تفعيل CDN | Enable CDN
NEXT_PUBLIC_ENABLE_CDN=true

# رابط CDN | CDN URL
NEXT_PUBLIC_CDN_URL=https://cdn.yourdomain.com
```

### 2. الأصول المتأثرة | Affected Assets

عند تفعيل CDN، سيتم تحميل هذه الأصول من خلال CDN:

- ملفات JavaScript (`/_next/static/chunks/*.js`)
- ملفات CSS (`/_next/static/css/*.css`)
- الخطوط (Fonts)
- الصور المحسّنة (Optimized Images)
- ملفات الـ Manifest
- أي أصول ثابتة أخرى في مجلد `/public`

---

## أمثلة لمزودي CDN | CDN Provider Examples

### Cloudflare CDN

```bash
NEXT_PUBLIC_ENABLE_CDN=true
NEXT_PUBLIC_CDN_URL=https://cdn.yourdomain.com
```

**خطوات الإعداد:**

1. أضف CNAME record في DNS يشير إلى موقعك
2. قم بتفعيل Auto Minify في Cloudflare
3. ضبط Cache Level على "Standard"
4. تأكد من تفعيل Brotli compression

### AWS CloudFront

```bash
NEXT_PUBLIC_ENABLE_CDN=true
NEXT_PUBLIC_CDN_URL=https://d111111abcdef8.cloudfront.net
```

**خطوات الإعداد:**

1. إنشاء CloudFront Distribution
2. ضبط Origin على S3 bucket أو server
3. تفعيل Compression
4. ضبط TTL المناسبة للأصول

### Vercel Edge Network

Vercel يستخدم CDN تلقائياً، لا حاجة للتكوين:

```bash
# اترك هذه المتغيرات فارغة أو لا تضعها
# NEXT_PUBLIC_ENABLE_CDN=
# NEXT_PUBLIC_CDN_URL=
```

### Fastly

```bash
NEXT_PUBLIC_ENABLE_CDN=true
NEXT_PUBLIC_CDN_URL=https://yourdomain.global.ssl.fastly.net
```

---

## سياسات الـ Cache | Cache Policies

يتم تكوين headers الـ Cache تلقائياً في `next.config.ts`:

### الأصول الثابتة (Static Assets)

```
Cache-Control: public, max-age=31536000, immutable
```

- مدة التخزين: سنة واحدة
- غير قابل للتغيير (immutable)
- مناسب لـ: JS, CSS, Fonts, Images

### ملفات Next.js (`/_next/static/*`)

```
Cache-Control: public, max-age=31536000, immutable
```

- مدة التخزين: سنة واحدة
- يتم إعادة التسمية تلقائياً عند التحديث (content hashing)

### الخطوط (Fonts)

```
Cache-Control: public, max-age=31536000, immutable
Cross-Origin-Resource-Policy: cross-origin
```

### API Responses

```
Cache-Control: public, s-maxage=60, stale-while-revalidate=120
```

- مدة التخزين: 60 ثانية
- يسمح بـ stale content لمدة 120 ثانية إضافية

---

## الأمان | Security

### Content Security Policy (CSP)

يتم تحديث CSP تلقائياً لدعم CDN المكوّن:

```javascript
// في next.config.ts
const cdnDomain = cdnUrl ? new URL(cdnUrl).hostname : null;
const cdnCsp = cdnDomain ? ` ${cdnUrl}` : '';

// CSP headers تتضمن CDN domain
script-src 'self' ... ${cdnCsp}
style-src 'self' ... ${cdnCsp}
font-src 'self' ... ${cdnCsp}
img-src 'self' ... ${cdnCsp}
```

---

## الأداء | Performance

### معايير الأداء المتوقعة

| المقياس   | بدون CDN  | مع CDN   |
| --------- | --------- | -------- |
| TTFB      | 200-500ms | 50-150ms |
| FCP       | 1-2s      | 0.5-1s   |
| LCP       | 2-4s      | 1-2s     |
| Bandwidth | 100%      | 70-80%   |

### تحسينات إضافية

1. **Image Optimization:**
   - استخدم Next.js Image component
   - يتم التحسين تلقائياً عند استخدام CDN

2. **Code Splitting:**
   - يتم تقسيم الحزم تلقائياً (انظر `next.config.ts`)
   - كل حزمة يتم تحميلها من CDN بشكل منفصل

3. **Compression:**
   - Brotli compression (تلقائي في معظم CDNs)
   - Gzip fallback

---

## الاختبار | Testing

### اختبار CDN محلياً

1. قم بإضافة entry في `/etc/hosts`:

```bash
127.0.0.1 cdn.local.test
```

2. استخدم هذا التكوين:

```bash
NEXT_PUBLIC_ENABLE_CDN=true
NEXT_PUBLIC_CDN_URL=http://cdn.local.test:3000
```

### التحقق من عمل CDN

افتح DevTools → Network tab وابحث عن:

```
Request URL: https://cdn.yourdomain.com/_next/static/...
Status: 200 (from cache)
x-cache: HIT
```

### أدوات الاختبار

```bash
# اختبار سرعة التحميل
curl -w "@curl-format.txt" -o /dev/null -s https://cdn.yourdomain.com/_next/static/chunks/main.js

# اختبار Cache headers
curl -I https://cdn.yourdomain.com/_next/static/chunks/main.js | grep -i cache
```

---

## استكشاف الأخطاء | Troubleshooting

### المشكلة: الأصول لا تُحمّل من CDN

**الحل:**

1. تأكد من أن `NEXT_PUBLIC_ENABLE_CDN=true`
2. تحقق من صحة `NEXT_PUBLIC_CDN_URL`
3. افتح DevTools → Console للبحث عن أخطاء CORS

### المشكلة: CORS Errors

**الحل:**
أضف هذه Headers في CDN:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, HEAD, OPTIONS
```

### المشكلة: محتوى قديم (Stale Content)

**الحل:**

1. قم بـ cache purge/invalidation في CDN
2. استخدم versioning في أسماء الملفات
3. Next.js يستخدم content hashing تلقائياً

---

## البيئات المختلفة | Different Environments

### Development

```bash
# لا حاجة لـ CDN في التطوير
NEXT_PUBLIC_ENABLE_CDN=false
```

### Staging

```bash
NEXT_PUBLIC_ENABLE_CDN=true
NEXT_PUBLIC_CDN_URL=https://cdn-staging.yourdomain.com
```

### Production

```bash
NEXT_PUBLIC_ENABLE_CDN=true
NEXT_PUBLIC_CDN_URL=https://cdn.yourdomain.com
```

---

## المراجع | References

- [Next.js Asset Prefix Documentation](https://nextjs.org/docs/api-reference/next.config.js/cdn-support-with-asset-prefix)
- [Web Performance Best Practices](https://web.dev/performance/)
- [CDN Comparison Guide](https://www.cdnperf.com/)

---

## ملاحظات مهمة | Important Notes

⚠️ **Security:**

- لا تُعرّض متغيرات server-side في CDN configuration
- استخدم HTTPS فقط للـ CDN URL
- تأكد من CSP headers صحيحة

✅ **Best Practices:**

- استخدم CDN قريب جغرافياً من مستخدميك
- فعّل compression (Brotli/Gzip)
- راقب استخدام Bandwidth
- قم بإعداد monitoring/alerts للـ CDN

📊 **Monitoring:**

- راقب hit/miss ratio
- تتبع TTFB من regions مختلفة
- استخدم Real User Monitoring (RUM)

---

**Last Updated:** 2025-11-07
**Version:** 1.0.0
