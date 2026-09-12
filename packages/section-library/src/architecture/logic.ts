import type { ArchitectureBreakpoint, ArchitectureContent } from "./types";

const FIT_BASE_CHARACTERS = 18;
const FIT_MIN_SCALE = 0.55;
const FIT_MAX_SCALE = 1;

export function headingLines(
  content: Pick<ArchitectureContent, "heading" | "headingLines">,
): string[] {
  if (content.headingLines && content.headingLines.length > 0) {
    return content.headingLines;
  }

  return [content.heading];
}

export function fitScale(line: string, baseCharacters = FIT_BASE_CHARACTERS): number {
  const length = line.trim().length;

  if (length <= baseCharacters) {
    return FIT_MAX_SCALE;
  }

  const scale = baseCharacters / length;
  return Math.min(FIT_MAX_SCALE, Math.max(FIT_MIN_SCALE, scale));
}

export function shouldShowCta(
  cta: ArchitectureContent["cta"],
  breakpoint: ArchitectureBreakpoint,
): boolean {
  return Boolean(cta) && breakpoint === "desktop";
}
