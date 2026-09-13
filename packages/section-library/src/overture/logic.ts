/**
 * The arch is drawn as a CSS `border-radius` pill on a fixed-width column, so
 * its shoulder height has to be derived from the column width rather than set
 * by hand — otherwise the curve changes shape at every viewport.
 */
export function archRadius(widthPercent: number): string {
  const clamped = Math.min(100, Math.max(10, widthPercent));
  return `${clamped / 2}vw ${clamped / 2}vw 0 0`;
}

/** Lines beyond the third would push the arch below the fold on a laptop. */
export function clampLines(lines: string[], max = 3): string[] {
  return lines.map((line) => line.trim()).filter(Boolean).slice(0, max);
}
