import { CLONE_SCHEMA_VERSION, SECTION_KEYS, type SectionKey } from "@cinematic/schemas";

export interface SectionGuide {
  /** Top-level fields the section renderer reads. */
  fields: readonly string[];
  /** Prerequisite id this section feeds, when it has one. */
  prerequisite?: string;
  /** `apply_customer_brief` group covering this section, when one exists. */
  briefGroup?: string;
  note?: string;
}

/**
 * Exhaustive by construction: adding a key to `SECTION_KEYS` fails the build
 * until it is described here, so the schema tool cannot silently drift.
 */
export const SECTION_GUIDE: Record<SectionKey, SectionGuide> = {
  loading: {
    fields: [
      "brand",
      "wordmark",
      "place",
      "leftCaption",
      "rightCaption",
      "tagline",
      "progressStyle",
      "maxDurationMs",
    ],
    prerequisite: "loading",
    briefGroup: "identity",
    note: "brand/place/wordmark are derived from brief.identity.",
  },
  navigation: {
    fields: [
      "brand",
      "sealLabel",
      "homeHref",
      "primary",
      "links",
      "cta",
      "contact",
      "overlayAccent",
      "overlayTitle",
      "scrollLabel",
      "showProgress",
    ],
    briefGroup: "identity",
    note: "brand/sealLabel are derived from brief.identity; menus need set_section_content.",
  },
  hero: {
    fields: [
      "heading",
      "headingLines",
      "place",
      "supportingBefore",
      "supportingAfter",
      "dayLabel",
      "nightLabel",
      "cta",
      "imageSrc",
      "imageAlt",
      "nightImageSrc",
      "nightImageAlt",
      "framing",
      "hotspots",
    ],
    prerequisite: "hero",
    briefGroup: "hero",
    note: "Needs a day image, a night image and at least one hotspot to pass prerequisites. framing.subject/land/focus frame the tall crop for your photograph.",
  },
  arch: {
    fields: [
      "id",
      "tone",
      "label",
      "curvedText",
      "curvedWordSpacing",
      "leftCaption",
      "rightCaption",
      "tagline",
    ],
    note: "Decorative handoff between hero and story; no required copy.",
  },
  story: {
    fields: ["leftCaption", "rightCaption", "tagline", "heading", "caption", "beats"],
    prerequisite: "story",
    briefGroup: "story",
    note: "beats[]: { title, body, imageSrc, imageAlt }.",
  },
  vista: {
    fields: ["quote", "attribution", "credit", "imageSrc", "imageAlt"],
    prerequisite: "vista",
    briefGroup: "vista",
  },
  concept: {
    fields: ["label", "dragHint", "intro", "between", "route", "floral"],
    prerequisite: "concept",
    briefGroup: "concept",
    note: "brief.concept writes into sections.concept.intro { tag, eyebrow, headingLines, body, aside }.",
  },
  location: {
    fields: [
      "eyebrow",
      "placeLines",
      "regionLabel",
      "description",
      "imageSrc",
      "imageAlt",
      "points",
      "cta",
    ],
    prerequisite: "location",
    briefGroup: "location",
  },
  residenceTypes: {
    fields: ["eyebrow", "types"],
    briefGroup: undefined,
    note: "Home-page teaser for residence types; edit with set_section_content.",
  },
  amenityBrowser: {
    fields: ["label", "eyebrow", "headingLines", "tablistLabel", "hint", "panels", "cta"],
    prerequisite: "amenities",
    briefGroup: "amenities",
    note: "panels[]: { id, name, title, description, imageSrc, imageAlt }.",
  },
  interiors: {
    fields: [
      "eyebrow",
      "headingPrefix",
      "rotatingWords",
      "rotationMs",
      "body",
      "galleryLabel",
      "lightboxLabel",
      "expandLabel",
      "closeLabel",
      "previousLabel",
      "nextLabel",
      "dragHint",
      "images",
    ],
    prerequisite: "interiors",
    briefGroup: "interiors",
    note: "images[]: { id, room, src, alt, caption }.",
  },
  architecture: {
    fields: [
      "eyebrow",
      "heading",
      "quote",
      "attribution",
      "credit",
      "materials",
      "imageSrc",
      "cta",
    ],
    prerequisite: "architecture",
    briefGroup: "architecture",
  },
  assurance: {
    fields: ["eyebrow", "heading", "headingLines", "intro", "exclusive", "rows", "image", "note"],
    prerequisite: "assurance",
    briefGroup: "assurance",
  },
  residenceFigures: {
    fields: ["id", "variant", "tone", "eyebrow", "lines", "body", "figures"],
    note: "Statement block with figures; edit with set_section_content.",
  },
  closingView: {
    fields: ["id", "variant", "tone", "eyebrow", "lines", "body", "imageSrc", "imageAlt", "action"],
    note: "Closing statement block; edit with set_section_content.",
  },
  contact: {
    fields: [
      "eyebrow",
      "heading",
      "headingLines",
      "channels",
      "socials",
      "map",
      "pin",
      "cta",
      "dragHint",
    ],
    prerequisite: "contact",
    briefGroup: "contact",
    note: "brief.contact email/phone/salesOffice are turned into channels[] and mirrored into the footer.",
  },
  footer: {
    fields: [
      "ctaEyebrow",
      "ctaHeadingLines",
      "ctaSubheading",
      "ctaBackgroundSrc",
      "ctaAction",
      "phone",
      "phoneHref",
      "officeLabel",
      "officeAddress",
      "officeMapHref",
      "brand",
      "legalLinks",
      "credit",
    ],
    prerequisite: "footer",
    briefGroup: "footer",
    note: "Needs phone, brand and at least one legal link to pass prerequisites.",
  },
  enquiry: {
    fields: [
      "brand",
      "eyebrow",
      "heading",
      "intro",
      "fields",
      "honeypotLabel",
      "submitLabel",
      "submittingLabel",
      "closeLabel",
      "note",
      "errorMessage",
      "success",
    ],
    briefGroup: "identity",
    note: "Lead form copy; brand is derived from brief.identity.",
  },
};

export const THEME_TOKENS = [
  "paper",
  "paperDeep",
  "ink",
  "inkDeep",
  "primary",
  "primaryForeground",
  "tide",
  "shell",
] as const;

export const REQUIRED_THEME_TOKENS = ["paper", "ink", "primary", "primaryForeground"] as const;

export function describeSchema(section?: SectionKey): Record<string, unknown> {
  if (section) {
    return { section, ...SECTION_GUIDE[section] };
  }

  return {
    schemaVersion: CLONE_SCHEMA_VERSION,
    identity: ["projectName", "brand", "place", "tagline"],
    theme: {
      tokens: THEME_TOKENS,
      required: REQUIRED_THEME_TOKENS,
      note: "Any CSS colour string; the Aurelia seed uses oklch(). Applied as --paper/--ink/--primary CSS variables.",
    },
    sectionKeys: SECTION_KEYS,
    sectionVisibility: "Partial<Record<SectionKey, boolean>>; omit or true to render.",
    residences: {
      listing: "Copy for the /residences index (labels, filters, empty states).",
      items:
        "Residence records. Required for prerequisites: name, slug, status. Typical extras: number, type, typeLabel, block, floor, bedrooms, bathrooms, interiorSqm, outdoorSqm, orientation, completion, description, features[], schematic{src,alt,caption}, plan{src,alt,caption}, photos[].",
    },
    sections: SECTION_GUIDE,
    workflow: [
      "create_clone → apply_customer_brief → check_prerequisites → export_clone",
      "Use evaluate_brief before creating anything to see which prerequisites a brief still leaves open.",
      "Use update_clone_config / set_section_content for fields the brief does not cover.",
    ],
  };
}
