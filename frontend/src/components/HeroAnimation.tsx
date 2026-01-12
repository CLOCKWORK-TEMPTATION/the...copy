"use client"

import { useRef, useState, type CSSProperties } from "react"

import Link from "next/link"
import { VideoTextMask } from "./VideoTextMask"
import { useHeroAnimation } from "@/hooks/use-hero-animation"
import { ImageWithFallback } from "./figma/ImageWithFallback"
import { IntroVideoModal } from "./IntroVideoModal"
import { BackgroundBeams } from "./aceternity/background-beams"
import { CardSpotlight } from "./aceternity/card-spotlight"
import { NoiseBackground } from "./aceternity/noise-background"
import images from "@/lib/images"

const HERO_CARD_IMAGE_STYLES: Record<string, CSSProperties> = {
  "/assets/v-shape/V-Shape-3.jpeg": {
    objectFit: "contain",
    backgroundColor: "rgba(5, 5, 5, 0.9)",
  },
}

interface HeroAnimationProps {
  onContinue?: () => void;
}

export const HeroAnimation = ({ onContinue }: HeroAnimationProps = {}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const [introOpen, setIntroOpen] = useState(false)

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
      {/* Aceternity UI Enhancements */}
      <NoiseBackground />
      <div className="absolute inset-0 z-0 pointer-events-none">
        <BackgroundBeams />
      </div>

      {/* HEADER: STRICTLY "النسخة" CENTERED ONLY - INITIALLY HIDDEN */}
      <div className="fixed top-0 left-0 right-0 z-[9998] h-24 flex justify-center items-center pointer-events-none shadow-[0_4px_20px_rgba(0,0,0,0.9)] bg-black/95 backdrop-blur-md border-b border-white/5 opacity-0 fixed-header">
        <span className="font-bold tracking-[0.25em] text-[22px] text-white/90 font-sans uppercase">النسخة</span>
      </div>

      <div className="scene-container fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none">

        {/* Original Unified Entity - Clickable Portal to /ui */}
        <div className="frozen-container relative w-full h-full flex items-center justify-center origin-center pointer-events-none">
          <Link
            href="/ui"
            id="center-unified-entity"
            aria-label="فتح قائمة أدوات النسخة"
            className="unified-entity relative w-full h-full flex items-center justify-center block pointer-events-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-2xl"
          >
            {/* V-Shape Container */}
            <div className="v-shape-container absolute top-0 left-0 w-full h-full m-0 p-0">
              <div className="v-shape-cards-layer absolute inset-0">
                {responsiveValues.cardPositions.map((_pos: any, i: number) => {
                  const centerIndex = Math.floor(responsiveValues.cardPositions.length / 2)
                  const distanceFromCenter = Math.abs(i - centerIndex)
                  const zIndex = 10010 - distanceFromCenter

                  return (
                    <CardSpotlight
                      key={`v-card-${i}`}
                      className="phase-3-img hero-vcard absolute origin-center"
                      style={{
                        width: `${responsiveValues.cardWidth}px`,
                        height: `${responsiveValues.cardHeight}px`,
                        zIndex,
                      } as CSSProperties}
                    >
                      <div className="card-elite w-full h-full overflow-hidden relative group">
                        {(() => {
                          const imageSrc = getImage(i)
                          const imageStyle = HERO_CARD_IMAGE_STYLES[imageSrc]
                          return (
                            <ImageWithFallback
                              src={imageSrc}
                              alt={`Scene ${i}`}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              style={imageStyle}
                            />
                          )
                        })()}
                        <div className="hero-card-sheen absolute inset-0 pointer-events-none" />
                        {/* Enhanced glow effect on hover */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-[#FFD700]/10 via-transparent to-transparent" />
                      </div>
                    </CardSpotlight>
                  )
                })}
              </div>

              <div className="main-content-wrapper relative flex flex-col items-center justify-center text-center w-full h-full">
                {/* Main Title: "النسخة" - الكبير دايماً - Enhanced with gradient */}
                <div className="text-content-wrapper flex flex-col items-center justify-center w-auto z-30 -ml-0.5 opacity-0">
                  <h1 className="text-main text-4xl sm:text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter leading-tight text-center drop-shadow-2xl bg-gradient-to-b from-white via-white to-white/80 bg-clip-text text-transparent">
                    النسخة
                  </h1>
                  {/* Subtle glow effect */}
                  <div className="absolute inset-0 blur-3xl opacity-20 bg-gradient-to-b from-[#FFD700]/20 to-transparent pointer-events-none" />
                </div>

                {/* Secondary texts container - Dedication then Slogan */}
                <div className="text-overlay-container absolute inset-0 z-[54] flex flex-col items-center justify-center pointer-events-none">
                  {/* Dedication Text: "اهداء ليسري نصر الله" */}
                  <div className="dedication-wrapper absolute pt-62 md:pt-40 mr-30 md:mr-32 opacity-0">
                    <p className="unified-text-style">
                      اهداء ليسري نصر الله
                    </p>
                  </div>

                  {/* Phase 5 Text: "بس اصلي" - السلوغن الثانوي بعد الإهداء */}
                  <div className="phase-5-wrapper absolute pt-62 md:pt-40 mr-30 md:mr-32 opacity-0">
                    <p className="unified-text-style">
                      بس اصلي
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* CTA / UX Hint */}
      <div className="hero-cta fixed bottom-6 left-0 right-0 z-[10020] flex flex-col items-center gap-3 opacity-0 pointer-events-none">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <button
            onClick={() => setIntroOpen(true)}
            className="pointer-events-auto inline-flex items-center justify-center rounded-full px-6 py-3 text-sm md:text-base font-semibold bg-white/10 hover:bg-white/15 active:bg-white/20 border border-white/15 hover:border-[#FFD700]/30 backdrop-blur-md cursor-pointer transition-all duration-300 group relative overflow-hidden"
            aria-label="شاهد الفيديو التعريفي"
          >
            {/* Shimmer effect on hover */}
            <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <span className="relative">اضغط على الفيديو</span>
          </button>
          {onContinue && (
            <button
              onClick={onContinue}
              className="pointer-events-auto inline-flex items-center justify-center rounded-full px-8 py-3 text-sm md:text-base font-semibold bg-white text-black hover:bg-white/90 active:bg-white/80 cursor-pointer transition-all duration-300 group relative overflow-hidden shadow-lg"
              aria-label="استكشف التطبيقات"
            >
              <span className="relative">استكشف التطبيقات ←</span>
            </button>
          )}
        </div>
        <div className="text-xs md:text-sm text-white/60 tracking-wider">
          اضغط على الكروت لفتح الأدوات
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

      {/* Intro Video Modal */}
      <IntroVideoModal
        open={introOpen}
        onClose={() => setIntroOpen(false)}
        videoSrc="https://cdn.pixabay.com/video/2025/11/09/314880.mp4"
        title="فيديو تعريفي عن النسخة"
      />
    </div>
  )
}
