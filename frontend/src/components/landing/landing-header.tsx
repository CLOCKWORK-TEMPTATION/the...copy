"use client";

import { forwardRef } from "react";

interface LandingHeaderProps {
  className?: string;
}

export const LandingHeader = forwardRef<HTMLElement, LandingHeaderProps>(
  ({ className = "" }, ref) => {
    return (
      <header
        ref={ref}
        className={`fixed top-0 left-0 right-0 z-50 bg-black text-white ${className}`}
        style={{
          opacity: 0,
          transform: "translateY(-100%)",
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* الشعار */}
            <div className="flex items-center">
              <span
                className="text-2xl lg:text-3xl font-bold"
                style={{
                  fontFamily:
                    "'Tajawal', 'Cairo', 'Noto Kufi Arabic', 'system-ui', sans-serif",
                }}
              >
                النسخة
              </span>
            </div>

            {/* زر الدخول */}
            <div className="flex items-center gap-4">
              <a
                href="/directors-studio"
                className="px-4 py-2 text-sm lg:text-base font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-105"
              >
                ادخل إلى التطبيق
              </a>
            </div>
          </div>
        </div>
      </header>
    );
  }
);

LandingHeader.displayName = "LandingHeader";
