"use client";

import dynamic from "next/dynamic";

const CineAIStudio = dynamic(
  () =>
    import("./components/CineAIStudio").then((mod) => ({
      default: mod.CineAIStudio,
    })),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">جاري تحميل استوديو السينما...</p>
        </div>
      </div>
    ),
    ssr: false,
  }
);

export default function CinematographyStudioPage() {
  return <CineAIStudio />;
}
