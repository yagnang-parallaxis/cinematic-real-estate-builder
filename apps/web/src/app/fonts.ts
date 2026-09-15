import { Archivo, Bodoni_Moda, Great_Vibes } from "next/font/google";

/**
 * One high-contrast Didone carries both the display tier and the arch curve.
 * The reference language sets every heading in a single condensed Didone, so
 * splitting display and arch across two families read as two design systems.
 */
export const displayFont = Bodoni_Moda({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-display-next",
  display: "swap",
  adjustFontFallback: true,
  fallback: ["Times New Roman", "Times", "serif"],
});

/**
 * The reference grotesque is an extended cut, so labels and body copy run a
 * touch wider than a default Archivo. The variable width axis covers it
 * without introducing a second body family.
 */
export const bodyFont = Archivo({
  subsets: ["latin"],
  weight: "variable",
  axes: ["wdth"],
  variable: "--font-body-next",
  display: "swap",
  adjustFontFallback: true,
});

export const accentFont = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-accent-next",
  display: "swap",
});
