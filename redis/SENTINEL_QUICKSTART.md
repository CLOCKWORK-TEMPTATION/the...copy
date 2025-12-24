# Redis Sentinel - Quick Start Guide

## تفعيل Redis Sentinel للـ High Availability

### 1. تشغيل Sentinel Cluster

#### Windows
```bash
cd redis
start-sentinel.bat
```

#### Linux/macOS
```bash
cd redis
redis-server sentinel-26379.conf --sentinel &
redis-server sentinel-26380.conf --sentinel &
redis-server sentinel-26381.conf --sentinel &
```

### 2. تفعيل Sentinel في التطبيق

قم بتحديث ملف `backend/.env`:

```env
# تفعيل Sentinel
REDIS_SENTINEL_ENABLED=true

# عناوين Sentinel (افتراضي: localhost)
REDIS_SENTINELS=127.0.0.1:26379,127.0.0.1:26380,127.0.0.1:26381

# اسم Master المُعرّف في Sentinel
REDIS_MASTER_NAME=mymaster

# كلمة مرور Redis (اختياري)
REDIS_PASSWORD=

# كلمة مرور Sentinel (اختياري)
REDIS_SENTINEL_PASSWORD=
```

### 3. إعادة تشغيل Backend

```bash
cd backend
pnpm dev
```

### 4. التحقق من الاتصال

```bash
# فحص حالة Sentinel
redis-cli -p 26379 sentinel masters

# فحص Master الحالي
redis-cli -p 26379 sentinel get-master-addr-by-name mymaster

# فحص Replicas
redis-cli -p 26379 sentinel replicas mymaster
```

### 5. اختبار Automatic Failover

#### Windows
```bash
cd scripts
test-sentinel-failover.bat
```

#### Linux/macOS
```bash
cd scripts
chmod +x test-sentinel-failover.sh
./test-sentinel-failover.sh
```

## الميزات

### ✅ High Availability
- اكتشاف تلقائي لفشل Master (5 ثوانٍ)
- Failover تلقائي إلى Replica
- إعادة اتصال تلقائية للتطبيق

### ✅ Automatic Failover
- Quorum: 2 من 3 Sentinels
- وقت Failover: 5-15 ثانية
- حفظ البيانات أثناء Failover

### ✅ Monitoring
- مراقبة صحة Redis
- تتبع أحداث Failover
- إحصائيات Cache

## إيقاف Sentinel

لإيقاف Sentinel والعودة لـ Redis العادي:

```env
# في backend/.env
REDIS_SENTINEL_ENABLED=false
REDIS_HOST=localhost
REDIS_PORT=6379
```

## استكشاف الأخطاء

### Sentinel لا يعمل
```bash
# فحص Logs
redis-cli -p 26379 INFO sentinel

# إعادة تشغيل
cd redis
start-sentinel.bat
```

### Failover لا يعمل
1. تأكد من تشغيل 3 Sentinels
2. تحقق من Quorum (يجب أن يكون 2)
3. فحص اتصال الشبكة

### التطبيق لا يتصل
```bash
# اختبار اتصال Sentinel
redis-cli -p 26379 PING

# فحص Master
redis-cli -p 26379 sentinel get-master-addr-by-name mymaster
```

## للإنتاج

### توزيع Sentinels
- ضع كل Sentinel على سيرفر منفصل
- استخدم عدد فردي (3، 5، 7)
- وزع على Availability Zones مختلفة

### الأمان
```conf
# في sentinel.conf
sentinel auth-pass mymaster your_password
requirepass sentinel_password
```

### Monitoring
- راقب Sentinel health
- تتبع Failover events
- قس وقت Failover

## المراجع
- [التوثيق الكامل](../docs/REDIS_SENTINEL_SETUP.md)
- [Redis Sentinel Docs](https://redis.io/docs/management/sentinel/)
