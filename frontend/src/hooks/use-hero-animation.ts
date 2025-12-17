"use client"

import { useState, useEffect, useLayoutEffect, type RefObject } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { heroConfig, type ResponsiveConfig } from "../lib/hero-config"

gsap.registerPlugin(ScrollTrigger)

export const useHeroAnimation = (
  containerRef: RefObject<HTMLDivElement | null>,
  triggerRef: RefObject<HTMLDivElement | null>,
) => {
  const [responsiveValues, setResponsiveValues] = useState<ResponsiveConfig | null>(null)

  // Fixed baseline constants for symmetric spacing (unused but kept for future reference)
  // const HEADER_H = 96
  // const SAFE_BOTTOM = 80
  // const SAFE_TOP = HEADER_H + 24

  useEffect(() => {
    const handleResize = () => {
      setResponsiveValues(heroConfig.getResponsiveValues(window.innerWidth))
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useLayoutEffect(() => {
    if (!responsiveValues || !containerRef.current || !triggerRef.current) return

    const phase3Images = gsap.utils.toArray(".phase-3-img") as HTMLElement[]

    const ctx = gsap.context(() => {
      // Performance optimization: reduce distance and improve scrub for smoothness
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerRef.current,
          start: "top top",
          end: "+=8000", // reduced from 12000 for better performance
          scrub: 1.2, // improved from 2.5 for faster response
          pin: true,
          anticipatePin: 1,
          id: "hero-scroll",
          invalidateOnRefresh: true, // performance improvement on resize
        },
      })

      // Phase 1: Reveal Video + Show Header - performance optimized
      tl.to(".video-mask-wrapper", {
        scale: 5,
        y: -600,
        opacity: 0,
        duration: 3,
        ease: "power2.inOut",
        pointerEvents: "none",
        // performance optimization: add will-change for animated elements
        willChange: "transform, opacity",
      })

      tl.to(
        ".fixed-header",
        {
          opacity: 1,
          duration: 1.5,
          ease: "power2.inOut",
        },
        "-=2.5",
      )

      // Phase 2: Title + Dedication (CRITICAL FIX: Set initial positions)
      tl.fromTo(
        ".text-content-wrapper",
        { opacity: 0, y: 300, scale: 0.9 },
        {
          opacity: 1,
          y: -240,
          scale: 1,
          duration: 2,
          ease: "power2.out",
          zIndex: 30,
        },
        "-=1.5",
      )

      tl.fromTo(
        ".dedication-wrapper",
        { opacity: 0, y: 300, scale: 0.95 },
        {
          opacity: 1,
          y: -240,
          scale: 1,
          duration: 2,
          ease: "power2.out",
          zIndex: 29,
        },
        "-=1.45",
      )

      // CRITICAL FIX: Position .phase-5-wrapper at exact same coordinates as .dedication-wrapper
      tl.set(
        ".phase-5-wrapper",
        {
          y: -240,
          scale: 1,
          opacity: 0,
        },
        "<",
      )

      tl.to(
        [".text-content-wrapper", ".dedication-wrapper"],
        {
          y: -240,
          duration: 1,
          ease: "none",
        },
        0.5,
      )

      // Phase 3: Card Animation Setup - performance optimized
      // phase3Images defined in outer scope

      // performance optimization: add will-change for cards
      phase3Images.forEach((img) => {
        gsap.set(img, { willChange: "transform, opacity" })
      })

      phase3Images.forEach((img, i) => {
        const staggerDelay = i * 0.12 // reduced delay for faster speed

        tl.fromTo(
          img,
          { y: "120vh", rotation: 0, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7, // reduced duration for faster speed
            ease: "power2.out",
            force3D: true, // force GPU acceleration
          },
          2.5 + staggerDelay, // timing optimization
        )
      })

      tl.to(
        ".phase-3-img",
        {
          top: (i) => (i < responsiveValues.cardPositions.length ? (responsiveValues.cardPositions[i]?.top || "50%") : "100vh"),
          left: (i) => (i < responsiveValues.cardPositions.length ? (responsiveValues.cardPositions[i]?.left || "50%") : "50%"),

          // استخدام الدوران من الكونفيج بدلاً من 0
          rotation: (i) => (i < responsiveValues.cardPositions.length ? (responsiveValues.cardPositions[i]?.rotation || 0) : 0),

          scale: responsiveValues.scale,
          opacity: (i) => (i < responsiveValues.cardPositions.length ? 1 : 0),

          // طبقات تراكب مقصودة: الأقرب للمركز + الأسفل (top أكبر) يكون في المقدمة
          zIndex: (i) => {
            const pos = responsiveValues.cardPositions[i]
            if (!pos) return 0
            const l = Number.parseFloat(String(pos.left).replace("%", ""))
            const t = Number.parseFloat(String(pos.top).replace("%", ""))
            const dist = Math.abs(l - 50) // قربه من المنتصف
            return Math.round((100 - dist) * 10 + t) // قيمة كبيرة = أمام
          },

          duration: 3.3,
          ease: "power3.inOut",
        },
        3.5,
      )

      // Phase 5: CRITICAL FIX - Direct transition from dedication to النسخة
      // Hide dedication text immediately
      tl.to(
        ".dedication-wrapper",
        {
          opacity: 0,
          duration: 0.4,
          ease: "power2.inOut",
        },
        "+=0.4",
      )

      // CRITICAL FIX: Show النسخة immediately after dedication fades (no intermediate step)
      tl.to(
        ".phase-5-wrapper",
        {
          opacity: 1,
          duration: 0.4,
          ease: "power2.inOut",
        },
        "<+=0.05", // Start almost immediately after dedication starts fading
      )

      // Keep "بس اصلي" visible during this transition (no fade out)
      // It will fade later with the unified entity shrink

      // ===== المرحلة 7: Grid 4x4 Zoom Out Effect =====

      // 7.1: إخفاء الهيدر مع بداية التحول
      tl.to(
        ".fixed-header",
        {
          opacity: 0,
          duration: 1.0,
          ease: "power2.inOut",
        },
        "+=0.5",
      )

      // 7.2: Zoom Out - تقليص أكبر للحاوية لتبقى في الفراغ الأسود فقط
      tl.to(
        ".frozen-container",
        {
          scale: 0.48, // تقليص أكبر ليناسب مساحة 2×2 في Grid 4×4 (الفراغ الأسود فقط)
          duration: 2.5,
          ease: "power4.out",
          transformOrigin: "center center",
        },
        "<", // متزامن مع إخفاء الهيدر
      )

      // 7.3: إظهار Grid 4x4 Layout
      tl.to(
        ".portfolio-grid-4x4",
        {
          opacity: 1,
          duration: 1.5,
          ease: "power2.out",
        },
        "-=2.0", // يبدأ قبل انتهاء التقليص
      )

      // إضافة الإطار والظلال للحاوية الداخلية
      tl.to(
        ".v-shape-container",
        {
          borderRadius: "2rem",
          border: "1px solid rgba(255,255,255,0.2)",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
          duration: 4,
          ease: "power3.inOut",
        },
        "<", // متزامن مع التقليص
      )

      // 7.4: تبديل النصوص فور انتهاء التقليص (قبل ظهور الصور)

      // الخطوة 1: إخفاء "النسخة" السفلى أولاً
      tl.to(
        ".phase-5-wrapper",
        {
          opacity: 0,
          duration: 0.3,
          ease: "power2.inOut",
        },
        "-=0.5", // يبدأ قبل انتهاء التقليص بقليل
      )

      // الخطوة 2: إخفاء "بس اصلي" الكبيرة ثانياً
      tl.to(
        ".text-content-wrapper",
        {
          opacity: 0,
          duration: 0.3,
          ease: "power2.inOut",
        },
        "+=0.2", // بعد إخفاء النسخة
      )

      // الخطوة 3: تغيير محتوى النص السفلي إلى "بس اصلي"
      tl.call(() => {
        if (!containerRef.current) return
        const secondaryTextRef = containerRef.current.querySelector(".phase-5-wrapper p")
        if (secondaryTextRef) {
          secondaryTextRef.textContent = "بس اصلي"
        }
      })

      // الخطوة 4: إظهار "بس اصلي" في المكان السفلي
      tl.to(
        ".phase-5-wrapper",
        {
          opacity: 1,
          duration: 0.4,
          ease: "power2.inOut",
        },
        "+=0.1",
      )

      // الخطوة 5: تغيير محتوى النص الكبير إلى "النسخة"
      tl.call(() => {
        if (!containerRef.current) return
        const mainTitleRef = containerRef.current.querySelector(".text-content-wrapper h1")
        if (mainTitleRef) {
          mainTitleRef.textContent = "النسخة"
        }
      })

      // الخطوة 6: إظهار "النسخة" في المكان الكبير
      tl.to(
        ".text-content-wrapper",
        {
          opacity: 1,
          duration: 0.4,
          ease: "power2.inOut",
        },
        "+=0.2",
      )

      // 7.5: إظهار 12 Portfolio Items المحيطة بعد انتهاء تبديل النصوص
      tl.to(
        ".portfolio-item-container",
        {
          opacity: 1,
          scale: 1,
          duration: 1.8,
          ease: "power4.out",
          stagger: 0.08, // تأخير بين كل عنصر
        },
        "+=0.3", // بعد انتهاء تبديل النصوص
      )

      // 7.6: Enable Interactivity for Grid and Center (Links)
      tl.set([".portfolio-grid-4x4", ".frozen-container"], {
        pointerEvents: "auto"
      })

      // انتهاء الأنيميشن مع النصوص المبدلة والصور
    }, containerRef)

    return () => {
      // تحسين تنظيف الذاكرة: إزالة will-change قبل التنظيف
      phase3Images?.forEach((img) => {
        gsap.set(img, { willChange: "auto" })
      })
      gsap.set(".video-mask-wrapper", { willChange: "auto" })

      ctx.revert()
      ScrollTrigger.getById("hero-scroll")?.kill()
      ScrollTrigger.refresh() // تحديث ScrollTrigger بعد التنظيف
    }
  }, [responsiveValues, containerRef, triggerRef])

  return { responsiveValues }
}