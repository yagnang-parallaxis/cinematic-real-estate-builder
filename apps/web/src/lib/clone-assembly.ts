import type { CloneConfig, IdentityConfig, ThemeConfig } from "@cinematic/schemas";

/**
 * Assembly of a `CloneConfig` from loose section content.
 *
 * This module deliberately has no relative imports, so both the Next app
 * (`default-clone.ts`) and the seed script (`scripts/seed-aurelia-clone.mts`,
 * run under `node --experimental-strip-types`) can share one mapping instead of
 * keeping two copies of it in step.
 */

export const AURELIA_IDENTITY: IdentityConfig = {
  projectName: "Aurelia Residences",
  brand: "Aurelia",
  place: "Harbor",
  tagline: "Eighteen residences above a quiet harbor.",
};

/** The palette lanes declared by `@cinematic/ui` styles, lifted into config. */
export const AURELIA_THEME: ThemeConfig = {
  paper: "oklch(0.945 0.016 88)",
  paperDeep: "oklch(0.915 0.024 86)",
  ink: "oklch(0.213 0.028 245)",
  inkDeep: "oklch(0.168 0.026 248)",
  primary: "oklch(0.84 0.05 85)",
  primaryForeground: "oklch(0.18 0.02 75)",
  tide: "oklch(0.84 0.032 230)",
  shell: "oklch(0.893 0.028 58)",
};

/** Section content as authored, before it is flattened into a clone config. */
export interface CloneSource {
  loading: unknown;
  navigation: unknown;
  hero: unknown;
  arch: unknown;
  story: unknown;
  vista: unknown;
  concept: unknown;
  location: unknown;
  residenceTypes: unknown;
  amenityBrowser: unknown;
  interiors: unknown;
  architecture: unknown;
  assurance: unknown;
  residenceFigures: unknown;
  closingView: unknown;
  contact: unknown;
  footer: unknown;
  enquiry: unknown;
  residenceListing: unknown;
  residences: unknown[];
}

export function assembleClone(
  source: CloneSource,
  identity: IdentityConfig = AURELIA_IDENTITY,
  theme: ThemeConfig = AURELIA_THEME,
): CloneConfig {
  return {
    schemaVersion: "1.0.0",
    identity,
    theme,
    sections: {
      loading: source.loading,
      navigation: source.navigation,
      hero: source.hero,
      arch: source.arch,
      story: source.story,
      vista: source.vista,
      concept: source.concept,
      location: source.location,
      residenceTypes: source.residenceTypes,
      amenityBrowser: source.amenityBrowser,
      interiors: source.interiors,
      architecture: source.architecture,
      assurance: source.assurance,
      residenceFigures: source.residenceFigures,
      closingView: source.closingView,
      contact: source.contact,
      footer: source.footer,
      enquiry: source.enquiry,
    },
    residences: {
      listing: source.residenceListing,
      items: source.residences,
    },
  };
}
