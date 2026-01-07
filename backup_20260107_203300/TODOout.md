# وثيقة التصميم الهندسي وخطة التنفيذ - مشروع BreakApp

## 1. الملخص التنفيذي (Executive Summary)

هذه الوثيقة تمثل المرجع التقني الموحد (Source of Truth) لبناء منصة "BreakApp". يركز التصميم على حل المشكلة الجذرية: "مزامنة اللوجستيات مع إحداثيات جغرافية متغيرة بمرور الوقت".

النظام ليس مجرد تطبيق طلب طعام، بل هو محرك حالة (State Machine) يعتمد على الموقع الجغرافي (Geo-dependent) لتحديد الموارد المتاحة، مع طبقة أمان تعتمد على الرموز (Tokenization) لعزل البيانات المالية عن المستخدم النهائي.

---

## 2. خارطة طريق التنفيذ (Implementation Roadmap)

تم تقسيم العمل إلى 4 دورات تطوير (Sprints) مركزة، مدة كل دورة أسبوعين، لضمان تسليم الـ MVP بكفاءة.

### Sprint 1: النواة والأمان (Core & Security)

**الهدف**: إنشاء البنية التحتية، ونظام الدخول عبر QR، وعزل بيانات المشاريع.

**المهام**:
- إعداد بيئة عمل NestJS (Backend) و Next.js (Frontend) بداخل Monorepo (نوصي بـ Turborepo)
- تجهيز PostgreSQL مع ملحق PostGIS
- تنفيذ نظام AuthGuard المعتمد على JWT (بدون كلمات مرور للطاقم)
- بناء جداول Projects و Users وتطبيق Row Level Security (RLS)

### Sprint 2: المحرك الجغرافي (The Geo-Engine)

**الهدف**: التعامل مع المواقع المتغيرة وحساب المسافات.

**المهام**:
- تطوير LocationService: استقبال الإحداثيات وتحديثها
- تنفيذ استعلامات PostGIS: ST_DWithin لفلترة الموردين في نطاق 3 كم
- بناء واجهة الأدمن (Director Dashboard) لتحديد موقع "الأوردر" اليومي

### Sprint 3: دورة حياة الطلب (Order Logic & Batching)

**الهدف**: تمكين الطلبات العمياء (Blind Ordering) وتجميعها.

**المهام**:
- تطوير API القوائم (/menu) الذي يخفي الأسعار بناءً على دور المستخدم
- بناء نظام الـ Batching: تجميع الطلبات الفردية في "Session Order" واحد
- تنفيذ OrderQueue باستخدام Redis للتعامل مع ضغط الطلبات وقت الغداء (Lunch Break)

### Sprint 4: الزمن الحقيقي (Real-time & Optimization)

**الهدف**: التتبع الحي وتجربة المستخدم النهائية.

**المهام**:
- إعداد Socket.io Gateway لبث تحديثات الموقع للـ Runner
- تطوير واجهة الـ Runner (PWA) لاستقبال المهام
- اختبارات الأداء (Load Testing) لمحاكاة 500 مستخدم في موقع واحد

---

## 3. خريطة الكود (The Code Map)

هيكل المجلدات المقترح لضمان القابلية للتوسع وصيانة الكود. يعتمد على نمط "Modular Monolith" في الـ Backend.

### أ. هيكلية الخلفية (Backend - NestJS)

```
src/
├── app.module.ts              # نقطة التجميع الرئيسية
├── common/                    # الكود المشترك
│   ├── decorators/            # (e.g., @CurrentUser, @Roles)
│   ├── filters/               # (e.g., HttpExceptionFilter)
│   └── guards/                # (e.g., ProjectAuthGuard)
├── config/                    # إعدادات البيئة وقاعدة البيانات
├── database/                  # Migrations & Seeds
├── modules/
│   ├── auth/                  # إدارة التوكن والدخول عبر QR
│   │   ├── strategies/        # استراتيجية JWT
│   │   └── auth.service.ts
│   ├── project/               # إدارة المشاريع وإعدادات الموقع
│   │   ├── dto/               # (SetLocationDto)
│   │   └── project.controller.ts
│   ├── geo/                   # المنطق الجغرافي (PostGIS Logic)
│   │   └── geo.service.ts     # (حساب المسافات والفلترة)
│   ├── order/                 # إدارة الطلبات والتجميع
│   │   ├── batching/          # منطق تجميع الطلبات للمورد
│   │   └── order.processor.ts # (Redis Queue Processor)
│   └── realtime/              # WebSockets Gateway
│       └── location.gateway.ts
└── shared/                    # كائنات مشتركة
    └── utils/                 # (Data Scrubbing Utility)
```

### ب. هيكلية الواجهة الأمامية (Frontend - Next.js)

```
src/
├── app/                       # App Router
│   ├── (auth)/login/qr/       # صفحة مسح الكود
│   ├── (dashboard)/director/  # لوحة تحكم مدير الإنتاج
│   ├── (crew)/menu/           # واجهة اختيار الطعام للطاقم
│   └── (runner)/track/        # واجهة التوصيل
├── components/
│   ├── maps/                  # مكونات الخريطة (Leaflet/Mapbox)
│   ├── ui/                    # عناصر التصميم (Buttons, Cards)
│   └── scanner/               # مكون قارئ QR
├── hooks/
│   ├── useSocket.ts           # الاتصال بالخادم اللحظي
│   └── useGeolocation.ts      # التعامل مع GPS الجهاز
├── lib/
│   ├── api.ts                 # إعدادات Axios/Fetch
│   └── constants.ts
└── types/                     # تعريفات TypeScript المشتركة
```

---

## 4. تصميم قاعدة البيانات (Database Schema Blueprint)

تم التصميم لـ PostgreSQL مع التركيز على الأنواع الجغرافية والعلاقات.

### الجداول الأساسية (SQL Structure Concept)

#### Projects (المشاريع)
- `id`: UUID
- `active_location`: GEOGRAPHY(Point, 4326) - حقل جوهري لتحديد الموقع الحالي
- `access_token_secret`: String - لتشفير توكنات الطاقم
- `budget_config`: JSONB - قواعد الميزانية

#### Vendors (الموردين)
- `id`: UUID
- `fixed_location`: GEOGRAPHY(Point, 4326)
- `is_mobile`: Boolean - في حال كان المورد عربة طعام متنقلة

#### Daily_Sessions (جلسات التموين اليومية)
هذا الجدول يربط المشروع بالموقع في وقت محدد.
- `id`: UUID
- `project_id`: FK
- `center_point`: GEOGRAPHY(Point) - موقع التصوير لتلك الجلسة
- `status`: Enum [OPEN, LOCKED, DELIVERING, COMPLETED]

#### Orders (الطلبات الفردية)
- `id`: UUID
- `session_id`: FK
- `user_hash`: String - هوية المستخدم (بدون بيانات شخصية حساسة)
- `items`: JSONB - تفاصيل الوجبة
- `cost_internal`: Decimal - للمحاسبة الداخلية فقط

---

## 5. السياق الهندسي والتفاصيل التقنية (Technical Context)

### أ. استراتيجية البيانات الجغرافية (Geo-Strategy)

سنعتمد على PostGIS كمحرك أساسي. عند قيام مدير الإنتاج بتحديث الموقع (Set Location)، سيتم تنفيذ الاستعلام التالي داخلياً لجلب الموردين:

```sql
SELECT * FROM vendors
WHERE ST_DWithin(
  vendors.fixed_location,
  ST_SetSRID(ST_MakePoint(:long, :lat), 4326),
  3000 -- المسافة بالمتر (3 كم)
);
```

**Offline-First Logic**: نظراً لاحتمالية ضعف الشبكة في مواقع التصوير الصحراوية، سيقوم الـ Frontend بتخزين الـ "Token" وآخر قائمة طعام تم تحميلها (Local Storage). عند عودة الاتصال، تتم مزامنة الطلبات عبر Service Worker.

### ب. التجريد المالي (Financial Abstraction)

لتحقيق متطلب "إخفاء الأسعار"، سنستخدم نمط DTO Filtering في الـ Backend:

1. عند طلب `/api/menu`، يتحقق النظام من دور المستخدم
2. إذا كان `Role = CREW`، يتم استخدام ClassSerializerInterceptor لاستبعاد حقل `price` من كائن الاستجابة (Response Object) قبل إرساله للشبكة
3. هذا يضمن أن البيانات لا تصل للمتصفح أصلاً

### ج. دورة حياة الـ Token (Access Control)

1. المدير يولد QR Code يحتوي على: `{ projectId, timestamp, signature }`
2. عضو الطاقم يمسح الكود
3. الخادم يتحقق من الـ Signature
4. يتم إصدار Session JWT قصير الأمد يخزن في ذاكرة الهاتف، يتيح الوصول فقط لقائمة الطعام الخاصة بذلك المشروع في ذلك اليوم

### د. التعامل مع التتبع الحي (Real-time Tracking)

سنستخدم Redis لتخزين إحداثيات الـ Runner بشكل مؤقت (Ephemeral Data) بدلاً من كتابتها في قاعدة البيانات كل ثانية، مما يقلل الحمل على PostgreSQL.

**التدفق**:
1. Runner يرسل الموقع → Socket Gateway → Redis Key Update
2. واجهة المدير (Dashboard) تقرأ من Redis وتعرض على الخريطة
3. عند انتهاء التوصيل، يتم حفظ "مسار الرحلة" النهائي في DB للأرشفة (اختياري)

---

**آخر تحديث**: 2025-12-29  
**الإصدار**: 1.0.0