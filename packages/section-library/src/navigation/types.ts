export interface NavigationLink {
  label: string;
  href: string;
}

export interface NavigationContent {
  brand: string;
  homeHref: string;
  links: NavigationLink[];
  cta?: NavigationLink;
  contact?: NavigationLink;
  mobileTagline?: string;
  showProgress?: boolean;
}
