"use client"

import { ReactNode } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Alert Component
 * Displays a styled alert message
 */

const alertVariants = cva(
  "relative w-full rounded-lg border p-4",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive: "border-destructive/50 text-destructive dark:border-destructive",
        warning: "border-yellow-500/50 text-yellow-900 dark:text-yellow-200",
        success: "border-green-500/50 text-green-900 dark:text-green-200",
        info: "border-blue-500/50 text-blue-900 dark:text-blue-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface AlertProps extends VariantProps<typeof alertVariants> {
  className?: string
  children: ReactNode
}

function Alert({ className, variant, children, ...props }: AlertProps) {
  return (
    <div className={cn(alertVariants({ variant }), className)} {...props}>
      {children}
    </div>
  )
}

function AlertTitle({ className, ...props }: { className?: string; children: ReactNode }) {
  return (
    <h5 className={cn("mb-1 font-medium leading-none tracking-tight", className)} {...props} />
  )
}

function AlertDescription({ className, ...props }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("text-sm [&_p]:leading-relaxed", className)} {...props} />
  )
}

export { Alert, AlertTitle, AlertDescription }
