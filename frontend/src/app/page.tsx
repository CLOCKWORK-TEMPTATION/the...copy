"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type VShapePosition = { top: string; left: string; rotation: number };

function getVShapePositions(viewportWidth: number): VShapePosition[] {
  // Why: مواصفات التمركز تختلف حسب نقاط التوقف (Responsive) لضمان نفس “اللغة السينمائية”
  // عبر أحجام الشاشات بدل الاعتماد على قيم ثابتة قد تكسر التكوين.
  const desktop: VShapePosition[] = [
    { top: "33%", left: "70%", rotation: 20 },
    { top: "52%", left: "65%", rotation: 15 },
    { top: "72%", left: "60%", rotation: 8 },
    { top: "82%", left: "50%", rotation: 0 },
    { top: "72%", left: "40%", rotation: -8 },
    { top: "52%", left: "35%", rotation: -15 },
    { top: "33%", left: "30%", rotation: -20 },
  ];

  const tablet: VShapePosition[] = [
    { top: "33%", left: "70%", rotation: 20 },
    { top: "52%", left: "75%", rotation: 15 },
    { top: "72%", left: "60%", rotation: 8 },
    { top: "82%", left: "50%", rotation: 0 },
    { top: "72%", left: "40%", rotation: -8 },
    { top: "52%", left: "40%", rotation: -15 },
    { top: "33%", left: "30%", rotation: -20 },
  ];

  const mobile: VShapePosition[] = [
    { top: "33%", left: "65%", rotation: 20 },
    { top: "52%", left: "25%", rotation: 15 },
    { top: "72%", left: "35%", rotation: 8 },
    { top: "82%", left: "50%", rotation: 0 },
    { top: "72%", left: "65%", rotation: -8 },
    { top: "52%", left: "75%", rotation: -15 },
    { top: "33%", left: "35%", rotation: -20 },
  ];

  if (viewportWidth < 768) return mobile;
  if (viewportWidth < 1024) return tablet;
  return desktop;
}

function seededUnitFloat(seed: number): number {
  // Why: نحتاج “عشوائية شكلية” لكن مستقرة (Deterministic) لتسهيل التدقيق والـE2E.
  const x = Math.sin(seed * 999.1337) * 10000;
  return x - Math.floor(x);
}

function getStableCardEntryParams(index: number): { rotation: number; xOffsetPercent: number } {
  const a = seededUnitFloat(index + 11);
  const b = seededUnitFloat(index + 37);
  const rotation = (a - 0.5) * 20; // -10° .. +10°
  const magnitude = b * 30 + 10; // 10 .. 40
  const sign = index % 2 === 0 ? -1 : 1;
  return { rotation, xOffsetPercent: sign * magnitude };
}

type AuditRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  left: number;
  right: number;
  bottom: number;
};

type AuditElementSnapshot = {
  key: string;
  rect: AuditRect;
  computed: {
    opacity: string;
    transform: string;
    top: string;
    left: string;
    position: string;
    zIndex: string;
    pointerEvents: string;
  };
};

type AuditSnapshot = {
  label: string;
  at: number;
  scrollY: number;
  viewport: { w: number; h: number };
  elements: AuditElementSnapshot[];
  deltasFromPrevious?: Record<string, { dx: number; dy: number }>;
  stabilityCheck?: {
    baselineLabel: string;
    tolerancePx: number;
    maxAbsDelta: { dx: number; dy: number };
    failures: Array<{ key: string; dx: number; dy: number }>;
  };
};

function getRect(el: Element): AuditRect {
  const r = el.getBoundingClientRect();
  return {
    x: r.x,
    y: r.y,
    width: r.width,
    height: r.height,
    top: r.top,
    left: r.left,
    right: r.right,
    bottom: r.bottom,
  };
}

function snapshotElement(key: string, el: Element | null): AuditElementSnapshot | null {
  if (!el) return null;
  const computed = window.getComputedStyle(el as HTMLElement);
  return {
    key,
    rect: getRect(el),
    computed: {
      opacity: computed.opacity,
      transform: computed.transform,
      top: computed.top,
      left: computed.left,
      position: computed.position,
      zIndex: computed.zIndex,
      pointerEvents: computed.pointerEvents,
    },
  };
}

function safeAuditConsoleLog(payload: unknown): void {
  // Why: Next/SWC قد يزيل console.* في production عند removeConsole،
  // لذا نستدعيها ديناميكياً لتجنّب الإزالة وللاحتفاظ بسجل التدقيق.
  const c = (globalThis as unknown as { [k: string]: unknown })["console"] as
    | { [k: string]: unknown }
    | undefined;
  const fn = c?.["log"];
  if (typeof fn === "function") {
    (fn as (...args: unknown[]) => void).call(c, "[AUDIT]", payload);
  }
}

export default function Home() {
  const triggerRef = useRef<HTMLDivElement>(null);
  const videoMaskWrapperRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const textContentRef = useRef<HTMLDivElement>(null);
  const dedicationRef = useRef<HTMLDivElement>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  const cards = useMemo(
    () => [
      { src: "/images/breakdown.jpg", alt: "breakdown" },
      { src: "/images/brainstorm.jpg", alt: "brainstorm" },
      {
        src: "/images/arabic-creative-writing-studio.jpg",
        alt: "arabic-creative-writing-studio",
      },
      {
        src: "/images/arabic-prompt-engineering-studio.jpg",
        alt: "arabic-prompt-engineering-studio",
      },
      { src: "/images/development.jpg", alt: "development" },
      { src: "/images/metrics-dashboard.jpg", alt: "metrics-dashboard" },
      { src: "/images/editor.webp", alt: "editor" },
    ],
    []
  );

  // GSAP Scroll Animations
  useLayoutEffect(() => {
    const triggerEl = triggerRef.current;
    const videoMaskWrapper = videoMaskWrapperRef.current;
    const header = headerRef.current;
    const textContent = textContentRef.current;
    const dedication = dedicationRef.current;

    if (!triggerEl || !videoMaskWrapper || !header || !textContent || !dedication) return;

    const ctx = gsap.context(() => {
      const phase3Images = gsap.utils.toArray<HTMLElement>(".phase-3-img");
      const vShape = getVShapePositions(window.innerWidth);

      // Initial State
      gsap.set(header, { opacity: 0 });
      gsap.set(videoMaskWrapper, {
        opacity: 1,
        scale: 1,
        y: 0,
        pointerEvents: "auto",
      });
      gsap.set(textContent, { opacity: 0, y: 300, scale: 0.9 });
      gsap.set(dedication, { opacity: 0, y: 300, scale: 0.9 });
      phase3Images.forEach((img, i) => {
        const entry = getStableCardEntryParams(i);
        gsap.set(img, {
          opacity: 0,
          y: "120vh",
          rotation: entry.rotation,
          xPercent: -50 + entry.xOffsetPercent,
          yPercent: -50,
        });
      });

      const collectAudit = (label: string): void => {
        const elements: AuditElementSnapshot[] = [];
        const snap1 = snapshotElement("videoMaskWrapper", videoMaskWrapper);
        const snap2 = snapshotElement("fixedHeader", header);
        const snap3 = snapshotElement("textContent", textContent);
        const snap4 = snapshotElement("dedication", dedication);
        if (snap1) elements.push(snap1);
        if (snap2) elements.push(snap2);
        if (snap3) elements.push(snap3);
        if (snap4) elements.push(snap4);

        phase3Images.forEach((img, i) => {
          const s = snapshotElement(`card_${i}`, img);
          if (s) elements.push(s);
        });

        const w = window as unknown as {
          __THECOPY_AUDIT__?: { snapshots: AuditSnapshot[] };
        };
        if (!w.__THECOPY_AUDIT__) w.__THECOPY_AUDIT__ = { snapshots: [] };

        const previous = w.__THECOPY_AUDIT__.snapshots[w.__THECOPY_AUDIT__.snapshots.length - 1];
        const snapshot: AuditSnapshot = {
          label,
          at: Date.now(),
          scrollY: window.scrollY,
          viewport: { w: window.innerWidth, h: window.innerHeight },
          elements,
        };

        if (previous) {
          const prevMap = new Map(previous.elements.map((e) => [e.key, e]));
          const deltas: Record<string, { dx: number; dy: number }> = {};
          for (const e of elements) {
            const p = prevMap.get(e.key);
            if (!p) continue;
            deltas[e.key] = { dx: e.rect.x - p.rect.x, dy: e.rect.y - p.rect.y };
          }
          snapshot.deltasFromPrevious = deltas;
        }

        w.__THECOPY_AUDIT__.snapshots.push(snapshot);

        // Zero-trust check: هل آخر فريم داخل الـPin ثابت بدون “قفزة” مقارنةً بـ phase4_end؟
        // (نتجاهل لحظة الـUnpin لأنها بطبيعتها تغيّر تموضع الـScene في الصفحة.)
        if (label === "hold_near_end_t5_9") {
          const baseline = w.__THECOPY_AUDIT__.snapshots
            .slice()
            .reverse()
            .find((s) => s.label === "phase4_end_t3_5");
          if (baseline) {
            const baselineMap = new Map(baseline.elements.map((e) => [e.key, e]));
            const tolerancePx = 0.5;
            let maxDx = 0;
            let maxDy = 0;
            const failures: Array<{ key: string; dx: number; dy: number }> = [];
            for (const e of elements) {
              const b = baselineMap.get(e.key);
              if (!b) continue;
              const dx = e.rect.x - b.rect.x;
              const dy = e.rect.y - b.rect.y;
              maxDx = Math.max(maxDx, Math.abs(dx));
              maxDy = Math.max(maxDy, Math.abs(dy));
              if (Math.abs(dx) > tolerancePx || Math.abs(dy) > tolerancePx) {
                failures.push({ key: e.key, dx, dy });
              }
            }
            snapshot.stabilityCheck = {
              baselineLabel: baseline.label,
              tolerancePx,
              maxAbsDelta: { dx: maxDx, dy: maxDy },
              failures,
            };
          }
        }

        safeAuditConsoleLog(snapshot);
      };

      // Timeline (0..6s) mapped إلى Scroll (0..5000px) عبر scrub
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerEl,
          start: "top top",
          end: "+=5000",
          scrub: 2.5,
          pin: true,
          anticipatePin: 1,
        },
      });

      // Phase 1: Reveal Video (0 -> 3s)
      tl.to(videoMaskWrapper, {
        scale: 5,
        y: -600,
        opacity: 0,
        duration: 3,
        ease: "power2.inOut",
        pointerEvents: "none",
      });

      // Phase 2: Header & Text Reveal (starts ~1s)
      tl.fromTo(
        header,
        { opacity: 0 },
        { opacity: 1, duration: 0.8, ease: "power1.inOut" },
        1
      );

      tl.fromTo(
        textContent,
        { opacity: 0, y: 300, scale: 0.9 },
        { opacity: 1, y: -230, scale: 1, duration: 2, ease: "power2.out" },
        1.5
      );

      tl.fromTo(
        dedication,
        { opacity: 0, y: 300, scale: 0.9 },
        { opacity: 1, y: -240, scale: 1, duration: 2, ease: "power2.out" },
        1.5
      );

      // Phase 3: Floating Cards Entry (1.2s ->)
      phase3Images.forEach((img, i) => {
        const entry = getStableCardEntryParams(i);
        const staggerDelay = i * 0.15;
        tl.fromTo(
          img,
          { y: "120vh", rotation: entry.rotation, opacity: 0, xPercent: -50 + entry.xOffsetPercent },
          { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
          1.2 + staggerDelay
        );
      });

      // Phase 4: V-Shape Formation (starts at 2s)
      tl.to(
        phase3Images,
        {
          top: (i: number) => vShape[i]?.top ?? "50%",
          left: (i: number) => vShape[i]?.left ?? "50%",
          xPercent: -50,
          yPercent: -50,
          rotation: (i: number) => vShape[i]?.rotation ?? 0,
          scale: 0.85,
          opacity: 1,
          duration: 1.5,
          ease: "power3.inOut",
        },
        2
      );

      // Hold final frame until end of scroll (3.5 -> 6)
      tl.to({}, { duration: 2.5 }, 3.5);

      // Audit points (Zero-trust): أرقام قبل الصورة
      tl.add(() => collectAudit("frame0_initial"), 0);
      tl.add(() => collectAudit("phase1_end_t3"), 3);
      tl.add(() => collectAudit("phase4_end_t3_5"), 3.5);
      tl.add(() => collectAudit("hold_near_end_t5_9"), 5.9);
      tl.add(() => collectAudit("timeline_end_t6"), 6);

      // Also audit after any refresh/recalc (pin measurements can shift on refresh)
      const onRefresh = () => collectAudit("scrollTrigger_refresh");
      ScrollTrigger.addEventListener("refresh", onRefresh);
      ScrollTrigger.refresh();

      // Cleanup listener within GSAP context lifecycle
      return () => {
        ScrollTrigger.removeEventListener("refresh", onRefresh);
      };
    }, triggerEl);

    return () => {
      ctx.revert();
    };
  }, []);

  // Safety: إيقاف سهم التمرير عند بداية التفاعل (لمعالجة UX)
  useEffect(() => {
    const onFirstScroll = () => {
      setHasInteracted(true);
    };
    window.addEventListener("scroll", onFirstScroll, { passive: true, once: true });
    return () => window.removeEventListener("scroll", onFirstScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-black" dir="rtl">
      {/* Fixed Header - Hidden Initially */}
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-[100] bg-black/90 text-white border-b border-white/10 backdrop-blur"
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

      {/* Pinned Cinematic Scene */}
      <section
        ref={triggerRef}
        data-cinematic-trigger="true"
        className="relative h-screen w-full overflow-hidden bg-black"
      >
        {/* Video Mask Wrapper (Frame 0) */}
        <div
          ref={videoMaskWrapperRef}
          className="video-mask-wrapper absolute inset-0 z-[50] bg-white will-change-transform will-change-opacity gpu-accelerated"
        >
          {/* Video */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
            style={{ zIndex: 1 }}
            src="https://cdn.pixabay.com/video/2025/11/09/314880.mp4"
          />

          {/* Text Mask Layer */}
          <div
            className="absolute inset-0 flex items-center justify-center bg-white"
            style={{ zIndex: 2, mixBlendMode: "screen" }}
          >
            <h1
              className="m-0 p-0 text-center leading-none"
              style={{
                fontSize: "clamp(8rem, 28vw, 40rem)",
                fontWeight: 900,
                color: "black",
                fontFamily: "Cairo, Tajawal, system-ui, -apple-system, sans-serif",
                letterSpacing: "-0.08em",
              }}
            >
              النسخة
            </h1>
          </div>
        </div>

        {/* Text Content Wrapper */}
        <div
          ref={textContentRef}
          className="text-content-wrapper pointer-events-none absolute left-1/2 top-1/2 z-[30] -translate-x-1/2 -translate-y-1/2 text-center text-white will-change-transform will-change-opacity gpu-accelerated"
          style={{ opacity: 0 }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-7xl xl:text-9xl font-black leading-tight">
            بس اصلي
          </h2>
        </div>

        {/* Dedication Wrapper */}
        <div
          ref={dedicationRef}
          className="dedication-wrapper pointer-events-none absolute left-1/2 top-1/2 z-[30] -translate-x-1/2 -translate-y-1/2 text-center text-white/90 will-change-transform will-change-opacity gpu-accelerated"
          style={{ opacity: 0 }}
        >
          <p className="text-xl md:text-2xl lg:text-3xl font-medium">اهداء ليسري نصر الله</p>
        </div>

        {/* Floating Cards (7) */}
        <div className="absolute inset-0 z-[20]">
          {cards.map((card, i) => {
            const left = `${16 + i * 8}%`;
            return (
              <div
                key={card.alt}
                className="phase-3-img absolute top-[60%] w-[160px] h-[200px] md:w-[200px] md:h-[250px] lg:w-[240px] lg:h-[300px] rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)] ring-1 ring-white/10 bg-black"
                data-index={i}
                style={{
                  left,
                  opacity: 0,
                }}
              >
                <div className="relative h-full w-full">
                  <Image
                    src={card.src}
                    alt={card.alt}
                    fill
                    sizes="(max-width: 767px) 160px, (max-width: 1023px) 200px, 240px"
                    className="object-cover"
                    priority={i === 3}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Scroll Arrow (Fixed) */}
      <div
        className="fixed bottom-[10px] left-1/2 z-[90] -translate-x-1/2 text-white/50"
        style={{ display: hasInteracted ? "none" : "block" }}
        aria-hidden="true"
      >
        <div className="animate-bounce select-none text-3xl leading-none">↓</div>
      </div>

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
