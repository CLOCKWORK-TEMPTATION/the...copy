"use client"

import { useRouter } from "next/navigation"
import { ImageWithFallback } from "@/components/figma/ImageWithFallback"
import images from "@/lib/images"

interface LauncherCenterCardProps {
  className?: string
}

// V-Shape card positions matching the hero layout feel
const CARD_POSITIONS = [
  // Left side (ascending)
  { left: "15%", top: "35%", width: 52, rotation: -12, zIndex: 1 },
  { left: "24%", top: "45%", width: 56, rotation: -8, zIndex: 2 },
  { left: "34%", top: "55%", width: 60, rotation: -4, zIndex: 3 },
  // Center (front/bottom - largest)
  { left: "50%", top: "62%", width: 72, rotation: 0, zIndex: 5 },
  // Right side (ascending)
  { left: "66%", top: "55%", width: 60, rotation: 4, zIndex: 3 },
  { left: "76%", top: "45%", width: 56, rotation: 8, zIndex: 2 },
  { left: "85%", top: "35%", width: 52, rotation: 12, zIndex: 1 },
]

export default function LauncherCenterCard({ className }: LauncherCenterCardProps) {
  const router = useRouter()

  // Use the first 7 images (V-shape images from hero)
  const heroImages = images.slice(0, 7)

  const handleClick = () => {
    router.push("/editor")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label="افتح محرر النسخة"
      className={`
        relative w-full h-full overflow-hidden rounded-2xl
        border border-white/15 bg-black
        outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black
        transition-all duration-300 hover:scale-[1.01] hover:border-[#FFD700]/40
        cursor-pointer group
        ${className ?? ""}
      `}
    >
      {/* Background vignette effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),rgba(0,0,0,0.95)_70%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/90" />

      {/* Content container */}
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-4 text-center">
        {/* Title section */}
        <div className="mb-2 md:mb-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-white drop-shadow-[0_8px_20px_rgba(0,0,0,0.7)]">
            النسخة
          </h2>
          <p className="mt-1 md:mt-2 text-sm md:text-base lg:text-lg text-white/70 font-medium">
            بس اصلي
          </p>
        </div>

        {/* V-Shape cards scene */}
        <div className="relative w-full max-w-[400px] h-[120px] sm:h-[150px] md:h-[180px] lg:h-[200px] mt-2 md:mt-4">
          {heroImages.map((src, i) => {
            const pos = CARD_POSITIONS[i]
            if (!pos) return null

            // Responsive width multiplier
            const baseWidth = pos.width

            return (
              <div
                key={`v-card-${i}`}
                className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 group-hover:scale-105"
                style={{
                  left: pos.left,
                  top: pos.top,
                  width: `${baseWidth}px`,
                  transform: `translate(-50%, -50%) rotate(${pos.rotation}deg)`,
                  zIndex: pos.zIndex,
                }}
              >
                <div className="relative overflow-hidden rounded-lg shadow-xl">
                  {/* Golden glow ring */}
                  <div className="absolute inset-0 rounded-lg ring-1 ring-[#FFD700]/60 shadow-[0_0_12px_rgba(255,215,0,0.3)]" />
                  <ImageWithFallback
                    src={src}
                    alt=""
                    className="w-full aspect-[3/4] object-cover rounded-lg"
                  />
                  {/* Subtle overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-lg" />
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA Button (visual only - not a real button to avoid nested interactive) */}
        <div className="mt-4 md:mt-6">
          <span className="inline-flex items-center justify-center rounded-full border border-[#FFD700]/40 bg-white/10 hover:bg-white/15 px-5 py-2.5 md:px-6 md:py-3 text-sm md:text-base font-semibold text-white shadow-[0_8px_20px_rgba(0,0,0,0.5)] transition-colors duration-200 group-hover:border-[#FFD700]/60 group-hover:shadow-[0_8px_25px_rgba(255,215,0,0.15)]">
            افتح المحرر
          </span>
        </div>

        {/* Hint text */}
        <p className="mt-2 md:mt-3 text-[10px] md:text-xs text-white/40">
          اضغط للدخول مباشرة
        </p>
      </div>

      {/* Hover glow overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700]/5 via-transparent to-[#FFD700]/5" />
      </div>
    </button>
  )
}
