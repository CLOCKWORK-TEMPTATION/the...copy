"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { VideoTextMask } from "@/components/video-text-mask";
import { LazyLandingCardScanner } from "@/components/landing/card-scanner/lazy-landing-card-scanner";

// Register GSAP plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
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
      const heroSection = heroRef.current;
      const header = headerRef.current;
      const cardsSection = cardsContainerRef.current;
      const maskContent = maskContentRef.current;
      const textSection = textSectionRef.current;

      if (
        !heroSection ||
        !header ||
        !cardsSection ||
        !maskContent ||
        !textSection
      ) {
        console.error("عنصر واحد أو أكثر مفقود من الصفحة.");
        return;
      }

      // Hero Timeline: Pin section and animate
      const heroTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: heroSection,
          start: "top top",
          end: "+=100%",
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

      // Pin text section when it reaches the top and keep it visible
      ScrollTrigger.create({
        trigger: textSection,
        start: "top top",
        end: () => `+=${cardsSection.offsetHeight * 2}`,
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

      {/* Cards Section with Scanner Effect */}
      <section
        ref={textSectionRef}
        className="relative bg-black py-16 md:py-24 z-50"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl mb-4 text-white">بس اصلي</h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              اهداء ليسري نصر الله
            </p>
          </div>
        </div>
      </section>

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
