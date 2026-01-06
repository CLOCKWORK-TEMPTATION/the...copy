"use client"

import { useState, useCallback } from "react"
import Image, { ImageProps } from "next/image"

/**
 * ImageWithFallback Component
 * Displays an image with a fallback placeholder on error
 */
interface ImageWithFallbackProps extends Omit<ImageProps, "onError"> {
  fallback?: string
  fallbackClassName?: string
}

export function ImageWithFallback({
  src,
  alt,
  fallback = "/placeholder.svg",
  fallbackClassName = "",
  className = "",
  ...props
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  const handleError = useCallback(() => {
    if (!hasError) {
      setHasError(true)
      setImgSrc(fallback)
    }
  }, [fallback, hasError])

  return (
    <Image
      src={imgSrc}
      alt={alt}
      onError={handleError}
      className={`${hasError ? fallbackClassName : className}`}
      {...props}
    />
  )
}
