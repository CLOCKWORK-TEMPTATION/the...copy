/**
 * Image configuration and utilities
 */

export interface ImageConfig {
  quality: number;
  format: string[];
  sizes: number[];
  domains: string[];
}

export const defaultImageConfig: ImageConfig = {
  quality: 85,
  format: ["image/avif", "image/webp"],
  sizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  domains: [
    "hebbkx1anhila5yf.public.blob.vercel-storage.com",
    "placehold.co",
    "images.unsplash.com",
    "picsum.photos",
  ],
};

export function getImageUrl(src: string, width?: number): string {
  if (!src) return "";
  if (src.startsWith("http")) return src;
  if (width) return `${src}?w=${width}`;
  return src;
}

export function getOptimizedImage(
  src: string,
  width: number,
  quality = 85
): string {
  if (!src) return "";
  if (src.startsWith("http")) {
    const url = new URL(src);
    url.searchParams.set("w", width.toString());
    url.searchParams.set("q", quality.toString());
    return url.toString();
  }
  return `${src}?w=${width}&q=${quality}`;
}
