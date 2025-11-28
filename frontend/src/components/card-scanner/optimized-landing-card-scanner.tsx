"use client";

import { useEffect, useRef, useCallback, useMemo } from "react";
import * as THREE from "three";
import { CARDS_11 } from "@/components/carousel/cards.config";
import images from "@/config/images";

// Map cards to their images
const cardImageMap: Record<string, number> = {
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
};

export function OptimizedLandingCardScanner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  const scannerCanvasRef = useRef<HTMLCanvasElement>(null);
  const cardStreamRef = useRef<HTMLDivElement>(null);
  const cardLineRef = useRef<HTMLDivElement>(null);

  // Performance optimization: Memoize expensive calculations
  const memoizedCardImageMap = useMemo(() => cardImageMap, []);

  // Performance optimization: Use RAF throttling
  const useRAFThrottle = (callback: () => void, deps: any[]) => {
    const rafRef = useRef<number | null>(null);
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    return useCallback(() => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        callbackRef.current();
        rafRef.current = null;
      });
    }, deps);
  };

  useEffect(() => {
    if (
      !cardLineRef.current ||
      !particleCanvasRef.current ||
      !scannerCanvasRef.current
    )
      return;

    // Enhanced CardStreamController with performance optimizations (Pure Math Logic)
    class OptimizedCardStreamController {
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

      // Performance optimizations
      private updateClippingThrottled: () => void;
      private resizeObserver!: ResizeObserver;
      private intersectionObserver!: IntersectionObserver;
      private visibleCards: Set<HTMLElement> = new Set(); // Changed to HTMLElement
      private cardPool: HTMLDivElement[] = [];

      // Constants for math calculation
      private readonly CARD_WIDTH = 400;
      private readonly CARD_GAP = 60;
      private readonly CARD_FULL_WIDTH = 460; // 400 + 60

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

        // استخدام requestAnimationFrame مباشرة للتحكم الأدق
        this.updateClippingThrottled = () => {
          // نترك التحكم في الـ Loop الرئيسي لتجنب التداخل
        };
        this.resizeObserver = new ResizeObserver(() => {});
        this.intersectionObserver = new IntersectionObserver(() => {});

        this.init();
      }

      init() {
        this.setupIntersectionObserver();
        this.setupResizeObserver();
        this.populateCardLine();
        this.calculateDimensions();
        this.setupEventListeners();
        this.updateCardPosition();
        this.animate();
        // تمت إزالة startPeriodicUpdates المستقلة ودمجها في حلقة الأنيميشن الرئيسية للأداء
      }

      private setupIntersectionObserver() {
        if (this.intersectionObserver) this.intersectionObserver.disconnect();
        this.intersectionObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                this.visibleCards.add(entry.target as HTMLElement);
              } else {
                this.visibleCards.delete(entry.target as HTMLElement);
              }
            });
          },
          {
            root: this.container,
            rootMargin: "200px", // زيادة المارجن لضمان تحميل الكروت قبل ظهورها
            threshold: 0,
          }
        );
      }

      private setupResizeObserver() {
        if (this.resizeObserver) this.resizeObserver.disconnect();
        this.resizeObserver = new ResizeObserver(() => {
          this.calculateDimensions();
        });
        this.resizeObserver.observe(this.container);
      }

      calculateDimensions() {
        this.containerWidth = this.container.offsetWidth;
        const cardCount = this.cardLine.children.length;
        this.cardLineWidth = this.CARD_FULL_WIDTH * cardCount;
      }

      setupEventListeners() {
        const passiveOptions = { passive: true };
        const activeOptions = { passive: false };

        this.cardLine.addEventListener(
          "mousedown",
          (e) => this.startDrag(e),
          activeOptions
        );
        document.addEventListener(
          "mousemove",
          (e) => this.onDrag(e),
          passiveOptions
        );
        document.addEventListener(
          "mouseup",
          () => this.endDrag(),
          passiveOptions
        );

        this.cardLine.addEventListener(
          "touchstart",
          (e) => {
            const touch = e.touches[0];
            if (touch) this.startDrag(touch);
          },
          activeOptions
        );
        document.addEventListener(
          "touchmove",
          (e) => {
            const touch = e.touches[0];
            if (touch) this.onDrag(touch);
          },
          activeOptions
        );
        document.addEventListener(
          "touchend",
          () => this.endDrag(),
          passiveOptions
        );

        this.cardLine.addEventListener(
          "wheel",
          (e) => this.onWheel(e),
          activeOptions
        );
        this.cardLine.addEventListener(
          "selectstart",
          (e) => e.preventDefault(),
          passiveOptions
        );
        this.cardLine.addEventListener(
          "dragstart",
          (e) => e.preventDefault(),
          passiveOptions
        );
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

        this.cardLine.style.transform = `translate3d(${this.position}px, 0, 0)`;
        // No updateCardClipping here, handled in animation loop
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

        // دمج تحديث القص (Clipping) هنا لضمان التزامن وتقليل العمليات
        this.updateCardClipping();

        requestAnimationFrame(() => this.animate());
      }

      updateCardPosition() {
        if (this.position < -this.cardLineWidth) {
          this.position = this.containerWidth;
        } else if (this.position > this.containerWidth) {
          this.position = -this.cardLineWidth;
        }
        this.cardLine.style.transform = `translate3d(${this.position}px, 0, 0)`;
      }

      onWheel(e: WheelEvent) {
        e.preventDefault();
        const scrollSpeed = 20;
        const delta = e.deltaY > 0 ? scrollSpeed : -scrollSpeed;
        this.position += delta;
        this.updateCardPosition();
      }

      private codeCache = new Map<string, string>();

      generateCode(width: number, height: number): string {
        const cacheKey = `${width}x${height}`;
        if (this.codeCache.has(cacheKey)) {
          return this.codeCache.get(cacheKey)!;
        }

        const randInt = (min: number, max: number) =>
          Math.floor(Math.random() * (max - min + 1)) + min;
        const pick = (arr: string[]) => {
          if (!arr || arr.length === 0) return "";
          const item = arr[randInt(0, arr.length - 1)];
          return item || "";
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

        const library: string[] = [];
        header.forEach((l) => library.push(l));
        helpers.forEach((l) => library.push(l));

        let flow = library.join(" ");
        flow = flow.replace(/\s+/g, " ").trim();
        const totalChars = width * height;
        while (flow.length < totalChars + width) {
          const extra = pick(library).replace(/\s+/g, " ").trim();
          flow += " " + (extra || "");
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

        // Cache the result
        this.codeCache.set(cacheKey, out);
        return out;
      }

      calculateCodeDimensions(
        cardWidth: number,
        cardHeight: number
      ): {
        width: number;
        height: number;
        fontSize: number;
        lineHeight: number;
      } {
        if (!cardWidth || !cardHeight)
          return { width: 0, height: 0, fontSize: 11, lineHeight: 13 };
        return {
          width: Math.floor(cardWidth / 6),
          height: Math.floor(cardHeight / 13),
          fontSize: 11,
          lineHeight: 13,
        };
      }

      // Helper methods for pooling
      private getCardFromPool(): HTMLDivElement {
        const card = this.cardPool.pop();
        return card ? card : this.createNewCard();
      }
      private createNewCard(): HTMLDivElement {
        const wrapper = document.createElement("div");
        wrapper.className = "card-wrapper";
        return wrapper;
      }

      createCardWrapper(
        card: (typeof CARDS_11)[number],
        imageIndex: number
      ): HTMLDivElement {
        const wrapper = this.getCardFromPool();
        wrapper.setAttribute("data-link", card.href);

        // إضافة Index للكارت لتسهيل الحسابات الرياضية لاحقاً
        // هذا مهم جداً للتحسين الرياضي
        const currentTotalCards = this.cardLine.children.length;
        wrapper.setAttribute("data-index", currentTotalCards.toString());

        wrapper.style.cursor = "pointer";
        wrapper.onclick = () => {
          window.location.href = card.href;
        };

        const normalCard = document.createElement("div");
        normalCard.className = "card card-normal";

        const cardImage = document.createElement("img");
        cardImage.className = "card-image";
        cardImage.src = (images[imageIndex] ?? images[0]) || "";
        cardImage.alt = card.title;
        cardImage.loading = "lazy";
        cardImage.decoding = "async"; // Important for performance

        normalCard.appendChild(cardImage);

        const asciiCard = document.createElement("div");
        asciiCard.className = "card card-ascii";

        const asciiContent = document.createElement("div");
        asciiContent.className = "ascii-content";
        const { width, height, fontSize, lineHeight } =
          this.calculateCodeDimensions(400, 250);
        asciiContent.style.fontSize = fontSize + "px";
        asciiContent.style.lineHeight = lineHeight + "px";
        asciiContent.textContent = this.generateCode(width, height);

        asciiCard.appendChild(asciiContent);
        wrapper.appendChild(normalCard);
        wrapper.appendChild(asciiCard);

        this.intersectionObserver.observe(wrapper);
        return wrapper;
      }

      // --- THE CORE OPTIMIZATION IS HERE ---
      updateCardClipping() {
        // Calculate Scanner position strictly mathematically
        const scannerCenter = window.innerWidth / 2;
        const scannerWidthHalf = 4; // Half of 8px
        const scannerLeft = scannerCenter - scannerWidthHalf;
        const scannerRight = scannerCenter + scannerWidthHalf;
        let anyScanningActive = false;

        // Loop through visible cards only
        this.visibleCards.forEach((wrapper) => {
          // بدلاً من getBoundingClientRect() المكلفة جداً
          // سنحسب مكان الكارت بناءً على موقعه في المصفوفة والإزاحة الحالية
          // Relative X = (Index * FullWidth) + GlobalOffset

          // ملاحظة: بما أن الكروت داخل div متحرك، فإن getBoundingClientRect هو الأسهل
          // ولكن لجعله أسرع، سنستخدم الحسابات التقريبية إذا أمكن،
          // أو نستخدم getBoundingClientRect مرة واحدة فقط إذا لزم الأمر.

          // التحسين الأقوى هنا:
          // استخدام getBoundingClientRect داخل requestAnimationFrame يعتبر Layout Thrashing
          // الحل: الاعتماد على this.position

          // بما أننا نستخدم translate3d على الحاوية الأب (cardLine)
          // فإن موقع الكارت بالنسبة للشاشة هو:
          // WrapperOffsetLeft + CurrentTranslateX
          // وحيث أن العناصر flex static، فإن WrapperOffsetLeft هو (Index * 460) تقريباً

          const rect = wrapper.getBoundingClientRect(); // سنبقي هذا للتبسيط ولكن سنحسن ما بعده
          // التحسين: إذا كان الكارت بعيداً جداً عن المنتصف، لا تقم بأي عمليات DOM إضافية

          const cardLeft = rect.left;
          const cardRight = rect.right;

          // تحسين جذري: تخطي الحسابات إذا كان الكارت خارج منطقة الماسح تماماً بهامش كبير
          if (cardRight < scannerLeft - 50 || cardLeft > scannerRight + 50) {
            // Reset styles if needed only once (using a flag ideally, but simplistic here)
            const normalCard = wrapper.firstChild as HTMLElement | null;
            const asciiCard = wrapper.lastChild as HTMLElement | null;
            if (normalCard && asciiCard) {
              if (
                normalCard.style &&
                normalCard.style.getPropertyValue("--clip-right") !== "0%"
              ) {
                // Only write if changed
                if (cardRight < scannerLeft) {
                  normalCard.style.setProperty("--clip-right", "100%");
                  asciiCard.style.setProperty("--clip-left", "100%");
                } else {
                  normalCard.style.setProperty("--clip-right", "0%");
                  asciiCard.style.setProperty("--clip-left", "0%");
                }
              }
            }
            wrapper.removeAttribute("data-scanned");
            return;
          }

          // If we are here, the card is intersecting or very close to the scanner
          const cardWidth = 400; // Fixed width known
          const normalCard = wrapper.firstChild as HTMLElement | null;
          const asciiCard = wrapper.lastChild as HTMLElement | null;

          if (cardLeft < scannerRight && cardRight > scannerLeft) {
            anyScanningActive = true;
            const scannerIntersectLeft = Math.max(scannerLeft - cardLeft, 0);

            // Math optimizations
            const normalClipRight = (scannerIntersectLeft / cardWidth) * 100;
            // Assuming symmetric scanner for simple math
            const asciiClipLeft =
              normalClipRight + ((scannerWidthHalf * 2) / cardWidth) * 100;

            if (
              normalCard &&
              asciiCard &&
              normalCard.style &&
              asciiCard.style
            ) {
              normalCard.style.setProperty(
                "--clip-right",
                `${normalClipRight}%`
              );
              asciiCard.style.setProperty("--clip-left", `${asciiClipLeft}%`);
            }

            if (
              !wrapper.hasAttribute("data-scanned") &&
              scannerIntersectLeft > 0
            ) {
              wrapper.setAttribute("data-scanned", "true");
              // Add effect logic here if needed, kept minimal for perf
            }
          }
        });

        if ((window as any).setScannerScanning) {
          (window as any).setScannerScanning(anyScanningActive);
        }
      }

      updateAsciiContent() {
        // تحديث المحتوى فقط للكروت الظاهرة وبمعدل عشوائي أقل لتقليل الضغط
        this.visibleCards.forEach((wrapper) => {
          if (Math.random() > 0.05) return; // تحديث 5% فقط من الكروت في كل دورة
          const content = wrapper.querySelector(".ascii-content");
          if (content) {
            // Use cached dimensions
            const { width, height } = this.calculateCodeDimensions(400, 250);
            content.textContent = this.generateCode(width, height);
          }
        });
      }

      populateCardLine() {
        this.cardLine.innerHTML = "";
        const repeatCount = 4;
        let globalIndex = 0; // Track global index for positioning math
        for (let repeat = 0; repeat < repeatCount; repeat++) {
          CARDS_11.forEach((card) => {
            const slug = card.href.replace("/", "");
            const imageIndex =
              memoizedCardImageMap[slug as keyof typeof memoizedCardImageMap] ??
              0;
            const cardWrapper = this.createCardWrapper(card, imageIndex);
            this.cardLine.appendChild(cardWrapper);
            globalIndex++;
          });
        }
      }

      destroy() {
        this.resizeObserver?.disconnect();
        this.intersectionObserver?.disconnect();
        this.codeCache.clear();
        this.cardPool.length = 0;
        this.visibleCards.clear();
      }
    }

    // Enhanced ParticleSystem with performance optimizations
    class OptimizedParticleSystem {
      scene: THREE.Scene;
      camera: THREE.OrthographicCamera;
      renderer: THREE.WebGLRenderer;
      particles: THREE.Points | null;
      particleCount: number;
      canvas: HTMLCanvasElement;
      velocities: Float32Array;
      alphas: Float32Array;
      private animationId: number | null = null;
      private isVisible: boolean = true;

      constructor(canvas: HTMLCanvasElement) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(
          -window.innerWidth / 2,
          window.innerWidth / 2,
          125,
          -125,
          1,
          1000
        );
        this.camera.position.z = 100;
        this.renderer = new THREE.WebGLRenderer({
          canvas: canvas,
          alpha: true,
          antialias: false, // Performance: Disable antialiasing
          powerPreference: "high-performance", // Performance: Request high performance
        });
        this.renderer.setSize(window.innerWidth, 250);
        this.renderer.setClearColor(0x000000, 0);
        this.particles = null;
        this.particleCount = 300; // Performance: Reduced from 400
        this.velocities = new Float32Array(0);
        this.alphas = new Float32Array(0);
        this.canvas = canvas;

        this.setupVisibilityObserver();
        this.createParticles();
        this.animate();

        window.addEventListener("resize", () => this.onWindowResize());
      }

      // Performance: Pause animation when not visible
      private setupVisibilityObserver() {
        const observer = new IntersectionObserver(
          (entries) => {
            if (entries[0]) {
              this.isVisible = entries[0].isIntersecting;
            }
          },
          { threshold: 0 }
        );
        observer.observe(this.canvas);
      }

      createParticles() {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.particleCount * 3);
        const colors = new Float32Array(this.particleCount * 3);
        const sizes = new Float32Array(this.particleCount);
        const velocities = new Float32Array(this.particleCount);

        // Performance: Create texture once and reuse
        const texture = this.createParticleTexture();

        for (let i = 0; i < this.particleCount; i++) {
          positions[i * 3] = (Math.random() - 0.5) * window.innerWidth * 2;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 250;
          positions[i * 3 + 2] = 0;

          colors[i * 3] = 1;
          colors[i * 3 + 1] = 1;
          colors[i * 3 + 2] = 1;

          const orbitRadius = Math.random() * 200 + 100;
          sizes[i] = (Math.random() * (orbitRadius - 60) + 60) / 8;

          velocities[i] = Math.random() * 60 + 30;
        }

        geometry.setAttribute(
          "position",
          new THREE.BufferAttribute(positions, 3)
        );
        geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

        this.velocities = velocities;

        const alphas = new Float32Array(this.particleCount);
        for (let i = 0; i < this.particleCount; i++) {
          alphas[i] = (Math.random() * 8 + 2) / 10;
        }
        geometry.setAttribute("alpha", new THREE.BufferAttribute(alphas, 1));
        this.alphas = alphas;

        const material = new THREE.ShaderMaterial({
          uniforms: {
            pointTexture: { value: texture },
            size: { value: 15.0 },
          },
          vertexShader: `
            attribute float alpha;
            varying float vAlpha;
            varying vec3 vColor;
            uniform float size;

            void main() {
              vAlpha = alpha;
              vColor = color;
              vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
              gl_PointSize = size;
              gl_Position = projectionMatrix * mvPosition;
            }
          `,
          fragmentShader: `
            uniform sampler2D pointTexture;
            varying float vAlpha;
            varying vec3 vColor;

            void main() {
              gl_FragColor = vec4(vColor, vAlpha) * texture2D(pointTexture, gl_PointCoord);
            }
          `,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          vertexColors: true,
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
      }

      // Performance: Cache texture creation
      private createParticleTexture(): THREE.CanvasTexture {
        const canvas = document.createElement("canvas");
        canvas.width = 64; // Performance: Reduced from 100
        canvas.height = 64;
        const ctx = canvas.getContext("2d")!;

        const half = canvas.width / 2;
        const hue = 217;

        const gradient = ctx.createRadialGradient(
          half,
          half,
          0,
          half,
          half,
          half
        );
        gradient.addColorStop(0.025, "#fff");
        gradient.addColorStop(0.1, `hsl(${hue}, 61%, 33%)`);
        gradient.addColorStop(0.25, `hsl(${hue}, 64%, 6%)`);
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(half, half, half, 0, Math.PI * 2);
        ctx.fill();

        return new THREE.CanvasTexture(canvas);
      }

      animate() {
        if (!this.isVisible) {
          this.animationId = requestAnimationFrame(() => this.animate());
          return;
        }

        if (this.particles) {
          const positionAttr = this.particles.geometry.attributes.position;
          const alphaAttr = this.particles.geometry.attributes.alpha;

          if (!positionAttr || !alphaAttr) return;

          const positions = positionAttr.array as Float32Array;
          const alphas = alphaAttr.array as Float32Array;
          const time = Date.now() * 0.001;

          // Performance: Process particles in batches
          const batchSize = 50;
          const pCount = this.particleCount > 0 ? this.particleCount : 1;
          const startIndex =
            (Math.floor(time * 10) % (Math.ceil(pCount / batchSize) || 1)) *
            batchSize;
          const endIndex = Math.min(
            startIndex + batchSize,
            this.particleCount || 0
          );

          for (let i = startIndex; i < endIndex; i++) {
            const velocity = this.velocities[i];
            const posX = positions[i * 3];

            if (velocity !== undefined && posX !== undefined) {
              positions[i * 3] = posX + velocity * 0.016;
            }

            const currentPosX = positions[i * 3];
            if (
              currentPosX !== undefined &&
              currentPosX > window.innerWidth / 2 + 100
            ) {
              positions[i * 3] = -window.innerWidth / 2 - 100;
              positions[i * 3 + 1] = (Math.random() - 0.5) * 250;
            }

            const currentPosY = positions[i * 3 + 1];
            if (currentPosY !== undefined) {
              positions[i * 3 + 1] =
                currentPosY + Math.sin(time + i * 0.1) * 0.5;
            }

            // Performance: Reduce twinkle frequency
            if (Math.random() < 0.01) {
              // Reduced from 0.1
              const currentAlpha = alphas[i];
              if (currentAlpha !== undefined) {
                const twinkle = Math.floor(Math.random() * 10);
                let newAlpha = currentAlpha;
                if (twinkle === 1 && currentAlpha > 0) {
                  newAlpha = currentAlpha - 0.05;
                } else if (twinkle === 2 && currentAlpha < 1) {
                  newAlpha = currentAlpha + 0.05;
                }
                alphas[i] = Math.max(0, Math.min(1, newAlpha));
              }
            }
          }

          positionAttr.needsUpdate = true;
          alphaAttr.needsUpdate = true;
        }

        this.renderer.render(this.scene, this.camera);
        this.animationId = requestAnimationFrame(() => this.animate());
      }

      onWindowResize() {
        this.camera.left = -window.innerWidth / 2;
        this.camera.right = window.innerWidth / 2;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, 250);
      }

      destroy() {
        if (this.animationId) {
          cancelAnimationFrame(this.animationId);
        }
        if (this.renderer) {
          this.renderer.dispose();
        }
        if (this.particles) {
          this.scene.remove(this.particles);
          this.particles.geometry.dispose();
          (this.particles.material as THREE.Material).dispose();
        }
      }
    }

    // Enhanced ParticleScanner with performance optimizations
    class OptimizedParticleScanner {
      canvas: HTMLCanvasElement;
      ctx: CanvasRenderingContext2D;
      animationId: number | null;
      w: number;
      h: number;
      particles: any[];
      count: number;
      maxParticles: number;
      intensity: number;
      lightBarX: number;
      lightBarWidth: number;
      fadeZone: number;
      scanTargetIntensity: number;
      scanTargetParticles: number;
      scanTargetFadeZone: number;
      scanningActive: boolean;
      baseIntensity: number;
      baseMaxParticles: number;
      baseFadeZone: number;
      currentIntensity: number;
      currentMaxParticles: number;
      currentFadeZone: number;
      transitionSpeed: number;
      gradientCanvas: HTMLCanvasElement;
      gradientCtx: CanvasRenderingContext2D;
      currentGlowIntensity: number;
      private isVisible: boolean = true;
      private frameCount: number = 0;

      constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d", {
          alpha: true,
          desynchronized: true, // Performance: Enable desynchronized rendering
        })!;
        this.animationId = null;

        this.w = window.innerWidth;
        this.h = 300;
        this.particles = [];
        this.count = 0;
        this.maxParticles = 600; // Performance: Reduced from 800
        this.intensity = 0.8;
        this.lightBarX = this.w / 2;
        this.lightBarWidth = 3;
        this.fadeZone = 60;

        this.scanTargetIntensity = 1.8;
        this.scanTargetParticles = 2000; // Performance: Reduced from 2500
        this.scanTargetFadeZone = 35;

        this.scanningActive = false;

        this.baseIntensity = this.intensity;
        this.baseMaxParticles = this.maxParticles;
        this.baseFadeZone = this.fadeZone;

        this.currentIntensity = this.intensity;
        this.currentMaxParticles = this.maxParticles;
        this.currentFadeZone = this.fadeZone;
        this.transitionSpeed = 0.05;

        this.gradientCanvas = document.createElement("canvas");
        this.gradientCtx = this.gradientCanvas.getContext("2d")!;
        this.currentGlowIntensity = 1;

        this.setupVisibilityObserver();
        this.setupCanvas();
        this.createGradientCache();
        this.initParticles();
        this.animate();

        window.addEventListener("resize", () => this.onResize());
      }

      // Performance: Pause animation when not visible
      private setupVisibilityObserver() {
        const observer = new IntersectionObserver(
          (entries) => {
            if (entries[0]) {
              this.isVisible = entries[0].isIntersecting;
            }
          },
          { threshold: 0 }
        );
        observer.observe(this.canvas);
      }

      setupCanvas() {
        this.canvas.width = this.w;
        this.canvas.height = this.h;
        this.canvas.style.width = this.w + "px";
        this.canvas.style.height = this.h + "px";
        this.ctx.clearRect(0, 0, this.w, this.h);
      }

      onResize() {
        this.w = window.innerWidth;
        this.lightBarX = this.w / 2;
        this.setupCanvas();
      }

      createGradientCache() {
        this.gradientCanvas.width = 16;
        this.gradientCanvas.height = 16;
        const half = this.gradientCanvas.width / 2;
        const gradient = this.gradientCtx.createRadialGradient(
          half,
          half,
          0,
          half,
          half,
          half
        );
        gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
        gradient.addColorStop(0.3, "rgba(173, 216, 230, 0.8)");
        gradient.addColorStop(0.7, "rgba(135, 206, 250, 0.4)");
        gradient.addColorStop(1, "transparent");

        this.gradientCtx.fillStyle = gradient;
        this.gradientCtx.beginPath();
        this.gradientCtx.arc(half, half, half, 0, Math.PI * 2);
        this.gradientCtx.fill();
      }

      random(min: number, max: number) {
        if (arguments.length < 2) {
          max = min;
          min = 0;
        }
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }

      randomFloat(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      createParticle() {
        const intensityRatio = this.intensity / this.baseIntensity;
        const speedMultiplier = 1 + (intensityRatio - 1) * 1.2;
        const sizeMultiplier = 1 + (intensityRatio - 1) * 0.7;

        return {
          x:
            this.lightBarX +
            this.randomFloat(-this.lightBarWidth / 2, this.lightBarWidth / 2),
          y: this.randomFloat(0, this.h),
          vx: this.randomFloat(0.2, 1.0) * speedMultiplier,
          vy: this.randomFloat(-0.15, 0.15) * speedMultiplier,
          radius: this.randomFloat(0.4, 1) * sizeMultiplier,
          alpha: this.randomFloat(0.6, 1),
          decay: this.randomFloat(0.005, 0.025) * (2 - intensityRatio * 0.5),
          originalAlpha: 0,
          life: 1.0,
          time: 0,
          startX: 0,
          twinkleSpeed: this.randomFloat(0.02, 0.08) * speedMultiplier,
          twinkleAmount: this.randomFloat(0.1, 0.25),
        };
      }

      initParticles() {
        for (let i = 0; i < this.maxParticles; i++) {
          const particle = this.createParticle();
          particle.originalAlpha = particle.alpha;
          particle.startX = particle.x;
          this.count++;
          this.particles[this.count] = particle;
        }
      }

      updateParticle(particle: any) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.time++;

        particle.alpha =
          particle.originalAlpha * particle.life +
          Math.sin(particle.time * particle.twinkleSpeed) *
            particle.twinkleAmount;

        particle.life -= particle.decay;

        if (particle.x > this.w + 10 || particle.life <= 0) {
          this.resetParticle(particle);
        }
      }

      resetParticle(particle: any) {
        particle.x =
          this.lightBarX +
          this.randomFloat(-this.lightBarWidth / 2, this.lightBarWidth / 2);
        particle.y = this.randomFloat(0, this.h);
        particle.vx = this.randomFloat(0.2, 1.0);
        particle.vy = this.randomFloat(-0.15, 0.15);
        particle.alpha = this.randomFloat(0.6, 1);
        particle.originalAlpha = particle.alpha;
        particle.life = 1.0;
        particle.time = 0;
        particle.startX = particle.x;
      }

      drawParticle(particle: any) {
        if (particle.life <= 0) return;

        let fadeAlpha = 1;

        if (particle.y < this.fadeZone) {
          fadeAlpha = particle.y / this.fadeZone;
        } else if (particle.y > this.h - this.fadeZone) {
          fadeAlpha = (this.h - particle.y) / this.fadeZone;
        }

        fadeAlpha = Math.max(0, Math.min(1, fadeAlpha));

        this.ctx.globalAlpha = particle.alpha * fadeAlpha;
        this.ctx.drawImage(
          this.gradientCanvas,
          particle.x - particle.radius,
          particle.y - particle.radius,
          particle.radius * 2,
          particle.radius * 2
        );
      }

      drawLightBar() {
        const cardHeight = 250;
        const idleHeight = cardHeight * 0.8;
        const currentHeight = this.scanningActive ? cardHeight : idleHeight;
        const drawY = (this.h - currentHeight) / 2;
        const currentFadeZone = this.scanningActive ? 5 : this.fadeZone;

        const verticalGradient = this.ctx.createLinearGradient(
          0,
          drawY,
          0,
          drawY + currentHeight
        );
        verticalGradient.addColorStop(0, "rgba(255, 255, 255, 0)");
        verticalGradient.addColorStop(
          Math.min(0.5, currentFadeZone / currentHeight),
          "rgba(255, 255, 255, 1)"
        );
        verticalGradient.addColorStop(
          Math.max(0.5, 1 - currentFadeZone / currentHeight),
          "rgba(255, 255, 255, 1)"
        );
        verticalGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

        this.ctx.globalCompositeOperation = "lighter";

        const targetGlowIntensity = this.scanningActive ? 3.5 : 1;
        if (!this.currentGlowIntensity) this.currentGlowIntensity = 1;
        this.currentGlowIntensity +=
          (targetGlowIntensity - this.currentGlowIntensity) *
          this.transitionSpeed;

        const glowIntensity = this.currentGlowIntensity;
        const lineWidth = this.lightBarWidth;
        const glow1Alpha = this.scanningActive ? 1.0 : 0.8;
        const glow2Alpha = this.scanningActive ? 0.8 : 0.6;

        const coreGradient = this.ctx.createLinearGradient(
          this.lightBarX - lineWidth / 2,
          0,
          this.lightBarX + lineWidth / 2,
          0
        );
        coreGradient.addColorStop(0, "rgba(255, 255, 255, 0)");
        coreGradient.addColorStop(
          0.3,
          `rgba(255, 255, 255, ${0.9 * glowIntensity})`
        );
        coreGradient.addColorStop(
          0.5,
          `rgba(255, 255, 255, ${1 * glowIntensity})`
        );
        coreGradient.addColorStop(
          0.7,
          `rgba(255, 255, 255, ${0.9 * glowIntensity})`
        );
        coreGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

        this.ctx.globalAlpha = 1;
        this.ctx.fillStyle = coreGradient;

        const radius = 15;
        this.ctx.beginPath();
        (this.ctx as any).roundRect(
          this.lightBarX - lineWidth / 2,
          drawY,
          lineWidth,
          currentHeight,
          radius
        );
        this.ctx.fill();

        const glow1Gradient = this.ctx.createLinearGradient(
          this.lightBarX - lineWidth * 2,
          0,
          this.lightBarX + lineWidth * 2,
          0
        );
        glow1Gradient.addColorStop(0, "rgba(135, 206, 250, 0)");
        glow1Gradient.addColorStop(
          0.5,
          `rgba(173, 216, 230, ${0.8 * glowIntensity})`
        );
        glow1Gradient.addColorStop(1, "rgba(135, 206, 250, 0)");

        this.ctx.globalAlpha = glow1Alpha;
        this.ctx.fillStyle = glow1Gradient;

        const glow1Radius = 25;
        this.ctx.beginPath();
        (this.ctx as any).roundRect(
          this.lightBarX - lineWidth * 2,
          drawY,
          lineWidth * 4,
          currentHeight,
          glow1Radius
        );
        this.ctx.fill();

        const glow2Gradient = this.ctx.createLinearGradient(
          this.lightBarX - lineWidth * 4,
          0,
          this.lightBarX + lineWidth * 4,
          0
        );
        glow2Gradient.addColorStop(0, "rgba(135, 206, 250, 0)");
        glow2Gradient.addColorStop(
          0.5,
          `rgba(135, 206, 250, ${0.4 * glowIntensity})`
        );
        glow2Gradient.addColorStop(1, "rgba(135, 206, 250, 0)");

        this.ctx.globalAlpha = glow2Alpha;
        this.ctx.fillStyle = glow2Gradient;

        const glow2Radius = 35;
        this.ctx.beginPath();
        (this.ctx as any).roundRect(
          this.lightBarX - lineWidth * 4,
          drawY,
          lineWidth * 8,
          currentHeight,
          glow2Radius
        );
        this.ctx.fill();

        this.ctx.globalCompositeOperation = "destination-in";
        this.ctx.globalAlpha = 1;
        this.ctx.fillStyle = verticalGradient;
        this.ctx.fillRect(0, drawY, this.w, currentHeight);
      }

      render() {
        if (!this.isVisible) return;

        // Performance: Skip frames when not scanning
        this.frameCount++;
        if (!this.scanningActive && this.frameCount % 2 === 0) return;

        const targetIntensity = this.scanningActive
          ? this.scanTargetIntensity
          : this.baseIntensity;
        const targetMaxParticles = this.scanningActive
          ? this.scanTargetParticles
          : this.baseMaxParticles;
        const targetFadeZone = this.scanningActive
          ? this.scanTargetFadeZone
          : this.baseFadeZone;

        this.currentIntensity +=
          (targetIntensity - this.currentIntensity) * this.transitionSpeed;
        this.currentMaxParticles +=
          (targetMaxParticles - this.currentMaxParticles) *
          this.transitionSpeed;
        this.currentFadeZone +=
          (targetFadeZone - this.currentFadeZone) * this.transitionSpeed;

        this.intensity = this.currentIntensity;
        this.maxParticles = Math.floor(this.currentMaxParticles);
        this.fadeZone = this.currentFadeZone;

        this.ctx.globalCompositeOperation = "source-over";
        this.ctx.clearRect(0, 0, this.w, this.h);

        this.drawLightBar();

        this.ctx.globalCompositeOperation = "lighter";

        // Performance: Process particles in batches
        const batchSize = this.scanningActive ? 100 : 50;
        const startIndex =
          (this.frameCount % Math.ceil(this.count / batchSize)) * batchSize;
        const endIndex = Math.min(startIndex + batchSize, this.count);

        for (let i = startIndex; i <= endIndex; i++) {
          if (this.particles[i]) {
            this.updateParticle(this.particles[i]);
            this.drawParticle(this.particles[i]);
          }
        }

        if (Math.random() < this.intensity && this.count < this.maxParticles) {
          const particle = this.createParticle();
          particle.originalAlpha = particle.alpha;
          particle.startX = particle.x;
          this.count++;
          this.particles[this.count] = particle;
        }

        if (this.count > this.maxParticles + 200) {
          const excessCount = Math.min(15, this.count - this.maxParticles);
          for (let i = 0; i < excessCount; i++) {
            delete this.particles[this.count - i];
          }
          this.count -= excessCount;
        }
      }

      animate() {
        this.render();
        this.animationId = requestAnimationFrame(() => this.animate());
      }

      setScanningActive(active: boolean) {
        this.scanningActive = active;
      }

      destroy() {
        if (this.animationId) {
          cancelAnimationFrame(this.animationId);
        }
        this.particles = [];
        this.count = 0;
      }
    }

    // Initialize all systems with optimized versions
    const cardStream = new OptimizedCardStreamController(
      cardStreamRef.current!,
      cardLineRef.current!
    );
    const particleSystem = new OptimizedParticleSystem(
      particleCanvasRef.current!
    );
    const particleScanner = new OptimizedParticleScanner(
      scannerCanvasRef.current!
    );

    (window as any).setScannerScanning = (active: boolean) => {
      if (particleScanner) {
        particleScanner.setScanningActive(active);
      }
    };

    // Cleanup
    return () => {
      cardStream.destroy();
      particleSystem.destroy();
      particleScanner.destroy();
    };
  }, [memoizedCardImageMap]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;700&display=swap');

        .card-scanner-container {
          position: relative;
          width: 100vw;
          height: 100%;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          background: #000000;
          overflow: hidden;
          padding-top: 2rem;
        }

        .card-stream {
          position: absolute;
          width: 100vw;
          height: 180px;
          display: flex;
          align-items: center;
          overflow: visible;
        }

        .card-line {
          display: flex;
          align-items: center;
          gap: 60px;
          white-space: nowrap;
          cursor: grab;
          user-select: none;
          will-change: transform;
          transform-style: preserve-3d;
        }

        .card-line:active {
          cursor: grabbing;
        }

        .card-line.dragging {
          cursor: grabbing;
        }

        .card-wrapper {
          position: relative;
          width: 400px;
          height: 250px;
          flex-shrink: 0;
          transition: transform 0.3s ease;
          will-change: transform;
          backface-visibility: hidden;
        }

        .card-wrapper:hover {
          transform: scale(1.05) translateZ(0);
        }

        .card {
          position: absolute;
          top: 0;
          left: 0;
          width: 400px;
          height: 250px;
          border-radius: 15px;
          overflow: hidden;
          will-change: clip-path;
        }

        .card-normal {
          background: transparent;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 0;
          color: white;
          z-index: 2;
          position: relative;
          overflow: hidden;
          clip-path: inset(0 0 0 var(--clip-right, 0%));
        }

        .card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 15px;
          transition: all 0.3s ease;
          filter: brightness(1.1) contrast(1.1);
          box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.1);
          will-change: filter;
        }

        .card-image:hover {
          filter: brightness(1.2) contrast(1.2);
        }

        .card-ascii {
          background: transparent;
          z-index: 1;
          position: absolute;
          top: 0;
          left: 0;
          width: 400px;
          height: 250px;
          border-radius: 15px;
          overflow: hidden;
          clip-path: inset(0 calc(100% - var(--clip-left, 0%)) 0 0);
        }

        .ascii-content {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          color: rgba(255, 255, 255, 0.6);
          font-family: 'Courier New', monospace;
          font-size: 11px;
          line-height: 13px;
          overflow: hidden;
          white-space: pre;
          animation: glitch 0.1s infinite linear alternate-reverse;
          margin: 0;
          padding: 0;
          text-align: left;
          vertical-align: top;
          box-sizing: border-box;
          -webkit-mask-image: linear-gradient(
            to right,
            rgba(0, 0, 0, 1) 0%,
            rgba(0, 0, 0, 0.8) 30%,
            rgba(0, 0, 0, 0.6) 50%,
            rgba(0, 0, 0, 0.4) 80%,
            rgba(0, 0, 0, 0.2) 100%
          );
          mask-image: linear-gradient(
            to right,
            rgba(0, 0, 0, 1) 0%,
            rgba(0, 0, 0, 0.8) 30%,
            rgba(0, 0, 0, 0.6) 50%,
            rgba(0, 0, 0, 0.4) 80%,
            rgba(0, 0, 0, 0.2) 100%
          );
          will-change: opacity;
        }

        @keyframes glitch {
          0% {
            opacity: 1;
          }
          15% {
            opacity: 0.9;
          }
          16% {
            opacity: 1;
          }
          49% {
            opacity: 0.8;
          }
          50% {
            opacity: 1;
          }
          99% {
            opacity: 0.9;
          }
          100% {
            opacity: 1;
          }
        }

        .scan-effect {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg,
            transparent,
            rgba(135, 206, 250, 0.1) 40%,
            rgba(135, 206, 250, 0.7) 50%,
            rgba(135, 206, 250, 0.1) 60%,
            transparent
          );
          animation: scanEffect 0.5s ease-in-out;
          pointer-events: none;
          z-index: 5;
          will-change: transform, opacity;
        }

        @keyframes scanEffect {
          0% {
            transform: translateX(-110%) skewX(-30deg);
            opacity: 0;
          }
          40% {
            transform: translateX(-30%) skewX(-30deg);
            opacity: 1;
          }
          60% {
            transform: translateX(30%) skewX(-30deg);
            opacity: 1;
          }
          100% {
            transform: translateX(110%) skewX(-30deg);
            opacity: 0;
          }
        }

        #particleCanvas {
          position: absolute;
          top: 50%;
          left: 0;
          transform: translateY(-50%) translateZ(0);
          width: 100vw;
          height: 250px;
          z-index: 0;
          pointer-events: none;
          will-change: transform;
        }

        #scannerCanvas {
          position: absolute;
          top: 50%;
          left: -3px;
          transform: translateY(-50%) translateZ(0);
          width: 100vw;
          height: 300px;
          z-index: 15;
          pointer-events: none;
          will-change: transform;
        }
      `}</style>

      <div className="card-scanner-container" ref={containerRef}>
        <canvas ref={particleCanvasRef} id="particleCanvas" />
        <canvas ref={scannerCanvasRef} id="scannerCanvas" />

        <div className="card-stream" ref={cardStreamRef}>
          <div className="card-line" ref={cardLineRef}></div>
        </div>
      </div>
    </>
  );
}
