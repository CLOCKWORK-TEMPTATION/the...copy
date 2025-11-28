"use client";

import React, { useMemo } from "react";
import { PortalCard } from "./PortalCard";
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
  count: number
): Array<{ x: number; y: number }> {
  if (typeof window === "undefined") {
    return Array(count).fill({ x: 0, y: 0 });
  }

  const positions = [];
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

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
      x: centerX + Math.cos(angle) * (radius + radiusOffset) + randomOffset,
      y: centerY + Math.sin(angle) * (radius + radiusOffset) + randomOffset,
    });
  }

  return positions;
}

export function PortalGrid({ visible, frameScale }: PortalGridProps) {
  const positions = useMemo(
    () => calculatePortalPositions(frameScale, CARDS_11.length),
    [frameScale]
  );

  return (
    <div className="fixed inset-0 pointer-events-none">
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
