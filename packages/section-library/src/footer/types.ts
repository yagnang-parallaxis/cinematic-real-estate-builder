export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterContent {
  ctaEyebrow: string;
  ctaHeadingLines: [string, string];
  ctaSubheading: string;
  ctaBackgroundSrc: string;
  ctaAction: { label: string; href: string };
  phone: string;
  phoneHref: string;
  officeLabel: string;
  officeAddress: string;
  officeMapHref: string;
  brand: string;
  legalLinks: FooterLink[];
  credit?: FooterLink;
}
