import { z } from "zod";

export const CLONE_SCHEMA_VERSION = "1.0.0" as const;

export const SECTION_KEYS = [
  "loading",
  "navigation",
  "hero",
  "arch",
  "story",
  "vista",
  "concept",
  "location",
  "residenceTypes",
  "amenityBrowser",
  "interiors",
  "architecture",
  "assurance",
  "residenceFigures",
  "closingView",
  "contact",
  "footer",
  "enquiry",
] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];

export const themeSchema = z.object({
  paper: z.string().min(1),
  paperDeep: z.string().min(1).optional(),
  ink: z.string().min(1),
  inkDeep: z.string().min(1).optional(),
  primary: z.string().min(1),
  primaryForeground: z.string().min(1),
  tide: z.string().min(1).optional(),
  shell: z.string().min(1).optional(),
});

export const identitySchema = z.object({
  projectName: z.string(),
  brand: z.string(),
  place: z.string(),
  tagline: z.string().optional(),
});

/** Section payloads keep their section-library shapes; validated structurally at the key level. */
const sectionPayload = z.record(z.unknown()).or(z.array(z.unknown())).or(z.unknown());

export const sectionsSchema = z.object({
  loading: sectionPayload,
  navigation: sectionPayload,
  hero: sectionPayload,
  arch: sectionPayload,
  story: sectionPayload,
  vista: sectionPayload,
  concept: sectionPayload,
  location: sectionPayload,
  residenceTypes: sectionPayload,
  amenityBrowser: sectionPayload,
  interiors: sectionPayload,
  architecture: sectionPayload,
  assurance: sectionPayload,
  residenceFigures: sectionPayload,
  closingView: sectionPayload,
  contact: sectionPayload,
  footer: sectionPayload,
  enquiry: sectionPayload,
});

export const residencesSchema = z.object({
  listing: sectionPayload,
  detailLabels: sectionPayload.optional(),
  items: z.array(z.any()),
});

export const cloneConfigSchema = z.object({
  schemaVersion: z.literal(CLONE_SCHEMA_VERSION),
  identity: identitySchema,
  theme: themeSchema,
  sections: sectionsSchema,
  sectionVisibility: z.record(z.string(), z.boolean()).optional(),
  residences: residencesSchema,
});

export type ThemeConfig = z.infer<typeof themeSchema>;
export type IdentityConfig = z.infer<typeof identitySchema>;
export type CloneConfig = z.infer<typeof cloneConfigSchema>;

export const cloneMetaSchema = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be kebab-case"),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  template: z.enum(["aurelia", "blank"]).default("aurelia"),
});

export type CloneMeta = z.infer<typeof cloneMetaSchema>;

export type PrerequisiteStatus = "complete" | "partial" | "missing";

export interface PrerequisiteItem {
  id: string;
  label: string;
  group: string;
  status: PrerequisiteStatus;
  section?: SectionKey | "theme" | "identity" | "residences";
  detail?: string;
}

function isNonEmptyString(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function getPath(root: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc === null || acc === undefined || typeof acc !== "object") {
      return undefined;
    }
    return (acc as Record<string, unknown>)[key];
  }, root);
}

function statusFor(required: boolean[], optionalFilled = 0): PrerequisiteStatus {
  const filled = required.filter(Boolean).length;
  if (filled === required.length && required.length > 0) {
    return optionalFilled >= 0 ? "complete" : "complete";
  }
  if (filled === 0) {
    return "missing";
  }
  return "partial";
}

export function evaluatePrerequisites(config: CloneConfig): PrerequisiteItem[] {
  const s = config.sections;
  const hero = s.hero as Record<string, unknown>;
  const hotspots = Array.isArray(hero.hotspots) ? hero.hotspots : [];
  const items = config.residences.items;

  const checks: PrerequisiteItem[] = [
    {
      id: "identity",
      label: "Project identity",
      group: "Identity",
      section: "identity",
      status: statusFor([
        isNonEmptyString(config.identity.projectName),
        isNonEmptyString(config.identity.brand),
        isNonEmptyString(config.identity.place),
      ]),
    },
    {
      id: "theme",
      label: "Colour theme",
      group: "Theme",
      section: "theme",
      status: statusFor([
        isNonEmptyString(config.theme.paper),
        isNonEmptyString(config.theme.ink),
        isNonEmptyString(config.theme.primary),
        isNonEmptyString(config.theme.primaryForeground),
      ]),
    },
    {
      id: "hero",
      label: "Hero media & copy",
      group: "Hero",
      section: "hero",
      status: statusFor([
        isNonEmptyString(hero.heading),
        isNonEmptyString(hero.imageSrc),
        isNonEmptyString(hero.nightImageSrc),
        isNonEmptyString(hero.supportingBefore),
        isNonEmptyString(hero.supportingAfter),
        hotspots.length >= 1,
      ]),
      detail: hotspots.length < 1 ? "Add at least one hotspot" : undefined,
    },
    {
      id: "loading",
      label: "Loading screen",
      group: "Core sections",
      section: "loading",
      status: statusFor([
        isNonEmptyString(getPath(s.loading, "brand")),
        isNonEmptyString(getPath(s.loading, "place")),
      ]),
    },
    {
      id: "story",
      label: "Storytelling",
      group: "Core sections",
      section: "story",
      status: statusFor([
        isNonEmptyString(getPath(s.story, "heading")),
        Array.isArray(getPath(s.story, "beats")) &&
          (getPath(s.story, "beats") as unknown[]).length >= 1,
      ]),
    },
    {
      id: "vista",
      label: "Vista",
      group: "Core sections",
      section: "vista",
      status: statusFor([isNonEmptyString(getPath(s.vista, "imageSrc"))]),
    },
    {
      id: "concept",
      label: "Concept",
      group: "Core sections",
      section: "concept",
      status: statusFor([
        Array.isArray(getPath(s.concept, "intro.headingLines")) &&
          (getPath(s.concept, "intro.headingLines") as unknown[]).length >= 1,
      ]),
    },
    {
      id: "location",
      label: "Location",
      group: "Core sections",
      section: "location",
      status: statusFor([
        isNonEmptyString(getPath(s.location, "eyebrow")) ||
          isNonEmptyString(getPath(s.location, "heading")),
        Array.isArray(getPath(s.location, "placeLines")) &&
          (getPath(s.location, "placeLines") as unknown[]).length >= 1,
        isNonEmptyString(getPath(s.location, "imageSrc")),
      ]),
    },
    {
      id: "amenities",
      label: "Amenities",
      group: "Core sections",
      section: "amenityBrowser",
      status: statusFor([
        Array.isArray(getPath(s.amenityBrowser, "panels")) &&
          (getPath(s.amenityBrowser, "panels") as unknown[]).length >= 1,
      ]),
    },
    {
      id: "interiors",
      label: "Interiors",
      group: "Core sections",
      section: "interiors",
      status: statusFor([
        Array.isArray(getPath(s.interiors, "images")) &&
          (getPath(s.interiors, "images") as unknown[]).length >= 1,
      ]),
    },
    {
      id: "architecture",
      label: "Architecture",
      group: "Core sections",
      section: "architecture",
      status: statusFor([
        isNonEmptyString(getPath(s.architecture, "heading")),
        isNonEmptyString(getPath(s.architecture, "imageSrc")),
      ]),
    },
    {
      id: "assurance",
      label: "Assurance",
      group: "Core sections",
      section: "assurance",
      status: statusFor([isNonEmptyString(getPath(s.assurance, "heading"))]),
    },
    {
      id: "contact",
      label: "Contact",
      group: "Legal / lead",
      section: "contact",
      status: statusFor([isNonEmptyString(getPath(s.contact, "heading"))]),
    },
    {
      id: "footer",
      label: "Footer & legal",
      group: "Legal / lead",
      section: "footer",
      status: statusFor([
        isNonEmptyString(getPath(s.footer, "phone")),
        isNonEmptyString(getPath(s.footer, "brand")),
        Array.isArray(getPath(s.footer, "legalLinks")) &&
          (getPath(s.footer, "legalLinks") as unknown[]).length >= 1,
      ]),
    },
    {
      id: "residences",
      label: "Residences inventory",
      group: "Residences",
      section: "residences",
      status: statusFor([
        items.length >= 1,
        items.every((entry) => {
          const item = entry as Record<string, unknown>;
          return (
            isNonEmptyString(item.name) &&
            isNonEmptyString(item.slug) &&
            isNonEmptyString(item.status)
          );
        }),
      ]),
      detail: items.length < 1 ? "Add at least one residence" : undefined,
    },
  ];

  return checks;
}

export function prerequisitesComplete(config: CloneConfig): boolean {
  return evaluatePrerequisites(config).every((item) => item.status === "complete");
}

export function applyThemeToCssVars(theme: ThemeConfig): Record<string, string> {
  const vars: Record<string, string> = {
    "--paper": theme.paper,
    "--ink": theme.ink,
    "--primary": theme.primary,
    "--primary-foreground": theme.primaryForeground,
    "--background": theme.paper,
    "--foreground": theme.ink,
  };
  if (theme.paperDeep) {
    vars["--paper-deep"] = theme.paperDeep;
  }
  if (theme.inkDeep) {
    vars["--ink-deep"] = theme.inkDeep;
  }
  if (theme.tide) {
    vars["--tide"] = theme.tide;
  }
  if (theme.shell) {
    vars["--shell"] = theme.shell;
  }
  return vars;
}

export function blankCloneFrom(template: CloneConfig, identity: IdentityConfig): CloneConfig {
  const blankHero = {
    ...(template.sections.hero as Record<string, unknown>),
    heading: identity.projectName,
    headingLines: [identity.brand, "Residences"],
    place: identity.place,
    supportingBefore: "",
    supportingAfter: "",
    imageSrc: "",
    nightImageSrc: "",
    hotspots: [],
  };

  return {
    ...template,
    identity,
    sections: {
      ...template.sections,
      loading: {
        ...(template.sections.loading as object),
        brand: identity.brand,
        place: identity.place,
        wordmark: [identity.brand, "Residences"],
        tagline: "",
      },
      navigation: {
        ...(template.sections.navigation as object),
        brand: identity.brand,
        sealLabel: `${identity.brand} Residences`,
      },
      hero: blankHero,
      footer: {
        ...(template.sections.footer as object),
        brand: `${identity.brand} Residences`,
        phone: "",
        officeAddress: "",
      },
    },
    residences: {
      listing: template.residences.listing,
      items: [],
    },
  };
}
