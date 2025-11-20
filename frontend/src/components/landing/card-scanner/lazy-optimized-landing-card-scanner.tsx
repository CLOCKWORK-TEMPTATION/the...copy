"use client";

import { Suspense, lazy } from "react";

// Lazy load the heavy scanner component
const OptimizedCardScanner = lazy(() =>
  import("./optimized-card-scanner").then((module) => ({
    default: module.OptimizedCardScanner,
  }))
);

// Lightweight loading component
function ScannerSkeleton() {
  return (
    <div
      className="card-scanner-skeleton"
      style={{
        position: "relative",
        width: "100%",
        height: "300px",
        background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
        border: "1px solid rgba(0, 255, 136, 0.2)",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Animated loading bars */}
      <div className="flex gap-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            style={{
              width: "60px",
              height: "80px",
              background: "rgba(0, 255, 136, 0.1)",
              borderRadius: "8px",
              animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* Scanner line animation */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          width: "2px",
          height: "100%",
          background:
            "linear-gradient(to bottom, transparent, #00ff88, transparent)",
          transform: "translateX(-50%)",
          animation: "glow 2s ease-in-out infinite alternate",
        }}
      />

      <style jsx>{`
        @keyframes pulse {
          0% {
            opacity: 0.3;
            transform: scaleY(0.8);
          }
          100% {
            opacity: 0.7;
            transform: scaleY(1.2);
          }
        }

        @keyframes glow {
          0% {
            box-shadow: 0 0 5px #00ff88;
            opacity: 0.5;
          }
          100% {
            box-shadow: 0 0 20px #00ff88;
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export function LazyOptimizedLandingCardScanner() {
  return (
    <Suspense fallback={<ScannerSkeleton />}>
      <OptimizedCardScanner />
    </Suspense>
  );
}
