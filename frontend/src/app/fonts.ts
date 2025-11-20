/**
 * Font Configuration using next/font/local
 *
 * This file defines local font loading with Next.js font optimization.
 * NOTE: Actual font files need to be placed in /public/fonts/
 * Currently using fallback to system fonts until real woff2 files are available.
 */

// Using system fonts as fallback until proper font files are added
export const amiri = {
  variable: "--font-amiri",
  style: { fontFamily: "serif" },
};

export const cairo = {
  variable: "--font-cairo",
  style: { fontFamily: "sans-serif" },
};

export const literata = {
  variable: "--font-literata",
  style: { fontFamily: "serif" },
};

export const sourceCodePro = {
  variable: "--font-source-code-pro",
  style: { fontFamily: "monospace" },
};

/**
 * To use these fonts in layout.tsx:
 *
 * import { amiri, cairo, literata, sourceCodePro } from './fonts';
 *
 * <html className={`${amiri.variable} ${cairo.variable} ${literata.variable} ${sourceCodePro.variable}`}>
 *
 * Then in globals.css:
 *
 * @layer base {
 *   :root {
 *     --font-body: var(--font-cairo);
 *     --font-headline: var(--font-amiri);
 *     --font-serif: var(--font-literata);
 *     --font-mono: var(--font-source-code-pro);
 *   }
 * }
 */
