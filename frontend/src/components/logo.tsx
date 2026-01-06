"use client"

/**
 * Logo Component
 * Displays the project logo
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FFA500]" />
      <span className="text-xl font-bold text-white" style={{ fontFamily: "Cairo, sans-serif" }}>
        النسخة
      </span>
    </div>
  )
}
