export interface ArchitectureContent {
  eyebrow: string;
  heading: string;
  headingLines?: string[];
  quote: string;
  attribution: string;
  credit?: string;
  materials?: string;
  imageSrc: string;
  cta?: { label: string; href: string };
}

export type ArchitectureBreakpoint = "desktop" | "compact";
