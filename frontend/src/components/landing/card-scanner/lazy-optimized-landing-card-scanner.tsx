"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Enhanced loading component with better visual feedback
const LoadingComponent = () => (
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
      flexDirection: "column",
      gap: "20px",
    }}
  >
    {/* Animated loading bar */}
    <div
      style={{
        width: "200px",
        height: "4px",
        background: "rgba(255, 255, 255, 0.1)",
        borderRadius: "2px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "40%",
          height: "100%",
          background:
            "linear-gradient(90deg, transparent, rgba(135, 206, 250, 0.8), transparent)",
          animation: "loading 2s infinite ease-in-out",
        }}
      />

    <div
      style={{
        color: "rgba(255, 255, 255, 0.6)",
        fontSize: "14px",
        textAlign: "center",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      جاري تحميل الكروت...
    </div>

    <style jsx>{`
      @keyframes loading {
        0% {
          transform: translateX(-100%);
        }
        100% {
          transform: translateX(500%);
        }
      }
    `}</style>
  </div>
);

// Lazy load the optimized component
const OptimizedLandingCardScanner = dynamic(
  () =>
    import("./optimized-landing-card-scanner").then((mod) => ({
      default: mod.OptimizedLandingCardScanner,
    })),
  {
    ssr: false,
    loading: LoadingComponent,
  }
);

export function LazyOptimizedLandingCardScanner() {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <OptimizedLandingCardScanner />
    </Suspense>
  );
}
