// Sentry Client Configuration
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const isDevelopment = process.env.NODE_ENV === "development";

// تعطيل Sentry تماماً في Development
if (isDevelopment) {
  console.log("[Sentry] Disabled in development mode (client)");
} else if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || "development",

    // Performance Monitoring
    tracesSampleRate: isDevelopment ? 1.0 : 0.1,

    // Debug mode for development
    debug: isDevelopment,

    // Basic error filtering
    beforeSend(event, hint) {
      // Don't send cancelled requests
      if (event.exception?.values?.[0]?.value?.includes("cancelled")) {
        return null;
      }

      if (isDevelopment) {
        console.log(
          "[Sentry] Event captured:",
          event.message || event.exception?.values?.[0]?.value
        );
      }

      return event;
    },

    // Enhanced context for navigation
    beforeBreadcrumb(breadcrumb, hint) {
      if (breadcrumb.category === "navigation") {
        breadcrumb.data = {
          ...breadcrumb.data,
          timestamp: new Date().toISOString(),
        };
      }
      return breadcrumb;
    },
  });

  console.log(
    `[Sentry] Initialized for ${isDevelopment ? "development" : "production"}`
  );
} else {
  console.warn("[Sentry] DSN not configured, monitoring disabled");
}
