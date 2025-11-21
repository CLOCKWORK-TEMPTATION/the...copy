# دليل النشر - Deployment Guide

## 🚀 خطوات النشر الكاملة

### 1️⃣ نشر Backend على Render

**أ) إنشاء حساب:**
- روح https://render.com
- سجل دخول بـ GitHub

**ب) إنشاء Web Service:**
1. **New** → **Web Service**
2. ربط GitHub repo: `the...copy`
3. **Name**: `thecopy-backend`
4. **Root Directory**: `backend`
5. **Build Command**: `pnpm install && pnpm build`
6. **Start Command**: `node dist/server.js`

**ج) إضافة Environment Variables:**
```
NODE_ENV=production
PORT=3001
DATABASE_URL=<من Neon>
REDIS_URL=<من Redis Cloud>
JWT_SECRET=<سر قوي>
GEMINI_API_KEY=<مفتاح Gemini>
FRONTEND_URL=<سيأتي من Vercel>
CORS_ORIGIN=<سيأتي من Vercel>
```

**د) إنشاء Database:**
- في Render → **New** → **PostgreSQL**
- أو استخدم Neon الموجود

**هـ) Deploy:**
- اضغط **Create Web Service**
- انتظر البناء (5-10 دقائق)
- احفظ الـ URL: `https://thecopy-backend.onrender.com`

---

### 2️⃣ نشر Frontend على Vercel

**أ) إنشاء حساب:**
- روح https://vercel.com
- سجل دخول بـ GitHub

**ب) Import Project:**
1. **Add New** → **Project**
2. اختر repo: `the...copy`
3. **Root Directory**: `frontend`
4. **Framework Preset**: Next.js

**ج) إضافة Environment Variables:**
```
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_API_URL=https://thecopy-backend.onrender.com
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDqFdX_frFRDldLTzOLGfpMgQM9Wqzv1gU
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=thecopy-84dfc.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=thecopy-84dfc
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=thecopy-84dfc.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1078970832716
NEXT_PUBLIC_FIREBASE_APP_ID=1:1078970832716:web:6725ff447de7b4619321e9
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-C7S9E1FXJL
```

**د) Deploy:**
- اضغط **Deploy**
- انتظر البناء (3-5 دقائق)
- احفظ الـ URL: `https://thecopy.vercel.app`

---

### 3️⃣ ربط Frontend بـ Backend

**أ) حدّث Backend CORS:**
- في Render → Backend Service → **Environment**
- عدّل:
  ```
  FRONTEND_URL=https://thecopy.vercel.app
  CORS_ORIGIN=https://thecopy.vercel.app
  ```
- **Save Changes** → سيعيد النشر تلقائياً

**ب) تأكد من Frontend:**
- في Vercel → Project → **Settings** → **Environment Variables**
- تأكد من:
  ```
  NEXT_PUBLIC_API_URL=https://thecopy-backend.onrender.com
  ```

---

### 4️⃣ اختبار النشر

**أ) اختبر Backend:**
```bash
curl https://thecopy-backend.onrender.com/api/health
```

**ب) اختبر Frontend:**
- افتح: https://thecopy.vercel.app
- جرب تسجيل دخول
- تحقق من Console للأخطاء

---

## 📊 URLs النهائية

| الخدمة | URL |
|--------|-----|
| **Frontend** | https://thecopy.vercel.app |
| **Backend** | https://thecopy-backend.onrender.com |
| **Database** | Neon PostgreSQL |
| **Cache** | Redis Cloud |
| **Auth** | Firebase |

---

## 🔧 Troubleshooting

### مشكلة: CORS Error
**الحل:**
- تأكد من `CORS_ORIGIN` في Backend = Frontend URL
- تأكد من `NEXT_PUBLIC_API_URL` في Frontend = Backend URL

### مشكلة: Database Connection
**الحل:**
- تأكد من `DATABASE_URL` صحيح
- تأكد من Neon database شغال

### مشكلة: Build Failed
**الحل:**
- شوف Logs في Render/Vercel
- تأكد من `pnpm install` شغال
- تأكد من Environment Variables موجودة

---

## 🔄 تحديث التطبيق

**Frontend:**
```bash
git add .
git commit -m "Update frontend"
git push
```
→ Vercel هينشر تلقائياً

**Backend:**
```bash
git add .
git commit -m "Update backend"
git push
```
→ Render هينشر تلقائياً

---

## 💰 التكلفة

| الخدمة | الخطة المجانية |
|--------|----------------|
| **Vercel** | 100GB Bandwidth/شهر |
| **Render** | 750 ساعة/شهر |
| **Neon** | 0.5GB Storage |
| **Redis Cloud** | 30MB |
| **Firebase** | 50K reads/يوم |

**المجموع: مجاني تماماً للبداية! 🎉**
