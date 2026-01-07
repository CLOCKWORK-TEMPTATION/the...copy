"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"

/**
 * LauncherCenterCard Component
 * Central hero card for the UI launcher grid
 * Features V-shape animation with GSAP
 */
interface LauncherCenterCardProps {
  className?: string
}

export default function LauncherCenterCard({ className = "" }: LauncherCenterCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!cardRef.current) return

    // Animate card entrance
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

    tl.fromTo(
      cardRef.current,
      { scale: 0.8, opacity: 0, rotation: -5 },
      { scale: 1, opacity: 1, rotation: 0, duration: 0.8 }
    )
      .fromTo(
        textRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        "-=0.4"
      )

    return () => {
      tl.kill()
    }
  }, [])

  return (
    <div
      ref={cardRef}
      className={`relative rounded-lg overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] border-2 border-[#FFD700]/30 ${className}`}
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/10 to-transparent" />

      {/* V-Shape decoration */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 400 400"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="vGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M 0 0 L 200 200 L 400 0 Z"
          fill="url(#vGradient)"
          className="animate-pulse"
        />
      </svg>

      {/* Content */}
      <div
        ref={textRef}
        className="relative z-10 flex flex-col items-center justify-center h-full p-6 text-center"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: "Cairo, sans-serif" }}>
          النسخة
        </h1>
        <p className="text-lg text-[#FFD700] mb-4" style={{ fontFamily: "Cairo, sans-serif" }}>
          منصة الإبداع السينمائي
        </p>
        <div className="w-16 h-1 bg-[#FFD700] rounded-full" />
      </div>

      {/* Corner accents */}
      <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-[#FFD700]/50 rounded-tr-lg" />
      <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-[#FFD700]/50 rounded-bl-lg" />
    </div>
  )
}
