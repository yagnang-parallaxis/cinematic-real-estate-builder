export interface NavigationLink {
  label: string;
  href: string;
  lines?: [string, string];
}

export type NavTone =
  | "on-dark"
  | "on-light"
  | "on-color"
  | "on-brand"
  | "on-media"
  | "on-media-night";

export interface NavigationContent {
  brand: string;
  /** Written around the seal. Falls back to `brand` when omitted. */
  sealLabel?: string;
  homeHref: string;
  primary?: NavigationLink;
  links: NavigationLink[];
  cta?: NavigationLink;
  contact?: NavigationLink;
  overlayAccent?: string;
  overlayTitle?: string;
  scrollLabel?: string;
  showProgress?: boolean;
}
