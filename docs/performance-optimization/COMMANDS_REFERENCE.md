# 🔧 مرجع الأوامر السريعة
# Quick Commands Reference

دليل سريع لجميع الأوامر المستخدمة في تحسين الأداء.

---

## 📦 قاعدة البيانات (Database)

### الاتصال والفحص
```bash
# الاتصال بقاعدة البيانات
psql $DATABASE_URL

# التحقق من الإصدار
psql $DATABASE_URL -c "SELECT version();"

# التحقق من حجم قاعدة البيانات
psql $DATABASE_URL -c "SELECT pg_size_pretty(pg_database_size(current_database()));"
```

### الفهارس (Indexes)
```bash
# عرض جميع الفهارس
psql $DATABASE_URL -c "
SELECT 
  schemaname, 
  tablename, 
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;
"

# عرض حجم الفهارس
psql $DATABASE_URL -c "
SELECT 
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) AS size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;
"

# البحث عن فهارس غير مستخدمة
psql $DATABASE_URL -c "
SELECT 
  schemaname, 
  tablename, 
  indexname, 
  idx_scan
FROM pg_stat_user_indexes
WHERE schemaname = 'public' 
  AND idx_scan = 0 
  AND indexrelname NOT LIKE '%pkey%';
"

# إعادة بناء جميع الفهارس
psql $DATABASE_URL -c "REINDEX DATABASE CONCURRENTLY your_db_name;"
```

### تطبيق Migrations
```bash
cd backend

# توليد migrations جديدة
pnpm db:generate

# تطبيق migrations
pnpm db:push

# فتح Drizzle Studio
pnpm db:studio
```

### قياس الأداء
```bash
cd backend

# تشغيل baseline queries
psql $DATABASE_URL < db-performance-analysis/baseline-queries.sql

# حفظ النتائج في ملف
psql $DATABASE_URL < db-performance-analysis/baseline-queries.sql > results.txt

# إعادة تعيين الإحصائيات
psql $DATABASE_URL -c "SELECT pg_stat_reset();"
```

### استعلامات الإحصائيات
```bash
# عرض أحجام الجداول
psql $DATABASE_URL -c "
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - 
                 pg_relation_size(schemaname||'.'||tablename)) AS indexes_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"

# عرض عدد الصفوف
psql $DATABASE_URL -c "
SELECT 
  schemaname,
  tablename,
  n_live_tup as row_count,
  n_dead_tup as dead_rows
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;
"
```

---

## 🔴 Redis

### الاتصال والفحص
```bash
# اختبار الاتصال
redis-cli -u $REDIS_URL PING

# الاتصال التفاعلي
redis-cli -u $REDIS_URL

# عرض معلومات Redis
redis-cli -u $REDIS_URL INFO

# عرض عدد المفاتيح
redis-cli -u $REDIS_URL DBSIZE
```

### إدارة المفاتيح
```bash
# عرض جميع المفاتيح
redis-cli -u $REDIS_URL KEYS '*'

# عرض مفاتيح محددة
redis-cli -u $REDIS_URL KEYS 'project:*'

# عرض قيمة مفتاح
redis-cli -u $REDIS_URL GET 'project:123:full'

# حذف مفتاح
redis-cli -u $REDIS_URL DEL 'project:123:full'

# حذف جميع المفاتيح
redis-cli -u $REDIS_URL FLUSHDB

# عرض TTL لمفتاح
redis-cli -u $REDIS_URL TTL 'project:123:full'
```

### مراقبة الأداء
```bash
# مراقبة الأوامر مباشرة
redis-cli -u $REDIS_URL MONITOR

# إحصائيات الذاكرة
redis-cli -u $REDIS_URL INFO memory

# إحصائيات الأداء
redis-cli -u $REDIS_URL INFO stats
```

### Docker Commands
```bash
# تشغيل Redis
cd backend
docker-compose up -d redis

# إيقاف Redis
docker-compose stop redis

# إعادة تشغيل Redis
docker-compose restart redis

# عرض logs
docker-compose logs -f redis

# الدخول إلى container
docker exec -it the-copy-redis sh
```

---

## 🚀 Backend

### تطوير وبناء
```bash
cd backend

# تشغيل في وضع التطوير
pnpm dev

# بناء للإنتاج
pnpm build

# تشغيل الإنتاج
pnpm start

# تشغيل الاختبارات
pnpm test

# تشغيل الاختبارات مع coverage
pnpm test:coverage
```

### فحص الجودة
```bash
cd backend

# Linting
pnpm lint

# إصلاح تلقائي
pnpm lint:fix

# Type checking
pnpm typecheck
```

### اختبار الأداء
```bash
cd backend

# اختبار Redis connection
node -e "
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
redis.ping()
  .then(() => { console.log('✅ Redis OK'); process.exit(0); })
  .catch(e => { console.error('❌ Redis Error:', e); process.exit(1); });
"

# اختبار قاعدة البيانات
node -e "
const { db } = require('./dist/db');
console.log('✅ Database connected');
"
```

---

## 🎨 Frontend

### تطوير وبناء
```bash
cd frontend

# تشغيل في وضع التطوير
pnpm dev

# بناء للإنتاج
pnpm build

# بناء مع تحليل
ANALYZE=true pnpm build

# تشغيل الإنتاج
pnpm start

# تشغيل الاختبارات
pnpm test

# اختبارات E2E
pnpm test:e2e
```

### تحليل الأداء
```bash
cd frontend

# Lighthouse audit
lighthouse http://localhost:3000 --view

# Lighthouse CI
lighthouse http://localhost:3000 \
  --only-categories=performance,accessibility,best-practices,seo \
  --output=json \
  --output-path=./lighthouse-report.json

# Bundle analysis
ANALYZE=true pnpm build

# عرض حجم build
du -sh .next
find .next/static/chunks -name "*.js" -type f -exec du -h {} + | sort -rh | head -10
```

### فحص الجودة
```bash
cd frontend

# Linting
pnpm lint

# Type checking
pnpm typecheck

# Format code
pnpm format
```

---

## 🧪 اختبارات API

### cURL Tests
```bash
# Health check
curl http://localhost:3001/api/health

# Health check مع timing
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3001/api/health

# Metrics endpoint
curl http://localhost:3001/metrics

# اختبار مع authentication
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3001/api/projects
```

### curl-format.txt
```bash
# إنشاء ملف curl-format.txt
cat > curl-format.txt << 'EOF'
time_namelookup:    %{time_namelookup}\n
time_connect:       %{time_connect}\n
time_appconnect:    %{time_appconnect}\n
time_pretransfer:   %{time_pretransfer}\n
time_redirect:      %{time_redirect}\n
time_starttransfer: %{time_starttransfer}\n
                    ----------\n
time_total:         %{time_total}\n
EOF
```

### Load Testing (autocannon)
```bash
# تثبيت autocannon
npm install -g autocannon

# اختبار بسيط
autocannon http://localhost:3001/api/health

# اختبار مع تكوين
autocannon -c 100 -d 30 http://localhost:3001/api/health
# -c 100: 100 concurrent connections
# -d 30: duration 30 seconds

# اختبار مع POST
autocannon -m POST \
  -H "Content-Type: application/json" \
  -b '{"email":"test@test.com","password":"test123"}' \
  http://localhost:3001/api/auth/login
```

---

## 🐳 Docker

### إدارة Containers
```bash
cd backend

# تشغيل جميع الخدمات
docker-compose up -d

# تشغيل خدمة محددة
docker-compose up -d postgres
docker-compose up -d redis

# إيقاف جميع الخدمات
docker-compose down

# إيقاف وحذف volumes
docker-compose down -v

# إعادة بناء
docker-compose build

# عرض الـ logs
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f postgres

# عرض الحالة
docker-compose ps
```

### صيانة
```bash
# تنظيف containers متوقفة
docker container prune -f

# تنظيف images غير مستخدمة
docker image prune -a -f

# تنظيف volumes غير مستخدمة
docker volume prune -f

# تنظيف شامل
docker system prune -a --volumes -f
```

---

## 📊 المراقبة (Monitoring)

### Sentry
```bash
# تفعيل Sentry في frontend
# تأكد من وجود NEXT_PUBLIC_SENTRY_DSN في .env

# تفعيل Sentry في backend
# تأكد من وجود SENTRY_DSN في .env

# اختبار Sentry
node -e "
const Sentry = require('@sentry/node');
Sentry.init({ dsn: process.env.SENTRY_DSN });
Sentry.captureMessage('Test message from CLI');
console.log('✅ Test message sent to Sentry');
"
```

### Bull Board
```bash
# الوصول إلى Bull Board Dashboard
open http://localhost:3001/admin/queues

# أو
curl http://localhost:3001/admin/queues
```

### Prometheus Metrics
```bash
# عرض جميع المقاييس
curl http://localhost:3001/metrics

# عرض مقاييس محددة
curl http://localhost:3001/metrics | grep http_request

# حفظ المقاييس
curl http://localhost:3001/metrics > metrics-$(date +%Y%m%d-%H%M%S).txt
```

---

## 🧰 أدوات مساعدة

### Git Commands
```bash
# حفظ التغييرات
git add .
git commit -m "perf: apply database indexes and caching"
git push

# إنشاء branch للتحسينات
git checkout -b feature/performance-optimization

# عرض الفروق
git diff
git diff --staged
```

### Environment Variables
```bash
# عرض المتغيرات الحالية
printenv | grep -E "DATABASE_URL|REDIS_URL|SENTRY_DSN"

# تعيين متغير مؤقت
export DATABASE_URL="postgresql://user:pass@localhost:5432/db"

# تحميل من ملف .env
set -a; source .env; set +a
```

### Package Management
```bash
# تثبيت dependencies
pnpm install

# تحديث packages
pnpm update

# تحديث package محدد
pnpm update drizzle-orm

# إزالة package
pnpm remove package-name

# عرض outdated packages
pnpm outdated

# تنظيف node_modules
rm -rf node_modules
pnpm install
```

---

## 📝 سكريبتات مخصصة

### اختبار الأداء الشامل
```bash
# تشغيل سكريبت الاختبار الشامل
bash scripts/test-performance.sh

# أو مع متغيرات مخصصة
BACKEND_URL=http://localhost:3001 \
FRONTEND_URL=http://localhost:3000 \
TEST_ITERATIONS=10 \
bash scripts/test-performance.sh
```

### القياسات السريعة
```bash
# قياس Database
cd backend
time psql $DATABASE_URL < db-performance-analysis/baseline-queries.sql

# قياس API
time curl -s http://localhost:3001/api/projects > /dev/null

# قياس Frontend build
cd frontend
time pnpm build
```

---

## 🔍 التشخيص (Troubleshooting)

### Backend Issues
```bash
# عرض الـ logs
tail -f backend/logs/combined.log
tail -f backend/logs/error.log

# البحث عن أخطاء
grep "ERROR" backend/logs/combined.log
grep "SECURITY_EVENT" backend/logs/*.log

# فحص الذاكرة
node --expose-gc --max-old-space-size=4096 dist/server.js

# profiling
node --inspect dist/server.js
# ثم افتح chrome://inspect
```

### Database Issues
```bash
# فحص الاتصالات
psql $DATABASE_URL -c "
SELECT count(*) as connections 
FROM pg_stat_activity 
WHERE datname = current_database();
"

# فحص الاستعلامات البطيئة
psql $DATABASE_URL -c "
SELECT pid, query, query_start, state 
FROM pg_stat_activity 
WHERE state != 'idle' 
  AND query_start < now() - interval '5 seconds'
ORDER BY query_start;
"

# إنهاء استعلام معين
psql $DATABASE_URL -c "SELECT pg_terminate_backend(PID);"
```

### Redis Issues
```bash
# فحص الذاكرة
redis-cli -u $REDIS_URL INFO memory | grep used_memory_human

# فحص الاتصالات
redis-cli -u $REDIS_URL INFO clients

# فحص slow log
redis-cli -u $REDIS_URL SLOWLOG GET 10
```

---

## 📚 مراجع سريعة

### PostgreSQL EXPLAIN
```sql
-- استعلام بسيط
EXPLAIN SELECT * FROM projects WHERE user_id = 'xxx';

-- مع تحليل فعلي
EXPLAIN ANALYZE SELECT * FROM projects WHERE user_id = 'xxx';

-- مع معلومات مفصلة
EXPLAIN (ANALYZE, BUFFERS, VERBOSE, COSTS) 
SELECT * FROM projects WHERE user_id = 'xxx';
```

### Next.js Commands
```bash
# بناء مع معلومات مفصلة
pnpm build --debug

# تحليل bundle
pnpm build && pnpm analyze

# تنظيف cache
rm -rf .next
rm -rf out
```

### TypeScript
```bash
# type checking سريع
tsc --noEmit

# توليد declarations
tsc --declaration --emitDeclarationOnly

# عرض الأخطاء فقط
tsc --noEmit --pretty false 2>&1 | grep "error TS"
```

---

## 🎯 Cheat Sheet

### الأوامر الأكثر استخداماً
```bash
# 1. بدء التطوير
pnpm dev                          # في كل من backend و frontend

# 2. اختبار الأداء
bash scripts/test-performance.sh  # الجذر

# 3. تطبيق migrations
cd backend && pnpm db:push        # backend

# 4. تحليل bundle
cd frontend && ANALYZE=true pnpm build  # frontend

# 5. فحص Redis
redis-cli -u $REDIS_URL PING      # أي مكان

# 6. فحص Database
psql $DATABASE_URL -c "SELECT 1;" # أي مكان

# 7. عرض logs
tail -f backend/logs/combined.log # الجذر

# 8. Bull Board
open http://localhost:3001/admin/queues

# 9. Metrics
curl http://localhost:3001/metrics

# 10. تشغيل الاختبارات
pnpm test                         # في كل من backend و frontend
```

---

**آخر تحديث**: نوفمبر 2024  
**مصمم لـ**: The Copy Application  
**الحالة**: ✅ جاهز للاستخدام