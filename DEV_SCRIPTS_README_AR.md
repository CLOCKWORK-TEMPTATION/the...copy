# 🚀 دليل سكريبتات التطوير

## البدء السريع

### ▶️ تشغيل بيئة التطوير
```powershell
.\start-dev.ps1
```

**ماذا يفعل:**
- ✅ يشغل خادم Redis (بورت 6379)
- ✅ يشغل خادم Backend (بورت 3001)
- ✅ يشغل خادم Frontend (بورت 5000)
- ✅ يفتح نافذة PowerShell منفصلة لكل خدمة

**بورتات مخصصة:**
```powershell
.\start-dev.ps1 -BackendPort 4000 -FrontendPort 3000
```

---

### ⏹️ إيقاف بيئة التطوير
```powershell
.\stop-dev.ps1
```

**ماذا يفعل:**
- 🛑 يوقف جميع خوادم Node.js (Backend و Frontend)
- 🛑 يوقف خادم Redis
- 📊 يعرض ملخص العمليات المُوقفة

**إيقاف قسري (إذا لم تُغلق العمليات):**
```powershell
.\stop-dev.ps1 -Force
```

---

## روابط الوصول

بعد التشغيل:
- **الواجهة الأمامية**: http://localhost:5000
- **Backend API**: http://localhost:3001
- **Bull Board**: http://localhost:3001/admin/queues
- **Redis**: localhost:6379

---

## حل المشاكل

### البورت مستخدم بالفعل
```powershell
# أوقف جميع الخدمات أولاً
.\stop-dev.ps1 -Force

# ثم شغل مرة أخرى
.\start-dev.ps1
```

### Redis غير موجود
- Redis اختياري لكن مُوصى به
- التطبيق سيعمل بوظائف محدودة بدونه
- ثبت Redis أو استخدم Docker: `docker run -d -p 6379:6379 redis`

### عمليات Node.js لا تتوقف
```powershell
# إيقاف قسري لجميع عمليات Node.js
.\stop-dev.ps1 -Force

# أو يدوياً:
Get-Process -Name "node" | Stop-Process -Force
```

### فحص ما يعمل حالياً
```powershell
# فحص عمليات Node.js
Get-Process -Name "node"

# فحص Redis
Get-Process -Name "redis-server"

# فحص البورتات
netstat -ano | findstr "3001"
netstat -ano | findstr "5000"
netstat -ano | findstr "6379"
```

---

## أوامر يدوية

إذا كنت تفضل التحكم اليدوي:

### Backend فقط
```powershell
cd backend
pnpm run dev
```

### Frontend فقط
```powershell
cd frontend
pnpm run dev
```

### Redis فقط
```powershell
.\redis\redis-server.exe
```

---

## ملاحظات

- ⚠️ إغلاق نافذة السكريبت لن يوقف الخوادم
- ⚠️ استخدم دائماً `stop-dev.ps1` للإيقاف الصحيح
- ✅ الخدمات تعمل في نوافذ منفصلة لسهولة المراقبة
- ✅ السجلات (Logs) مرئية في نافذة كل خدمة

---

## نصائح إضافية

### إعادة تشغيل سريعة
```powershell
.\stop-dev.ps1 -Force; .\start-dev.ps1
```

### فحص صحة الخدمات
```powershell
# Backend Health Check
curl http://localhost:3001/api/health

# Redis Health Check
redis-cli PING
```

### مراقبة الأداء
- افتح **Bull Board** لمراقبة الطوابير: http://localhost:3001/admin/queues
- افتح **Metrics Dashboard**: http://localhost:3001/metrics
