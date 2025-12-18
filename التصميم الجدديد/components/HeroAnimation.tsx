"use client"

import { useRef } from "react"
import { VideoTextMask } from "./VideoTextMask"
import { useHeroAnimation } from "@/hooks/use-hero-animation"
import { ImageWithFallback } from "./figma/ImageWithFallback"
import images from "@/lib/images"

const CENTER_CELLS = [5, 6, 9, 10]

const GRID_SIZE = 16
const GRID_CENTER_START_INDEX = 5

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
        <div className="portfolio-grid-4x4 absolute inset-0 w-full h-full opacity-0 p-4">
          <div className="grid grid-cols-4 grid-rows-4 gap-2 md:gap-4 w-full h-full">
            {/* Generate 16 grid cells */}
            {Array.from({ length: GRID_SIZE }, (_, i) => {
              // Center 4 cells (indices 5,6,9,10) for unified entity
              const isCenterCell = CENTER_CELLS.includes(i)
              // Skip rendering individual cells for center area
              if (isCenterCell && i !== GRID_CENTER_START_INDEX) return null

              return (
                <div
                  key={`grid-cell-${i}`}
                  className={`grid-cell relative rounded-lg overflow-hidden ${isCenterCell
                    ? 'col-span-2 row-span-2 unified-entity-grid-container'
                    : 'portfolio-item-container opacity-0'
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
                    <div className="portfolio-item w-full h-full relative">
                      <ImageWithFallback
                        src={getImage(i)}
                        alt={`Portfolio Design ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-2 left-2 text-white">
                        <div className="text-xs font-medium">Design {i + 1}</div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Original Unified Entity - Will be positioned in center during Phase 7 */}
        <div className="frozen-container relative w-full h-full flex items-center justify-center origin-center">
          <div className="unified-entity relative w-full h-full flex items-center justify-center">
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
                  <h1 className="text-main text-4xl sm:text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter leading-tight text-center">
                    بس اصلي
                  </h1>
                </div>

                {/* CRITICAL FIX: Dedication and النسخة use SAME positioning wrapper */}
                <div className="text-overlay-container absolute inset-0 z-[54] flex flex-col items-center justify-center pointer-events-none">
                  {/* Dedication Text: "اهداء ليسري نصر الله" */}
                  <div className="dedication-wrapper absolute  pt-62 md:pt-40 mr-30 md:mr-32 opacity-0">
                    <p className="unified-text-style">
                      اهداء ليسري نصر الله
                    </p>
                  </div>

                  {/* Phase 5 Text: "النسخة" - SAME COORDINATES as dedication */}
                  <div className="phase-5-wrapper absolute  pt-62 md:pt-40 mr-30 md:mr-32 opacity-0">
                    <p className="unified-text-style">
                      النسخة
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
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