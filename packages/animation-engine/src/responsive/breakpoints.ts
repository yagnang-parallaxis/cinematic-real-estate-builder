import type { Breakpoint } from "../core/types";

export const BREAKPOINT_MEDIA: Record<Exclude<Breakpoint, "desktop">, string> = {
  tablet: "(max-width: 1024px)",
  mobile: "(max-width: 767px)",
};

export function detectBreakpoint(): Breakpoint {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "desktop";
  }

  if (window.matchMedia(BREAKPOINT_MEDIA.mobile).matches) {
    return "mobile";
  }

  if (window.matchMedia(BREAKPOINT_MEDIA.tablet).matches) {
    return "tablet";
  }

  return "desktop";
}
