"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heroRef.current || !titleRef.current || !subtitleRef.current || !ctaRef.current) return;

    // Animate hero elements on mount
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.from(titleRef.current, {
      y: 50,
      opacity: 0,
      duration: 1,
      delay: 0.3,
    })
    .from(subtitleRef.current, {
      y: 30,
      opacity: 0,
      duration: 0.8,
    }, "-=0.5")
    .from(ctaRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.8,
    }, "-=0.4");

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden"
    >
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black opacity-50" />

      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1
          ref={titleRef}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent"
          style={{
            fontFamily:
              "'Tajawal', 'Cairo', 'Noto Kufi Arabic', 'system-ui', sans-serif",
          }}
        >
          النسخة
        </h1>

        <p
          ref={subtitleRef}
          className="text-xl sm:text-2xl md:text-3xl text-gray-300 mb-12 max-w-3xl mx-auto"
          style={{
            fontFamily:
              "'Tajawal', 'Cairo', 'Noto Kufi Arabic', 'system-ui', sans-serif",
          }}
        >
          منصة متكاملة للكتابة الإبداعية والتحليل الدرامي
        </p>

        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="/directors-studio"
            className="px-8 py-4 text-lg font-medium text-black bg-white hover:bg-gray-100 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-white/20"
            style={{
              fontFamily:
                "'Tajawal', 'Cairo', 'Noto Kufi Arabic', 'system-ui', sans-serif",
            }}
          >
            ابدأ الآن
          </a>

          <a
            href="#features"
            className="px-8 py-4 text-lg font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300 hover:scale-105 backdrop-blur-sm"
            style={{
              fontFamily:
                "'Tajawal', 'Cairo', 'Noto Kufi Arabic', 'system-ui', sans-serif",
            }}
          >
            استكشف المزيد
          </a>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </section>
  );
}
