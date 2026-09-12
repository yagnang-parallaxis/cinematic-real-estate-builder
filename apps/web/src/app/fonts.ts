import { Archivo, Great_Vibes, Italiana } from "next/font/google";

export const displayFont = Italiana({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display-next",
  display: "swap",
});

export const bodyFont = Archivo({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-body-next",
  display: "swap",
});

export const accentFont = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-accent-next",
  display: "swap",
});
