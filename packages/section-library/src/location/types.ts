/** One nearby place, in the order it is read along the row. */
export interface LocationPoint {
  id: string;
  label: string;
  /** Travel time as written copy, e.g. "4 min" or "8 min on foot". */
  travelTime: string;
}

export interface LocationContent {
  eyebrow: string;
  /** Place name, split into the lines the heading reveals one at a time. */
  placeLines: string[];
  regionLabel: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  points: LocationPoint[];
  cta: { label: string; href: string };
}
