export const typeRoles = [
  "display",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "lead",
  "body",
  "label",
  "caption",
  "micro",
  "accent",
] as const;

export type TypeRole = (typeof typeRoles)[number];

/**
 * Tiers a heading may be fitted to. Fitting only makes sense where the copy is
 * meant to span its measure, which is the display tier and the three below it.
 */
export const fitTiers = ["display", "h1", "h2", "h3"] as const;

export type FitTier = (typeof fitTiers)[number];

/**
 * Size of a script accent that annotates a heading, as a fraction of that
 * heading's rendered size.
 *
 * The script is never assigned a tier of its own in these positions: it has to
 * keep its ratio to the caps beside it, including after a fit pass has pulled
 * the heading back. Expressing it as a ratio is what makes that automatic —
 * and keeps the accent off the list of authored sizes.
 */
export const accentCompanionRatio = 0.625;

export const fontFamilies = {
  display: "Bodoni Moda",
  body: "Archivo",
  accent: "Great Vibes",
} as const;

export const typeScaleRatio = {
  desktop: 16,
  compact: 4.16,
} as const;

export const desktopTypeNumerators = {
  display: 192,
  h1: 136,
  h2: 96,
  h3: 63,
  h4: 40,
  h5: 28,
  h6: 28,
  lead: 13,
  body: 13,
  label: 11,
  caption: 11,
  micro: 9,
  accent: 120,
} as const;

export const compactTypeNumerators = {
  display: 96,
  h1: 73,
  h2: 56,
  h3: 40,
  h4: 28,
  h5: 28,
  h6: 28,
  lead: 13,
  body: 13,
  label: 11,
  caption: 11,
  micro: 9,
  accent: 72,
} as const;

export const typeScale: Record<
  TypeRole,
  {
    font: keyof typeof fontFamilies;
    weight: number;
    tracking: string;
    leading: string;
    transform: "uppercase" | "none";
  }
> = {
  display: {
    font: "display",
    weight: 400,
    tracking: "-0.024em",
    leading: "0.875",
    transform: "uppercase",
  },
  h1: {
    font: "display",
    weight: 400,
    tracking: "-0.024em",
    leading: "0.88235",
    transform: "uppercase",
  },
  h2: {
    font: "display",
    weight: 400,
    tracking: "-0.024em",
    leading: "0.91667",
    transform: "uppercase",
  },
  h3: {
    font: "display",
    weight: 400,
    tracking: "-0.016em",
    leading: "0.88889",
    transform: "uppercase",
  },
  h4: {
    font: "display",
    weight: 400,
    tracking: "-0.008em",
    leading: "1",
    transform: "uppercase",
  },
  h5: {
    font: "display",
    weight: 400,
    tracking: "0em",
    leading: "1",
    transform: "uppercase",
  },
  h6: {
    font: "display",
    weight: 400,
    tracking: "0em",
    leading: "1",
    transform: "uppercase",
  },
  lead: {
    font: "body",
    weight: 400,
    tracking: "-0.024em",
    leading: "1.38462",
    transform: "none",
  },
  body: {
    font: "body",
    weight: 400,
    tracking: "-0.024em",
    leading: "1.38462",
    transform: "none",
  },
  label: {
    font: "body",
    weight: 700,
    tracking: "0.048em",
    leading: "1.45455",
    transform: "uppercase",
  },
  caption: {
    font: "body",
    weight: 400,
    tracking: "-0.024em",
    leading: "1.45455",
    transform: "none",
  },
  /*
   * The smallest cut in the language: a wide-tracked bold used for the chrome's
   * own labels — menu trigger, scene counter, scroll prompt — where the label
   * tier would read as content rather than as instrumentation.
   */
  micro: {
    font: "body",
    weight: 700,
    tracking: "0.32em",
    leading: "1.45455",
    transform: "uppercase",
  },
  accent: {
    font: "accent",
    weight: 400,
    tracking: "0em",
    leading: "1",
    transform: "none",
  },
};
