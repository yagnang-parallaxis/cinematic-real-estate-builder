export interface HeroHotspot {
  id: string;
  label: string;
  description: string;
  x: number;
  y: number;
}

export type HeroVariant = "day" | "night";

export type HeroBreakpoint = "desktop" | "compact";

/**
 * Art direction for the tall hero crop, authored per photograph.
 *
 * The media box is far taller than any usable source, so `object-fit: cover`
 * always scales the photograph to the box height and crops it horizontally.
 * That has two consequences the authoring model has to respect:
 *
 * - Vertically nothing is cropped, so `object-position` cannot move the
 *   subject. Its distance from the top of the section is `subject × runway`,
 *   which makes the runway height — not a focal point — the vertical control.
 * - Horizontally most of the frame is discarded, so the one axis that
 *   `object-position` does govern is worth authoring.
 */
export interface HeroFraming {
  /** Where the subject sits down the source photograph, 0 top to 1 bottom. */
  subject?: number;
  /** Where the subject should land in the first viewport, 0 top to 1 bottom. */
  land?: Partial<Record<HeroBreakpoint, number>>;
  /** Which column of the photograph the crop keeps, 0 left to 1 right. */
  focus?: Partial<Record<HeroBreakpoint, number>>;
}

export interface HeroContent {
  heading: string;
  headingLines?: [string, string];
  place: string;
  supportingBefore: string;
  supportingAfter: string;
  dayLabel: string;
  nightLabel: string;
  cta: { label: string; href: string };
  imageSrc: string;
  imageAlt: string;
  nightImageSrc?: string;
  nightImageAlt?: string;
  hotspots?: HeroHotspot[];
  scrollLabel?: string;
  framing?: HeroFraming;
}
