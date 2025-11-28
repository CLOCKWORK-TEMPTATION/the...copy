"use client";

import React from "react";

interface StackingFrameProps {
  scale: number; // 1.0 → 0.75 → 0.3
}

// Placeholder images with gradients
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

export function StackingFrame({ scale }: StackingFrameProps) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div
        className="relative transition-transform duration-300"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center center",
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
                transform: `rotate(${placeholder.rotation}deg) translateY(${index * -8}px)`,
                zIndex: placeholder.zIndex,
              }}
            />
          ))}
        </div>

        {/* Text Content */}
        <div className="text-center">
          <h2 className="text-6xl md:text-7xl lg:text-8xl mb-6 text-white font-bold">
            بس اصلي
          </h2>
          <p className="text-2xl md:text-3xl text-white/70">
            اهداء ليسري نصر الله
          </p>
        </div>
      </div>
    </div>
  );
}
