# دليل OpenTelemetry Distributed Tracing

<div dir="rtl">

## 📊 نظرة عامة

تم إعداد **OpenTelemetry Distributed Tracing** لتتبع العمليات عبر النظام بالكامل (Frontend + Backend). يتيح لك هذا النظام:

- **تتبع الطلبات** من المتصفح حتى قاعدة البيانات
- **قياس الأداء** وتحديد نقاط الاختناق
- **تشخيص الأخطاء** بسرعة أكبر
- **فهم تدفق البيانات** عبر الخدمات المختلفة

## 🏗️ المعمارية

```
┌─────────────┐
│   Browser   │  → Frontend Tracing (Fetch, XHR)
└──────┬──────┘
       │ HTTP Request (with trace context)
       ▼
┌─────────────┐
│   Backend   │  → Auto-instrumentation (Express, DB, Redis)
└──────┬──────┘
       │ OTLP/HTTP
       ▼
┌─────────────┐
│   Jaeger    │  → Trace Storage & UI
└─────────────┘
```

## 🚀 البدء السريع

### 1. تشغيل Jaeger

```bash
# تشغيل Jaeger عبر Docker
docker-compose -f docker-compose.tracing.yml up -d

# التحقق من تشغيل Jaeger
docker ps | grep jaeger
```

الوصول إلى واجهة Jaeger:
- **UI**: http://localhost:16686
- **Health Check**: http://localhost:14269

### 2. تفعيل Tracing في Backend

في ملف `.env`:

```env
# تفعيل Distributed Tracing
TRACING_ENABLED=true

# نقطة نهاية Jaeger
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces

# اسم الخدمة
SERVICE_NAME=theeeecopy-backend

# مستوى التسجيل (للتصحيح)
OTEL_LOG_LEVEL=info
```

ثم ابدأ Backend:

```bash
cd backend
pnpm dev
```

### 3. تفعيل Tracing في Frontend

في ملف `.env.local`:

```env
# تفعيل Browser Tracing
NEXT_PUBLIC_TRACING_ENABLED=true

# نقطة نهاية Jaeger (يجب أن تكون متاحة للمتصفح)
NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces

# اسم الخدمة
NEXT_PUBLIC_SERVICE_NAME=theeeecopy-frontend

# البيئة
NEXT_PUBLIC_ENVIRONMENT=development
```

ثم ابدأ Frontend:

```bash
cd frontend
pnpm dev
```

### 4. عرض Traces

1. افتح المتصفح على http://localhost:5000
2. قم بعمليات في التطبيق (تسجيل دخول، تحليل نص، إلخ)
3. افتح Jaeger UI: http://localhost:16686
4. اختر الخدمة `theeeecopy-backend` أو `theeeecopy-frontend`
5. انقر على "Find Traces"

## 📋 ما يتم تتبعه تلقائيًا

### Backend Auto-Instrumentation

✅ **HTTP Requests/Responses**
- جميع طلبات Express.js
- رؤوس الـ headers والاستجابات
- أكواد الحالة والأخطاء

✅ **Database Operations**
- استعلامات PostgreSQL (عبر Drizzle ORM)
- عمليات MongoDB
- مدة التنفيذ والنتائج

✅ **Redis Operations**
- عمليات GET/SET/DELETE
- مدة العمليات

✅ **External APIs**
- طلبات HTTP/HTTPS الخارجية
- استدعاءات Google Gemini AI

### Frontend Auto-Instrumentation

✅ **Fetch API**
- جميع طلبات `fetch()`
- التوقيتات والاستجابات

✅ **XMLHttpRequest**
- طلبات XHR القديمة
- التوافق مع المكتبات القديمة

## 🎯 إنشاء Spans مخصصة

### في Backend (Node.js)

```typescript
import { trace, SpanStatusCode } from '@/config/tracing';

export async function analyzeScript(scriptId: string) {
  const tracer = trace.getTracer('analysis-service');
  
  // إنشاء span رئيسي
  const span = tracer.startSpan('analyze_script', {
    attributes: {
      'script.id': scriptId,
      'operation.type': 'ai_analysis',
    },
  });

  try {
    // عملياتك هنا
    const result = await performAnalysis(scriptId);
    
    // إضافة بيانات إضافية
    span.addEvent('analysis_complete', {
      'characters.count': result.characters.length,
      'scenes.count': result.scenes.length,
    });

    // تحديد النجاح
    span.setStatus({ code: SpanStatusCode.OK });
    return result;
  } catch (error) {
    // تسجيل الخطأ
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error.message,
    });
    span.recordException(error);
    throw error;
  } finally {
    // إنهاء الـ span دائماً
    span.end();
  }
}
```

### Spans متداخلة

```typescript
import { trace, context } from '@/config/tracing';

async function processUserRequest(userId: string) {
  const tracer = trace.getTracer('user-service');
  const parentSpan = tracer.startSpan('process_request');

  try {
    // إنشاء context للـ span الحالي
    await context.with(
      trace.setSpan(context.active(), parentSpan),
      async () => {
        // Child span 1
        const dbSpan = tracer.startSpan('fetch_user_data');
        const user = await fetchUser(userId);
        dbSpan.end();

        // Child span 2
        const cacheSpan = tracer.startSpan('cache_result');
        await cacheUser(user);
        cacheSpan.end();
      }
    );

    parentSpan.setStatus({ code: SpanStatusCode.OK });
  } finally {
    parentSpan.end();
  }
}
```

### في Frontend (React)

```typescript
'use client';

import { trace, SpanStatusCode } from '@/lib/tracing';

export function useScriptAnalysis(scriptId: string) {
  const analyzeScript = async () => {
    const tracer = trace.getTracer('ui-service');
    const span = tracer.startSpan('user_analyze_script', {
      attributes: {
        'script.id': scriptId,
        'user.action': 'analyze',
      },
    });

    try {
      const response = await fetch(`/api/analyze/${scriptId}`);
      
      span.setAttributes({
        'http.status_code': response.status,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      span.setStatus({ code: SpanStatusCode.OK });
      return data;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message,
      });
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  };

  return { analyzeScript };
}
```

## 🔍 أمثلة للاستخدام

### تتبع استدعاء AI

```typescript
import { trace, SpanStatusCode } from '@/config/tracing';

export async function callGeminiAI(prompt: string) {
  const tracer = trace.getTracer('ai-service');
  
  const span = tracer.startSpan('gemini.generate_content', {
    attributes: {
      'ai.model': 'gemini-pro',
      'prompt.length': prompt.length,
    },
  });

  try {
    const response = await genAI.generateContent(prompt);
    
    span.addEvent('ai_response_received', {
      'response.length': response.text.length,
      'tokens.consumed': response.usageMetadata?.totalTokens || 0,
    });

    span.setStatus({ code: SpanStatusCode.OK });
    return response;
  } catch (error) {
    span.recordException(error);
    throw error;
  } finally {
    span.end();
  }
}
```

### تتبع BullMQ Jobs

```typescript
import { trace, SpanStatusCode } from '@/config/tracing';

export class AnalysisWorker {
  async process(job: Job) {
    const tracer = trace.getTracer('queue-worker');
    
    const span = tracer.startSpan('job.process_analysis', {
      attributes: {
        'job.id': job.id,
        'job.type': job.name,
        'job.attempt': job.attemptsMade,
      },
    });

    try {
      span.addEvent('job_started');
      
      const result = await this.performAnalysis(job.data);
      
      span.addEvent('job_completed', {
        'processing.duration_ms': span.duration,
      });

      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setAttributes({
        'job.failed': true,
        'error.type': error.constructor.name,
      });
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  }
}
```

## 🎨 أفضل الممارسات

### 1. تسمية Spans

✅ **جيد:**
```typescript
tracer.startSpan('db.query.get_user_by_id');
tracer.startSpan('ai.gemini.analyze_script');
tracer.startSpan('cache.redis.set_user_session');
```

❌ **سيء:**
```typescript
tracer.startSpan('doSomething');
tracer.startSpan('process');
tracer.startSpan('func1');
```

### 2. إضافة Attributes المفيدة

```typescript
span.setAttributes({
  // معرفات الموارد
  'user.id': userId,
  'script.id': scriptId,
  
  // معلومات العملية
  'operation.type': 'analysis',
  'db.system': 'postgresql',
  
  // مقاييس الأداء
  'query.duration_ms': 150,
  'result.count': 10,
  
  // سياق إضافي
  'environment': process.env.NODE_ENV,
});
```

### 3. استخدام Events

```typescript
span.addEvent('cache_miss', {
  'cache.key': cacheKey,
});

span.addEvent('rate_limit_exceeded', {
  'user.id': userId,
  'limit': 100,
});

span.addEvent('ai_fallback_used', {
  'primary.model': 'gemini-pro',
  'fallback.model': 'gemini-pro-vision',
});
```

### 4. معالجة الأخطاء

```typescript
try {
  // عملياتك
} catch (error) {
  // سجل الخطأ في الـ span
  span.recordException(error);
  
  // حدد حالة الخطأ
  span.setStatus({
    code: SpanStatusCode.ERROR,
    message: error.message,
  });
  
  // أضف سياق إضافي
  span.setAttributes({
    'error.type': error.constructor.name,
    'error.handled': true,
  });
  
  throw error;
} finally {
  // أنهِ الـ span دائماً
  span.end();
}
```

## ⚙️ التكوين المتقدم

### استخدام Elasticsearch للتخزين الدائم

في `docker-compose.tracing.yml`، قم بإلغاء التعليق على قسم Elasticsearch:

```yaml
services:
  elasticsearch:
    # ... (تكوين Elasticsearch)
  
  jaeger-with-storage:
    # ... (تكوين Jaeger مع Elasticsearch)
```

ثم:

```bash
docker-compose -f docker-compose.tracing.yml up -d
```

### ربط مع خدمة مُدارة

لاستخدام خدمة مثل **Honeycomb** أو **Lightstep**:

```env
# Backend
TRACING_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=https://api.honeycomb.io/v1/traces
OTEL_AUTH_TOKEN=your-api-key

# Frontend
NEXT_PUBLIC_TRACING_ENABLED=true
NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT=https://api.honeycomb.io/v1/traces
NEXT_PUBLIC_OTEL_AUTH_TOKEN=your-api-key
```

عدّل ملف [backend/src/config/tracing.ts](../backend/src/config/tracing.ts):

```typescript
const traceExporter = new OTLPTraceExporter({
  url: OTEL_EXPORTER_OTLP_ENDPOINT,
  headers: {
    'x-honeycomb-team': process.env.OTEL_AUTH_TOKEN || '',
  },
});
```

## 🐛 استكشاف الأخطاء

### لا تظهر Traces في Jaeger

1. **تحقق من تشغيل Jaeger:**
   ```bash
   curl http://localhost:14269/
   ```

2. **تحقق من إرسال Traces:**
   ```bash
   # في Backend
   OTEL_LOG_LEVEL=debug pnpm dev
   ```

3. **تحقق من متغيرات البيئة:**
   ```bash
   # Backend
   echo $TRACING_ENABLED
   echo $OTEL_EXPORTER_OTLP_ENDPOINT
   ```

### CORS Errors في Frontend

إذا كانت المتصفح يحظر طلبات OTLP:

**الخيار 1: استخدام Proxy Backend**

أنشئ endpoint في Backend:

```typescript
app.post('/api/traces', async (req, res) => {
  const response = await fetch('http://localhost:4318/v1/traces', {
    method: 'POST',
    headers: req.headers,
    body: JSON.stringify(req.body),
  });
  res.status(response.status).send(await response.text());
});
```

ثم عدّل Frontend:

```env
NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:3001/api/traces
```

**الخيار 2: تعطيل Browser Tracing في Development**

```env
NEXT_PUBLIC_TRACING_ENABLED=false
```

### أداء بطيء

إذا كان Tracing يسبب بطء:

1. **قلل عدد Spans:**
   - تجنب إنشاء spans لعمليات صغيرة جداً
   - استخدم sampling

2. **عدّل Batch Size:**
   ```typescript
   import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
   
   provider.addSpanProcessor(new BatchSpanProcessor(exporter, {
     maxQueueSize: 100,
     maxExportBatchSize: 10,
     scheduledDelayMillis: 500,
   }));
   ```

## 📚 موارد إضافية

- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [Jaeger Documentation](https://www.jaegertracing.io/docs/)
- [OpenTelemetry Best Practices](https://opentelemetry.io/docs/concepts/signals/traces/)
- [Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/)

## 📝 الملفات المرجعية

- Backend Configuration: [backend/src/config/tracing.ts](../backend/src/config/tracing.ts)
- Frontend Configuration: [frontend/src/lib/tracing.ts](../frontend/src/lib/tracing.ts)
- Usage Examples: [backend/src/examples/tracing-examples.ts](../backend/src/examples/tracing-examples.ts)
- Docker Compose: [docker-compose.tracing.yml](../docker-compose.tracing.yml)

</div>
