"use client"

import { useRef } from "react"
import Link from "next/link"
import { VideoTextMask } from "./VideoTextMask"
import { useHeroAnimation } from "@/hooks/use-hero-animation"
import { ImageWithFallback } from "./figma/ImageWithFallback"
import images from "@/lib/images"

const CENTER_CELLS = [5, 6, 9, 10]

const GRID_SIZE = 16
const GRID_CENTER_START_INDEX = 5

// Mapping for the 12 surrounding grid cells
// Indices: 0-15, excluding 5, 6, 9, 10
const APP_MAPPING: Record<number, { route: string; label: string }> = {
  0: { route: "/directors-studio", label: "رؤية المخرج" },
  1: { route: "/cinematography-studio", label: "التصوير السينمائي" },
  2: { route: "/arabic-creative-writing-studio", label: "الكتابة الإبداعية" },
  3: { route: "/arabic-prompt-engineering-studio", label: "هندسة التلقين" },
  4: { route: "/actorai-arabic", label: "الممثل الذكي" },
  7: { route: "/breakdown", label: "تحليل المشهد" },
  8: { route: "/brain-storm-ai", label: "العصف الذهني" },
  11: { route: "/metrics-dashboard", label: "لوحة التحليلات" },
  12: { route: "/analysis", label: "التحليل الدرامي" },
  13: { route: "/new", label: "مشروع جديد" },
  // Reserves
  14: { route: "#", label: "قريباً" },
  15: { route: "#", label: "قريباً" },
}

export const HeroAnimation = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  const { responsiveValues } = useHeroAnimation(containerRef, triggerRef)

  if (!responsiveValues) return <div className="min-h-screen bg-black" />

  const getImage = (index: number) => {
    if (!images || images.length === 0) return "/placeholder.svg"
    return images[index % images.length]
  }

  return (
    <div
      ref={containerRef}
      className="hero-animation-root bg-black text-white relative overflow-hidden"
      dir="rtl"
    >
      {/* HEADER: STRICTLY "النسخة" CENTERED ONLY - INITIALLY HIDDEN */}
      <div className="fixed top-0 left-0 right-0 z-[9998] h-24 flex justify-center items-center pointer-events-none shadow-[0_4px_20px_rgba(0,0,0,0.9)] bg-black/95 backdrop-blur-md border-b border-white/5 opacity-0 fixed-header">
        <span className="font-bold tracking-[0.25em] text-[22px] text-white/90 font-sans uppercase">النسخة</span>
      </div>

      <div className="scene-container fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none">

        {/* Phase 7: 4x4 Grid Layout (16 cells total) */}
        {/* Initially invisible and non-interactive */}
        <div className="portfolio-grid-4x4 absolute inset-0 w-full h-full opacity-0 pointer-events-none p-4">
          <div className="grid grid-cols-4 grid-rows-4 gap-2 md:gap-4 w-full h-full">
            {/* Generate 16 grid cells */}
            {Array.from({ length: GRID_SIZE }, (_, i) => {
              // Center 4 cells (indices 5,6,9,10) for unified entity
              const isCenterCell = CENTER_CELLS.includes(i)
              // Skip rendering individual cells for center area
              if (isCenterCell && i !== GRID_CENTER_START_INDEX) return null

              const appData = APP_MAPPING[i];

              return (
                <div
                  key={`grid-cell-${i}`}
                  className={`grid-cell relative rounded-lg overflow-hidden ${isCenterCell
                    ? 'col-span-2 row-span-2 unified-entity-grid-container'
                    : 'portfolio-item-container opacity-0 transform-gpu' // added transform-gpu
                    }`}
                  style={{
                    backgroundColor: isCenterCell ? 'transparent' : 'rgba(255,255,255,0.05)',
                    border: isCenterCell ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {isCenterCell ? (
                    // Center area - clean space for unified entity (no text artifacts)
                    <div className="unified-entity-placeholder w-full h-full" />
                  ) : (
                    // Portfolio items for surrounding cells
                    <Link
                      href={appData?.route || "#"}
                      className="group block w-full h-full relative cursor-pointer pointer-events-auto"
                      aria-label={appData?.label || `Design ${i + 1}`}
                    >
                      <ImageWithFallback
                        src={getImage(i)}
                        alt={appData?.label || `Portfolio Design ${i + 1}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300" />

                      {/* Active Border Effect on Hover */}
                      <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#FFD700]/50 transition-colors duration-300 rounded-lg" />

                      <div className="absolute bottom-4 left-0 right-0 p-4 text-center">
                        <div className="text-sm md:text-base font-bold text-white mb-1 drop-shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                          {appData?.label}
                        </div>
                        {appData?.route !== "#" && (
                          <div className="text-[10px] md:text-xs text-[#FFD700] opacity-0 group-hover:opacity-100 transition-opacity duration-300 uppercase tracking-widest font-medium">
                            فتح التطبيق
                          </div>
                        )}
                      </div>
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Original Unified Entity - Will be positioned in center during Phase 7 */}
        {/* Initially non-interactive (pointer-events-none applied via class in GSAP usually, but we set it here) */}
        {/* We wrap the content in Link and control pointer-events via CSS/GSAP */}
        <div className="frozen-container relative w-full h-full flex items-center justify-center origin-center pointer-events-none">
          {/* Changed to Link for the center interaction */}
          <Link
            href="/editor"
            className="unified-entity relative w-full h-full flex items-center justify-center block"
            // pointer-events will be enabled by GSAP at the end
            id="center-unified-entity"
          >
            {/* V-Shape Container */}
            <div className="v-shape-container absolute top-0 left-0 w-full h-full m-0 p-0">
              <div className="v-shape-cards-layer absolute inset-0">
                {responsiveValues.cardPositions.map((pos, i) => {
                  const centerIndex = Math.floor(responsiveValues.cardPositions.length / 2)
                  const distanceFromCenter = Math.abs(i - centerIndex)
                  const zIndex = 10010 - distanceFromCenter

                  return (
                    <div
                      key={`v-card-${i}`}
                      className="phase-3-img hero-vcard absolute origin-center"
                      style={{
                        width: `${responsiveValues.cardWidth}px`,
                        height: `${responsiveValues.cardHeight}px`,
                        zIndex,
                      }}
                    >
                      <div className="card-elite w-full h-full overflow-hidden relative">
                        <ImageWithFallback
                          src={getImage(i)}
                          alt={`Scene ${i}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="hero-card-sheen absolute inset-0 pointer-events-none" />
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="main-content-wrapper relative flex flex-col items-center justify-center text-center w-full h-full">
                {/* Main Title: "بس اصلي" */}
                <div className="text-content-wrapper flex flex-col items-center justify-center w-auto z-30 -ml-0.5 opacity-0">
                  <h1 className="text-main text-4xl sm:text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter leading-tight text-center drop-shadow-2xl">
                    بس اصلي
                  </h1>
                </div>

                {/* CRITICAL FIX: Dedication and النسخة use SAME positioning wrapper */}
                <div className="text-overlay-container absolute inset-0 z-[54] flex flex-col items-center justify-center pointer-events-none">
                  {/* Dedication Text: "اهداء ليسري نصر الله" */}
                  <div className="dedication-wrapper absolute pt-62 md:pt-40 mr-30 md:mr-32 opacity-0">
                    <p className="unified-text-style">
                      اهداء ليسري نصر الله
                    </p>
                  </div>

                  {/* Phase 5 Text: "النسخة" - SAME COORDINATES as dedication */}
                  <div className="phase-5-wrapper absolute pt-62 md:pt-40 mr-30 md:mr-32 opacity-0">
                    <p className="unified-text-style">
                      النسخة
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div ref={triggerRef} className="h-screen w-full flex flex-col items-center justify-center">
        {/* =========================================
            LAYER 1: INTRO (Video)
           ========================================= */}
        <div className="video-mask-wrapper absolute inset-0 z-[60] bg-white pointer-events-none">
          <VideoTextMask
            videoSrc="https://cdn.pixabay.com/video/2025/11/09/314880.mp4"
            text="النسخة"
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  )
}