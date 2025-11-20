"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { VideoTextMask } from "@/components/video-text-mask";
import { LazyLandingCardScanner } from "@/components/landing/card-scanner/lazy-landing-card-scanner";
import { LazyOptimizedLandingCardScanner } from "@/components/landing/card-scanner/lazy-optimized-landing-card-scanner";
import { HeroSection } from "@/components/landing/hero-section";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <HeroSection />

      {/* Optimized Card Scanner Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              استكشف أدوات النسخة
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              مجموعة شاملة من الأدوات المتقدمة للكتابة الإبداعية والتحليل
              الدرامي
            </p>
          </div>

          <LazyOptimizedLandingCardScanner />

          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              اسحب أو استخدم عجلة الماوس للتنقل • انقر على أي كارت للوصول إلى
              الأداة
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
