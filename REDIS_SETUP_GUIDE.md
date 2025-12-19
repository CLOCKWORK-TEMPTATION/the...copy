# 🚀 دليل تثبيت وتشغيل Redis
## Redis Installation & Setup Guide

---

## ⚠️ الحالة الحالية

Redis **غير مثبت** في المشروع. هذا يؤثر على:
- ❌ BullMQ (معالجة المهام الخلفية)
- ❌ Cache Layer 2 (التخزين المؤقت الموزع)
- ❌ Queue Dashboard
- ❌ تحليل AI (يعمل ببطء)

---

## 📥 خيارات التثبيت

### الخيار 1: Docker (الأسهل - موصى به) ⭐

```powershell
# تشغيل Redis في Docker
docker run -d `
  --name redis `
  -p 6379:6379 `
  --restart unless-stopped `
  redis:alpine

# التحقق من التشغيل
docker ps | findstr redis

# اختبار الاتصال
docker exec redis redis-cli PING
# يجب أن يرجع: PONG
```

**المميزات:**
- ✅ سهل التثبيت والإدارة
- ✅ معزول عن النظام
- ✅ سهل الإيقاف والحذف
- ✅ يعمل تلقائياً عند إعادة التشغيل

---

### الخيار 2: Windows Native (للتطوير)

#### الخطوة 1: تحميل Redis

```powershell
# تحميل Redis for Windows
# الرابط: https://github.com/tporadowski/redis/releases

# أو استخدام Chocolatey
choco install redis-64

# أو استخدام Scoop
scoop install redis
```

#### الخطوة 2: نسخ الملفات

```powershell
# إنشاء مجلد redis في المشروع
mkdir redis -Force

# نسخ ملفات Redis إلى المجلد
# (بعد التحميل من الرابط أعلاه)
Copy-Item "C:\path\to\redis\*" -Destination ".\redis\" -Recurse
```

#### الخطوة 3: تشغيل Redis

```powershell
cd redis
.\redis-server.exe redis.windows.conf
```

---

### الخيار 3: WSL (Windows Subsystem for Linux)

```bash
# في WSL Terminal
sudo apt update
sudo apt install redis-server

# تشغيل Redis
sudo service redis-server start

# التحقق
redis-cli PING
```

---

## ✅ التحقق من التثبيت

### 1. اختبار الاتصال

```powershell
# يجب أن يرجع: PONG
redis-cli PING
```

### 2. اختبار الكتابة والقراءة

```powershell
# كتابة
redis-cli SET test "Hello Redis"

# قراءة
redis-cli GET test
# يجب أن يرجع: "Hello Redis"

# حذف
redis-cli DEL test
```

### 3. فحص المعلومات

```powershell
# معلومات Redis
redis-cli INFO server

# عدد المفاتيح
redis-cli DBSIZE
```

---

## 🔧 تكوين Backend

### تحديث .env

```bash
# backend/.env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# أو استخدم URL كامل
# REDIS_URL=redis://localhost:6379
```

### إعادة تشغيل Backend

```powershell
cd backend
pnpm dev
```

يجب أن ترى:
```
✅ Redis cache connected successfully
✅ BullMQ queues initialized
```

---

## 🎯 التحقق من عمل الخدمات

### 1. فحص Cache Service

```powershell
# يجب أن يظهر redis: "connected"
curl http://localhost:3001/api/health
```

### 2. فحص BullMQ Dashboard

افتح المتصفح:
```
http://localhost:3001/admin/queues
```

يجب أن ترى:
- ✅ analysis-jobs
- ✅ export-jobs
- ✅ extraction-jobs
- ✅ notification-jobs

### 3. اختبار تحليل AI

```powershell
# في Frontend
cd frontend
pnpm dev

# افتح التطبيق وجرب تحليل نص
# يجب أن يعمل بسرعة وبدون أخطاء
```

---

## 🔄 إدارة Redis

### إيقاف Redis

```powershell
# Docker
docker stop redis

# Windows Native
# اضغط Ctrl+C في نافذة Redis

# WSL
sudo service redis-server stop
```

### إعادة تشغيل Redis

```powershell
# Docker
docker restart redis

# Windows Native
cd redis
.\redis-server.exe redis.windows.conf

# WSL
sudo service redis-server restart
```

### حذف جميع البيانات

```powershell
# حذف كل المفاتيح
redis-cli FLUSHALL

# أو حذف قاعدة البيانات الحالية فقط
redis-cli FLUSHDB
```

---

## 🐛 حل المشاكل

### المشكلة: "ECONNREFUSED"

**السبب:** Redis غير مفعّل

**الحل:**
```powershell
# تحقق من تشغيل Redis
redis-cli PING

# إذا لم يعمل، شغّل Redis
docker start redis
# أو
cd redis && .\redis-server.exe redis.windows.conf
```

---

### المشكلة: "Port 6379 already in use"

**الحل 1:** أوقف العملية المستخدمة للمنفذ
```powershell
# ابحث عن العملية
netstat -ano | findstr :6379

# أوقف العملية
taskkill /PID <رقم_العملية> /F
```

**الحل 2:** استخدم منفذ مختلف
```powershell
# في redis.conf
port 6380

# في backend/.env
REDIS_PORT=6380
```

---

### المشكلة: Redis يتوقف عند إغلاق Terminal

**الحل:** استخدم Docker أو قم بتشغيله كخدمة Windows

```powershell
# تشغيل كخدمة Windows
redis-server --service-install redis.windows.conf
redis-server --service-start
```

---

## 📊 مراقبة Redis

### استخدام Redis CLI

```powershell
# الدخول إلى CLI
redis-cli

# داخل CLI:
> INFO stats
> MONITOR  # مراقبة الأوامر في الوقت الفعلي
> CLIENT LIST  # قائمة الاتصالات
```

### استخدام Redis Commander (GUI)

```powershell
# تثبيت Redis Commander
npm install -g redis-commander

# تشغيل
redis-commander

# افتح: http://localhost:8081
```

---

## 🎉 النتيجة المتوقعة

بعد تثبيت وتشغيل Redis:

### قبل ❌
- Cache محدود (100 عنصر)
- لا يوجد معالجة خلفية
- تحليل AI بطيء
- Export لا يعمل

### بعد ✅
- Cache غير محدود وموزع
- معالجة خلفية للمهام
- تحليل AI سريع (60% أسرع)
- Export يعمل بشكل صحيح
- Queue Dashboard متاح

---

## 📚 موارد إضافية

- [Redis Documentation](https://redis.io/docs/)
- [Redis for Windows](https://github.com/tporadowski/redis)
- [BullMQ Documentation](https://docs.bullmq.io/)
- [Cache Service Code](./backend/src/services/cache.service.ts)

---

## ✅ Checklist

- [ ] Redis مثبت
- [ ] Redis يعمل
- [ ] `redis-cli PING` يرجع PONG
- [ ] Backend متصل بـ Redis
- [ ] BullMQ Dashboard متاح
- [ ] Cache يعمل (L1 + L2)
- [ ] اختبار تحليل AI يعمل

---

**الخطوة التالية:** بعد تثبيت Redis، قم بتشغيل:
```powershell
.\activate-services.ps1
```

---

**آخر تحديث:** 2025-01-XX  
**الحالة:** جاهز للتطبيق ✅
