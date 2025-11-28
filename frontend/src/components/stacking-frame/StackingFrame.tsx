"use client";

import React, { forwardRef } from "react";

interface StackingFrameProps {
  scale: number;
}

const placeholders = [
  {
    bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    rotation: -5,
    zIndex: 1,
  },
  {
    bg: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    rotation: 3,
    zIndex: 2,
  },
  {
    bg: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    rotation: -2,
    zIndex: 3,
  },
];

export const StackingFrame = forwardRef<HTMLDivElement, StackingFrameProps>(
  ({ scale }, ref) => {
    // Apply grayscale and stroke effects when scale is reduced (Branding Phase)
    const isBrandingPhase = scale < 0.4;

    return (
      <div
        ref={ref}
        className="w-full h-full flex items-center justify-center"
        style={{
          opacity: scale === 0 ? 0 : 1,
          pointerEvents: scale === 0 ? "none" : "auto",
          transition: "opacity 0.3s ease-in-out",
        }}
      >
        <div
          className="relative transition-all duration-300"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "center center",
            filter: isBrandingPhase ? "grayscale(100%)" : "none",
            boxShadow: isBrandingPhase
              ? "0 0 0 3px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.2)"
              : "none",
            transitionProperty: "filter, box-shadow",
          }}
        >
          {/* Stacked Images Container */}
          <div className="relative w-[600px] h-[400px] mb-12">
            {placeholders.map((placeholder, index) => (
              <div
                key={index}
                className="absolute inset-0 rounded-2xl shadow-2xl"
                style={{
                  background: placeholder.bg,
                  transform: `rotate(${placeholder.rotation}deg) translateY(${
                    index * -8
                  }px)`,
                  zIndex: placeholder.zIndex,
                }}
              />
            ))}
          </div>

          {/* Text Content */}
          <div className="text-center">
            <h2 className="text-6xl md:text-7xl lg:text-8xl mb-6 text-white font-bold"
              style={{
                fontFamily:
                  "'Tajawal', 'Cairo', 'Noto Kufi Arabic', 'system-ui', '-apple-system', 'Segoe UI', 'Arial Black', sans-serif",
                letterSpacing: "-0.08em",
                fontWeight: 900,
              }}
            >
              بس اصلي
            </h2>
            <p className="text-2xl md:text-3xl text-white/70"
              style={{
                fontFamily:
                  "'Tajawal', 'Cairo', 'Noto Kufi Arabic', 'system-ui', '-apple-system', 'Segoe UI', sans-serif",
              }}
            >
              اهداء ليسري نصر الله
            </p>
          </div>
        </div>
      </div>
    );
  }
);

StackingFrame.displayName = "StackingFrame";
