import type { ArchitectureBreakpoint, ArchitectureContent } from "./types";

export function headingLines(
  content: Pick<ArchitectureContent, "heading" | "headingLines">,
): string[] {
  if (content.headingLines && content.headingLines.length > 0) {
    return content.headingLines;
  }

  return [content.heading];
}

export function shouldShowCta(
  cta: ArchitectureContent["cta"],
  breakpoint: ArchitectureBreakpoint,
): boolean {
  return Boolean(cta) && breakpoint === "desktop";
}
