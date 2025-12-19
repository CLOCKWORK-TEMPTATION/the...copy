# النسخة - The Copy

<div align="center">

**منصة للكتابة الإبداعية والتحليل الدرامي باللغة العربية**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)

</div>

---

## 📖 نظرة عامة

**The Copy** هو تطبيق ويب شامل للكتابة الإبداعية والتحليل الدرامي، مصمم خصيصاً للغة العربية. يجمع التطبيق بين:

- 🎭 **تحليل المحطات السبع**: تحليل درامي متقدم باستخدام الذكاء الاصطناعي
- 🎬 **استوديو المخرجين**: أدوات احترافية لإدارة المشاريع والمشاهد
- 🤖 **ذكاء اصطناعي متقدم**: يعتمد على Google Gemini API
- 📊 **إدارة شاملة**: تتبع الشخصيات، المشاهد، واللقطات

---

## 🏗️ البنية التقنية

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **State Management**: React Hooks
- **Monitoring**: Sentry

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon Serverless)
- **ORM**: Drizzle ORM
- **Cache**: Redis
- **Queue**: BullMQ
- **Real-time**: WebSocket + SSE
- **Monitoring**: Sentry + Prometheus

### DevOps
- **Package Manager**: pnpm
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions (optional)
- **Deployment**: Vercel (Frontend) + Custom (Backend)

---

## 🚀 البدء السريع

### المتطلبات الأساسية

```bash
# Node.js 20+
node --version

# pnpm
npm install -g pnpm

# PostgreSQL (أو استخدم Neon)
psql --version

# Redis (اختياري - يمكن استخدام Docker)
redis-cli --version
```

### التثبيت

```bash
# 1. استنساخ المشروع
git clone https://github.com/your-username/the-copy.git
cd the-copy

# 2. تثبيت Dependencies
pnpm install

# 3. إعداد Environment Variables
# Backend
cp backend/.env.example backend/.env
# Frontend
cp frontend/.env.example frontend/.env

# 4. إعداد قاعدة البيانات
cd backend
pnpm db:push
```

### تشغيل بيئة التطوير

#### الطريقة السريعة (موصى بها) ⚡
```powershell
# تشغيل كل شيء بأمر واحد (Windows)
.\start-dev.ps1

# إيقاف كل شيء
.\stop-dev.ps1
```

#### الطريقة اليدوية
```bash
# Terminal 1 - Redis (اختياري)
docker-compose up -d redis
# أو على Windows
.\redis\redis-server.exe

# Terminal 2 - Backend
cd backend
pnpm dev

# Terminal 3 - Frontend
cd frontend
pnpm dev
```

📖 **[دليل السكريبتات الكامل](./DEV_SCRIPTS_README_AR.md)** | **[English Guide](./DEV_SCRIPTS_README.md)**

### الوصول إلى التطبيق

- **Frontend**: http://localhost:5000
- **Backend API**: http://localhost:3001
- **Bull Board**: http://localhost:3001/admin/queues
- **Drizzle Studio**: `cd backend && pnpm db:studio`

---

## 📚 الوثائق

### الوثائق الأساسية
- **[Backend Documentation](./backend/BACKEND_DOCUMENTATION.md)** - دليل شامل للـ Backend
- **[Database Security](./backend/DATABASE_SECURITY.md)** - أمان قاعدة البيانات
- **[Docker Guide](./backend/DOCKER_GUIDE.md)** - دليل Docker

### 🚀 تحسين الأداء (Performance Optimization)

قمنا بإعداد دليل شامل لتحسين أداء التطبيق بنسبة **40-70%**:

#### الأدلة الرئيسية
- **[README](./docs/performance-optimization/README.md)** - نظرة عامة شاملة
- **[البدء السريع](./docs/performance-optimization/QUICK_START.md)** - تحسينات في 3-4 ساعات ⚡
- **[الخطة الكاملة](./docs/performance-optimization/IMPLEMENTATION_PLAN.md)** - خطة 10 مراحل (أسبوعين)
- **[الملخص التنفيذي](./docs/performance-optimization/EXECUTIVE_SUMMARY_AR.md)** - للمدراء وصناع القرار

#### الأدلة المساعدة
- **[متتبع التقدم](./docs/performance-optimization/PROGRESS_TRACKER.md)** - تتبع التنفيذ
- **[مرجع الأوامر](./docs/performance-optimization/COMMANDS_REFERENCE.md)** - أوامر سريعة
- **[استكشاف الأخطاء](./docs/performance-optimization/TROUBLESHOOTING.md)** - حل المشاكل

#### تحليل قاعدة البيانات
- **[تقرير الأداء](./backend/db-performance-analysis/PERFORMANCE_ANALYSIS_REPORT.md)** - تحليل شامل
- **[Baseline Queries](./backend/db-performance-analysis/baseline-queries.sql)** - استعلامات القياس

#### التحسينات المُطبقة
- ✅ **8 فهارس مركبة جديدة** للمشاريع/المشاهد/الشخصيات/اللقطات
- ✅ **Redis caching** للبيانات المتكررة
- ✅ **BullMQ** لمعالجة المهام الطويلة
- ✅ **WebSocket + SSE** للتحديثات الفورية
- ✅ **Security hardening** مع Zod validation
- ✅ **Monitoring** مع Sentry + Prometheus

#### البدء مع تحسين الأداء

```bash
# البدء السريع (3-4 ساعات)
# اقرأ: docs/performance-optimization/QUICK_START.md

# 1. تطبيق فهارس قاعدة البيانات
cd backend
pnpm db:push

# 2. فحص Redis
redis-cli PING

# 3. تحليل Bundle
cd frontend
ANALYZE=true pnpm build

# 4. اختبار الأداء
bash scripts/test-performance.sh
```

#### النتائج المتوقعة
- ⚡ **تحسين 40-70%** في سرعة الاستجابة
- 📊 **تقليل 60%** في استعلامات قاعدة البيانات
- 💰 **توفير 60%** في تكاليف Gemini API
- 🚀 **تحسين 50%** في زمن تحميل الصفحات

---

## 🎯 الميزات الرئيسية

### 1. تحليل المحطات السبع
- تحليل درامي متقدم للنصوص
- 7 محطات تحليلية شاملة
- رؤى وتوصيات من الذكاء الاصطناعي
- تقارير مفصلة قابلة للتصدير

### 2. استوديو المخرجين
- إدارة مشاريع متعددة
- تنظيم المشاهد واللقطات
- تتبع الشخصيات والاتساق
- أدوات تخطيط بصري

### 3. التحليل الذكي
- استخراج تلقائي للمشاهد والشخصيات
- اقتراحات للقطات والزوايا
- تحليل الاتساق الدرامي
- توصيات إبداعية

### 4. الأمان والأداء
- مصادقة آمنة (JWT)
- تشفير البيانات
- Rate limiting ذكي
- تخزين مؤقت محسّن
- معالجة غير متزامنة

---

## 🧪 الاختبارات

```bash
# Backend Tests
cd backend
pnpm test
pnpm test:coverage

# Frontend Tests
cd frontend
pnpm test
pnpm test:e2e

# Performance Tests
bash scripts/test-performance.sh

# Linting
cd backend && pnpm lint
cd frontend && pnpm lint
```

---

## 📊 المراقبة والإحصائيات

### Dashboards
- **Bull Board**: http://localhost:3001/admin/queues
- **Metrics Dashboard**: http://localhost:3000/admin/metrics
- **Prometheus Metrics**: http://localhost:3001/metrics
- **Sentry**: [Your Sentry Dashboard]

### Health Checks
```bash
# Backend Health
curl http://localhost:3001/api/health

# Redis Health
redis-cli PING

# Database Health
psql $DATABASE_URL -c "SELECT 1;"
```

---

## 🔒 الأمان

- ✅ **CORS** مُكوّن بشكل صارم
- ✅ **Helmet** مع CSP محسّن
- ✅ **Rate Limiting** متعدد المستويات
- ✅ **UUID Validation** شامل
- ✅ **SQL Injection Prevention**
- ✅ **XSS Protection**
- ✅ **Security Event Logging**
- ✅ **JWT Authentication**

راجع [Database Security Guide](./backend/DATABASE_SECURITY.md) للمزيد.

---

## 🤝 المساهمة

نرحب بمساهماتكم! يرجى:

1. Fork المشروع
2. إنشاء branch للميزة (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push للـ branch (`git push origin feature/AmazingFeature`)
5. فتح Pull Request

### إرشادات المساهمة
- اتبع معايير الكود الحالية
- أضف اختبارات للميزات الجديدة
- حدّث الوثائق عند الحاجة
- تأكد من نجاح جميع الاختبارات

---

## 📝 الترخيص

هذا المشروع مرخص تحت [MIT License](./LICENSE).

---

## 👥 الفريق

صُمم وطُور بواسطة **The Copy Team**

---

## 📞 الدعم

- 📧 Email: [support@the-copy.app]
- 📖 Documentation: [docs/](./docs/)
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/the-copy/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/your-username/the-copy/discussions)

---

## 🚀 الجاهزية للنشر

### 📚 **[فهرس التقارير الكامل](./REPORTS_INDEX.md)** - ابدأ من هنا!

### 🎉 **[الحالة النهائية للخدمات](./FINAL_SERVICES_STATUS.md)** - جميع الخدمات جاهزة! ✅

### 🔧 **[تحليل الخدمات والأدوات](./SERVICES_ANALYSIS_REPORT.md)** - تقرير شامل للخدمات

### ⚡ **[دليل الإصلاح السريع](./SERVICES_QUICK_FIX_AR.md)** - إصلاح الخدمات في 5 دقائق

### 👍 **[تكوينات الإنتاج](./PRODUCTION_CONFIG_ANALYSIS.md)** - تحليل .env.production

---

### 📋 التقارير الرئيسية

#### للمدراء وصناع القرار 👔
**[الملخص التنفيذي](./EXECUTIVE_SUMMARY_AR.md)** (5 دقائق)
- نظرة عامة سريعة
- المشاكل الحرجة والتكاليف
- التوصيات والخطة

#### للمطورين والتقنيين 💻
**[التقرير الشامل](./PRODUCTION_READINESS_REPORT.md)** (30 دقيقة)
- تحليل تفصيلي كامل
- جميع المشاكل والحلول
- خطة النشر الكاملة

#### للتنفيذ السريع ⚡
**[قائمة المهام](./DEPLOYMENT_CHECKLIST.md)** (دليل عملي)
- خطوات النشر بالترتيب
- Checklist قابل للتنفيذ
- الوقت المتوقع لكل مرحلة

#### مراجع إضافية 📖
- **[الأوامر المفيدة](./QUICK_COMMANDS.md)** - مرجع سريع للأوامر
- **[التحقق قبل النشر](./PRE_DEPLOYMENT_VERIFICATION.md)** - Checklist نهائي
- **[قائمة المهام الحالية](./todos.md)** - تتبع التقدم

---

### ⚠️ الحالة الحالية

**الجاهزية**: 75% ⚠️ يتطلب إجراءات حرجة

**المشاكل الحرجة (يجب حلها قبل النشر):**
- 🔴 **الأمان**: API Keys مكشوفة في `.env` files
- 🔴 **قاعدة البيانات**: SQLite (يجب التبديل لـ PostgreSQL)
- 🔴 **MongoDB**: Credentials تحتاج تدوير
- 🟡 **Redis**: غير مفعّل (مطلوب للأداء الأمثل)
- 🟡 **الاختبارات**: بعض الاختبارات فاشلة

**الوقت المتوقع للجاهزية الكاملة**: 3-5 أيام عمل

**التوصية**: ابدأ بـ [الملخص التنفيذي](./EXECUTIVE_SUMMARY_AR.md) ثم اتبع [قائمة المهام](./DEPLOYMENT_CHECKLIST.md)

---

## 🗺️ خارطة الطريق

### الإصدار الحالي (v1.0)
- ✅ تحليل المحطات السبع
- ✅ استوديو المخرجين
- ✅ تحسينات الأداء
- ✅ نظام الطوابير
- ✅ التحديثات الفورية
- ⚠️ **يتطلب إجراءات أمنية قبل النشر**

### القادم (v1.1)
- [ ] تصدير PDF/DOCX محسّن
- [ ] تعاون متعدد المستخدمين
- [ ] تطبيق الهاتف المحمول
- [ ] دعم لغات إضافية
- [ ] تحليلات متقدمة

### المستقبل (v2.0)
- [ ] AI-powered scene generation
- [ ] Visual storyboarding
- [ ] Budget estimation tools
- [ ] Production scheduling
- [ ] Asset management

---

## 🌟 شكر خاص

- [Next.js](https://nextjs.org/) - React Framework
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [Google Gemini](https://deepmind.google/technologies/gemini/) - AI Analysis
- [shadcn/ui](https://ui.shadcn.com/) - UI Components
- [BullMQ](https://docs.bullmq.io/) - Queue System
- [Sentry](https://sentry.io/) - Error Monitoring

---

<div align="center">

**صُنع بـ ❤️ للمبدعين العرب**

[الموقع الرسمي](#) | [الوثائق](./docs/) | [التحديثات](#) | [المجتمع](#)

</div>