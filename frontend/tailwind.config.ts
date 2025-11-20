import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    // Comprehensive content paths for production purging
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/ai/**/*.{js,ts,jsx,tsx,mdx}",
    // Include any potential component files in root src
    "./src/*.{js,ts,jsx,tsx,mdx}",
  ],
  // Production optimizations
  future: {
    hoverOnlyWhenSupported: true,
  },
  // Note: safelist is no longer part of Config type in Tailwind v4
  // Dynamic classes should be included in content paths or use @apply
  theme: {
    extend: {
      fontFamily: {
        // Optimized font stacks with proper fallbacks for better CLS scores
        body: ["Literata", "Georgia", "Times New Roman", "serif"],
        headline: ["Literata", "Georgia", "Times New Roman", "serif"],
        code: [
          "Source Code Pro",
          "SF Mono",
          "Monaco",
          "Cascadia Code",
          "Roboto Mono",
          "Consolas",
          "Courier New",
          "monospace",
        ],
        // Arabic font families with system fallbacks
        arabic: ["Amiri", "serif"],
        "arabic-modern": [
          "Cairo",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        "arabic-clean": [
          "Tajawal",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      colors: {
        // Figma Design System colors
        bg: "var(--color-bg)",
        panel: "var(--color-panel)",
        surface: "var(--color-surface)",
        text: "var(--color-text)",
        "muted-text": "var(--color-muted)",
        "accent-color": "var(--color-accent)",
        "accent-weak": "var(--color-accent-weak)",

        // State colors
        "state-draft": "var(--state-draft)",
        "state-final": "var(--state-final)",
        "state-alt": "var(--state-alt)",
        "state-flagged": "var(--state-flagged)",

        // Original theme colors (for compatibility)
        // Using var() directly since CSS variables contain oklch, hex, or rgba values
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        card: {
          DEFAULT: "var(--color-card)",
          foreground: "var(--color-card-foreground)",
        },
        popover: {
          DEFAULT: "var(--color-popover)",
          foreground: "var(--color-popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--color-primary)",
          foreground: "var(--color-primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          foreground: "var(--color-secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--color-muted)",
          foreground: "var(--color-muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          foreground: "var(--color-accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--color-destructive)",
          foreground: "var(--color-destructive-foreground)",
        },
        border: "var(--color-border)",
        input: "var(--color-input)",
        ring: "var(--color-ring)",
        chart: {
          "1": "var(--color-chart-1)",
          "2": "var(--color-chart-2)",
          "3": "var(--color-chart-3)",
          "4": "var(--color-chart-4)",
          "5": "var(--color-chart-5)",
        },
        sidebar: {
          DEFAULT: "var(--color-sidebar)",
          foreground: "var(--color-sidebar-foreground)",
          primary: "var(--color-sidebar-primary)",
          "primary-foreground": "var(--color-sidebar-primary-foreground)",
          accent: "var(--color-sidebar-accent)",
          "accent-foreground": "var(--color-sidebar-accent-foreground)",
          border: "var(--color-sidebar-border)",
          ring: "var(--color-sidebar-ring)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
