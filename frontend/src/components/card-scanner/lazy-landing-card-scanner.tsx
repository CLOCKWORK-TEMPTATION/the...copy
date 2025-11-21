"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Lazy load the optimized LandingCardScanner component
const LandingCardScanner = dynamic(
  () =>
    import("./optimized-landing-card-scanner").then((mod) => ({
      default: mod.OptimizedLandingCardScanner,
    })),
  {
    ssr: false, // Disable SSR for Three.js components
    loading: () => (
      <div
        className="card-scanner-container"
        style={{
          position: "relative",
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000000",
        }}
      >
        <div
          style={{
            color: "rgba(255, 255, 255, 0.6)",
            fontSize: "14px",
            textAlign: "center",
          }}
        >
          جاري التحميل...
        </div>
      </div>
    ),
  }
);

export function LazyLandingCardScanner() {
  return (
    <Suspense
      fallback={
        <div
          className="card-scanner-container"
          style={{
            position: "relative",
            width: "100vw",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#000000",
          }}
        >
          <div
            style={{
              color: "rgba(255, 255, 255, 0.6)",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            جاري التحميل...
          </div>
        </div>
      }
    >
      <LandingCardScanner />
    </Suspense>
  );
}
