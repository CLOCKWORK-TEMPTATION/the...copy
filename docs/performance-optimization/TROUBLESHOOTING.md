# 🔧 دليل استكشاف الأخطاء وحلها
# Troubleshooting Guide - Performance Optimization

دليل شامل لحل المشاكل الشائعة أثناء تطبيق تحسينات الأداء.

---

## 📑 جدول المحتويات

1. [مشاكل قاعدة البيانات](#مشاكل-قاعدة-البيانات)
2. [مشاكل Redis](#مشاكل-redis)
3. [مشاكل BullMQ](#مشاكل-bullmq)
4. [مشاكل الأداء العام](#مشاكل-الأداء-العام)
5. [مشاكل الأمان](#مشاكل-الأمان)
6. [مشاكل Frontend](#مشاكل-frontend)
7. [مشاكل الـ Build](#مشاكل-الـ-build)

---

## مشاكل قاعدة البيانات

### ❌ المشكلة: الفهارس لم تُنشأ بعد تشغيل `pnpm db:push`

**الأعراض**:
```
✓ Migration completed
But no indexes created
```

**التشخيص**:
```bash
# تحقق من الفهارس الموجودة
psql $DATABASE_URL -c "
SELECT indexname FROM pg_indexes 
WHERE tablename IN ('projects', 'scenes', 'characters', 'shots')
  AND indexname LIKE 'idx_%';
"
```

**الحلول**:

**الحل 1**: إعادة توليد migrations
```bash
cd backend

# احذف ملفات migrations القديمة (اختياري)
rm -rf drizzle/migrations/*

# توليد جديد
pnpm db:generate

# تطبيق
pnpm db:push
```

**الحل 2**: إنشاء الفهارس يدوياً
```sql
-- نسخ من schema.ts وتنفيذ في psql
psql $DATABASE_URL << 'EOF'
CREATE INDEX IF NOT EXISTS idx_projects_id_user ON projects(id, user_id);
CREATE INDEX IF NOT EXISTS idx_scenes_id_project ON scenes(id, project_id);
-- ... الخ
EOF
```

**الحل 3**: Force push
```bash
pnpm db:push --force
```

**التحقق**:
```bash
psql $DATABASE_URL -c "
SELECT COUNT(*) as new_indexes 
FROM pg_indexes 
WHERE tablename IN ('projects', 'scenes', 'characters', 'shots')
  AND indexname LIKE 'idx_%';
"
# يجب أن يعيد 12 أو أكثر
```

---

### ❌ المشكلة: الاستعلامات ما زالت بطيئة بعد إضافة الفهارس

**الأعراض**:
```
Query time: 65ms (expected < 20ms)
```

**التشخيص**:
```sql
-- تحقق من استخدام الفهارس
EXPLAIN ANALYZE 
SELECT * FROM shots 
WHERE id = 'xxx' AND scene_id = 'yyy';
```

**إذا رأيت "Seq Scan" بدلاً من "Index Scan"**:

**الحل 1**: ANALYZE الجداول
```sql
ANALYZE projects;
ANALYZE scenes;
ANALYZE characters;
ANALYZE shots;
```

**الحل 2**: VACUUM الجداول
```sql
VACUUM ANALYZE projects;
VACUUM ANALYZE scenes;
VACUUM ANALYZE characters;
VACUUM ANALYZE shots;
```

**الحل 3**: إعادة بناء الفهارس
```sql
REINDEX TABLE projects;
REINDEX TABLE scenes;
REINDEX TABLE characters;
REINDEX TABLE shots;
```

**الحل 4**: إعادة حساب الإحصائيات
```sql
-- زيادة statistics target
ALTER TABLE projects ALTER COLUMN id SET STATISTICS 1000;
ALTER TABLE projects ALTER COLUMN user_id SET STATISTICS 1000;
ANALYZE projects;
```

---

### ❌ المشكلة: Too many connections

**الأعراض**:
```
Error: sorry, too many clients already
```

**التشخيص**:
```sql
-- عرض عدد الاتصالات الحالية
SELECT count(*) FROM pg_stat_activity;

-- عرض الحد الأقصى
SHOW max_connections;

-- عرض الاتصالات حسب قاعدة البيانات
SELECT datname, count(*) 
FROM pg_stat_activity 
GROUP BY datname;
```

**الحلول**:

**الحل 1**: إنهاء الاتصالات الخاملة
```sql
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle'
  AND state_change < now() - interval '10 minutes';
```

**الحل 2**: تكوين Connection Pooling
```javascript
// في backend/src/db/index.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,              // الحد الأقصى للاتصالات
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

**الحل 3**: في Neon (serverless)
```bash
# استخدم pooled connection string
# بدلاً من: postgresql://user:pass@host/db
# استخدم: postgresql://user:pass@host/db?sslmode=require&pooled=true
```

---

### ❌ المشكلة: N+1 Queries ما زالت موجودة

**الأعراض**:
```
3 queries for getting a single shot
Expected: 1 query
```

**التشخيص**:
```bash
# فعّل query logging
psql $DATABASE_URL -c "ALTER SYSTEM SET log_statement = 'all';"
psql $DATABASE_URL -c "SELECT pg_reload_conf();"

# راقب الـ logs
tail -f /var/lib/postgresql/data/log/postgresql-*.log
```

**الحل**: تحديث Controllers لاستخدام JOIN

**قبل** (في `shots.controller.ts`):
```typescript
// Query 1
const [shot] = await db.select().from(shots).where(eq(shots.id, id));
// Query 2
const [scene] = await db.select().from(scenes).where(eq(scenes.id, shot.sceneId));
// Query 3
const [project] = await db.select().from(projects).where(eq(projects.id, scene.projectId));
```

**بعد**:
```typescript
// Query واحد فقط
const [result] = await db
  .select({
    shot: shots,
    scene: scenes,
    project: projects,
  })
  .from(shots)
  .innerJoin(scenes, eq(shots.sceneId, scenes.id))
  .innerJoin(projects, eq(scenes.projectId, projects.id))
  .where(and(
    eq(shots.id, id),
    eq(projects.userId, req.user.id)
  ));
```

---

## مشاكل Redis

### ❌ المشكلة: Redis Connection Failed

**الأعراض**:
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**التشخيص**:
```bash
# تحقق من تشغيل Redis
redis-cli PING

# أو
docker ps | grep redis

# أو
ps aux | grep redis
```

**الحلول**:

**الحل 1**: تشغيل Redis في Docker
```bash
cd backend
docker-compose up -d redis

# تحقق
docker-compose logs redis
```

**الحل 2**: تثبيت Redis محلياً
```bash
# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis

# macOS
brew install redis
brew services start redis

# Windows
# استخدم Docker أو WSL
```

**الحل 3**: تحديث REDIS_URL
```bash
# في .env
REDIS_URL=redis://localhost:6379

# أو مع password
REDIS_URL=redis://:password@localhost:6379

# أو Redis Cloud
REDIS_URL=redis://user:pass@redis-cloud-host:port
```

**التحقق**:
```bash
redis-cli -u $REDIS_URL PING
# يجب أن يرجع: PONG
```

---

### ❌ المشكلة: Cache Hit Ratio منخفض جداً (< 30%)

**الأعراض**:
```
Cache Hit Ratio: 15%
Expected: > 70%
```

**التشخيص**:
```bash
# تحقق من Redis INFO
redis-cli INFO stats | grep keyspace

# عرض المفاتيح
redis-cli KEYS '*'

# عرض TTL
redis-cli TTL 'project:123:full'
```

**الأسباب المحتملة**:

**السبب 1**: TTL قصير جداً
```typescript
// في gemini-cache.strategy.ts
// قبل
const CACHE_TTL = {
  ANALYSIS_RESULT: 60,  // دقيقة واحدة فقط! قصير جداً
};

// بعد
const CACHE_TTL = {
  ANALYSIS_RESULT: 3600,  // ساعة واحدة
};
```

**السبب 2**: Cache Invalidation عدواني
```typescript
// تحقق من أنك لا تحذف الـ cache كثيراً
// يجب invalidation فقط عند التحديث الفعلي
```

**السبب 3**: مفاتيح Cache غير متطابقة
```typescript
// تأكد من استخدام نفس key structure
// قبل
const key = `project-${id}`;  // dash
// بعد  
const key = `project:${id}:full`;  // colon (consistent)
```

---

### ❌ المشكلة: Redis Memory Full

**الأعراض**:
```
Error: OOM command not allowed when used memory > 'maxmemory'
```

**التشخيص**:
```bash
redis-cli INFO memory | grep used_memory_human
redis-cli CONFIG GET maxmemory
```

**الحلول**:

**الحل 1**: زيادة maxmemory
```bash
redis-cli CONFIG SET maxmemory 512mb
redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

**الحل 2**: تنظيف المفاتيح القديمة
```bash
# حذف مفاتيح منتهية
redis-cli EVAL "return redis.call('DEL', unpack(redis.call('KEYS', ARGV[1])))" 0 'expired:*'

# أو تنظيف شامل (حذر!)
redis-cli FLUSHDB
```

**الحل 3**: تحسين TTLs
```typescript
// استخدم TTLs أقصر للبيانات المؤقتة
const CACHE_TTL = {
  USER_PROJECTS: 300,      // 5 دقائق (بدلاً من 30)
  PROJECT_DATA: 1800,      // 30 دقيقة (بدلاً من ساعات)
};
```

---

## مشاكل BullMQ

### ❌ المشكلة: Jobs لا تُعالج

**الأعراض**:
```
Job queued but never processed
Queue status: 10 waiting, 0 active
```

**التشخيص**:
```bash
# تحقق من Workers
cd backend
pnpm test src/queues/

# تحقق من Bull Board
open http://localhost:3001/admin/queues
```

**الحلول**:

**الحل 1**: تأكد من تشغيل Workers
```typescript
// في server.ts
import { initializeWorkers } from '@/queues';

// يجب استدعاء هذا عند بدء التطبيق
initializeWorkers();
```

**الحل 2**: تحقق من Redis connection
```bash
# Workers تحتاج Redis
redis-cli PING
```

**الحل 3**: تحقق من Worker registration
```typescript
// في queues/index.ts
export function initializeWorkers() {
  registerAIAnalysisWorker();        // ✓
  registerDocumentProcessingWorker(); // ✓
  registerCacheWarmingWorker();      // ✓
  
  logger.info('✅ All workers initialized');
}
```

**الحل 4**: راجع الـ logs
```bash
tail -f backend/logs/combined.log | grep -i "worker\|queue\|job"
```

---

### ❌ المشكلة: Jobs تفشل مع Timeout

**الأعراض**:
```
Job failed: Error: Job timeout
```

**الحلول**:

**الحل 1**: زيادة timeout
```typescript
// في queue.config.ts
const workerOptions: WorkerOptions = {
  connection: redisConnection,
  lockDuration: 60000,     // 60 ثانية (بدلاً من 30)
  maxJobsPerWorker: 5,
};
```

**الحل 2**: تقسيم المهام الكبيرة
```typescript
// بدلاً من معالجة السيناريو كاملاً
// قسّمه إلى مهام أصغر
await queue.addBulk([
  { name: 'analyze-scene-1', data: { sceneId: '1' } },
  { name: 'analyze-scene-2', data: { sceneId: '2' } },
  // ...
]);
```

**الحل 3**: تحسين Worker logic
```typescript
// أضف progress reporting
async function processJob(job: Job) {
  await job.updateProgress(10);
  // ... processing
  await job.updateProgress(50);
  // ... more processing
  await job.updateProgress(100);
}
```

---

## مشاكل الأداء العام

### ❌ المشكلة: API Response Time > 200ms

**التشخيص**:
```bash
# قياس endpoint محدد
time curl -s http://localhost:3001/api/projects

# مع تفاصيل
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3001/api/projects
```

**الحلول**:

**1. تحقق من Database queries**
```bash
# فعّل query logging
export DEBUG=drizzle:*
pnpm dev
```

**2. تحقق من Cache usage**
```bash
# راقب Redis
redis-cli MONITOR | grep -E "GET|SET"
```

**3. Profile Node.js**
```bash
node --inspect dist/server.js
# افتح chrome://inspect
# أخذ CPU profile
```

**4. تحقق من Network latency**
```bash
# إذا Database بعيد
ping your-database-host

# إذا Redis بعيد
ping your-redis-host
```

---

### ❌ المشكلة: Memory Leak

**الأعراض**:
```
Memory usage increasing over time
Eventually crashes with OOM
```

**التشخيص**:
```bash
# راقب الذاكرة
node --expose-gc --inspect dist/server.js

# في Chrome DevTools
# Allocation Timeline
# Heap Snapshot
```

**الأسباب الشائعة**:

**1. Event listeners لم تُزال**
```typescript
// سيء
eventEmitter.on('event', handler);

// جيد
const cleanup = () => {
  eventEmitter.off('event', handler);
};
// استدعِ cleanup عند الحاجة
```

**2. Intervals لم تُوقف**
```typescript
// سيء
setInterval(fetchData, 1000);

// جيد
const intervalId = setInterval(fetchData, 1000);
// عند التنظيف
clearInterval(intervalId);
```

**3. Redis/Database connections لم تُغلق**
```typescript
// في shutdown handler
process.on('SIGTERM', async () => {
  await closeRedis();
  await closeDatabase();
  process.exit(0);
});
```

---

## مشاكل الأمان

### ❌ المشكلة: UUID Validation لا يعمل

**الأعراض**:
```
Invalid UUID passes validation
SQL injection possible
```

**التشخيص**:
```bash
# اختبر بـ UUID غير صالح
curl -X GET "http://localhost:3001/api/projects/not-a-uuid"

# يجب أن يرجع 400 Bad Request
```

**الحل**:
```typescript
// تأكد من إضافة validateParams في server.ts
import { validateParams, commonSchemas } from '@/middleware';

app.get('/api/projects/:id', 
  authMiddleware, 
  validateParams(commonSchemas.idParam),  // ← مهم!
  projectsController.getProject
);
```

**التحقق من Schema**:
```typescript
// في validation.middleware.ts
export const commonSchemas = {
  idParam: z.object({
    id: z.string().uuid('معرف غير صالح'),  // ✓
  }),
};
```

---

### ❌ المشكلة: CORS Errors في Production

**الأعراض**:
```
Access to fetch blocked by CORS policy
```

**الحلول**:

**1. تحديث CORS_ORIGIN في .env**
```bash
# في production
CORS_ORIGIN=https://your-frontend-domain.com,https://www.your-frontend-domain.com
```

**2. تحقق من middleware**
```typescript
// في middleware/index.ts
const allowedOrigins = env.CORS_ORIGIN.split(',').map(origin => origin.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
```

---

## مشاكل Frontend

### ❌ المشكلة: LCP > 3s (بطيء جداً)

**التشخيص**:
```bash
lighthouse http://localhost:3000 --only-categories=performance
```

**الحلول**:

**1. استبدل <img> بـ <Image>**
```tsx
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority  // للصورة الأولى فوق الـ fold
/>
```

**2. Preload الموارد الحرجة**
```tsx
// في layout.tsx
<head>
  <link rel="preload" as="image" href="/hero.jpg" />
  <link rel="preload" as="font" href="/fonts/main.woff2" />
</head>
```

**3. تحسين الـ fonts**
```typescript
// في fonts.ts
import { Cairo } from 'next/font/google';

const cairo = Cairo({
  subsets: ['arabic'],
  display: 'swap',  // مهم!
  preload: true,
});
```

---

### ❌ المشكلة: Bundle Size كبير جداً (> 500KB)

**التشخيص**:
```bash
cd frontend
ANALYZE=true pnpm build
```

**الحلول**:

**1. Dynamic Imports**
```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Spinner />,
  ssr: false,
});
```

**2. Tree Shaking**
```typescript
// سيء
import _ from 'lodash';

// جيد
import debounce from 'lodash/debounce';

// أو استخدم lodash-es
import { debounce } from 'lodash-es';
```

**3. إزالة unused dependencies**
```bash
pnpm remove unused-package
```

---

## مشاكل الـ Build

### ❌ المشكلة: Build Fails مع Type Errors

**الأعراض**:
```
Type error: Property 'xxx' does not exist on type 'yyy'
```

**الحلول**:

**1. تحديث types**
```bash
cd backend
pnpm add -D @types/node @types/express

cd frontend
pnpm add -D @types/node @types/react
```

**2. تحقق من tsconfig.json**
```json
{
  "compilerOptions": {
    "strict": true,
    "skipLibCheck": true,  // skip type checking of declaration files
    "esModuleInterop": true
  }
}
```

**3. Type assertions**
```typescript
// إذا كنت متأكداً من النوع
const value = data as ExpectedType;

// أو
const value = data satisfies ExpectedType;
```

---

### ❌ المشكلة: Module Resolution Error

**الأعراض**:
```
Error: Cannot find module '@/components/Something'
```

**الحلول**:

**1. تحقق من tsconfig paths**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

**2. تحقق من package.json في Backend**
```json
{
  "_moduleAliases": {
    "@": "dist"
  }
}
```

**3. أعد تشغيل TS Server في VSCode**
```
Ctrl+Shift+P → TypeScript: Restart TS Server
```

---

## 📞 الحصول على المساعدة

إذا استمرت المشكلة بعد تجربة الحلول أعلاه:

### 1. جمع المعلومات
```bash
# معلومات النظام
node --version
pnpm --version
psql --version
redis-cli --version

# معلومات التطبيق
cd backend && pnpm list
cd frontend && pnpm list

# Logs
tail -n 100 backend/logs/error.log > debug-info.txt
```

### 2. إنشاء Minimal Reproducible Example
- عزل المشكلة
- كود بسيط يُعيد إنتاج المشكلة
- خطوات واضحة للتكرار

### 3. مراجعة الوثائق
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)
- [QUICK_START.md](./QUICK_START.md)
- [COMMANDS_REFERENCE.md](./COMMANDS_REFERENCE.md)

### 4. فحص Sentry
```
https://sentry.io/your-project
```
- راجع الأخطاء الأخيرة
- تحقق من stack traces
- راجع breadcrumbs

---

## ✅ Checklist للمشاكل الشائعة

قبل فتح Issue، تحقق من:

- [ ] تشغيل `pnpm install` في كل من backend و frontend
- [ ] قراءة رسالة الخطأ بالكامل
- [ ] فحص logs (`backend/logs/`)
- [ ] التحقق من environment variables
- [ ] Redis يعمل ومتصل
- [ ] Database يعمل ومتصل
- [ ] Port 3000 و 3001 غير مشغولة
- [ ] تشغيل build محلي بنجاح
- [ ] مراجعة TROUBLESHOOTING.md (هذا الملف)

---

**آخر تحديث**: نوفمبر 2024  
**للأسئلة**: راجع [README.md](./README.md)  
**للأوامر السريعة**: راجع [COMMANDS_REFERENCE.md](./COMMANDS_REFERENCE.md)