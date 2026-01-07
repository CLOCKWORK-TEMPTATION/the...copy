"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Logo } from "./logo"

/**
 * Main Navigation Component
 */
export function MainNav({ className = "" }: { className?: string }) {
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "الرئيسية" },
    { href: "/ui", label: "التطبيقات" },
    { href: "/directors-studio", label: "استوديو المخرج" },
  ]

  return (
    <nav className={cn("flex items-center gap-6", className)}>
      <Logo />
      <ul className="flex items-center gap-4">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-[#FFD700]",
                pathname === item.href ? "text-[#FFD700]" : "text-white/70"
              )}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
