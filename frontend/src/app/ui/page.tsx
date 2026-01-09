"use client"

import Link from "next/link"
import { ImageWithFallback } from "@/components DONT USE THIS FLODER EVER/figma/ImageWithFallback"
import images from "@/lib/images"
import LauncherCenterCard from "@/components DONT USE THIS FLODER EVER/LauncherCenterCard"

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
  14: { route: "/editor", label: "المحرر", ready: true },
  15: { route: "/art-director", label: "مهندس الديكور", ready: true },
}

const getImage = (index: number) => {
  if (!images || images.length === 0) return "/placeholder.svg"
  return images[index % images.length]
}

export default function UILauncherPage() {
  return (
    <div
      className="fixed inset-0 bg-black text-white overflow-hidden"
      dir="rtl"
    >
      {/* Full-bleed Grid Container - no sidebar, no topbar */}
      <div className="w-full h-full p-3 md:p-4">
        <div className="grid grid-cols-4 grid-rows-4 gap-2 md:gap-3 w-full h-full">
          {Array.from({ length: 16 }, (_, i) => {
            const isCenterCell = CENTER_CELLS.includes(i)

            // Skip rendering individual cells for center area (except the first one)
            if (isCenterCell && i !== GRID_CENTER_START_INDEX) return null

            // Center 2x2 card - Hero Preview with V-Shape
            if (isCenterCell && i === GRID_CENTER_START_INDEX) {
              return (
                <div key={`grid-cell-${i}`} className="col-span-2 row-span-2">
                  <LauncherCenterCard className="h-full w-full" />
                </div>
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
                <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3 text-center">
                  <div className="text-xs md:text-sm font-bold text-white mb-0.5 drop-shadow-lg transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
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
    </div>
  )
}
