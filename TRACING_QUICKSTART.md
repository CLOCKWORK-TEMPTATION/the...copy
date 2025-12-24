# OpenTelemetry Distributed Tracing - Quick Start

## 🚀 تشغيل Jaeger

```powershell
# تشغيل
.\manage-tracing.ps1 start

# التحقق من الحالة
.\manage-tracing.ps1 status

# فتح واجهة Jaeger
.\manage-tracing.ps1 ui
```

## ⚙️ إعداد البيئة

### Backend (.env)

```env
TRACING_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
SERVICE_NAME=theeeecopy-backend
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_TRACING_ENABLED=true
NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
NEXT_PUBLIC_SERVICE_NAME=theeeecopy-frontend
```

## 📚 التوثيق الكامل

راجع [docs/DISTRIBUTED_TRACING.md](docs/DISTRIBUTED_TRACING.md) للحصول على:
- أمثلة متقدمة
- أفضل الممارسات
- استكشاف الأخطاء
- التكامل مع الخدمات المُدارة

## 🔗 روابط مهمة

- Jaeger UI: http://localhost:16686
- OTLP Endpoint: http://localhost:4318/v1/traces
- Health Check: http://localhost:14269
