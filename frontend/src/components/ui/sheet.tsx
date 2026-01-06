"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SheetProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function Sheet({ className, children, ...props }: SheetProps) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  )
}

export interface SheetContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  side?: "top" | "bottom" | "left" | "right"
}

export function SheetContent({ className, ...props }: SheetContentProps) {
  return <div className={cn("", className)} {...props} />
}

export function SheetHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)} {...props} />
}

export function SheetTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg font-semibold", className)} {...props} />
}

export default Sheet
