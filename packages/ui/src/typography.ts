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
] as const;

export type TypeRole = (typeof typeRoles)[number];

export const fontFamilies = {
  display: "Cormorant Garamond",
  body: "Outfit",
} as const;

export const typeScale: Record<
  TypeRole,
  { font: keyof typeof fontFamilies; weight: number; tracking: string }
> = {
  display: { font: "display", weight: 500, tracking: "-0.03em" },
  h1: { font: "display", weight: 500, tracking: "-0.025em" },
  h2: { font: "display", weight: 500, tracking: "-0.02em" },
  h3: { font: "display", weight: 500, tracking: "-0.015em" },
  h4: { font: "body", weight: 500, tracking: "-0.01em" },
  h5: { font: "body", weight: 500, tracking: "0" },
  h6: { font: "body", weight: 500, tracking: "0.02em" },
  lead: { font: "body", weight: 400, tracking: "0" },
  body: { font: "body", weight: 400, tracking: "0" },
  label: { font: "body", weight: 500, tracking: "0.18em" },
  caption: { font: "body", weight: 400, tracking: "0.04em" },
};
