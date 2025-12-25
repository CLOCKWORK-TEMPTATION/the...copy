# The Copy – Advanced Codemap (Monorepo)

هدف هذه الخريطة: مرجع عملي ودقيق يغطي البنية المعمارية، التدفقات الأساسية، نقاط الأمان، المراقبة والأداء، مسارات الصحة، والنشر Blue-Green — مع روابط لمسارات الملفات الفعلية داخل المستودع وخطوات تحقق سريعة.

## نظرة عامة
- **الواجهة الخلفية (Backend/Express)**: تهيئة مبكرة للمراقبة (Sentry/OpenTelemetry)، سلسلة Middleware أمنية، مصادقة JWT، اتصال قاعدة البيانات (Drizzle + Neon)، طوابير/خدمات خلفية، مسارات الصحة.
- **الواجهة الأمامية (Frontend/Next.js)**: Middleware للأمان يضيف CSP والـ Headers، تهيئة Sentry متعددة البيئات، خدمات مراقبة الأداء والـ Web Vitals.
- **النشر (Blue-Green)**: GitHub Actions → بناء بـ pnpm → تشغيل بيئة جديدة بـ PM2 → فحوصات دخان وصحة → تبديل الترافيك بـ Nginx بلا توقف.

## Backend

### التهيئة والمراقبة
- **Sentry Backend**: راجع [backend/src/config/sentry.ts](backend/src/config/sentry.ts).
  - `initializeSentry()` يقرأ DSN، يفعّل APM، يضبط معدلات العيّنة، ويضيف تكاملات `nodeProfilingIntegration`.
  - أدوات تتبع زمن العمليات: `startTransaction()`, `trackDbQuery()`, `captureException()`, `captureMessage()` مع عتبات أداء مُعرّفة.
- **OpenTelemetry**: أمثلة وأدلة متقدمة في [backend/src/examples/tracing-examples.ts](backend/src/examples/tracing-examples.ts) وملفات الدليل في [docs/DISTRIBUTED_TRACING.md](docs/DISTRIBUTED_TRACING.md).
- **الـ Logger**: Sanitization للّوغز عبر [backend/src/middleware/log-sanitization.middleware](backend/src/middleware) وواجهات في [backend/src/utils/logger.ts](backend/src/utils/logger.ts).

### سلسلة الأمان (Middleware Chain)
- **WAF/CSRF/Headers**: تُطبق مبكرًا ضمن `server.ts` (انظر [backend/src/server.ts](backend/src/server.ts)).
- **Auth Middleware**: استخراج `Bearer` والتحقق من JWT، وإرفاق المستخدم على الطلب قبل الوصول للمسيطرات (controllers).
- **Rate Limiting/CORS/Compression**: تُضبط مبكرًا في سلسلة الـ middleware لحماية نقاط الدخول الحساسة.

### المصادقة (Auth)
- **Schemas**: مخططات Zod في [backend/src/utils/validation.schemas.ts](backend/src/utils/validation.schemas.ts).
- **تدفق تسجيل الدخول**:
  1) التحقق بـ Zod.
  2) جلب المستخدم من DB.
  3) مقارنة كلمة المرور بـ bcrypt.
  4) توليد زوج Tokens (Access/Refresh) وحفظ الـ Refresh في Cookie آمن.
  5) إرجاع استجابة تتضمن بيانات المستخدم وتوكن الوصول.
- **اختبارات تكامل**: راجع [backend/src/__tests__/integration/controllers.integration.test.ts](backend/src/__tests__/integration/controllers.integration.test.ts) لمسارات `POST /api/auth/login` و`GET /api/auth/me` وغيرها.

### قواعد البيانات (Drizzle + Neon)
- **مخططات وترحيلات**: ملفات SQL في [backend/drizzle](backend/drizzle) (مثل `0000_boring_klaw.sql`, `0001_broad_korath.sql`).
- **اتصال سيرفرليس/WebSocket**: إعدادات في [backend/src/config/websocket.config.ts](backend/src/config/websocket.config.ts) مع مهلة مصادقة وخصائص تخطي Middleware لبعض القنوات.
- **الصحة (Redis)**: أداة التحقق في [backend/src/utils/redis-health.ts](backend/src/utils/redis-health.ts) واختباراتها في [backend/src/utils/redis-health.test.ts](backend/src/utils/redis-health.test.ts).

### مسارات الصحة (Health)
- **جاهزية والصحة العامة**: نقاط `/health`, `/health/ready`, `/health/detailed` مُدارة عبر `HealthController` ومؤشرات Redis/DB.
- **استخدام في النشر**: تستُخدم ضمن فحوصات الدخان في الـ Blue-Green قبل تحويل الترافيك.

## Frontend

### Middleware & Security Headers
- **Next.js Middleware**: [frontend/src/middleware.ts](frontend/src/middleware.ts)
  - يبني CSP (`script-src`, `style-src`, `connect-src`, `frame-ancestors`) ويطبّق `Content-Security-Policy`.
  - يضيف `X-Frame-Options: DENY`, `X-Content-Type-Options`, `Referrer-Policy`.

### Sentry & Observability
- **تهيئة متعددة البيئات**: [frontend/src/instrumentation.ts](frontend/src/instrumentation.ts) و [frontend/src/lib/drama-analyst/services/observability.ts](frontend/src/lib/drama-analyst/services/observability.ts).
  - تعطيل في التطوير عند عدم وجود DSN.
  - تكاملات `browserTracingIntegration`, `replayIntegration`, وتهيئة الـ tags/context/user.
- **Web Vitals & Uptime**: خدمات قياس وتقارير إلى Sentry في:
  - [frontend/src/lib/drama-analyst/services/webVitalsService.ts](frontend/src/lib/drama-analyst/services/webVitalsService.ts)
  - [frontend/src/lib/drama-analyst/services/uptimeMonitoringService.ts](frontend/src/lib/drama-analyst/services/uptimeMonitoringService.ts)

### Caching Helpers
- **Cache Middleware**: [frontend/src/lib/cache-middleware.ts](frontend/src/lib/cache-middleware.ts) لتغليف المعالجات وإرجاع `NextResponse` مع رؤوس تخزين مناسبة.

## النشر Blue-Green

### خط الأنابيب
- **GitHub Actions & Scripts**: راجع ملفات CI/CD في الجذر والدلائل ذات الصلة (مثل `blue-green-deploy.sh`, قوالب YAML في `.github/workflows` إن وُجدت؛ وعموماً راجع [PRODUCTION_DEPLOYMENT_SETUP.md](PRODUCTION_DEPLOYMENT_SETUP.md) و[STAGING_DEPLOYMENT.md](STAGING_DEPLOYMENT.md)).
- **خطوات أساسية**:
  - سحب آخر كود → تثبيت تبعيات بـ pnpm → بناء → تشغيل PM2 على منفذ بيئة "Blue/Green".
  - فحوصات الصحة والدخان (يشمل `/health`, `/health/detailed`).
  - اختبار/إعادة تحميل Nginx لتحويل الترافيك بلا توقف.

## قوائم تحقق تنفيذية (Aligned مع AGENTS.md)

### TypeScript & جودة الكود
- فعّل الوضع الصارم، لا تستخدم `any` دون مبرر، وصرّح أنواع العائد للدوال العامة.
- نظّم الاستيرادات وفق الفئات، والتزم إعدادات Prettier/ESLint المعرّفة.

### الأمان
- Zod على جميع نقاط الإدخال الحساسة، ووثّق مخططات البيئة، ووفّر ملف `.env.example`.
- Cookies: استخدم `HttpOnly`, `Secure`, `SameSite=Strict/Lax` للـ Refresh Token وتحقق من النطاقات عبر البيئات.
- CSRF: طبّق على طلبات تغيّر الحالة فقط، وتحقّق من عدم كسر واجهات القراءة.
- CORS/Rate Limiting: حدّد الـ origins بدقة وضع معدّل للطلبات على مسارات المصادقة والمشاريع.

### المراقبة والأداء
- OpenTelemetry قبل أي Import آخر، ثم Sentry، ثم إنشاء تطبيق Express، ثم سلسلة الأمان.
- أنشئ Spans مسمّاة لتدفقات auth/DB/projects، واستخدم `captureException` في كلّ `try/catch`.
- أضف فهارس على أعمدة الربط في DB (مثل `projects.userId`) وتجنّب N+1.

### Blue-Green & الصحة
- نفّذ ترحيلات DB بأمان قبل تشغيل البيئة الجديدة، واختبر توافق الـ schema.
- وسّع فحوصات الدخان: تحقق من تسجيل الدخول، طلب محمي، وجود CSP، وحالة Redis/DB.

## فهرس سريع للملفات المذكورة
- Backend:
  - [backend/src/server.ts](backend/src/server.ts)
  - [backend/src/config/sentry.ts](backend/src/config/sentry.ts)
  - [backend/src/examples/tracing-examples.ts](backend/src/examples/tracing-examples.ts)
  - [backend/src/utils/validation.schemas.ts](backend/src/utils/validation.schemas.ts)
  - [backend/src/utils/logger.ts](backend/src/utils/logger.ts)
  - [backend/src/utils/redis-health.ts](backend/src/utils/redis-health.ts)
  - [backend/src/__tests__/integration/controllers.integration.test.ts](backend/src/__tests__/integration/controllers.integration.test.ts)
  - [backend/src/config/websocket.config.ts](backend/src/config/websocket.config.ts)
  - [backend/drizzle](backend/drizzle)
- Frontend:
  - [frontend/src/middleware.ts](frontend/src/middleware.ts)
  - [frontend/src/instrumentation.ts](frontend/src/instrumentation.ts)
  - [frontend/src/lib/drama-analyst/services/observability.ts](frontend/src/lib/drama-analyst/services/observability.ts)
  - [frontend/src/lib/drama-analyst/services/webVitalsService.ts](frontend/src/lib/drama-analyst/services/webVitalsService.ts)
  - [frontend/src/lib/drama-analyst/services/uptimeMonitoringService.ts](frontend/src/lib/drama-analyst/services/uptimeMonitoringService.ts)
  - [frontend/src/lib/cache-middleware.ts](frontend/src/lib/cache-middleware.ts)
- Docs/Guides:
  - [docs/DISTRIBUTED_TRACING.md](docs/DISTRIBUTED_TRACING.md)
  - [PRODUCTION_DEPLOYMENT_SETUP.md](PRODUCTION_DEPLOYMENT_SETUP.md)
  - [STAGING_DEPLOYMENT.md](STAGING_DEPLOYMENT.md)
  - [AGENTS.md](AGENTS.md)

## خطوات تحقق سريعة
```bash
# Backend
cd backend
pnpm typecheck
pnpm lint
pnpm test
pnpm build

# Frontend
cd ../frontend
pnpm typecheck
pnpm lint
pnpm test
pnpm build

# Root checks
cd ..
pnpm typecheck
pnpm lint
pnpm test
```

## ملاحظات تطبيقية
- حافظ على ترتيب التهيئة: Tracing → Sentry → إنشاء تطبيق → سلاسل الأمان → تعريف المسارات.
- راقب حدود Neon/Pool، وفكّر في PgBouncer عند الحاجة.
- حدّث خريطة الكود دوريًا مع أي تغييرات في المسارات أو خدمات الخلفية أو إعدادات الأمن.

---

## Route Inventory (Backend)

ملخص المسارات مع الروابط إلى التعريفات في `server.ts`:

- Health & Metrics
  - GET `/api/health` → [server.ts](backend/src/server.ts#L204)
  - GET `/health` → [server.ts](backend/src/server.ts#L205)
  - GET `/health/live` → [server.ts](backend/src/server.ts#L206)
  - GET `/health/ready` → [server.ts](backend/src/server.ts#L207)
  - GET `/health/startup` → [server.ts](backend/src/server.ts#L208)
  - GET `/health/detailed` → [server.ts](backend/src/server.ts#L209)
  - GET `/metrics` (Prometheus) → [server.ts](backend/src/server.ts#L212)
  - Gemini cost summary: GET `/api/gemini/cost-summary` (auth) → [server.ts](backend/src/server.ts#L215)

- Auth
  - POST `/api/auth/signup` (CSRF token set) → [server.ts](backend/src/server.ts#L234)
  - POST `/api/auth/login` (CSRF token set) → [server.ts](backend/src/server.ts#L235)
  - POST `/api/auth/logout` (CSRF) → [server.ts](backend/src/server.ts#L236)
  - POST `/api/auth/refresh` (CSRF + set token) → [server.ts](backend/src/server.ts#L237)
  - GET `/api/auth/me` (auth) → [server.ts](backend/src/server.ts#L238)

- Analysis
  - POST `/api/analysis/seven-stations` (auth + CSRF) → [server.ts](backend/src/server.ts#L241)
  - GET `/api/analysis/stations-info` (auth) → [server.ts](backend/src/server.ts#L242)

- Projects
  - GET `/api/projects` (auth) → [server.ts](backend/src/server.ts#L245)
  - GET `/api/projects/:id` (auth) → [server.ts](backend/src/server.ts#L246)
  - POST `/api/projects` (auth + CSRF) → [server.ts](backend/src/server.ts#L247)
  - PUT `/api/projects/:id` (auth + CSRF) → [server.ts](backend/src/server.ts#L248)
  - DELETE `/api/projects/:id` (auth + CSRF) → [server.ts](backend/src/server.ts#L249)
  - POST `/api/projects/:id/analyze` (auth + CSRF) → [server.ts](backend/src/server.ts#L250)

- Scenes
  - GET `/api/projects/:projectId/scenes` (auth) → [server.ts](backend/src/server.ts#L253)
  - GET `/api/scenes/:id` (auth) → [server.ts](backend/src/server.ts#L254)
  - POST `/api/scenes` (auth + CSRF) → [server.ts](backend/src/server.ts#L255)
  - PUT `/api/scenes/:id` (auth + CSRF) → [server.ts](backend/src/server.ts#L256)
  - DELETE `/api/scenes/:id` (auth + CSRF) → [server.ts](backend/src/server.ts#L257)

- Characters
  - GET `/api/projects/:projectId/characters` (auth) → [server.ts](backend/src/server.ts#L260)
  - GET `/api/characters/:id` (auth) → [server.ts](backend/src/server.ts#L261)
  - POST `/api/characters` (auth + CSRF) → [server.ts](backend/src/server.ts#L262)
  - PUT `/api/characters/:id` (auth + CSRF) → [server.ts](backend/src/server.ts#L263)
  - DELETE `/api/characters/:id` (auth + CSRF) → [server.ts](backend/src/server.ts#L264)

- Shots
  - GET `/api/scenes/:sceneId/shots` (auth) → [server.ts](backend/src/server.ts#L267)
  - GET `/api/shots/:id` (auth) → [server.ts](backend/src/server.ts#L268)
  - POST `/api/shots` (auth + CSRF) → [server.ts](backend/src/server.ts#L269)
  - PUT `/api/shots/:id` (auth + CSRF) → [server.ts](backend/src/server.ts#L270)
  - DELETE `/api/shots/:id` (auth + CSRF) → [server.ts](backend/src/server.ts#L271)
  - POST `/api/shots/suggestion` (auth + CSRF) → [server.ts](backend/src/server.ts#L272)

- AI
  - POST `/api/ai/chat` (auth + CSRF) → [server.ts](backend/src/server.ts#L275)
  - POST `/api/ai/shot-suggestion` (auth + CSRF) → [server.ts](backend/src/server.ts#L276)

- Queue
  - GET `/api/queue/jobs/:jobId` (auth) → [server.ts](backend/src/server.ts#L279)
  - GET `/api/queue/stats` (auth) → [server.ts](backend/src/server.ts#L280)
  - GET `/api/queue/:queueName/stats` (auth) → [server.ts](backend/src/server.ts#L281)
  - POST `/api/queue/jobs/:jobId/retry` (auth + CSRF) → [server.ts](backend/src/server.ts#L282)
  - POST `/api/queue/:queueName/clean` (auth + CSRF) → [server.ts](backend/src/server.ts#L283)

- Metrics
  - GET `/api/metrics/snapshot` (auth) → [server.ts](backend/src/server.ts#L286)
  - GET `/api/metrics/latest` (auth) → [server.ts](backend/src/server.ts#L287)
  - GET `/api/metrics/range` (auth) → [server.ts](backend/src/server.ts#L288)
  - GET `/api/metrics/database` (auth) → [server.ts](backend/src/server.ts#L289)
  - GET `/api/metrics/redis` (auth) → [server.ts](backend/src/server.ts#L290)
  - GET `/api/metrics/queue` (auth) → [server.ts](backend/src/server.ts#L291)
  - GET `/api/metrics/api` (auth) → [server.ts](backend/src/server.ts#L292)
  - GET `/api/metrics/resources` (auth) → [server.ts](backend/src/server.ts#L293)
  - GET `/api/metrics/gemini` (auth) → [server.ts](backend/src/server.ts#L294)
  - GET `/api/metrics/report` (auth) → [server.ts](backend/src/server.ts#L295)
  - GET `/api/metrics/health` (auth) → [server.ts](backend/src/server.ts#L296)
  - GET `/api/metrics/dashboard` (auth) → [server.ts](backend/src/server.ts#L297)
  - GET `/api/metrics/cache/*` (auth) → [server.ts](backend/src/server.ts#L300-L303)
  - APM: GET `/api/metrics/apm/dashboard`, GET `/api/metrics/apm/config`, POST `/api/metrics/apm/reset`, GET `/api/metrics/apm/alerts` → [server.ts](backend/src/server.ts#L306-L309)

- WAF Management
  - GET `/api/waf/stats` (auth) → [server.ts](backend/src/server.ts#L312)
  - GET `/api/waf/events` (auth) → [server.ts](backend/src/server.ts#L322)
  - GET `/api/waf/config` (auth) → [server.ts](backend/src/server.ts#L333)
  - PUT `/api/waf/config` (auth + CSRF) → [server.ts](backend/src/server.ts#L343)
  - GET `/api/waf/blocked-ips` (auth) → [server.ts](backend/src/server.ts#L353)
  - POST `/api/waf/block-ip` (auth + CSRF) → [server.ts](backend/src/server.ts#L363)
  - POST `/api/waf/unblock-ip` (auth + CSRF) → [server.ts](backend/src/server.ts#L377)

ملاحظة: جميع المسارات الحساسة محمية بـ `authMiddleware`، وتُطبق `csrfProtection` على طلبات تغيّر الحالة.

## Environment Schema (Backend)

مفاتيح بيئية مستخدمة وشائعة:
- `PORT` (تشغيل السيرفر) → [server.ts](backend/src/server.ts#L407)
- قاعدة البيانات: `DATABASE_URL`
- JWT: `JWT_SECRET` (مطلوب) → [config/env.ts](backend/src/config/env.ts#L34)
- CORS: `CORS_ORIGIN`
- Rate limiting: `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS`
- Tracing: `TRACING_ENABLED`, `OTEL_EXPORTER_OTLP_ENDPOINT`, `OTEL_LOG_LEVEL`, `SERVICE_NAME`
- Sentry: `SENTRY_DSN`, `SENTRY_TRACES_SAMPLE_RATE`, `SENTRY_PROFILES_SAMPLE_RATE`, `SENTRY_RELEASE`, `SENTRY_SERVER_NAME`
- Redis: `REDIS_URL`, أو (`REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`) + Sentinel (`REDIS_SENTINEL_ENABLED`, `REDIS_SENTINELS`, `REDIS_MASTER_NAME`, `REDIS_SENTINEL_PASSWORD`) → [config/redis.config.ts](backend/src/config/redis.config.ts)
- Notifications: SMTP (`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`) و Slack (`SLACK_WEBHOOK_URL`) → [services/notification.service.ts](backend/src/services/notification.service.ts)
- Google GenAI: `GOOGLE_GENAI_API_KEY` (اختبارات إعداد) → [test/setup.ts](backend/src/test/setup.ts#L17)

Frontend env (اختصار):
- `NEXT_PUBLIC_SENTRY_DSN` وغيره كما في [frontend/src/env.ts](frontend/src/env.ts)

## CSP Policy Template (Frontend)

قالب قابل للتعديل في `middleware.ts` لضبط CSP بدقة:

مثال توجيهات أساسية:
- `default-src 'self'`
- `script-src 'self' 'unsafe-inline' 'unsafe-eval'` (قلّلها قدر الإمكان)
- `style-src 'self' 'unsafe-inline'`
- `img-src 'self' data:`
- `font-src 'self' data:`
- `connect-src 'self' https://o*.ingest.sentry.io https://api.the-copy.com` (أضف نطاقات الـ APIs وSentry)
- `frame-ancestors 'none'`

طبّقها عبر: [frontend/src/middleware.ts](frontend/src/middleware.ts#L59-L69)

ملاحظة: اضبط `connect-src` وفقًا للنطاقات الفعلية (SaaS/Neon/Sentry/API)، وتأكد من عدم حظر Telemetry/Monitoring.

## APM Thresholds & Performance Hotspots

- Sentry APM thresholds (مثال): `dbQuery: 1000ms` مضبوطة في [backend/src/config/sentry.ts](backend/src/config/sentry.ts#L28-L29, backend/src/config/sentry.ts#L286-L287).
- تحقق من زمن استعلامات المشاريع/المشاهد/اللقطات؛ أضف فهارس على مفاتيح الربط (`userId`, `projectId`, `sceneId`).
- راقب ازدحام Redis/Queue عبر مسارات `/api/metrics/*` وواجهات WAF لتأثير الحظر على الأداء.

## Blue-Green Smoke Tests (Suggested)

تحقّق سريع قبل التحويل:
```bash
# صحة عامة
curl -f http://localhost:$PORT/health
curl -f http://localhost:$PORT/health/detailed

# جاهزية
curl -f http://localhost:$PORT/health/ready

# مصادقة (مثال)
curl -f -X POST http://localhost:$PORT/api/auth/login -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"pass"}'

# طلب محمي (بعد الحصول على Bearer)
curl -f -H "Authorization: Bearer $TOKEN" http://localhost:$PORT/api/projects

# تحقق CSP (Frontend)
curl -I https://your-frontend-domain/ | grep -i content-security-policy
```

## Maintenance Checklist

- ترتيب التهيئة: Tracing → Sentry → Express app → Security middleware → Routes.
- تحديث `.env.example` مع أي مفتاح جديد؛ تحقق عبر مخطط Zod للبيئة.
- مراجعة CSP عند إضافة خدمات خارجية (Sentry/Analytics/AI endpoints).
- ضبط Rate limiting عند إضافة مسارات حساسة جديدة.
- تحديث فهارس DB عند نمو الجداول؛ راجع تقارير الأداء وAPM.
- إضافة/تحديث اختبارات Vitest/Supertest وPlaywright عند توسيع API/UI.

---

## Controllers & Services Matrix

ربط مختصر بين المسارات، المسيطرات، والخدمات الرئيسية (استنادًا لتعريفات `server.ts` وملفات controllers):

- Auth
  - `POST /api/auth/signup` → `AuthController.signup` → خدمات: توليد Tokens، تخزين Refresh في Cookie (راجع `auth.controller.ts`).
  - `POST /api/auth/login` → `AuthController.login` → خدمات: التحقق من `bcrypt`, توليد زوج Tokens (`auth.service.ts`).
  - `POST /api/auth/logout` → `AuthController.logout` → تفريغ Cookie.
  - `POST /api/auth/refresh` → `AuthController.refresh` → تجديد Tokens.
  - `GET /api/auth/me` → `AuthController.getCurrentUser`.

- Projects
  - CRUD عبر `ProjectsController.{getProjects,getProject,createProject,updateProject,deleteProject}`.

- Scenes
  - CRUD عبر `ScenesController.{getScenes,getScene,createScene,updateScene,deleteScene}`.

- Shots
  - CRUD عبر `ShotsController.{getShots,getShot,createShot,updateShot,deleteShot}` + `generateShotSuggestion` (Gemini).

- Characters
  - CRUD عبر `CharactersController.{getCharacters,getCharacter,createCharacter,updateCharacter,deleteCharacter}`.

- Analysis
  - `POST seven-stations`, `GET stations-info` عبر `AnalysisController` و`StationsOrchestrator`.

- Queue & Metrics & WAF
  - Queue: `QueueController.{getJobStatus,getQueueStats,getSpecificQueueStats,retryJob,cleanQueue}`.
  - Metrics/APM/Cache: `MetricsController.*` (snapshots, latest, range, db/redis/queue/api/resources, apm, cache).
  - WAF: إدارة الإعدادات/الأحداث/الحظر عبر مسارات `api/waf/*`.

ملاحظة: مخططات Zod ذات الصلة في `utils/validation.schemas.ts` (تحقق بيانات Auth وغيرها).

## Coverage Snapshot (Backend)

ملخّص سريع من نتائج الاختبارات في [backend/test-results.json](backend/test-results.json):
- Suites ناجحة: `middleware/index.test.ts`, `db/connection.test.ts`, `__tests__/smoke/api-endpoints.smoke.test.ts`, `config/env.test.ts`, `utils/redis-health.test.ts`, `scenes.controller.test.ts`, `test/security.comprehensive.test.ts`, `middleware/auth.middleware.test.ts`, `projects.controller.test.ts`, `services/auth.service.test.ts`, `types/index.test.ts`, `utils/logger.test.ts`.
- Suites فاشلة بارزة: `shots.controller.test.ts` (عدة حالات CRUD وترتيب)، `cache.service.test.ts` (عمليات L1/L2)، `db/index.test.ts` (تهيئة Pool/Drizzle)، `characters.controller.test.ts` (حالات صلاحيات/أخطاء)، `analysis.service.test.ts` (تشغيل pipeline/Gemini)، `gemini.service.test.ts` (مهلة/اعتمادات/بناء prompt)، وبعض اختبارات Queue بسبب تبعيات BullMQ مفقودة.
- مؤشرات لتحسين سريع:
  - تثبيت/تهيئة تبعيات مفقودة (BullMQ/tslib) قبل اختبارات Queue.
  - مراجعة رسائل الخطأ العربية المتوقعة مقابل الفعلية في Controllers.
  - ضبط حالات `status(201|404|403)` في Controllers لتطابق التوقعات.
  - تحسين زمن ومشلّات Gemini عبر Mocks ثابتة لتفادي مهلات طويلة.

## CSP Profiles by Environment

- Dev:
  - تساهل نسبي مع `connect-src` نحو localhost وخدمات مراقبة محليّة.
  - يمكن السماح مؤقتًا بـ `'unsafe-inline'`/`'unsafe-eval'` لتسريع التطوير (يفضّل تقليلها).

- Staging:
  - قرب الإنتاج: أزل `'unsafe-eval'` إن أمكن، ثبّت نطاقات APIs وSentry.
  - طبّق `frame-ancestors 'none'` والتزم بقيود الصور والخطوط.

- Prod:
  - أقصى تشدّد: لا `'unsafe-eval'`, قلّل `'unsafe-inline'`، حدّد مصادر scripts/styles بدقة.
  - احصر `connect-src` على نطاقات الإنتاج (API/Sentry/Telemetry) فقط.
  - راقب الأخطاء الناتجة عن CSP عند إضافة تكاملات جديدة.

ضبط يتم في [frontend/src/middleware.ts](frontend/src/middleware.ts) مع مراجعة دورية عند تغيير مزوّدي الخدمات.


