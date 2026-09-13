export interface AssuranceLink {
  label: string;
  href: string;
}

export interface AssuranceRow {
  id: string;
  title: string;
  detail: string;
  /** Rendered inside the expanded panel as a real external anchor. */
  link?: AssuranceLink;
}

export interface AssuranceImage {
  src: string;
  /** Empty when the image carries no information the copy does not already give. */
  alt: string;
  caption?: string;
}

export interface AssuranceContent {
  eyebrow: string;
  heading: string;
  headingLines?: string[];
  intro: string;
  rows: AssuranceRow[];
  /** Close every other row when one opens. Defaults to allowing several open. */
  exclusive?: boolean;
  defaultOpenIds?: string[];
  image?: AssuranceImage;
  note?: string;
}
