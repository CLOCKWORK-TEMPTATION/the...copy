"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { VideoTextMask } from "@/components/video-text-mask";
import { StackingFrame } from "@/components/stacking-frame/StackingFrame";
import { PortalGrid } from "@/components/portal-grid/PortalGrid";

import { LazyLandingCardScanner } from "@/components/card-scanner/lazy-landing-card-scanner";

// Register GSAP plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const maskContentRef = useRef<HTMLDivElement>(null);
  const stackingFrameRef = useRef<HTMLDivElement>(null);
  const stackingFrameContainerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [frameScale, setFrameScale] = useState(1);
  const [portalGridVisible, setPortalGridVisible] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // GSAP Scroll Animations
  useEffect(() => {
    if (!isMounted) return;

    const ctx = gsap.context(() => {
      const heroSection = heroRef.current;
      const header = headerRef.current;
      const cardsSection = cardsContainerRef.current;
      const maskContent = maskContentRef.current;
      const stackingFrameContainer = stackingFrameContainerRef.current;

      if (
        !heroSection ||
        !header ||
        !cardsSection ||
        !maskContent ||
        !stackingFrameContainer
      ) {
        console.error("عنصر واحد أو أكثر مفقود من الصفحة.");
        return;
      }

      // Hero Timeline: Pin section and animate
      const heroTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: heroSection,
          start: "top top",
          end: "+=50%",
          scrub: true,
          pin: true,
        },
      });

      // Zoom and fade out effect for video + mask
      heroTimeline.to(maskContent, {
        scale: 1.5,
        y: -200,
        opacity: 0,
        ease: "power2.in",
      });

      // Header fade in at the same time
      heroTimeline.to(
        header,
        {
          opacity: 1,
          ease: "power1.in",
        },
        "<"
      );

      // Cards section slide in from bottom and stop at center
      gsap.fromTo(
        cardsSection,
        {
          y: 150,
        },
        {
          y: 0,
          ease: "power3.out",
          scrollTrigger: {
            trigger: cardsSection,
            start: "top bottom",
            end: "top center",
            scrub: 1.5,
          },
        }
      );

      // ============= STACKING FRAME ANIMATIONS =============

      // Entry Phase: Fade in StackingFrame after hero section
      const entryTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: cardsSection,
          start: "top bottom",
          end: "top center",
          onEnter: () => {
            setFrameScale(1);
            gsap.to(stackingFrameContainer, {
              opacity: 1,
              duration: 0.5,
              ease: "power1.inOut",
            });
          },
        },
      });

      // Immersion Phase (0-50% of cards scroll): Scale 1.0 → 0.75 and reveal portals
      gsap.to(
        {},
        {
          scrollTrigger: {
            trigger: cardsSection,
            start: "top center",
            end: "center center",
            scrub: 1.5,
            onUpdate: (self) => {
              const scale = 1 - self.progress * 0.25; // 1.0 → 0.75
              setFrameScale(scale);

              // Fade in portal grid during immersion
              if (self.progress > 0.1 && !portalGridVisible) {
                setPortalGridVisible(true);
              }
            },
          },
        }
      );

      // Branding Phase (50-100% of cards scroll): Scale 0.75 → 0.3
      gsap.to(
        {},
        {
          scrollTrigger: {
            trigger: cardsSection,
            start: "center center",
            end: "bottom center",
            scrub: 1.5,
            onUpdate: (self) => {
              const scale = 0.75 - self.progress * 0.45; // 0.75 → 0.3
              setFrameScale(Math.max(scale, 0.3));
            },
          },
        }
      );

      // Pin cards section when it reaches center - stop movement completely
      ScrollTrigger.create({
        trigger: cardsSection,
        start: "top center",
        endTrigger: "body",
        end: "bottom bottom",
        pin: true,
        pinSpacing: false,
      });

      // Pin stacking frame section when it reaches the top and keep it visible
      ScrollTrigger.create({
        trigger: stackingFrameContainer,
        start: "top top",
        end: () => `+=${cardsSection.offsetHeight * 2}`,
        pin: true,
        pinSpacing: false,
      });
    });

    return () => ctx.revert();
  }, [isMounted, portalGridVisible]);

  return (
    <div className="relative min-h-screen bg-black" dir="rtl">
      {/* Fixed Header - Hidden Initially */}
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-[100] bg-black text-white border-b border-white/10"
        style={{ opacity: 0 }}
      >
        <div className="container mx-auto flex items-center justify-center px-6 py-4">
          <a
            href="#"
            aria-label="العودة للصفحة الرئيسية"
            className="cursor-pointer"
          >
            <h2 className="text-2xl">النسخة</h2>
          </a>
        </div>
      </header>

      {/* Hero Section with Video Text Mask */}
      <section
        ref={heroRef}
        className="relative w-full h-screen overflow-hidden bg-white"
      >
        <VideoTextMask
          ref={maskContentRef}
          videoSrc="https://cdn.pixabay.com/video/2025/11/09/314880.mp4"
          text="النسخة"
          className="w-full h-full"
        />
      </section>

      {/* Stacking Frame Section */}
      <section
        ref={stackingFrameContainerRef}
        className="relative w-full h-screen flex items-center justify-center bg-black z-50"
        style={{ opacity: 0 }}
      >
        <StackingFrame ref={stackingFrameRef} scale={frameScale} />
      </section>

      <section
        ref={cardsContainerRef}
        className="relative h-[50vh] bg-black overflow-hidden z-[60]"
      >
        <LazyLandingCardScanner />
      </section>

      {/* Portal Grid - Portals reveal around StackingFrame */}
      <PortalGrid visible={portalGridVisible} frameScale={frameScale} />

      {/* Footer */}
      <footer className="relative bg-black border-t border-white/10 px-4 py-8">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:flex-row">
          <span className="text-2xl text-white">النسخ��</span>
          <p className="text-sm text-white/60">
            &copy; {new Date().getFullYear()} النسخة. جميع الحقوق محفوظة.
          </p>
        </div>
      </footer>
    </div>
  );
}
