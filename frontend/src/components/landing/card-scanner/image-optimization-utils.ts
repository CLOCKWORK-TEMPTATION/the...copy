// Image optimization utilities
export interface OptimizedImageConfig {
  src: string;
  webpSrc?: string;
  avifSrc?: string;
  placeholder?: string;
  sizes?: string;
  quality?: number;
}

export class ImageOptimizer {
  private static instance: ImageOptimizer;
  private cache = new Map<string, HTMLImageElement>();
  private loadingPromises = new Map<string, Promise<HTMLImageElement>>();
  private placeholderCache = new Map<string, string>();

  static getInstance(): ImageOptimizer {
    if (!ImageOptimizer.instance) {
      ImageOptimizer.instance = new ImageOptimizer();
    }
    return ImageOptimizer.instance;
  }

  // Generate optimized image URLs
  generateOptimizedUrls(
    originalSrc: string,
    width: number = 400,
    height: number = 250
  ): OptimizedImageConfig {
    const baseUrl = originalSrc.split("?")[0];
    const params = new URLSearchParams();

    // Add optimization parameters
    params.set("w", width.toString());
    params.set("h", height.toString());
    params.set("q", "85"); // Quality 85%
    params.set("f", "auto"); // Auto format
    params.set("fit", "cover");

    return {
      src: `${baseUrl}?${params.toString()}`,
      webpSrc: `${baseUrl}?${params.toString()}&f=webp`,
      avifSrc: `${baseUrl}?${params.toString()}&f=avif`,
      placeholder: this.generatePlaceholder(width, height),
      sizes: `(max-width: 768px) 300px, 400px`,
      quality: 85,
    };
  }

  // Generate base64 placeholder
  generatePlaceholder(width: number, height: number): string {
    const key = `${width}x${height}`;
    if (this.placeholderCache.has(key)) {
      return this.placeholderCache.get(key)!;
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      // Create gradient placeholder
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#1a1a1a");
      gradient.addColorStop(0.5, "#2a2a2a");
      gradient.addColorStop(1, "#1a1a1a");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Add subtle pattern
      ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
      for (let i = 0; i < width; i += 20) {
        for (let j = 0; j < height; j += 20) {
          if ((i + j) % 40 === 0) {
            ctx.fillRect(i, j, 10, 10);
          }
        }
      }
    }

    const placeholder = canvas.toDataURL("image/jpeg", 0.1);
    this.placeholderCache.set(key, placeholder);
    return placeholder;
  }

  // Preload image with modern formats support
  async preloadImage(config: OptimizedImageConfig): Promise<HTMLImageElement> {
    const cacheKey = config.src;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey)!;
    }

    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.decoding = "async";
      img.loading = "lazy";
      img.fetchPriority = "low";

      // Try modern formats first
      const sources = [config.avifSrc, config.webpSrc, config.src].filter(
        Boolean
      );

      let currentIndex = 0;

      const tryNextFormat = () => {
        if (currentIndex >= sources.length) {
          reject(new Error(`Failed to load image: ${config.src}`));
          return;
        }

        const currentSrc = sources[currentIndex];
        img.onload = () => {
          this.cache.set(cacheKey, img);
          this.loadingPromises.delete(cacheKey);
          resolve(img);
        };

        img.onerror = () => {
          currentIndex++;
          tryNextFormat();
        };

        img.src = currentSrc!;
      };

      tryNextFormat();
    });

    this.loadingPromises.set(cacheKey, promise);
    return promise;
  }

  // Check if image is cached
  isImageCached(src: string): boolean {
    return this.cache.has(src);
  }

  // Get cached image
  getCachedImage(src: string): HTMLImageElement | null {
    return this.cache.get(src) || null;
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
    this.loadingPromises.clear();
  }
}
