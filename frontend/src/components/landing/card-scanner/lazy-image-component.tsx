"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  ImageOptimizer,
  OptimizedImageConfig,
} from "./image-optimization-utils";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean;
}

export function LazyImage({
  src,
  alt,
  className = "",
  width = 400,
  height = 250,
  onLoad,
  onError,
  priority = false,
}: LazyImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [imageSrc, setImageSrc] = useState<string>("");
  const [hasError, setHasError] = useState(false);

  const imageOptimizer = ImageOptimizer.getInstance();

  // Generate optimized image configuration
  const imageConfig: OptimizedImageConfig =
    imageOptimizer.generateOptimizedUrls(src, width, height);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) return; // Skip observer for priority images

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "50px", // Start loading 50px before entering viewport
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [priority]);

  // Load image when in view
  useEffect(() => {
    if (!isInView) return;

    const loadImage = async () => {
      try {
        // Check if image is already cached
        const cachedImage = imageOptimizer.getCachedImage(imageConfig.src);
        if (cachedImage) {
          setImageSrc(cachedImage.src);
          setIsLoaded(true);
          onLoad?.();
          return;
        }

        // Load optimized image
        const loadedImage = await imageOptimizer.preloadImage(imageConfig);
        setImageSrc(loadedImage.src);
        setIsLoaded(true);
        onLoad?.();
      } catch (error) {
        console.error("Failed to load image:", error);
        setHasError(true);
        setImageSrc(imageConfig.placeholder || "");
        onError?.();
      }
    };

    loadImage();
  }, [isInView, imageConfig, onLoad, onError, imageOptimizer]);

  // Set placeholder initially
  useEffect(() => {
    if (!imageSrc && imageConfig.placeholder) {
      setImageSrc(imageConfig.placeholder);
    }
  }, [imageSrc, imageConfig.placeholder]);

  return (
    <div className="relative overflow-hidden">
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        className={`
          ${className}
          transition-all duration-300 ease-out
          ${isLoaded ? "opacity-100 scale-100" : "opacity-70 scale-105"}
          ${hasError ? "filter grayscale" : ""}
        `}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          willChange: isLoaded ? "auto" : "transform, opacity",
        }}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "low"}
      />

      {/* Loading indicator */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 text-white/60 text-sm">
          فشل تحميل الصورة
        </div>
      )}
    </div>
  );
}
