"use client";

import { useEffect, useRef, useCallback, useMemo } from "react";
import * as THREE from "three";
import { CARDS_11 } from "@/components/carousel/cards.config";
import images from "@/config/images";
import { LazyImage } from "./lazy-image-component";
import { ImageOptimizer } from "./image-optimization-utils";

export function OptimizedCardScanner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  const scannerCanvasRef = useRef<HTMLCanvasElement>(null);
  const cardStreamRef = useRef<HTMLDivElement>(null);
  const cardLineRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);

  // Memoize card image mapping
  const cardImageMap = useMemo(() => ({
    "directors-studio": 8,
    editor: 9,
    analysis: 1,
    "arabic-creative-writing-studio": 2,
    "actorai-arabic": 0,
    "cinematography-studio": 6,
    breakdown: 5,
    development: 7,
    brainstorm: 4,
    "metrics-dashboard": 10,
    "arabic-prompt-engineering-studio": 3,
  }), []);

  // Preload critical images on mount
  useEffect(() => {
    const imageOptimizer = ImageOptimizer.getInstance();
    
    // Preload first few images with high priority
    const criticalImages = images.slice(0, 3);
    criticalImages.forEach(src => {
      const config = imageOptimizer.generateOptimizedUrls(src, 400, 250);
      imageOptimizer.preloadImage(config).catch(console.error);
    });
  }, []);

  useEffect(() => {
    if (
      !cardLineRef.current ||
      !particleCanvasRef.current ||
      !scannerCanvasRef.current ||
      isInitializedRef.current
    ) return;

    isInitializedRef.current = true;

    // Enhanced CardStreamController with viewport-based loading
    class EnhancedCardStreamController {
      container: HTMLElement;
      cardLine: HTMLElement;
      position: number;
      velocity: number;
      direction: number;
      isAnimating: boolean;
      isDragging: boolean;
      lastTime: number;
      lastMouseX: number;
      mouseVelocity: number;
      friction: number;
      minVelocity: number;
      containerWidth: number;
      cardLineWidth: number;
      cardWrappers: {
        wrapper: HTMLElement;
        normalCard: HTMLElement;
        asciiCard: HTMLElement;
        isVisible: boolean;
        imageLoaded: boolean;
      }[];
      visibilityObserver: IntersectionObserver;
      imageOptimizer: ImageOptimizer;

      constructor(container: HTMLElement, cardLine: HTMLElement) {
        this.container = container;
        this.cardLine = cardLine;
        this.position = 0;
        this.velocity = 120;
        this.direction = -1;
        this.isAnimating = true;
        this.isDragging = false;
        this.lastTime = 0;
        this.lastMouseX = 0;
        this.mouseVelocity = 0;
        this.friction = 0.95;
        this.minVelocity = 30;
        this.containerWidth = 0;
        this.cardLineWidth = 0;
        this.cardWrappers = [];
        this.imageOptimizer = ImageOptimizer.getInstance();

        // Setup intersection observer for visibility tracking
        this.visibilityObserver = new IntersectionObserver(
          (entries) => this.handleVisibilityChange(entries),
          {
            root: this.container,
            rootMargin: "100px", // Load images 100px before they become visible
            threshold: 0.1
          }
        );

        this.init();
      }

      handleVisibilityChange(entries: IntersectionObserverEntry[]) {
        entries.forEach(entry => {
          const wrapper = this.cardWrappers.find(w => w.wrapper === entry.target);
          if (wrapper) {
            wrapper.isVisible = entry.isIntersecting;
            
            // Trigger image loading for visible cards
            if (entry.isIntersecting && !wrapper.imageLoaded) {
              this.loadCardImage(wrapper);
            }
          }
        });
      }

      async loadCardImage(cardWrapper: typeof this.cardWrappers[0]) {
        if (cardWrapper.imageLoaded) return;

        const lazyImage = cardWrapper.normalCard.querySelector('.lazy-image') as HTMLElement;
        if (lazyImage) {
          // Trigger lazy image loading
          lazyImage.style.visibility = 'visible';
          cardWrapper.imageLoaded = true;
        }
      }

      async init() {
        await this.populateCardLine();
        this.calculateDimensions();
        this.setupEventListeners();
        this.updateCardPosition();
        this.animate();
        this.startPeriodicUpdates();
      }

      calculateDimensions() {
        this.containerWidth = this.container.offsetWidth;
        const cardWidth = 400;
        const cardGap = 60;
        const cardCount = this.cardLine.children.length;
        this.cardLineWidth = (cardWidth + cardGap) * cardCount;
      }

      setupEventListeners() {
        const passiveOptions = { passive: false };
        
        this.cardLine.addEventListener("mousedown", (e) => this.startDrag(e));
        document.addEventListener("mousemove", (e) => this.onDrag(e), passiveOptions);
        document.addEventListener("mouseup", () => this.endDrag());

        this.cardLine.addEventListener("touchstart", (e) => {
          const touch = e.touches[0];
          if (touch) this.startDrag(touch);
        }, passiveOptions);
        
        document.addEventListener("touchmove", (e) => {
          const touch = e.touches[0];
          if (touch) this.onDrag(touch);
        }, passiveOptions);
        
        document.addEventListener("touchend", () => this.endDrag());
        this.cardLine.addEventListener("wheel", (e) => this.onWheel(e), passiveOptions);
        
        this.cardLine.addEventListener("selectstart", (e) => e.preventDefault());
        this.cardLine.addEventListener("dragstart", (e) => e.preventDefault());

        window.addEventListener("resize", () => this.calculateDimensions());
      }

      startDrag(e: MouseEvent | Touch) {
        if ("preventDefault" in e) e.preventDefault();
        
        this.isDragging = true;
        this.isAnimating = false;
        this.lastMouseX = e.clientX;
        this.mouseVelocity = 0;

        const transform = window.getComputedStyle(this.cardLine).transform;
        if (transform !== "none") {
          const matrix = new DOMMatrix(transform);
          this.position = matrix.m41;
        }

        this.cardLine.style.animation = "none";
        this.cardLine.classList.add("dragging");
        document.body.style.userSelect = "none";
        document.body.style.cursor = "grabbing";
      }

      onDrag(e: MouseEvent | Touch) {
        if (!this.isDragging) return;
        if ("preventDefault" in e) e.preventDefault();

        const deltaX = e.clientX - this.lastMouseX;
        this.position += deltaX;
        this.mouseVelocity = deltaX * 60;
        this.lastMouseX = e.clientX;

        this.cardLine.style.transform = `translateX(${this.position}px)`;
        this.updateCardClipping();
      }

      endDrag() {
        if (!this.isDragging) return;

        this.isDragging = false;
        this.cardLine.classList.remove("dragging");

        if (Math.abs(this.mouseVelocity) > this.minVelocity) {
          this.velocity = Math.abs(this.mouseVelocity);
          this.direction = this.mouseVelocity > 0 ? 1 : -1;
        } else {
          this.velocity = 120;
        }

        this.isAnimating = true;
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
      }

      animate() {
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        if (this.isAnimating && !this.isDragging) {
          if (this.velocity > this.minVelocity) {
            this.velocity *= this.friction;
          } else {
            this.velocity = Math.max(this.minVelocity, this.velocity);
          }

          this.position += this.velocity * this.direction * deltaTime;
          this.updateCardPosition();
        }

        requestAnimationFrame(() => this.animate());
      }

      updateCardPosition() {
        const containerWidth = this.containerWidth;
        const cardLineWidth = this.cardLineWidth;

        if (this.position < -cardLineWidth) {
          this.position = containerWidth;
        } else if (this.position > containerWidth) {
          this.position = -cardLineWidth;
        }

        this.cardLine.style.transform = `translateX(${this.position}px)`;
        this.updateCardClipping();
      }

      onWheel(e: WheelEvent) {
        e.preventDefault();
        const scrollSpeed = 20;
        const delta = e.deltaY > 0 ? scrollSpeed : -scrollSpeed;
        this.position += delta;
        this.updateCardPosition();
        this.updateCardClipping();
      }

      generateCode = (() => {
        const codeCache = new Map<string, string>();
        
        return (width: number, height: number): string => {
          const key = `${width}x${height}`;
          if (codeCache.has(key)) {
            return codeCache.get(key)!;
          }

          const randInt = (min: number, max: number) =>
            Math.floor(Math.random() * (max - min + 1)) + min;
          const pick = (arr: string[]) => {
            const item = arr[randInt(0, arr.length - 1)];
            return item ?? "";
          };

          const header = [
            "// النسخة: تحويل الأفكار إلى واقع",
            "/* منصة للكتابة الإبداعية والتحليل الدرامي */",
            "const PLATFORM = 'النسخة';",
            "const CREATIVITY = 'unlimited';",
            "const POSSIBILITIES = Infinity;",
          ];

          const helpers = [
            "function createStory(idea) { return thecopy.generate(idea); }",
            "function analyze(script) { return thecopy.analyze(script); }",
            "const innovate = (vision) => thecopy.create(vision);",
          ];

          const library: string[] = [...header, ...helpers];
          let flow = library.join(" ");
          flow = flow.replace(/\s+/g, " ").trim();
          
          const totalChars = width * height;
          while (flow.length < totalChars + width) {
            const extra = pick(library).replace(/\s+/g, " ").trim();
            flow += " " + extra;
          }

          let out = "";
          let offset = 0;
          for (let row = 0; row < height; row++) {
            let line = flow.slice(offset, offset + width);
            if (line.length < width)
              line = line + " ".repeat(width - line.length);
            out += line + (row < height - 1 ? "\n" : "");
            offset += width;
          }
          
          codeCache.set(key, out);
          return out;
        };
      })();

      calculateCodeDimensions(cardWidth: number, cardHeight: number) {
        const fontSize = 11;
        const lineHeight = 13;
        const charWidth = 6;
        const width = Math.floor(cardWidth / charWidth);
        const height = Math.floor(cardHeight / lineHeight);
        return { width, height, fontSize, lineHeight };
      }

      createCardWrapper(
        card: (typeof CARDS_11)[number],
        imageIndex: number,
        isPriority: boolean = false
      ): HTMLDivElement {
        const wrapper = document.createElement("div");
        wrapper.className = "card-wrapper";
        wrapper.setAttribute("data-link", card.href);
        wrapper.style.cursor = "pointer";

        // Click handler for navigation
        wrapper.addEventListener("click", () => {
          window.location.href = card.href;
        });

        const normalCard = document.createElement("div");
        normalCard.className = "card card-normal";

        // Create lazy image container
        const imageContainer = document.createElement("div");
        imageContainer.className = "lazy-image";
        imageContainer.style.width = "100%";
        imageContainer.style.height = "100%";
        imageContainer.style.visibility = isPriority ? "visible" : "hidden";

        // Use React component for lazy loading
        const imageSrc = images[imageIndex] ?? images[0];
        
        // Create a temporary container for React component
        const reactContainer = document.createElement("div");
        reactContainer.style.width = "100%";
        reactContainer.style.height = "100%";
        
        // We'll render the LazyImage component here
        imageContainer.appendChild(reactContainer);
        normalCard.appendChild(imageContainer);

        const asciiCard = document.createElement("div");
        asciiCard.className = "card card-ascii";

        const asciiContent = document.createElement("div");
        asciiContent.className = "ascii-content";

        const { width, height, fontSize, lineHeight } =
          this.calculateCodeDimensions(400, 250);
        asciiContent.style.fontSize = fontSize + "px";
        asciiContent.style.lineHeight = lineHeight + "px";
        asciiContent.style.willChange = "contents";
        asciiContent.textContent = this.generateCode(width, height);

        asciiCard.appendChild(asciiContent);
        wrapper.appendChild(normalCard);
        wrapper.appendChild(asciiCard);

        // Observe wrapper for visibility
        this.visibilityObserver.observe(wrapper);

        return wrapper;
      }

      updateCardClipping() {
        const scannerX = window.innerWidth / 2;
        const scannerWidth = 8;
        const scannerLeft = scannerX - scannerWidth / 2;
        const scannerRight = scannerX + scannerWidth / 2;
        let anyScanningActive = false;

        this.cardWrappers.forEach(({ wrapper, normalCard, asciiCard }) => {
          const rect = wrapper.getBoundingClientRect();
          const cardLeft = rect.left;
          const cardRight = rect.right;
          const cardWidth = rect.width;

          if (cardLeft < scannerRight && cardRight > scannerLeft) {
            anyScanningActive = true;
            const scannerIntersectLeft = Math.max(scannerLeft - cardLeft, 0);
            const scannerIntersectRight = Math.min(
              scannerRight - cardLeft,
              cardWidth
            );

            const normalClipRight = (scannerIntersectLeft / cardWidth) * 100;
            const asciiClipLeft = (scannerIntersectRight / cardWidth) * 100;

            normalCard.style.setProperty("--clip-right", `${normalClipRight}%`);
            asciiCard.style.setProperty("--clip-left", `${asciiClipLeft}%`);

            if (
              !wrapper.hasAttribute("data-scanned") &&
              scannerIntersectLeft > 0
            ) {
              wrapper.setAttribute("data-scanned", "true");
              const scanEffect = document.createElement("div");
              scanEffect.className = "scan-effect";
              wrapper.appendChild(scanEffect);
              setTimeout(() => {
                scanEffect.parentNode?.removeChild(scanEffect);
              }, 600);
            }
          } else {
            if (cardRight < scannerLeft) {
              normalCard.style.setProperty("--clip-right", "100%");
              asciiCard.style.setProperty("--clip-left", "100%");
            } else if (cardLeft > scannerRight) {
              normalCard.style.setProperty("--clip-right", "0%");
              asciiCard.style.setProperty("--clip-left", "0%");
            }
            wrapper.removeAttribute("data-scanned");
          }
        });

        if ((window as any).setScannerScanning) {
          (window as any).setScannerScanning(anyScanningActive);
        }
      }

      updateAsciiContent() {
        // Throttle ASCII updates for better performance
        const asciiElements = document.querySelectorAll(".ascii-content");
        const updateCount = Math.min(2, asciiElements.length);
        
        for (let i = 0; i < updateCount; i++) {
          const randomIndex = Math.floor(Math.random() * asciiElements.length);
          const content = asciiElements[randomIndex];
          if (content && Math.random() < 0.1) {
            const { width, height } = this.calculateCodeDimensions(400, 250);
            content.textContent = this.generateCode(width, height);
          }
        }
      }

      async populateCardLine() {
        this.cardLine.innerHTML = "";
        this.cardWrappers = [];
        
        const repeatCount = 6;
        
        for (let repeat = 0; repeat < repeatCount; repeat++) {
          for (let i = 0; i < CARDS_11.length; i++) {
            const card = CARDS_11[i];
            if (!card) continue;
            const slug = card.href.replace("/", "");
            const imageIndex = cardImageMap[slug as keyof typeof cardImageMap] ?? 0;
            
            // First few cards are priority
            const isPriority = repeat === 0 && i < 3;
            
            const cardWrapper = this.createCardWrapper(card, imageIndex, isPriority);
            this.cardLine.appendChild(cardWrapper);
            
            const normalCard = cardWrapper.querySelector(".card-normal") as HTMLElement;
            const asciiCard = cardWrapper.querySelector(".card-ascii") as HTMLElement;
            
            if (normalCard && asciiCard) {
              this.cardWrappers.push({ 
                wrapper: cardWrapper, 
                normalCard, 
                asciiCard,
                isVisible: false,
                imageLoaded: isPriority
              });
            }
          }
        }
      }

      startPeriodicUpdates() {
        setInterval(() => {
          this.updateAsciiContent();
        }, 2000);
      }

      destroy() {
        this.visibilityObserver.disconnect();
        this.imageOptimizer.clearCache();
      }
    }

    // Enhanced ParticleSystem with better performance
    class OptimizedParticleSystem {
      canvas: HTMLCanvasElement;
      ctx: CanvasRenderingContext2D;
      particles: Array<{
        x: number;
        y: number;
        vx: number;
        vy: number;
        life: number;
        maxLife: number;
        size: number;
        opacity: number;
      }>;
      animationId: number | null;
      isActive: boolean;
      lastTime: number;
      particlePool: Array<any>;
      maxParticles: number;

      constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
        if (!ctx) throw new Error("Could not get canvas context");
        this.ctx = ctx;
        this.particles = [];
        this.particlePool = [];
        this.maxParticles = 50; // Reduced for better performance
        this.animationId = null;
        this.isActive = false;
        this.lastTime = 0;
        this.setupCanvas();
      }

      setupCanvas() {
        const updateCanvasSize = () => {
          const rect = this.canvas.getBoundingClientRect();
          const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap DPR for performance
          
          this.canvas.width = rect.width * dpr;
          this.canvas.height = rect.height * dpr;
          this.canvas.style.width = rect.width + "px";
          this.canvas.style.height = rect.height + "px";
          
          this.ctx.scale(dpr, dpr);
          this.ctx.imageSmoothingEnabled = false; // Better performance
        };

        updateCanvasSize();
        window.addEventListener("resize", updateCanvasSize);
      }

      getParticle() {
        return this.particlePool.pop() || {
          x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 0, size: 0, opacity: 0
        };
      }

      releaseParticle(particle: any) {
        this.particlePool.push(particle);
      }

      createParticle(x: number, y: number) {
        if (this.particles.length >= this.maxParticles) return;

        const particle = this.getParticle();
        particle.x = x;
        particle.y = y;
        particle.vx = (Math.random() - 0.5) * 100;
        particle.vy = (Math.random() - 0.5) * 100;
        particle.life = 0;
        particle.maxLife = 1000 + Math.random() * 1000;
        particle.size = 1 + Math.random() * 2;
        particle.opacity = 0.8;

        this.particles.push(particle);
      }

      update(deltaTime: number) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
          const particle = this.particles[i];
          particle.life += deltaTime;
          
          if (particle.life >= particle.maxLife) {
            this.releaseParticle(particle);
            this.particles.splice(i, 1);
            continue;
          }

          particle.x += particle.vx * deltaTime * 0.001;
          particle.y += particle.vy * deltaTime * 0.001;
          particle.opacity = 0.8 * (1 - particle.life / particle.maxLife);
        }
      }

      render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.particles.length === 0) return;

        this.ctx.fillStyle = "#00ff88";
        
        for (const particle of this.particles) {
          this.ctx.globalAlpha = particle.opacity;
          this.ctx.fillRect(
            particle.x - particle.size / 2,
            particle.y - particle.size / 2,
            particle.size,
            particle.size
          );
        }
        
        this.ctx.globalAlpha = 1;
      }

      animate() {
        if (!this.isActive) return;

        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.render();

        this.animationId = requestAnimationFrame(() => this.animate());
      }

      start() {
        if (this.isActive) return;
        this.isActive = true;
        this.lastTime = performance.now();
        this.animate();
      }

      stop() {
        this.isActive = false;
        if (this.animationId) {
          cancelAnimationFrame(this.animationId);
          this.animationId = null;
        }
      }

      addParticles(x: number, y: number, count: number = 3) {
        for (let i = 0; i < count; i++) {
          this.createParticle(
            x + (Math.random() - 0.5) * 20,
            y + (Math.random() - 0.5) * 20
          );
        }
      }
    }

    // Enhanced ScannerBeam with optimized rendering
    class OptimizedScannerBeam {
      canvas: HTMLCanvasElement;
      ctx: CanvasRenderingContext2D;
      animationId: number | null;
      isScanning: boolean;
      scannerX: number;
      beamWidth: number;
      glowIntensity: number;
      lastTime: number;

      constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
        if (!ctx) throw new Error("Could not get canvas context");
        this.ctx = ctx;
        this.animationId = null;
        this.isScanning = false;
        this.scannerX = 0;
        this.beamWidth = 8;
        this.glowIntensity = 0;
        this.lastTime = 0;
        this.setupCanvas();
      }

      setupCanvas() {
        const updateCanvasSize = () => {
          const rect = this.canvas.getBoundingClientRect();
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          
          this.canvas.width = rect.width * dpr;
          this.canvas.height = rect.height * dpr;
          this.canvas.style.width = rect.width + "px";
          this.canvas.style.height = rect.height + "px";
          
          this.ctx.scale(dpr, dpr);
          this.scannerX = rect.width / 2;
        };

        updateCanvasSize();
        window.addEventListener("resize", updateCanvasSize);
      }

      setScanning(scanning: boolean) {
        this.isScanning = scanning;
        if (scanning && !this.animationId) {
          this.lastTime = performance.now();
          this.animate();
        }
      }

      animate() {
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Smooth glow intensity transition
        const targetIntensity = this.isScanning ? 1 : 0;
        const transitionSpeed = 0.003;
        this.glowIntensity += (targetIntensity - this.glowIntensity) * transitionSpeed * deltaTime;

        this.render();

        if (this.glowIntensity > 0.01 || this.isScanning) {
          this.animationId = requestAnimationFrame(() => this.animate());
        } else {
          this.animationId = null;
        }
      }

      render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.glowIntensity <= 0.01) return;

        const canvasHeight = this.canvas.height / (window.devicePixelRatio || 1);
        const opacity = this.glowIntensity * 0.8;

        // Create gradient for beam effect
        const gradient = this.ctx.createLinearGradient(
          this.scannerX - this.beamWidth,
          0,
          this.scannerX + this.beamWidth,
          0
        );
        
        gradient.addColorStop(0, `rgba(0, 255, 136, 0)`);
        gradient.addColorStop(0.5, `rgba(0, 255, 136, ${opacity})`);
        gradient.addColorStop(1, `rgba(0, 255, 136, 0)`);

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(
          this.scannerX - this.beamWidth,
          0,
          this.beamWidth * 2,
          canvasHeight
        );

        // Add glow effect
        this.ctx.shadowColor = "#00ff88";
        this.ctx.shadowBlur = 20 * this.glowIntensity;
        this.ctx.fillStyle = `rgba(0, 255, 136, ${opacity * 0.3})`;
        this.ctx.fillRect(
          this.scannerX - 1,
          0,
          2,
          canvasHeight
        );
        this.ctx.shadowBlur = 0;
      }
    }

    // Initialize systems
    const cardStreamController = new EnhancedCardStreamController(
      containerRef.current,
      cardLineRef.current
    );

    const particleSystem = new OptimizedParticleSystem(particleCanvasRef.current);
    const scannerBeam = new OptimizedScannerBeam(scannerCanvasRef.current);

    // Global scanner state management
    (window as any).setScannerScanning = (isScanning: boolean) => {
      scannerBeam.setScanning(isScanning);
      if (isScanning) {
        particleSystem.start();
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          particleSystem.addParticles(rect.width / 2, rect.height / 2, 5);
        }
      } else {
        particleSystem.stop();
      }
    };

    // Cleanup function
    return () => {
      cardStreamController.destroy();
      particleSystem.stop();
      scannerBeam.setScanning(false);
      delete (window as any).setScannerScanning;
    };
  }, [cardImageMap]);

  return (
    <div
      ref={containerRef}
      className="card-scanner-container"
      style={{
        position: "relative",
        width: "100%",
        height: "300px",
        overflow: "hidden",
        background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
        border: "1px solid rgba(0, 255, 136, 0.2)",
        borderRadius: "12px",
      }}
    >
      {/* Card Stream */}
      <div
        ref={cardStreamRef}
        className="card-stream"
        style={{
          position: "absolute",
          top: "25px",
          left: "0",
          width: "100%",
          height: "250px",
          overflow: "hidden",
        }}
      >
        <div
          ref={cardLineRef}
          className="card-line"
          style={{
            display: "flex",
            gap: "60px",
            height: "100%",
            willChange: "transform",
            cursor: "grab",
          }}
        />
      </div>

      {/* Particle Canvas */}
      <canvas
        ref={particleCanvasRef}
        className="particle-canvas"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 10,
        }}
      />

      {/* Scanner Beam Canvas */}
      <canvas
        ref={scannerCanvasRef}
        className="scanner-canvas"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 5,
        }}
      />

      {/* Scanner Line */}
      <div
        className="scanner-line"
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          width: "2px",
          height: "100%",
          background: "linear-gradient(to bottom, transparent, #00ff88, transparent)",
          transform: "translateX(-50%)",
          zIndex: 15,
          boxShadow: "0 0 10px #00ff88",
        }}
      />

      {/* Performance Monitor (Development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "rgba(0, 0, 0, 0.8)",
            color: "#00ff88",
            padding: "5px 10px",
            borderRadius: "4px",
            fontSize: "12px",
            fontFamily: "monospace",
            zIndex: 20,
          }}
        >
          Optimized Scanner Active
        </div>
      )}
    </div>
  );
}
