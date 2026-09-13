import type { ArchRevealContent } from "@cinematic/section-library";

/**
 * After the tall hero photograph has been scrolled (sky → house → lawn), the
 * dome rises over the same house — HomeOpen fills backdropSrc from the hero
 * day frame when unset.
 */
export const storyArch: ArchRevealContent = {
  id: "story-arch",
  tone: "color",
  label: "Into the three reasons to return",
  curvedText: "Three reasons to return",
  /** Raise to spread words further along the curve; lower to keep them tighter. */
  curvedWordSpacing: 1.15,
  leftCaption: "North",
  rightCaption: "Coast",
  tagline: ["A place to live —", "to return year after year"],
};
