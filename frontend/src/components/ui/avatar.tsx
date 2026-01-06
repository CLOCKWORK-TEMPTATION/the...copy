"use client"

import { ReactNode } from "react"
import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Avatar Components
 * Display user avatars and fallbacks
 */

const AvatarContext = React.createContext<{
  imageLoadingStatus: "loading" | "loaded" | "error"
  setImageLoadingStatus: (status: "loading" | "loaded" | "error") => void
} | undefined>(undefined)

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children: ReactNode
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
Avatar.displayName = "Avatar"

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string
}

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, onLoadingStatusChange = () => {}, ...props }, ref) => {
    const context = React.useContext(AvatarContext)
    const [status, setStatus] = React.useState<"loading" | "loaded" | "error">("loading")

    React.useEffect(() => {
      if (status !== "loading") {
        onLoadingStatusChange(status)
        context?.setImageLoadingStatus(status)
      }
    }, [status, context, onLoadingStatusChange])

    return (
      <img
        ref={ref}
        className={cn("aspect-square h-full w-full", className)}
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
        {...props}
      />
    )
  }
)
AvatarImage.displayName = "AvatarImage"

interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children: ReactNode
}

const AvatarFallback = React.forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback }
