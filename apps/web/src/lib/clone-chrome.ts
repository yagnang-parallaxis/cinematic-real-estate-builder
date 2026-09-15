import type { CloneConfig } from "@cinematic/schemas";
import type { FooterContent, NavigationContent, Residence } from "@cinematic/section-library";

/**
 * The same chrome as the homepage on the residence routes, with every in-page
 * anchor pointed back at the homepage so "Contact" and "Book a call" still land
 * somewhere.
 */
export function subpageNavigation(config: CloneConfig): NavigationContent {
  const navigation = config.sections.navigation as NavigationContent;

  return {
    ...navigation,
    contact: navigation.contact ? { ...navigation.contact, href: "/#visit" } : undefined,
    cta: navigation.cta ? { ...navigation.cta, href: "/#visit" } : undefined,
  };
}

export function subpageFooter(config: CloneConfig): FooterContent {
  return { ...(config.sections.footer as FooterContent), topHref: "#content" };
}

/** The inventory, typed back up from the opaque section payload. */
export function cloneResidences(config: CloneConfig): Residence[] {
  return config.residences.items as Residence[];
}
