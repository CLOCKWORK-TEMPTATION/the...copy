"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface PortalCardProps {
  title: string;
  description: string;
  href: string;
  index: number;
  position: { x: number; y: number };
  visible: boolean;
}

export function PortalCard({
  title,
  description,
  href,
  index,
  position,
  visible,
}: PortalCardProps) {
  return (
    <Link
      href={href}
      className="absolute group"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translate(-50%, -50%)",
        opacity: visible ? 1 : 0,
        transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s`,
      }}
    >
      <div className="w-64 h-48 bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:border-white/30 hover:scale-105 transition-all duration-300 shadow-2xl">
        <div className="flex flex-col h-full justify-between">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-white/60 line-clamp-2">{description}</p>
          </div>

          <div className="flex items-center text-white/80 group-hover:text-white transition-colors">
            <span className="text-sm ml-2">استكشف</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}
