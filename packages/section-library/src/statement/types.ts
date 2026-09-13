import type { SectionTone } from "../shared/tone";

export type StatementVariant =
  /** A single editorial sentence held between two drifting accent images. */
  | "callout"
  /** A statement answering itself with a row of hard numbers. */
  | "figures"
  /** A closing line set large over a full-bleed photograph. */
  | "panorama";

export interface StatementFigure {
  value: string;
  label: string;
}

export interface StatementAction {
  label: string;
  href: string;
}

export interface StatementContent {
  id: string;
  variant: StatementVariant;
  tone: SectionTone;
  eyebrow?: string;
  /** Lines unmask in turn, so the break points are an authored decision. */
  lines: string[];
  body?: string;
  figures?: StatementFigure[];
  /** Flanking accents for `callout`, the background plate for `panorama`. */
  imageSrc?: string;
  imageAlt?: string;
  secondaryImageSrc?: string;
  secondaryImageAlt?: string;
  action?: StatementAction;
}
