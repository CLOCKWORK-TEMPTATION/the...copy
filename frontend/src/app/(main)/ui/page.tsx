"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ImageWithFallback } from "@/components/figma/ImageWithFallback"
import images from "@/lib/images"
import { heroConfig, type ResponsiveConfig } from "@/lib/hero-config"

// Grid configuration
const CENTER_CELLS = [5, 6, 9, 10]
const GRID_CENTER_START_INDEX = 5

// Mapping for the 12 surrounding grid cells (indices 0-15, excluding 5, 6, 9, 10)
const APP_MAPPING: Record<number, { route: string; label: string; ready: boolean }> = {
  0: { route: "/directors-studio", label: "رؤية المخرج", ready: true },
  1: { route: "/cinematography-studio", label: "التصوير السينمائي", ready: true },
  2: { route: "/arabic-creative-writing-studio", label: "الكتابة الإبداعية", ready: true },
  3: { route: "/arabic-prompt-engineering-studio", label: "هندسة التلقين", ready: true },
  4: { route: "/actorai-arabic", label: "الممثل الذكي", ready: true },
  7: { route: "/breakdown", label: "تحليل المشهد", ready: true },
  8: { route: "/brain-storm-ai", label: "العصف الذهني", ready: true },
  11: { route: "/metrics-dashboard", label: "لوحة التحليلات", ready: true },
  12: { route: "/analysis", label: "التحليل الدرامي", ready: true },
  13: { route: "/new", label: "مشروع جديد", ready: true },
  14: { route: "/brainstorm", label: "منصة Jules", ready: true },
  15: { route: "/development", label: "التطوير", ready: true },
}

// V-Shape images (first 7 from images array)
const V_SHAPE_IMAGES = images.slice(0, 7)

const getImage = (index: number) => {
  if (!images || images.length === 0) return "/placeholder.svg"
  return images[index % images.length]
}

// Mini V-Shape component for the center card
const MiniVShape = ({ responsiveValues }: { responsiveValues: ResponsiveConfig }) => {
  // Scale down the positions to fit inside the center card
  const scale = 0.35

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <div className="relative w-full h-full">
        {responsiveValues.cardPositions.map((pos, i) => {
          if (i >= V_SHAPE_IMAGES.length) return null

          const centerIndex = Math.floor(responsiveValues.cardPositions.length / 2)
          const distanceFromCenter = Math.abs(i - centerIndex)
          const zIndex = 10 - distanceFromCenter

          // Parse position percentages and center them
          const left = parseFloat(pos.left.replace("%", ""))
          const top = parseFloat(pos.top.replace("%", ""))

          return (
            <div
              key={`mini-v-card-${i}`}
              className="absolute origin-center transition-transform duration-300 hover:scale-105"
              style={{
                width: `${responsiveValues.cardWidth * scale}px`,
                height: `${responsiveValues.cardHeight * scale}px`,
                left: `${left}%`,
                top: `${top}%`,
                transform: `translate(-50%, -50%) rotate(${pos.rotation}deg)`,
                zIndex,
              }}
            >
              <div className="w-full h-full rounded-lg overflow-hidden shadow-lg border border-white/10">
                <ImageWithFallback
                  src={V_SHAPE_IMAGES[i]}
                  alt={`Scene ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function UILauncherPage() {
  const [responsiveValues, setResponsiveValues] = useState<ResponsiveConfig | null>(null)

  useEffect(() => {
    const handleResize = () => {
      setResponsiveValues(heroConfig.getResponsiveValues(window.innerWidth))
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  if (!responsiveValues) {
    return <div className="min-h-screen bg-black" />
  }

  return (
    <div
      className="min-h-screen bg-black text-white p-4 md:p-8"
      dir="rtl"
    >
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 h-20 flex justify-center items-center bg-black/95 backdrop-blur-md border-b border-white/5">
        <Link href="/" className="font-bold tracking-[0.25em] text-xl text-white/90 font-sans uppercase hover:text-white transition-colors">
          النسخة
        </Link>
      </div>

      {/* Main Grid Container */}
      <div className="pt-24 pb-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-4 grid-rows-4 gap-2 md:gap-4 w-full aspect-square max-h-[calc(100vh-10rem)]">
          {Array.from({ length: 16 }, (_, i) => {
            const isCenterCell = CENTER_CELLS.includes(i)

            // Skip rendering individual cells for center area (except the first one)
            if (isCenterCell && i !== GRID_CENTER_START_INDEX) return null

            // Center 2x2 card - links to /editor
            if (isCenterCell && i === GRID_CENTER_START_INDEX) {
              return (
                <Link
                  key={`grid-cell-${i}`}
                  href="/editor"
                  className="col-span-2 row-span-2 relative rounded-xl overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black border border-white/20 hover:border-[#FFD700]/50 transition-all duration-300 group"
                  aria-label="فتح محرر النسخة"
                >
                  {/* Mini V-Shape Background */}
                  <MiniVShape responsiveValues={responsiveValues} />

                  {/* Dark overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />

                  {/* Content */}
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-4">
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter text-white drop-shadow-2xl mb-2">
                      النسخة
                    </h1>
                    <p className="text-sm md:text-base lg:text-lg text-white/80 font-medium">
                      بس اصلي
                    </p>
                    <div className="mt-4 text-xs md:text-sm text-[#FFD700] opacity-0 group-hover:opacity-100 transition-opacity duration-300 uppercase tracking-widest">
                      افتح المحرر
                    </div>
                  </div>

                  {/* Hover glow effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700]/5 via-transparent to-[#FFD700]/5" />
                  </div>
                </Link>
              )
            }

            // Surrounding cells - app cards
            const appData = APP_MAPPING[i]

            if (!appData) {
              // Empty cell (shouldn't happen with current mapping)
              return (
                <div
                  key={`grid-cell-${i}`}
                  className="relative rounded-lg overflow-hidden bg-white/5 border border-white/10"
                />
              )
            }

            // Disabled card (not ready)
            if (!appData.ready) {
              return (
                <div
                  key={`grid-cell-${i}`}
                  className="relative rounded-lg overflow-hidden bg-white/5 border border-white/10 cursor-not-allowed"
                  aria-disabled="true"
                >
                  <ImageWithFallback
                    src={getImage(i + 7)}
                    alt={appData.label}
                    className="w-full h-full object-cover opacity-30"
                  />
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <span className="text-white/50 text-sm font-medium">قريبًا</span>
                  </div>
                </div>
              )
            }

            // Active app card
            return (
              <Link
                key={`grid-cell-${i}`}
                href={appData.route}
                className="group relative rounded-lg overflow-hidden bg-white/5 border border-white/10 hover:border-[#FFD700]/50 transition-all duration-300"
                aria-label={appData.label}
              >
                <ImageWithFallback
                  src={getImage(i + 7)}
                  alt={appData.label}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300" />

                {/* Active Border Effect on Hover */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#FFD700]/50 transition-colors duration-300 rounded-lg" />

                {/* Label */}
                <div className="absolute bottom-0 left-0 right-0 p-2 md:p-4 text-center">
                  <div className="text-xs md:text-sm font-bold text-white mb-1 drop-shadow-lg transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                    {appData.label}
                  </div>
                  <div className="text-[8px] md:text-xs text-[#FFD700] opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 uppercase tracking-widest font-medium">
                    فتح التطبيق
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Footer hint */}
      <div className="fixed bottom-4 left-0 right-0 text-center">
        <p className="text-xs text-white/40">
          اضغط على أي كارت لفتح التطبيق
        </p>
      </div>
    </div>
  )
}
