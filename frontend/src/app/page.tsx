"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { VideoTextMask } from "@/components/video-text-mask";

import { LazyLandingCardScanner } from "@/components/card-scanner/lazy-landing-card-scanner";

// Register GSAP plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const introWrapperRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const maskContentRef = useRef<HTMLDivElement>(null);
  const textSectionRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // GSAP Scroll Animations
  useEffect(() => {
    if (!isMounted) return;

    const ctx = gsap.context(() => {
      const introWrapper = introWrapperRef.current;
      const heroSection = heroRef.current;
      const header = headerRef.current;
      const cardsSection = cardsContainerRef.current;
      const maskContent = maskContentRef.current;
      const textSection = textSectionRef.current;

      if (
        !introWrapper ||
        !heroSection ||
        !header ||
        !cardsSection ||
        !maskContent ||
        !textSection
      ) {
        return;
      }

      // Intro Timeline: Pin wrapper and animate
      const introTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: introWrapper,
          start: "top top",
          end: "+=100%",
          scrub: true,
          pin: true,
          pinSpacing: true,
        },
      });

      // Zoom and fade out effect for video + mask (Top Layer)
      introTimeline.to(maskContent, {
        scale: 1.5,
        ease: "power2.in",
      });

      // Fade out the white background overlay to reveal text below
      const whiteOverlay = maskContent.querySelector('.overlay-bg');
      if (whiteOverlay) {
        introTimeline.to(whiteOverlay, {
          opacity: 0,
          ease: "power2.in",
        }, "<");
      }

      // Header fade in at the same time
      introTimeline.to(
        header,
        {
          opacity: 1,
          ease: "power1.in",
        },
        "<"
      );

      // Ensure text section is visible and animate it in
      introTimeline.to(
        textSection,
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
            end: "center center",
            scrub: 1.5,
          },
        }
      );

      // Pin cards section when it reaches center - stop movement completely
      ScrollTrigger.create({
        trigger: cardsSection,
        start: "center center",
        endTrigger: "body",
        end: "bottom bottom",
        pin: true,
        pinSpacing: false,
      });
    });

    return () => ctx.revert();
  }, [isMounted]);

  return (
    <div className="relative min-h-screen bg-black" dir="rtl">
      {/* Fixed Header - Hidden Initially */}
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-50 bg-black text-white border-b border-white/10"
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

      {/* Intro Wrapper: Contains both Hero (Top) and Text (Bottom) */}
      <div
        ref={introWrapperRef}
        className="relative w-full h-screen overflow-hidden"
      >
        {/* Bottom Layer: Text Section (Z-0) */}
        <div
          ref={textSectionRef}
          className="absolute inset-0 z-0 flex items-center justify-center bg-black"
        >
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="text-4xl md:text-5xl mb-4 text-white">بس اصلي</h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                اهداء ليسري نصر الله
              </p>
            </div>
          </div>
        </div>

        {/* Top Layer: Hero Section with Video Text Mask (Z-10) */}
        <div
          ref={heroRef}
          className="absolute inset-0 z-10 w-full h-full bg-white"
        >
          <VideoTextMask
            ref={maskContentRef}
            videoSrc="https://cdn.pixabay.com/video/2025/11/09/314880.mp4"
            text="النسخة"
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Cards Section with Scanner Effect */}
      <section
        ref={cardsContainerRef}
        className="relative h-screen bg-black overflow-hidden"
      >
        <LazyLandingCardScanner />
      </section>

      {/* Footer */}
      <footer className="relative bg-black border-t border-white/10 px-4 py-8">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:flex-row">
          <span className="text-2xl text-white">النسخة</span>
          <p className="text-sm text-white/60">
            &copy; {new Date().getFullYear()} النسخة. جميع الحقوق محفوظة.
          </p>
        </div>
      </footer>
    </div>
  );
}
