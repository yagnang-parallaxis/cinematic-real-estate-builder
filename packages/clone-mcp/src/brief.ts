import { z, type CloneConfig } from "@cinematic/schemas";

import { deepMerge, isPlainObject, upsertBy, type JsonRecord } from "./patch.js";

const media = z
  .object({
    src: z.string().min(1),
    alt: z.string().optional(),
    caption: z.string().optional(),
  })
  .strict();

const link = z.object({ label: z.string().min(1), href: z.string().min(1) }).strict();

const identityBrief = z
  .object({
    projectName: z.string().min(1).optional(),
    brand: z.string().min(1).optional(),
    place: z.string().min(1).optional(),
    tagline: z.string().optional(),
    /** Loading/nav wordmark pieces; defaults to `[brand]` when brand is supplied. */
    wordmark: z.array(z.string().min(1)).min(1).optional(),
  })
  .strict();

const colorsBrief = z
  .object({
    paper: z.string().min(1).optional(),
    paperDeep: z.string().min(1).optional(),
    ink: z.string().min(1).optional(),
    inkDeep: z.string().min(1).optional(),
    primary: z.string().min(1).optional(),
    primaryForeground: z.string().min(1).optional(),
    tide: z.string().min(1).optional(),
    shell: z.string().min(1).optional(),
  })
  .strict();

const breakpointFraction = z
  .object({
    desktop: z.number().min(0).max(1).optional(),
    compact: z.number().min(0).max(1).optional(),
  })
  .strict();

const heroBrief = z
  .object({
    heading: z.string().min(1).optional(),
    headingLines: z.array(z.string()).optional(),
    supportingBefore: z.string().optional(),
    supportingAfter: z.string().optional(),
    dayLabel: z.string().optional(),
    nightLabel: z.string().optional(),
    imageSrc: z.string().optional(),
    imageAlt: z.string().optional(),
    nightImageSrc: z.string().optional(),
    nightImageAlt: z.string().optional(),
    cta: link.optional(),
    /* How the tall hero crop is framed for this particular photograph. */
    framing: z
      .object({
        subject: z.number().min(0).max(1).optional(),
        land: breakpointFraction.optional(),
        focus: breakpointFraction.optional(),
      })
      .strict()
      .optional(),
    hotspots: z
      .array(
        z
          .object({
            id: z.string().min(1),
            label: z.string().min(1),
            description: z.string().optional(),
            x: z.number(),
            y: z.number(),
          })
          .strict(),
      )
      .optional(),
  })
  .strict();

const storyBrief = z
  .object({
    heading: z.string().optional(),
    caption: z.string().optional(),
    beats: z
      .array(
        z
          .object({
            title: z.string().min(1),
            body: z.string().optional(),
            imageSrc: z.string().optional(),
            imageAlt: z.string().optional(),
          })
          .strict(),
      )
      .optional(),
  })
  .strict();

const vistaBrief = z
  .object({
    quote: z.string().optional(),
    attribution: z.string().optional(),
    credit: z.string().optional(),
    imageSrc: z.string().optional(),
    imageAlt: z.string().optional(),
  })
  .strict();

const conceptBrief = z
  .object({
    tag: z.string().optional(),
    eyebrow: z.string().optional(),
    headingLines: z.array(z.string()).optional(),
    body: z.string().optional(),
    aside: z.string().optional(),
  })
  .strict();

const locationBrief = z
  .object({
    eyebrow: z.string().optional(),
    placeLines: z.array(z.string()).optional(),
    regionLabel: z.string().optional(),
    description: z.string().optional(),
    imageSrc: z.string().optional(),
    imageAlt: z.string().optional(),
  })
  .strict();

const amenitiesBrief = z
  .object({
    label: z.string().optional(),
    eyebrow: z.string().optional(),
    headingLines: z.array(z.string()).optional(),
    panels: z
      .array(
        z
          .object({
            id: z.string().min(1),
            name: z.string().min(1),
            title: z.string().optional(),
            description: z.string().optional(),
            imageSrc: z.string().optional(),
            imageAlt: z.string().optional(),
          })
          .strict(),
      )
      .optional(),
  })
  .strict();

const interiorsBrief = z
  .object({
    eyebrow: z.string().optional(),
    headingPrefix: z.string().optional(),
    rotatingWords: z.array(z.string()).optional(),
    body: z.string().optional(),
    images: z
      .array(
        z
          .object({
            id: z.string().min(1),
            room: z.string().optional(),
            src: z.string().min(1),
            alt: z.string().optional(),
            caption: z.string().optional(),
          })
          .strict(),
      )
      .optional(),
  })
  .strict();

const architectureBrief = z
  .object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    quote: z.string().optional(),
    attribution: z.string().optional(),
    credit: z.string().optional(),
    imageSrc: z.string().optional(),
  })
  .strict();

const assuranceBrief = z
  .object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    headingLines: z.array(z.string()).optional(),
    intro: z.string().optional(),
    note: z.string().optional(),
  })
  .strict();

const contactBrief = z
  .object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    headingLines: z.array(z.string()).optional(),
    /** Contact channels + the footer lead lines are derived from these. */
    email: z.string().min(1).optional(),
    phone: z.string().min(1).optional(),
    salesOffice: z.string().min(1).optional(),
    mapsUrl: z.string().min(1).optional(),
  })
  .strict();

const footerBrief = z
  .object({
    brand: z.string().optional(),
    phone: z.string().optional(),
    phoneHref: z.string().optional(),
    officeLabel: z.string().optional(),
    officeAddress: z.string().optional(),
    officeMapHref: z.string().optional(),
    credit: z.string().optional(),
    ctaEyebrow: z.string().optional(),
    ctaHeadingLines: z.array(z.string()).optional(),
    ctaSubheading: z.string().optional(),
    legalLinks: z.array(link).optional(),
  })
  .strict();

const residenceBrief = z
  .object({
    slug: z.string().min(1),
    name: z.string().min(1).optional(),
    status: z.string().min(1).optional(),
    number: z.string().optional(),
    type: z.string().optional(),
    typeLabel: z.string().optional(),
    block: z.string().optional(),
    floor: z.string().optional(),
    floorLabel: z.string().optional(),
    bedrooms: z.number().optional(),
    bathrooms: z.number().optional(),
    interiorSqm: z.number().optional(),
    outdoorSqm: z.number().optional(),
    outdoorLabel: z.string().optional(),
    orientation: z.string().optional(),
    completion: z.string().optional(),
    description: z.string().optional(),
    features: z.array(z.string()).optional(),
    schematic: media.optional(),
    plan: media.optional(),
  })
  .strict();

/**
 * One structured intake shape covering everything the prerequisites check asks
 * for. Sections not represented here (navigation, arch, residenceTypes,
 * residenceFigures, closingView, enquiry, loading detail) are edited with
 * `set_section_content`.
 */
export const customerBriefSchema = z
  .object({
    identity: identityBrief.optional(),
    colors: colorsBrief.optional(),
    hero: heroBrief.optional(),
    story: storyBrief.optional(),
    vista: vistaBrief.optional(),
    concept: conceptBrief.optional(),
    location: locationBrief.optional(),
    amenities: amenitiesBrief.optional(),
    interiors: interiorsBrief.optional(),
    architecture: architectureBrief.optional(),
    assurance: assuranceBrief.optional(),
    contact: contactBrief.optional(),
    footer: footerBrief.optional(),
    residences: z.array(residenceBrief).optional(),
  })
  .strict();

export type CustomerBrief = z.infer<typeof customerBriefSchema>;
export type IdentityBrief = z.infer<typeof identityBrief>;
export type ContactBrief = z.infer<typeof contactBrief>;

/** Brief group → section key, for the groups that map field-for-field. */
const DIRECT_SECTIONS = {
  hero: "hero",
  story: "story",
  vista: "vista",
  location: "location",
  amenities: "amenityBrowser",
  interiors: "interiors",
  architecture: "architecture",
  assurance: "assurance",
} as const satisfies Record<string, string>;

function telHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  return `tel:${digits}`;
}

function mapsHref(address: string): string {
  return `https://maps.google.com/?q=${encodeURIComponent(address)}`;
}

function sectionOf(config: CloneConfig, key: string): JsonRecord {
  const section = (config.sections as JsonRecord)[key];
  return isPlainObject(section) ? section : {};
}

function applyIdentity(config: CloneConfig, identity: IdentityBrief): CloneConfig {
  const sections: JsonRecord = {};

  if (identity.brand !== undefined) {
    const wordmark = identity.wordmark ?? [identity.brand];
    sections.loading = { brand: identity.brand, wordmark };
    sections.navigation = { brand: identity.brand, sealLabel: `${identity.brand} Residences` };
    sections.footer = { brand: `${identity.brand} Residences` };
    sections.enquiry = { brand: identity.brand };
  } else if (identity.wordmark !== undefined) {
    sections.loading = { wordmark: identity.wordmark };
  }

  if (identity.place !== undefined) {
    sections.loading = { ...(sections.loading as JsonRecord | undefined), place: identity.place };
    sections.hero = { place: identity.place };
  }

  if (identity.tagline !== undefined) {
    sections.loading = {
      ...(sections.loading as JsonRecord | undefined),
      tagline: identity.tagline,
    };
  }

  const { wordmark: _wordmark, ...identityFields } = identity;

  return deepMerge(config, { identity: identityFields, sections });
}

function applyContact(config: CloneConfig, contact: ContactBrief): CloneConfig {
  const existing = sectionOf(config, "contact");
  let channels = Array.isArray(existing.channels) ? (existing.channels as unknown[]) : [];

  if (contact.email !== undefined) {
    channels = upsertBy(
      channels,
      "id",
      {
        id: "write",
        label: "Write us",
        value: contact.email,
        href: `mailto:${contact.email}`,
        kind: "email",
      },
      true,
    );
  }

  if (contact.phone !== undefined) {
    channels = upsertBy(
      channels,
      "id",
      {
        id: "talk",
        label: "Talk to us",
        value: contact.phone,
        href: telHref(contact.phone),
        kind: "tel",
      },
      true,
    );
  }

  if (contact.salesOffice !== undefined) {
    channels = upsertBy(
      channels,
      "id",
      {
        id: "office",
        label: "Sales office",
        value: contact.salesOffice,
        href: contact.mapsUrl ?? mapsHref(contact.salesOffice),
        kind: "maps",
      },
      true,
    );
  }

  const footer: JsonRecord = {};
  if (contact.phone !== undefined) {
    footer.phone = contact.phone;
    footer.phoneHref = telHref(contact.phone);
  }
  if (contact.salesOffice !== undefined) {
    footer.officeAddress = contact.salesOffice;
  }
  if (contact.mapsUrl !== undefined) {
    footer.officeMapHref = contact.mapsUrl;
  }

  return deepMerge(config, {
    sections: {
      contact: {
        eyebrow: contact.eyebrow,
        heading: contact.heading,
        headingLines: contact.headingLines,
        channels,
      },
      footer,
    },
  });
}

function applyResidences(
  config: CloneConfig,
  residences: NonNullable<CustomerBrief["residences"]>,
): CloneConfig {
  let items: unknown[] = config.residences.items;
  for (const residence of residences) {
    items = upsertBy(items, "slug", residence, true);
  }
  return deepMerge(config, { residences: { items } });
}

/**
 * Fold a customer brief into a config. Pure: callers decide whether to persist
 * the result, which is what makes the dry-run and evaluate tools possible.
 */
export function applyBrief(config: CloneConfig, brief: CustomerBrief): CloneConfig {
  let next = config;

  if (brief.identity) {
    next = applyIdentity(next, brief.identity);
  }
  if (brief.colors) {
    next = deepMerge(next, { theme: brief.colors });
  }

  for (const [group, sectionKey] of Object.entries(DIRECT_SECTIONS)) {
    const payload = brief[group as keyof CustomerBrief];
    if (payload) {
      next = deepMerge(next, { sections: { [sectionKey]: payload } });
    }
  }

  if (brief.concept) {
    next = deepMerge(next, { sections: { concept: { intro: brief.concept } } });
  }
  if (brief.contact) {
    next = applyContact(next, brief.contact);
  }
  if (brief.footer) {
    next = deepMerge(next, { sections: { footer: brief.footer } });
  }
  if (brief.residences) {
    next = applyResidences(next, brief.residences);
  }

  return next;
}
