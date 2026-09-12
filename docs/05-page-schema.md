# Canonical Page Schema

## The Structured Configuration Contract Between Builder, API, Database, and Renderer

**Status:** Draft for architecture review
**Depends on:** [`docs/01-product-requirements.md`](01-product-requirements.md) (Sections 9, 11, 13, 19, 23, 36 — architecture, builder, content model, SEO, publishing, versioning), [`docs/03-animation-system.md`](03-animation-system.md) (the 20 animation primitives), [`docs/04-component-library.md`](04-component-library.md) (the 32 components and their per-component content/layout/animation/responsive/accessibility schemas)
**Scope of this document:** The canonical `Page` document shape and its surrounding versioning/publishing envelope — the one schema that the visual builder edits, the Platform API serves, the database persists, templates seed, and the renderer consumes. TypeScript interfaces and JSON are illustrative design artifacts, not a final implementation (no ORM/database DDL, no API route contracts).

---

## 1. Design Goals and How This Schema Satisfies Them

Per Principle 11 of the PRD ("the website renderer must not be tightly coupled to the builder"), there is exactly **one** canonical shape for a page's structure — not a builder-internal format that gets "compiled" into a different renderer format. Every consumer reads and writes the same `Page` shape, at different points in its lifecycle:

| Consumer           | How it uses this schema                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Visual builder** | Reads/writes a `Page`'s **draft** snapshot directly; the left/center/right panel model from PRD Section 11 maps 1:1 onto `sections[]` (left panel = section list/reorder), the live canvas (center = rendered `sections[]`), and the inspector (right panel = one section's `content`/`layout`/`animation`/`responsive`/`visibility`, per Section 4.1 of `docs/03-animation-system.md`). |
| **Platform API**   | Serves `Page` (wrapped in the versioning envelope, Section 3.5 below) as its wire format for both authenticated builder requests and the rendering layer's data-fetching — one schema, two audiences (PRD Principle 11).                                                                                                                                                                 |
| **Database**       | Persists `PageVersionRecord` snapshots (Section 3.5) as the source of truth; the database schema (Prisma models, out of scope here) stores this shape's fields, not a bespoke internal representation.                                                                                                                                                                                   |
| **Templates**      | A Website/Page Template (PRD Section 14) is a pre-populated `Page` (or a small set of them) plus a `TemplateBinding` (Section 3.6) recording provenance — "seeding from a template" is "copy a `Page` object and stamp a new `id`."                                                                                                                                                      |
| **Versioning**     | Every edit produces a new immutable `PageVersionRecord`; `Page` itself never carries edit history — history lives one level up, in the envelope (Section 3.5), per PRD Section 36.                                                                                                                                                                                                       |
| **Preview**        | A preview URL renders whichever `PageVersionRecord` is currently the page's draft, using the exact same renderer code path as production — "preview" is a data-selection concern (which version to fetch), never a schema or component difference.                                                                                                                                       |
| **Publishing**     | Publishing is the act of taking the current draft `PageVersionRecord` and creating a new `published`-status `PageVersionRecord` from it (Section 6) — the schema doesn't need a "draft version of this field" concept anywhere inside `Page` itself, because draft/published are two whole snapshots, not per-field states.                                                              |

---

## 2. Canonical Structure Overview

```
Page
 ├── metadata        → SEO + routing identity (PRD Section 19)
 ├── theme            → binding to a versioned Theme (PRD Section 15/36)
 ├── navigation        → binding to the site Navigation, with optional per-page overrides
 └── sections[]        → ordered list of Section
       └── Section
             ├── id            → stable, unique within the page
             ├── type          → one of the 32 component types (docs/04-component-library.md)
             ├── content       → shape depends on `type` (per-component content schema, doc 04)
             ├── layout        → variant + slot/column configuration (per-component layout schema, doc 04)
             ├── animation     → primitive + bounded params (docs/03-animation-system.md)
             ├── responsive    → additive Tablet/Mobile overrides (RES-3/RES-4)
             └── visibility    → shown/hidden, per-breakpoint, optional scheduling
```

`Page` is deliberately **not** the top-level persisted/addressable object — `PageDocument` and `PageVersionRecord` (Section 3.5) wrap it to carry versioning, publishing state, and provenance without polluting the structural shape itself. This mirrors the PRD's separation of _content_ from _publishing lifecycle_ (Section 2's eight independently-configurable layers).

---

## 3. TypeScript Interfaces

These interfaces are a **design artifact**: they exist to pin down field names, shapes, and relationships precisely enough for implementation planning, not to be copy-pasted verbatim into a codebase. Types like `AssetId`, `EntityId` are opaque string aliases standing in for whatever identifier strategy (UUID, ULID, etc.) implementation chooses.

### 3.1 Shared Primitives

```typescript
type ISODateTime = string; // ISO 8601, always UTC at rest
type LocaleCode = string; // e.g. "en", "es"
type AssetId = string; // reference into the Media Library (docs/01 Section 18)
type EntityId = string; // reference to any platform entity (page, theme, user, content record...)
type SectionId = string; // unique within one Page's sections[]

type Breakpoint = "tablet" | "mobile"; // "desktop" is always the base; overrides exist only for the other two
type PublishState = "draft" | "published";

type ComponentFamily = "content" | "real-estate" | "interaction";

// The 28 component types placeable inside sections[]. Navigation/Footer/PageTransition/
// LoadingScreen (docs/04-component-library.md Global family) are site-level singletons,
// referenced from Page.navigation or from the parent Website record — never a section type.
type ComponentType =
  | "Hero"
  | "RichText"
  | "ImageText"
  | "ImageGrid"
  | "Gallery"
  | "HorizontalGallery"
  | "Video"
  | "Stats"
  | "Quote"
  | "CTA"
  | "ProjectOverview"
  | "Architecture"
  | "BuildingExplorer"
  | "Building"
  | "Floor"
  | "Residence"
  | "ResidenceGrid"
  | "FloorPlan"
  | "Amenities"
  | "Location"
  | "LocationMap"
  | "ConstructionTimeline"
  | "ConstructionUpdate"
  | "ParallaxImage"
  | "StickyStory"
  | "ScrollGallery"
  | "ImageReveal"
  | "TextReveal";

// The 20 primitives from docs/03-animation-system.md, plus the explicit opt-out (ANI-2).
type AnimationPrimitive =
  | "none"
  | "fade"
  | "fade-up"
  | "fade-down"
  | "slide"
  | "scale"
  | "image-zoom"
  | "image-reveal"
  | "clip-path-reveal"
  | "text-reveal"
  | "word-reveal"
  | "character-reveal"
  | "parallax"
  | "horizontal-scroll"
  | "sticky-storytelling"
  | "pinned-section"
  | "carousel"
  | "marquee"
  | "counter"
  | "menu-reveal"
  | "page-transition";
```

### 3.2 Page Metadata (SEO + Routing Identity)

```typescript
interface PageMetadata {
  title: string; // SEO-1
  slug: string; // SEO-6, unique within the Website
  description: string; // SEO-1
  locale: LocaleCode;

  openGraph: {
    title?: string; // falls back to `title` if unset — SEO-2
    description?: string; // falls back to `description` if unset
    image?: AssetId;
  };
  twitterCard: "summary" | "summary_large_image";

  canonicalUrl?: string; // SEO-1, overrides the default self-canonical
  robots: { index: boolean; follow: boolean }; // SEO-5

  structuredData: StructuredDataBinding[]; // SEO-3 — auto-derived, individually overridable

  pageType: "home" | "listing" | "detail" | "standard" | "contact" | "not-found";
  // `pageType` lets the renderer/API apply type-specific defaults (e.g. structured data
  // shape for 'detail' pages bound to a Residence) without a separate schema per page type.
}

interface StructuredDataBinding {
  schemaType: string; // e.g. "ApartmentComplex", "Accommodation", "BreadcrumbList"
  source: "auto" | "manual"; // 'auto' = derived from bound content entities at render time
  manualOverride?: Record<string, unknown>; // present only when source = 'manual'
}
```

### 3.3 Theme and Navigation Bindings

```typescript
interface ThemeBinding {
  themeId: EntityId;
  themeVersion: number; // pins the exact Theme version (VER-2)
  tokenOverrides?: Partial<ThemeTokenOverrides>; // rare, page-specific token exceptions
}

// Illustrative only — the full token set is defined by the Design System (docs/01 Section 15),
// not re-specified here.
interface ThemeTokenOverrides {
  colorTone?: "light" | "color" | "dark"; // this page's default background tone, if it differs
  containerWidth?: "standard" | "narrow" | "full-bleed";
}

interface NavigationBinding {
  navigationId: EntityId; // the site-level Navigation singleton
  navigationVersion: number;
  overrides?: {
    hidden?: boolean;
    variant?: "inline" | "overlay-always";
    forceContrast?: "auto" | "on-light" | "on-dark" | "on-color" | "on-brand";
  };
}
```

### 3.4 Section and Its Five Required Facets

```typescript
interface Section {
  id: SectionId;
  type: ComponentType;

  content: SectionContent; // discriminated by `type` — see 3.4.1
  layout: LayoutConfig;
  animation: AnimationConfig;
  responsive: ResponsiveOverrides;
  visibility: VisibilityConfig;

  // Present only when this instance is bound to a reusable/global section (BLD-5).
  sourceRef?: {
    globalSectionId: EntityId;
    globalSectionVersion: number;
    localOverrideFields: string[]; // field paths this instance has locally overridden,
    // and which therefore do NOT get overwritten when
    // the global section definition is next updated
  };
}
```

#### 3.4.1 Section Content (Discriminated by `type`)

`content`'s shape is fully determined by `type` and validated against a per-component registry (Section 5). Rather than duplicate all 28 component content shapes from `docs/04-component-library.md` here, the union is expressed structurally, with three components shown in full as worked examples (one from each of the CONTENT / REAL ESTATE / INTERACTION families) — the remaining 25 follow the same pattern using their own field table from doc 04.

```typescript
type SectionContent =
  | { type: "Hero"; data: HeroContent }
  | { type: "RichText"; data: RichTextContent }
  | { type: "Residence"; data: ResidenceContent }
  | { type: "ParallaxImage"; data: ParallaxImageContent };
  // ...one variant per remaining ComponentType, each `data` shape drawn from
  // that component's "Content schema" table in docs/04-component-library.md.

interface HeroContent {
  heading: string;
  subheading?: string;
  supportingSentence?: string;
  backgroundMedia: AssetId;
  alternateMedia?: AssetId;
  toggleLabels?: { primary: string; secondary: string };
  hotspots?: Array<{
    id: string;
    position: { x: number; y: number }; // percentage-based, matches reference-analysis pin positioning
    label: string;
    description: string;
  }>;
  primaryCta: CtaReference;
  showScrollIndicator: boolean;
}

interface RichTextContent {
  heading?: string;
  body: RichTextValue; // a structured rich-text document, not a raw HTML string
  alignment: "left" | "center";
  columnVariant: "narrow-centered" | "full-width" | "two-column-split";
}

interface ResidenceContent {
  residenceEntityId: EntityId; // binds to the Residence content entity (docs/01 Section 13)
  // Fields below mirror the entity but are resolved/cached at publish time so the renderer
  // never needs a live join at request time (see Section 5.2, referential integrity).
  name: string;
  status: "available" | "reserved" | "sold" | "not-released";
  bedrooms?: number;
  bathrooms?: number;
  interiorAreaSqm: number;
  terraceAreaSqm?: number;
  orientation?: string;
  price?: { amount: number; currency: string; displayPublicly: boolean };
  completionDate?: ISODateTime;
  description?: RichTextValue;
  featureTags: string[];
  primarySchematicImage: AssetId;
  gallerySectionRef?: SectionId; // a nested Gallery section instance, if composed inline
  floorPlanEntityId: EntityId;
  documents: AssetId[];
  primaryCta: CtaReference;
}

interface ParallaxImageContent {
  media: AssetId;
  additionalLayers?: AssetId[];
}

interface CtaReference {
  label: string;
  target: { kind: "page" | "section-anchor" | "external-url" | "modal"; value: string };
}

type RichTextValue = unknown; // structured rich-text document shape, defined by the editor
// implementation chosen later — out of scope for this document
```

#### 3.4.2 Layout Configuration

```typescript
interface LayoutConfig {
  variant: string; // one of the component's named layout variants (doc 04)
  columnSpan?: GridSpan;
  slots?: Record<string, SlotAssignment>; // for components that compose sub-components (doc 04's
  // Composition Map — e.g. ProjectOverview's ordered beats)
  spacingOverride?: SpacingToken; // references the spacing scale (docs/02 Section 7 finding:
  // "u-4".."u-272"-style tokens), never a raw pixel value
}

type GridSpan =
  "4-columns" | "5-columns" | "6-columns" | "8-columns" | "9-columns" | "13-columns" | "full";
type SpacingToken =
  "u-4" | "u-8" | "u-16" | "u-24" | "u-32" | "u-48" | "u-64" | "u-96" | "u-160" | "u-272";

interface SlotAssignment {
  ref: SectionId | EntityId; // a nested Section, or a bound content-entity reference
  order: number;
}
```

#### 3.4.3 Animation Configuration

```typescript
interface AnimationConfig {
  primitive: AnimationPrimitive;
  params?: AnimationParams; // shape depends on `primitive`, bounded per Section 5.3
  trigger?: {
    mode:
      | "on-load"
      | "on-scroll-enter"
      | "on-scroll-progress"
      | "on-click"
      | "on-hover"
      | "on-route-change";
    viewportThreshold?: number; // 0-1, for on-scroll-enter
    scrollRange?: { start: number; end: number }; // for on-scroll-progress / scrub / pin
  };
  reducedMotionOverride?: {
    // May only SOFTEN the primitive's platform-default reduced-motion fallback
    // (docs/03-animation-system.md, per-primitive spec) — never disable it (ANI-4 is non-negotiable).
    style: "platform-default" | "instant" | "short-crossfade";
  };
}

// Illustrative shared shape; the authoritative bounds per primitive live in the
// Animation Parameter Registry (Section 5.3), not hardcoded into this type.
interface AnimationParams {
  durationBand?: "fast" | "normal" | "slow" | "cinematic";
  delayMs?: number;
  staggerMs?: number;
  easing?: "standard" | "ease-out" | "ease-in-out" | "soft-spring" | "snap" | "linear";
  direction?: "up" | "down" | "left" | "right" | "center-out" | "radial";
  distance?: "subtle" | "standard" | "pronounced";
  intensity?: number; // 0-1, normalized; meaning is primitive-specific
  loop?: boolean;
  [key: string]: unknown; // additional primitive-specific bounded params
}
```

#### 3.4.4 Responsive Overrides

```typescript
interface ResponsiveOverrides {
  tablet?: BreakpointOverride;
  mobile?: BreakpointOverride;
}

// Every field is optional and ADDITIVE on top of the Desktop base configuration (RES-4) —
// an override object is never a parallel, independently-complete Section definition.
interface BreakpointOverride {
  layout?: Partial<LayoutConfig>;
  animation?: Partial<AnimationConfig>;
  visibility?: Partial<VisibilityConfig>;
  contentOverrides?: Partial<Record<string, unknown>>; // e.g. an alternate crop/focal point (RES-5),
  // or reordering composed slots (doc 04's
  // Residence "media before info" mobile rule)
}
```

#### 3.4.5 Visibility Configuration

```typescript
interface VisibilityConfig {
  hidden: boolean; // manual hide — section stays editable, doesn't render (BLD-2)
  breakpointVisibility: {
    desktop: boolean;
    tablet: boolean;
    mobile: boolean;
  };
  schedule?: {
    publishAt?: ISODateTime;
    unpublishAt?: ISODateTime;
  };
}
```

### 3.5 The Page Document Itself, and Its Versioning Envelope

```typescript
interface Page {
  metadata: PageMetadata;
  theme: ThemeBinding;
  navigation: NavigationBinding;
  sections: Section[];
}

// One immutable snapshot of a Page at a point in time (PRD Section 36, VER-1/VER-5).
interface PageVersionRecord {
  versionId: EntityId;
  pageId: EntityId;
  versionNumber: number; // monotonically increasing per pageId, starting at 1
  status: PublishState;
  page: Page; // the full, immutable snapshot
  schemaVersion: string; // semver of the Page shape itself (Section 6)
  createdAt: ISODateTime;
  createdBy: EntityId; // user who triggered this version
  parentVersionId?: EntityId; // set when created via rollback (VER-5) — never via normal edits
  changeSummary?: string; // human-readable, e.g. "Updated Residence 011 availability"
}

// The addressable, mutable-pointer resource — this is what a URL/route/API endpoint maps to.
interface PageDocument {
  pageId: EntityId;
  websiteId: EntityId;
  draftVersionId: EntityId; // always points at the latest draft snapshot
  publishedVersionId?: EntityId; // undefined until the first Publish action
  versionHistory: EntityId[]; // ordered, for the version-history/rollback UI (VER-6)
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}
```

### 3.6 Template Provenance

```typescript
interface TemplateBinding {
  templateId: EntityId;
  templateVersion: number; // pinned at creation time (TPL-7) — never silently bumped
  templateKind: "website" | "page" | "section";
}

// A Page created from a template additionally records where it came from, without this
// affecting the Page shape itself (provenance lives on PageDocument, not on Page).
interface PageDocument {
  // ...fields from 3.5 above
  template?: TemplateBinding;
}
```

---

## 4. JSON Examples

### 4.1 A Minimal Home Page — Draft `Page` Snapshot

```json
{
  "metadata": {
    "title": "Home",
    "slug": "/",
    "description": "Boutique residences on the coast, designed around privacy and long-term living.",
    "locale": "en",
    "openGraph": { "image": "asset_01H8X..." },
    "twitterCard": "summary_large_image",
    "robots": { "index": true, "follow": true },
    "structuredData": [{ "schemaType": "ApartmentComplex", "source": "auto" }],
    "pageType": "home"
  },
  "theme": {
    "themeId": "theme_01H9A...",
    "themeVersion": 4
  },
  "navigation": {
    "navigationId": "nav_01H9B...",
    "navigationVersion": 2
  },
  "sections": [
    {
      "id": "sec_hero",
      "type": "Hero",
      "content": {
        "heading": "Site Name",
        "subheading": "Region",
        "supportingSentence": "A place to return to",
        "backgroundMedia": "asset_01HA1...",
        "alternateMedia": "asset_01HA2...",
        "toggleLabels": { "primary": "by day", "secondary": "by night" },
        "hotspots": [
          {
            "id": "hotspot_1",
            "position": { "x": 57.5, "y": 62.5 },
            "label": "Crafted to Endure",
            "description": "Durable, natural materials selected to age gracefully."
          }
        ],
        "primaryCta": {
          "label": "View available residences",
          "target": { "kind": "page", "value": "/residences" }
        },
        "showScrollIndicator": true
      },
      "layout": { "variant": "full-bleed-toggle" },
      "animation": {
        "primitive": "text-reveal",
        "trigger": { "mode": "on-load" },
        "params": { "durationBand": "normal", "easing": "ease-out" }
      },
      "responsive": {
        "mobile": {
          "contentOverrides": { "showScrollIndicator": false }
        }
      },
      "visibility": {
        "hidden": false,
        "breakpointVisibility": { "desktop": true, "tablet": true, "mobile": true }
      }
    },
    {
      "id": "sec_cta_final",
      "type": "CTA",
      "content": {
        "heading": "Perfect sea views",
        "supportingLine": "From rooftop terraces",
        "primaryAction": {
          "label": "View available residences",
          "target": { "kind": "page", "value": "/residences" }
        },
        "backgroundMedia": "asset_01HA9..."
      },
      "layout": { "variant": "full-bleed-centered" },
      "animation": {
        "primitive": "fade-up",
        "trigger": { "mode": "on-scroll-enter", "viewportThreshold": 0.2 },
        "params": { "durationBand": "normal", "easing": "ease-out", "distance": "standard" }
      },
      "responsive": {},
      "visibility": {
        "hidden": false,
        "breakpointVisibility": { "desktop": true, "tablet": true, "mobile": true }
      }
    }
  ]
}
```

### 4.2 A Single `Residence` Section (Detail Page Excerpt)

```json
{
  "id": "sec_residence_011",
  "type": "Residence",
  "content": {
    "residenceEntityId": "res_011",
    "name": "No. 011",
    "status": "available",
    "bedrooms": 3,
    "bathrooms": 2,
    "interiorAreaSqm": 132,
    "terraceAreaSqm": 29,
    "orientation": "South-facing",
    "price": { "amount": 0, "currency": "EUR", "displayPublicly": false },
    "completionDate": "2026-10-01T00:00:00Z",
    "featureTags": ["Pool & gym", "Storage", "Parking", "Underfloor heating"],
    "primarySchematicImage": "asset_01HB1...",
    "gallerySectionRef": "sec_residence_011_gallery",
    "floorPlanEntityId": "floorplan_011",
    "documents": ["doc_011_brochure_pdf"],
    "primaryCta": {
      "label": "Submit a request",
      "target": { "kind": "modal", "value": "book-a-call" }
    }
  },
  "layout": {
    "variant": "split-info-media",
    "slots": {
      "media": { "ref": "sec_residence_011_gallery", "order": 1 }
    }
  },
  "animation": {
    "primitive": "image-reveal",
    "trigger": { "mode": "on-scroll-enter", "viewportThreshold": 0.15 },
    "params": { "durationBand": "normal", "direction": "up" }
  },
  "responsive": {
    "mobile": {
      "layout": { "variant": "stacked-media-first" },
      "contentOverrides": { "_mediaBeforeInfo": true }
    }
  },
  "visibility": {
    "hidden": false,
    "breakpointVisibility": { "desktop": true, "tablet": true, "mobile": true }
  }
}
```

### 4.3 Versioning Envelope — `PageDocument` + `PageVersionRecord` History

```json
{
  "pageDocument": {
    "pageId": "page_home_01",
    "websiteId": "site_era_01",
    "draftVersionId": "ver_0007",
    "publishedVersionId": "ver_0006",
    "versionHistory": ["ver_0001", "ver_0003", "ver_0005", "ver_0006", "ver_0007"],
    "createdAt": "2026-06-01T09:00:00Z",
    "updatedAt": "2026-09-10T14:22:00Z",
    "template": {
      "templateId": "tpl_boutique_residences",
      "templateVersion": 2,
      "templateKind": "website"
    }
  },
  "versions": [
    {
      "versionId": "ver_0006",
      "pageId": "page_home_01",
      "versionNumber": 6,
      "status": "published",
      "schemaVersion": "1.2.0",
      "createdAt": "2026-08-20T11:00:00Z",
      "createdBy": "user_editor_42",
      "changeSummary": "Updated hero background to summer campaign asset",
      "page": { "...": "full Page snapshot as of version 6" }
    },
    {
      "versionId": "ver_0007",
      "pageId": "page_home_01",
      "versionNumber": 7,
      "status": "draft",
      "schemaVersion": "1.2.0",
      "createdAt": "2026-09-10T14:22:00Z",
      "createdBy": "user_editor_42",
      "parentVersionId": "ver_0006",
      "changeSummary": "Added final CTA section",
      "page": { "...": "full Page snapshot as of version 7, not yet published" }
    }
  ]
}
```

---

## 5. Validation Rules

Validation is enforced **server-side** on every write (SEC-2/SEC-5), independent of the builder UI's own guardrails. Three tiers:

### 5.1 Structural Validation

| Rule                                                                                                                                                                                                                                                                               | Applies to            |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| `Page.sections` must contain at least one `Section` with `hidden: false` at some breakpoint, or the page is flagged as "empty" in the builder.                                                                                                                                     | `Page`                |
| `Section.id` must be unique within `Page.sections` (including nested `slots` references — a `SectionId` referenced as a slot target must exist elsewhere in the same page's section list, or the containing template's global-section catalogue).                                  | `Section`             |
| `Section.content`'s shape must match the JSON Schema registered for `Section.type` (one schema per `ComponentType`, generated from the content tables in `docs/04-component-library.md`) — an unknown `type` value is rejected outright, never silently accepted as freeform data. | `Section.content`     |
| Required fields per component (e.g., `Hero.backgroundMedia`, `Residence.floorPlanEntityId`) must be present — matching each component's "Required media"/"Content schema: Required" columns in doc 04.                                                                             | `Section.content`     |
| `PageMetadata.slug` must be unique within the `Website` and match the platform's URL-safe slug pattern (SEO-6).                                                                                                                                                                    | `PageMetadata`        |
| `ResponsiveOverrides` fields must be a strict subset of the base `LayoutConfig`/`AnimationConfig`/`VisibilityConfig` shape for that section's `type` — an override introducing a field that doesn't exist on the Desktop base is rejected (RES-4: additive, never parallel).       | `ResponsiveOverrides` |

### 5.2 Referential Integrity

| Rule                                                                                                                                                                                                                                                                                                 | Enforcement point                   |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `ThemeBinding.themeId`/`themeVersion` must reference an existing, non-deleted Theme version.                                                                                                                                                                                                         | On write (draft save)               |
| `NavigationBinding.navigationId`/`navigationVersion` must reference an existing Navigation singleton for the same `websiteId`.                                                                                                                                                                       | On write                            |
| Every `AssetId` referenced anywhere in `content` must exist in the Media Library **and** be scoped to the same Organization/Project (MT-3/MT-4 tenant isolation) — cross-tenant asset references are rejected, not just discouraged.                                                                 | On write                            |
| `residenceEntityId`, `floorPlanEntityId`, and similar entity references must resolve to a real content entity belonging to the same Project; a dangling reference blocks Publish (not Draft save, so an Editor can work ahead of content entry) but is surfaced as a validation warning immediately. | On write (warn), on Publish (block) |
| `sourceRef.globalSectionId` must reference an existing reusable/global section definition; `localOverrideFields` must be valid field paths within that section's `content`/`layout` shape.                                                                                                           | On write                            |
| `SlotAssignment.ref` values must resolve to a `Section.id` present in the same page (or an explicitly shared cross-page global section) — no dangling slot references.                                                                                                                               | On write                            |

### 5.3 Animation Parameter Bounds (the Animation Parameter Registry)

Every `AnimationConfig.params` value is checked against a **registry keyed by `AnimationPrimitive`**, mirroring each primitive's "Configurable properties" list in `docs/03-animation-system.md` — this is what makes ANI-1 ("no free-form code/expression input") a server-enforced guarantee rather than a UI convention:

```typescript
interface AnimationParamSpec {
  allowedKeys: string[]; // params outside this set are rejected
  bounds: Record<string, { min?: number; max?: number; enum?: string[] }>;
  requiredKeys?: string[];
}

// Illustrative excerpt — the full registry has one entry per AnimationPrimitive.
const ANIMATION_PARAM_REGISTRY: Record<AnimationPrimitive, AnimationParamSpec> = {
  parallax: {
    allowedKeys: ["direction", "intensity", "axisLock", "disableBelowBreakpoint", "smoothing"],
    bounds: {
      direction: { enum: ["up", "down", "left", "right"] },
      intensity: { min: 0, max: 1 },
    },
  },
  "word-reveal": {
    allowedKeys: ["staggerMs", "direction", "durationBand", "easing"],
    bounds: {
      staggerMs: { min: 20, max: 80 },
      durationBand: { enum: ["fast", "normal", "slow"] },
    },
    // Enforces the content-length guardrail from docs/03-animation-system.md Section 12:
    // the API additionally rejects this primitive on any `content` field whose bound value
    // exceeds a configured word-count ceiling, or on any field without a declared max length.
  },
  // ...remaining 18 primitives
};
```

- Any `params` key not in `allowedKeys` for the given `primitive` is rejected.
- Any numeric value outside its `bounds` range, or any string not in its `enum`, is rejected.
- `character-reveal`/`word-reveal` additionally validate the **bound content field's** declared max length (Section 12-13 of the animation doc's guardrails) — this is the one case where content and animation validation are cross-checked together.

### 5.4 Guardrails (Non-Blocking Warnings)

| Rule                                                                                                                                                                      | Rationale                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| More than a platform-configured threshold of continuous/scroll-coupled primitives (`parallax`, `horizontal-scroll`, `sticky-storytelling`, `pinned-section`) on one page. | PERF-5 — surfaced as a warning, not blocked, since a Designer may have deliberately tested and accepted the cost. |
| A `word-reveal`/`character-reveal` primitive bound to a CMS field with no declared max length.                                                                            | Recommends `text-reveal` instead (Section 12-13, animation doc).                                                  |
| An oversized/unoptimized asset referenced above the fold.                                                                                                                 | PERF-4/PERF-5.                                                                                                    |
| A text/background color pairing (via `ThemeTokenOverrides` or the active Theme) failing WCAG AA.                                                                          | DES-5.                                                                                                            |

---

## 6. Versioning Strategy

Two independent version numbers exist, deliberately not conflated:

1. **`PageVersionRecord.versionNumber`** — a per-page, monotonically increasing content-history counter (draft edit #1, #2, publish, draft edit #3, ...). This is what VER-1/VER-6 and the builder's version-history UI operate on.
2. **`schemaVersion`** (a semver string, e.g. `"1.2.0"`, stamped on every `PageVersionRecord`) — the _structural shape_ of the `Page` document itself, versioned independently of content edits, and bumped only when this document's TypeScript interfaces change. This is what Section 7's migration strategy operates on.

### 6.1 Draft → Publish → Rollback Lifecycle

- **Draft edits** create a new `PageVersionRecord` with `status: "draft"` each time a save occurs (or update the current draft record in place, for the fast-moving autosave case — implementation choice; either way, the _published_ record is never touched by draft edits). `PageDocument.draftVersionId` always points at the latest one.
- **Publish** (PUB-2) creates a **new** `PageVersionRecord` with `status: "published"`, copying the current draft's `page` snapshot verbatim, and updates `PageDocument.publishedVersionId` to point at it. The draft record is left in the history untouched — publishing is additive, never a mutation of an existing record.
- **Rollback** (PUB-3/VER-5) creates **another new** `PageVersionRecord` (never re-activates or mutates an old one) whose `page` field is a copy of the target historical version's `page`, with `parentVersionId` set to that historical version's `versionId` and `changeSummary` auto-populated (e.g., `"Rolled back to version 4"`). Its `status` is `"draft"` by default (so a rollback can be previewed before going live) unless the organization's publish-approval policy (PUB-6) is off, in which case it may be created directly as `"published"`.
- **Theme/Animation/Template pinning** (VER-2): because `Page.theme` carries an explicit `themeVersion` and every `Section.animation` carries fully-resolved, bounded params (not a live reference to a mutable "current default"), a `PageVersionRecord` is **self-contained** — rolling back to it restores the exact visual/motion state that was live at that time, with no dependency on the current state of the Theme or Animation Profile.

### 6.2 Multi-Page (Website-Level) Publish Grouping

A single Publish action in the builder often affects more than one `Page` (e.g., a Theme change touches every page's rendering, or an Editor batches several content edits before publishing). To keep PUB-2's "every publish creates a new immutable version" guarantee coherent across multiple pages published together, a lightweight grouping record sits above individual `PageVersionRecord`s:

```typescript
interface WebsiteReleaseRecord {
  releaseId: EntityId;
  websiteId: EntityId;
  createdAt: ISODateTime;
  createdBy: EntityId;
  pageVersionIds: EntityId[]; // the set of PageVersionRecords promoted to "published" together
  cacheInvalidationStatus: "pending" | "complete" | "failed";
}
```

This is what the renderer's incremental-regeneration pipeline (REN-2) subscribes to: one `WebsiteReleaseRecord` triggers cache invalidation for exactly the pages listed, not the whole site.

---

## 7. Migration Strategy

Migrations exist for two distinct kinds of change, handled differently:

### 7.1 Content/Configuration Changes (Not a Schema Migration)

Ordinary edits — a new residence, a reordered section, a swapped hero image — are simply new `PageVersionRecord`s at the _current_ `schemaVersion`. No migration logic is involved; this is the normal Draft/Publish flow from Section 6.

### 7.2 Schema (Structural) Changes — the `schemaVersion` Field

When the `Page` shape itself changes (a field renamed, a new required field added, a `ComponentType` restructured), the platform follows this process:

1. **Prefer additive, non-breaking changes.** A new optional field, a new `ComponentType`, or a new `AnimationPrimitive` requires no migration at all — existing `PageVersionRecord`s remain valid as-is, and the renderer/builder simply treat the new field as absent/default on old records. This is the default path and should cover the large majority of evolution.
2. **Breaking changes register a migration function**, keyed by a `(fromVersion, toVersion)` pair, e.g. `migrate_1_2_0_to_1_3_0(page: PageV1_2): PageV1_3`. Each function is pure, deterministic, and covers exactly one version step; migrating across multiple versions means chaining the relevant single-step functions in order.
3. **Migrations run lazily at read time by default**: when a `PageVersionRecord` with an older `schemaVersion` is fetched (by the builder, the renderer, or the API), it is passed through the applicable migration chain in memory before being returned — the **stored** record is left untouched (immutability is preserved; VER-1's guarantee is not violated by a schema migration).
4. **A background backfill job** may later rewrite `PageVersionRecord`s forward to the current `schemaVersion` at rest (for read-performance reasons, once a migration has been running safely in the lazy path for a defined soak period) — but this always happens by writing a value equal to what the lazy migration already produces, and only ever for _already-published_ historical records being brought current, never by altering a record's semantic content.
5. **Component-type and primitive renames use an alias map**, not a hard cutover: `{'BuildingBrowser': 'BuildingExplorer'}`-style entries let old `Section.type`/`AnimationConfig.primitive` values keep resolving correctly indefinitely (or until a communicated deprecation date for organization admins), independent of whether the backfill job in step 4 has run yet.
6. **Template migrations are opt-in, never automatic** (per PRD Open Decision #9): a `Page`/`Website` created from `TemplateBinding{templateId, templateVersion}` is never silently moved to a newer `templateVersion`. The builder surfaces an "update available" notice; accepting it runs a scoped, previewable merge (new template fields/sections added, existing customizations preserved) that itself produces an ordinary new draft `PageVersionRecord` — it is not a distinct migration mechanism from the normal edit flow.

### 7.3 Rollback Interaction with Migrations

Because every `PageVersionRecord` stores its own `schemaVersion`, rolling back to a version created under an older schema is safe by construction: the lazy migration path (7.2, step 3) applies automatically to the _restored_ snapshot the same way it would to any other old record being read — a rollback is never blocked by, nor requires special-casing around, an intervening schema change.

### 7.4 Migration Safety Practices

- Every registered migration function ships with a **dry-run mode**: run against a sampled or full copy of production `PageVersionRecord`s in a staging environment, diffing input/output, before being enabled in the live lazy-read path.
- Migration functions are **one-directional and additive-by-default in intent** (old data becomes valid new-shape data) — a migration is not expected to be manually reversible; safety against a bad migration comes from dry-run validation beforehand and from the fact that stored historical records are never mutated in place (step 3), so a bad migration function can simply be fixed and re-run against the same untouched originals.
- `schemaVersion` bumps follow semver conventions: a patch/minor bump implies no registered migration is needed (additive only); a major bump implies at least one breaking change and requires the migration chain in 7.2 to be complete and dry-run-validated before the new `schemaVersion` is written by any client.

---

## 8. What This Schema Deliberately Does Not Specify

- No database DDL, Prisma model, or ORM mapping — the interfaces above are the conceptual contract those would implement.
- No API route/endpoint design (REST/GraphQL shape, pagination, auth headers) — this document defines the resource shape those endpoints would serve, not the endpoints themselves.
- No rich-text document format (`RichTextValue` is intentionally left opaque) — that is an editor-implementation decision independent of the page structure.
- No concrete numeric defaults for animation parameters or spacing tokens — those live in the Theme/Animation Profile definitions (`docs/03-animation-system.md` Section 6), not in this structural schema.
- No exhaustive per-component `content` interface for all 28 placeable components — three are shown in full as worked examples; the remaining 25 follow directly from their respective "Content schema" tables in `docs/04-component-library.md` using the same conventions.
