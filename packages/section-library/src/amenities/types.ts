import type { HeroHotspot } from "../hero/types";

export interface AmenityScene {
  id: string;
  caption: string;
  imageSrc: string;
  hotspots?: HeroHotspot[];
}

export interface AmenitiesContent {
  eyebrow: string;
  heading: string;
  headingLines?: string[];
  scenes: AmenityScene[];
}
