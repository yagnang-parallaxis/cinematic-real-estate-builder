/**
 * Section tones. A tone is the only colour decision a section makes: it binds
 * `--tone-bg` / `--tone-fg` and tells the fixed navigation which contrast to
 * adopt while that section is under it.
 */
export const SECTION_TONES = [
  "light",
  "light-deep",
  "color",
  "brand",
  "dark",
  "cellar",
  "media",
] as const;

export type SectionTone = (typeof SECTION_TONES)[number];

export type NavContrast = `on-${SectionTone}`;

export function navContrastForTone(tone: SectionTone): NavContrast {
  return `on-${tone}`;
}

/** Tones whose background is a photograph rather than a flat fill. */
export function isMediaTone(tone: SectionTone): boolean {
  return tone === "media";
}
