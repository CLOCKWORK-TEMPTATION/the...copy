"use client";

import { lazy, Suspense } from "react";

const SevenStationsComponent = lazy(() => import("./seven-stations-component"));

export default function SevenStationsPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto max-w-6xl p-6 space-y-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                جاري تحميل واجهة المحطات السبع...
              </p>
            </div>
          </div>
        </div>
      }
    >
      <SevenStationsComponent />
    </Suspense>
  );
}
