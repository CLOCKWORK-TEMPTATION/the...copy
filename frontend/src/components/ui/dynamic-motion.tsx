"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export type DynamicMotionDivProps = React.ComponentProps<typeof motion.div>

export const DynamicMotionDiv = React.forwardRef<
  HTMLDivElement,
  DynamicMotionDivProps
>(({ className, ...props }, ref) => (
  <motion.div ref={ref} className={cn("", className)} {...props} />
))

DynamicMotionDiv.displayName = "DynamicMotionDiv"

export default DynamicMotionDiv
