"use client";

import React, { useMemo, useState, useEffect } from "react";
import { PortalCard } from "../portal-card/PortalCard";
import { CARDS_11 } from "../carousel/cards.config";

interface PortalGridProps {
  visible: boolean;
  frameScale: number;
}

// Seeded random for consistent positioning
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

// Calculate portal positions around the frame
function calculatePortalPositions(
  frameScale: number,
  count: number,
  centerX: number,
  centerY: number
): Array<{ x: number; y: number }> {
  const positions = [];

  // Adjust radius based on frame scale
  // 0.75 → tighter circle, 0.3 → wider circle
  const baseRadius = frameScale === 0.75 ? 450 : 600;
  const radius = frameScale > 0.5 ? baseRadius : baseRadius * 1.2;

  for (let i = 0; i < count; i++) {
    // Distribute around circle with some randomness
    const angle = (Math.PI * 2 * i) / count;
    const randomOffset = (seededRandom(i) - 0.5) * 80;
    const radiusOffset = (seededRandom(i + 100) - 0.5) * 100;

    positions.push({
      x:
        centerX +
        Math.cos(angle) * (radius + radiusOffset) +
        randomOffset,
      y:
        centerY +
        Math.sin(angle) * (radius + radiusOffset) +
        randomOffset,
    });
  }

  return positions;
}

export function PortalGrid({ visible, frameScale }: PortalGridProps) {
  const [centerX, setCenterX] = useState(0);
  const [centerY, setCenterY] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  // Initialize window dimensions only on client side after mount
  useEffect(() => {
    setCenterX(window.innerWidth / 2);
    setCenterY(window.innerHeight / 2);
    setIsMounted(true);

    // Update on window resize
    const handleResize = () => {
      setCenterX(window.innerWidth / 2);
      setCenterY(window.innerHeight / 2);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const positions = useMemo(
    () => calculatePortalPositions(frameScale, CARDS_11.length, centerX, centerY),
    [frameScale, centerX, centerY]
  );

  // Don't render portal grid until mounted to avoid hydration mismatch
  if (!isMounted) {
    return (
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: -1,
        }}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: visible ? 40 : -1,
        transition: "z-index 0.3s ease-in-out",
      }}
    >
      <div className="relative w-full h-full pointer-events-auto">
        {CARDS_11.map((card, index) => (
          <PortalCard
            key={card.key}
            title={card.title}
            description={card.description}
            href={card.href}
            index={index}
            position={positions[index] || { x: 0, y: 0 }}
            visible={visible}
          />
        ))}
      </div>
    </div>
  );
}
