export interface HeroHotspot {
  id: string;
  label: string;
  description: string;
  x: number;
  y: number;
}

export type HeroVariant = "day" | "night";

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
}
