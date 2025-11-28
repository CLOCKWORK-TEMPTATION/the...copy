"use client";

import React from "react";
import Link from "next/link";

interface PortalCardProps {
  title: string;
  description: string;
  href: string;
  index: number;
  position: { x: number; y: number };
  visible: boolean;
}

const cardGradients = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
  "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
  "linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)",
  "linear-gradient(135deg, #2e2e78 0%, #662d91 100%)",
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
];

export function PortalCard({
  title,
  description,
  href,
  index,
  position,
  visible,
}: PortalCardProps) {
  const gradient = cardGradients[index % cardGradients.length];
  const staggerDelay = index * 0.05;

  return (
    <Link href={href}>
      <div
        className="absolute w-48 h-48 rounded-xl shadow-2xl cursor-pointer transition-all duration-500 hover:scale-110 hover:shadow-2xl"
        style={{
          background: gradient,
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: `translate(-50%, -50%) ${
            visible ? "scale(1)" : "scale(0.5)"
          }`,
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? "auto" : "none",
          transitionDelay: `${staggerDelay}s`,
          transitionProperty: "opacity, transform",
        }}
      >
        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
          <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
          <p className="text-sm text-white/70">{description}</p>
        </div>
      </div>
    </Link>
  );
}
