"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { VideoTextMask } from "@/components/video-text-mask";
import { StackingFrame } from "@/components/stacking-frame/StackingFrame";
import { PortalGrid } from "@/components/portal-grid/PortalGrid";

// Register GSAP plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const maskContentRef = useRef<HTMLDivElement>(null);
  const stackingContainerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  // Animation states
  const [frameScale, setFrameScale] = useState(1.0);
  const [portalsVisible, setPortalsVisible] = useState(false);

  // GSAP Scroll Animations
  useEffect(() => {
    if (typeof window === "undefined") return;

    const ctx = gsap.context(() => {
      const heroSection = heroRef.current;
      const header = headerRef.current;
      const maskContent = maskContentRef.current;
      const stackingContainer = stackingContainerRef.current;
      const frame = frameRef.current;

      if (
        !heroSection ||
        !header ||
        !maskContent ||
        !stackingContainer ||
        !frame
      ) {
        console.error("عنصر واحد أو أكثر مفقود من الصفحة.");
        return;
      }

      // Hero Timeline: Pin section and animate video mask
      const heroTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: heroSection,
          start: "top top",
          end: "+=100%",
          scrub: true,
          pin: true,
        },
      });

      // Animate video mask (scale up and fade out)
      heroTimeline.to(maskContent, {
        scale: 1.5,
        y: -200,
        opacity: 0,
        ease: "power2.in",
      });

      // Header fade in animation (separate from hero timeline)
      gsap.to(header, {
        opacity: 1,
        ease: "power1.in",
        scrollTrigger: {
          trigger: heroSection,
          start: "top top",
          end: "50% top",
          scrub: true,
          toggleActions: "play none none none",
          onLeave: () => {
            if (header) header.style.opacity = "1";
          },
          onEnterBack: () => {
            if (header) header.style.opacity = "1";
          },
        },
      });

      // Frame fade in - appears as video disappears
      gsap.fromTo(
        frame,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: heroSection,
            start: "60% top",
            end: "100% top",
            scrub: 0.5,
          },
        }
      );

      // Phase 2: Frame scales from 100% to 75% + portals appear
      ScrollTrigger.create({
        trigger: stackingContainer,
        start: "top top",
        end: "50% top",
        pin: frame,
        pinSpacing: false,
        onUpdate: (self) => {
          const progress = self.progress;
          const newScale = 1.0 - progress * 0.25; // 1.0 → 0.75
          setFrameScale(newScale);

          // Show portals at 30% progress
          if (progress > 0.3 && !portalsVisible) {
            setPortalsVisible(true);
          }
        },
      });

      // Phase 3: Frame scales from 75% to 30% (logo style)
      ScrollTrigger.create({
        trigger: stackingContainer,
        start: "50% top",
        end: "100% top",
        onUpdate: (self) => {
          const progress = self.progress;
          const newScale = 0.75 - progress * 0.45; // 0.75 → 0.3
          setFrameScale(newScale);
        },
      });
    });

    return () => ctx.revert();
  }, [portalsVisible]);

  return (
    <div
      className="relative min-h-screen bg-black overflow-x-hidden"
      dir="rtl"
      suppressHydrationWarning
    >
      {/* Header */}
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-[100] bg-black text-white border-b border-white/10"
        style={{ opacity: 0 }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">النسخة</h1>
            <nav className="flex gap-6">
              <a href="#" className="hover:text-white/80 transition-colors">
                الرئيسية
              </a>
              <a href="#" className="hover:text-white/80 transition-colors">
                حول
              </a>
              <a href="#" className="hover:text-white/80 transition-colors">
                اتصل بنا
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Video Section */}
      <section
        ref={heroRef}
        className="relative h-screen bg-black overflow-hidden"
      >
        <VideoTextMask
          videoSrc="/videos/output.webm"
          maskText="النسخة"
          maskContentRef={maskContentRef}
        />
      </section>

      {/* Stacking Animation Container */}
      <section
        ref={stackingContainerRef}
        className="relative min-h-[400vh] bg-black"
      >
        {/* Central Frame - Sticky positioned */}
        <div
          ref={frameRef}
          className="sticky top-0 h-screen w-full z-30"
          style={{ opacity: 0 }}
        >
          <StackingFrame scale={frameScale} />
        </div>

        {/* Portal Grid - Fixed positioned around frame */}
        <PortalGrid visible={portalsVisible} frameScale={frameScale} />
      </section>

      {/* Footer */}
      <footer className="relative bg-black border-t border-white/10 px-4 py-8">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-white/60" suppressHydrationWarning>
            © {new Date().getFullYear()} النسخة. جميع الحقوق محفوظة.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-sm text-white/60 hover:text-white">
              سياسة الخصوصية
            </a>
            <a href="#" className="text-sm text-white/60 hover:text-white">
              الشروط والأحكام
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
