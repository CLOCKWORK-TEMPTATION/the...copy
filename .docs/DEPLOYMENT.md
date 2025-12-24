# دليل النشر | Deployment Guide

## 📋 نظرة عامة

هذا الدليل يشرح كيفية نشر مشروع **The Copy** على:
- **Frontend**: Vercel
- **Backend**: Railway
- **Database**: Neon PostgreSQL (موجود)
- **Cache**: Redis Cloud (موجود)
- **Monitoring**: Sentry + Jaeger

---

## 🚀 البدء السريع

### 1. التطوير المحلي مع Docker

```bash
# تشغيل Redis + Jaeger
docker-compose -f docker-compose.dev.yml up -d

# التحقق من الحالة
docker-compose -f docker-compose.dev.yml ps

# عرض Jaeger UI
# افتح: http://localhost:16686
```

### 2. تشغيل المشروع محلياً

```bash
# Backend
cd backend
cp .env.example .env
# عدّل .env بالقيم المطلوبة
pnpm install
pnpm dev

# Frontend (في terminal آخر)
cd frontend
cp .env.example .env.local
# عدّل .env.local بالقيم المطلوبة
pnpm install
pnpm dev
```

---

## ☁️ النشر على Railway (Backend)

### الخطوة 1: إنشاء مشروع جديد

1. اذهب إلى [Railway Dashboard](https://railway.app/dashboard)
2. انقر **New Project** → **Deploy from GitHub repo**
3. اختر المستودع وحدد مجلد `/backend`

### الخطوة 2: إعداد البيئة

أضف هذه المتغيرات في **Variables**:

```env
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=<من backend/.env.production>

# AI
GOOGLE_GENAI_API_KEY=<من backend/.env.production>
GEMINI_API_KEY=<من backend/.env.production>

# Security
JWT_SECRET=<من backend/.env.production>

# CORS - سيتم تحديثه بعد نشر Frontend
CORS_ORIGIN=https://your-app.vercel.app
FRONTEND_URL=https://your-app.vercel.app

# Redis
REDIS_URL=<من backend/.env.production>

# Sentry
SENTRY_DSN=<من backend/.env.production>
SENTRY_AUTH_TOKEN=<من backend/.env.production>

# Tracing
TRACING_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=<Railway Jaeger URL>/v1/traces
SERVICE_NAME=thecopy-backend

# MongoDB
MONGODB_URI=<من backend/.env.production>
```

### الخطوة 3: إعداد البناء

في **Settings**:
- **Build Command**: `pnpm install && pnpm build`
- **Start Command**: `node dist/server.js`
- **Root Directory**: `/backend`

### الخطوة 4: نشر Jaeger (اختياري)

1. في Railway، انقر **New** → **Docker Image**
2. استخدم: `jaegertracing/all-in-one:1.52`
3. أضف المتغيرات:
   ```env
   COLLECTOR_OTLP_ENABLED=true
   SPAN_STORAGE_TYPE=memory
   ```
4. انسخ URL الداخلي واستخدمه في `OTEL_EXPORTER_OTLP_ENDPOINT`

---

## ▲ النشر على Vercel (Frontend)

### الخطوة 1: ربط المستودع

1. اذهب إلى [Vercel Dashboard](https://vercel.com/dashboard)
2. انقر **Add New** → **Project**
3. اختر المستودع

### الخطوة 2: إعداد المشروع

- **Framework Preset**: Next.js
- **Root Directory**: `frontend`
- **Build Command**: `pnpm build`
- **Output Directory**: `.next`

### الخطوة 3: إضافة Environment Variables

```env
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production

# Backend URL (من Railway)
NEXT_PUBLIC_API_URL=https://your-backend.railway.app

# Gemini
GEMINI_API_KEY_PROD=<من frontend/.env.production>

# Sentry
NEXT_PUBLIC_SENTRY_DSN=<من frontend/.env.production>
SENTRY_DSN=<من frontend/.env.production>
SENTRY_ORG=<من frontend/.env.production>
SENTRY_PROJECT=<من frontend/.env.production>
SENTRY_AUTH_TOKEN=<من frontend/.env.production>

# Tracing
NEXT_PUBLIC_TRACING_ENABLED=true
NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT=<Jaeger URL>/v1/traces
NEXT_PUBLIC_SERVICE_NAME=thecopy-frontend

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=<من frontend/.env.production>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<من frontend/.env.production>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<من frontend/.env.production>
# ... باقي Firebase variables
```

### الخطوة 4: تحديث CORS

بعد نشر Frontend، انسخ URL من Vercel وحدّث في Railway:
```env
CORS_ORIGIN=https://your-actual-app.vercel.app
FRONTEND_URL=https://your-actual-app.vercel.app
```

---

## ✅ قائمة التحقق بعد النشر

### Backend (Railway)
- [ ] Health check يعمل: `GET /health`
- [ ] API يستجيب: `GET /api/health`
- [ ] قاعدة البيانات متصلة
- [ ] Redis متصل

### Frontend (Vercel)
- [ ] الصفحة الرئيسية تظهر
- [ ] تسجيل الدخول يعمل
- [ ] الاتصال بالـ API يعمل

### Monitoring
- [ ] Sentry يستقبل الأحداث
- [ ] Jaeger يعرض الـ traces (إذا مُفعّل)

---

## 🔧 استكشاف الأخطاء

### مشكلة CORS
```
Access to fetch blocked by CORS policy
```
**الحل**: تأكد من أن `CORS_ORIGIN` في Backend يطابق URL الـ Frontend بالضبط.

### مشكلة اتصال قاعدة البيانات
```
Connection refused
```
**الحل**: تأكد من `?sslmode=require` في DATABASE_URL.

### مشكلة JWT
```
Token verification failed
```
**الحل**: تأكد من أن `JWT_SECRET` متطابق ولا يقل عن 32 حرف.

### مشكلة Tracing
```
Failed to export traces
```
**الحل**: تأكد من أن Jaeger URL صحيح ومتاح.

---

## 📊 URLs المفيدة

| الخدمة | URL |
|--------|-----|
| Railway Dashboard | https://railway.app/dashboard |
| Vercel Dashboard | https://vercel.com/dashboard |
| Neon Console | https://console.neon.tech |
| Redis Cloud | https://app.redislabs.com |
| Sentry | https://sentry.io |
| Google AI Studio | https://makersuite.google.com |

---

## 🔐 ملاحظات أمنية

1. **لا تشارك ملفات `.env.production`** - استخدم environment variables في المنصات
2. **دوّر المفاتيح دورياً** - خاصة JWT_SECRET و API keys
3. **راقب Sentry** - للكشف عن الأخطاء والهجمات
4. **فعّل 2FA** - على جميع حسابات الخدمات

---

## 📞 الدعم

- Issues: https://github.com/your-repo/issues
- Documentation: `/docs` folder
