import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const isDevelopment = process.env.NODE_ENV === "development";

if (dsn) {
    Sentry.init({
        dsn,

        // ضبط معدل العينات في الإنتاج أو استخدام tracesSampler للتحكم الدقيق
        tracesSampleRate: isDevelopment ? 1.0 : 0.1,

        // تفعيل وضع التصحيح في التطوير لطباعة معلومات مفيدة
        debug: isDevelopment,
    });
}
