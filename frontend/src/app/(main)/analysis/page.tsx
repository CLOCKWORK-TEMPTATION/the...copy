"use client";

import dynamic from "next/dynamic";

const V0Component = dynamic(() => import("@/components DONT USE THIS FLODER EVER/v0-component"), {
  ssr: false,
});

const SevenStations = dynamic(() => import("./seven-stations"), {
  loading: () => (
    <div className="container mx-auto max-w-6xl p-6 space-y-6">
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل المحطات السبع...</p>
        </div>
      </div>
    </div>
  ),
  ssr: false,
});

export default function AnalysisPage() {
  return (
    <div>
      <V0Component />
      <SevenStations />
    </div>
  );
}
