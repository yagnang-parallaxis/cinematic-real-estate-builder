# Clone Suite MVP — Design Spec

**Status:** Awaiting user review  
**Date:** 2026-09-15  
**Product:** Cinematic Real Estate Builder — sellable Era-style site clones  
**Approach:** Clone Config JSON + live web preview (approved)

---

## 1. Goal

Ship a **ready-to-use clone suite** as a vertical slice:

1. Fix and stabilize the existing Era-style template (`apps/web` + section library).
2. Admin (`apps/builder`) with a **full-site brief** prerequisites checklist.
3. Customize **theme (colors)** and **section content** from the UI (font overrides = phase 2).
4. **Side-by-side live preview** (forms left, site iframe right, ~300ms debounce).
5. **Export a ready-to-deploy zip** — Next.js project first; static export as a later toggle.

This is **not** the full multi-tenant SaaS in `docs/01-product-requirements.md`. No Postgres, no auth, no drag-drop canvas, no PRD Page versioning in this MVP.

---

## 2. Decisions (locked)

| Decision | Choice |
| -------- | ------ |
| Scope | Vertical slice: customize → preview → zip |
| Export (MVP) | Standalone Next.js project zip |
| Export (later) | Static site zip via UI toggle |
| Prerequisites depth | Full site brief (every section’s copy/media) |
| Preview UX | Side-by-side; live sync with ~300ms debounce |
| Persistence | File-backed clones under `data/clones/<slug>/` |
| Template | Current Aurelia / Era-pattern `apps/web` |

---

## 3. Architecture

```
apps/builder  →  edit CloneConfig (checklist + section forms + theme)
       │
       │  debounced save + postMessage / preview hydrate
       ▼
apps/web      →  render @cinematic/section-library from CloneConfig
       │
       │  POST /clones/:slug/export?format=next
       ▼
apps/api      →  zip export-template + site.config.json + assets
```

### Packages

| Piece | Role |
| ----- | ---- |
| `@cinematic/schemas` | Zod `CloneConfig`, theme tokens, prerequisites registry |
| `@cinematic/section-library` | Unchanged renderers; content props fed from config |
| `@cinematic/ui` | CSS variables (`--primary`, `--background`, …) driven by theme |
| `data/clones/<slug>/` | `config.json`, `meta.json`, `assets/` |
| `export-template/` | Thin Next app skeleton used only for zip packaging |

### Data layout

```
data/clones/
  aurelia/                 # seeded from today’s apps/web content
    meta.json              # name, slug, createdAt, updatedAt
    config.json            # CloneConfig
    assets/                # uploaded media; export always copies (no symlinks in zip)
```

### Out of scope (MVP)

- Multi-tenant auth, organizations, billing  
- App-level Postgres / Redis usage (Compose provides local services on :15432 / :16379 for later; clone store stays file-backed in MVP)  
- Visual drag-drop section reordering beyond show/hide  
- Free-form HTML/CSS/GSAP  
- Production CDN / custom domains  

---

## 4. CloneConfig (canonical shape)

Illustrative; authoritative validation lives in Zod under `@cinematic/schemas`.

```typescript
interface CloneConfig {
  schemaVersion: "1.0.0";
  identity: {
    projectName: string;
    brand: string;
    place: string;
    tagline?: string;
  };
  theme: {
    paper: string;       // CSS color → --paper / --background
    ink: string;         // → --ink / --foreground
    primary: string;     // → --primary
    primaryForeground: string;
    // MVP: colors only. Font family uploads/overrides are phase 2;
    // preview keeps the template’s Next font stack.
  };
  sections: {
    loading: LoadingContent;
    navigation: NavigationContent;
    hero: HeroContent;
    arch: ArchRevealContent;       // HomeOpen handoff
    story: StoryContent;
    vista: VistaContent;
    concept: ConceptContent;
    location: LocationContent;
    residenceTypes: ResidenceTypesContent;
    amenityBrowser: AmenityBrowserContent;
    interiors: InteriorsContent;
    architecture: ArchitectureContent;
    assurance: AssuranceContent;
    statements: {
      residenceFigures: StatementContent;
      closingView: StatementContent;
    };
    contact: ContactContent;
    footer: FooterContent;
    enquiry: EnquiryContent;
  };
  sectionVisibility: Partial<Record<SectionKey, boolean>>; // default true
  residences: {
    listing: ResidenceGridContent;
    items: Residence[];            // detail pages
  };
}
```

Content types reuse existing exports from `@cinematic/section-library` (no parallel type system).

**Migration:** A one-time seed script (or checked-in JSON) writes `data/clones/aurelia/config.json` from today’s `apps/web/src/content/*.ts`. After that, `apps/web` **only** loads `CloneConfig` (default slug `aurelia` when `?clone` is absent). The TS content modules become the seed input only — not a second runtime path.

---

## 5. Clone lifecycle

1. **List** — builder shows clones + prerequisite completion %.  
2. **Create** — name + slug; seed from **Aurelia** or **blank-required** (same keys, empty required fields).  
3. **Edit** — section forms + theme; autosave draft to disk.  
4. **Prerequisites** — derived from Zod + required-field registry; jump links into forms.  
5. **Preview** — always available; may show incomplete content.  
6. **Export** — blocked until prerequisites pass. No “export draft” in MVP. Writes `<slug>-site.zip`.

---

## 6. Admin UI (`apps/builder`)

### Layout

| Zone | Responsibility |
| ---- | ---------------- |
| Left rail | Clone switcher, New clone, prerequisites overview, section navigator |
| Center | Forms for selected section / Theme / Residences |
| Right | Live iframe of `apps/web` |

### Prerequisites checklist (full brief)

Derived automatically (not a hand-maintained markdown list):

1. **Identity** — project name, brand/wordmark, place, primary CTA labels  
2. **Theme** — paper, ink, primary (+ primaryForeground)  
3. **Hero** — day + night images, heading, supporting line, ≥1 hotspot  
4. **Core sections** — Story, Vista, Concept, Location, Amenities, Interiors, Architecture, Assurance, Contact, Footer: each section’s required copy + media  
5. **Residences** — ≥1 residence with name, slug, status, schematic/plan, key specs  
6. **Legal / lead** — contact path (email/phone or enquiry target), footer legal lines  

UI states: ✅ complete · ⚠️ partial · ❌ missing. Export enabled only when all required items are ✅.

### Theme & components from UI

- **Theme panel** writes CSS color tokens applied on preview `documentElement`.  
- **Section visibility** toggles `sectionVisibility[key]` (hidden = skip render, config retained).  
- Fields are structured only — matching section-library content types.

### New-clone landing

After create, land on prerequisites overview until Identity + Theme are filled; then unlock section-by-section editing with clear remaining gaps.

---

## 7. Live preview

- Iframe URL: `apps/web` with `?clone=<slug>&preview=1` (and residences routes when editing that area).  
- On form change (~300ms debounce):  
  1. `PUT /clones/:slug` persists config.  
  2. `postMessage({ type: "cinematic:preview", config })` into the iframe.  
- `PreviewBridge` in `apps/web` (active only when `preview=1`): applies theme CSS variables and hydrates in-memory content without a full navigation when possible; falls back to soft reload if needed.  
- Same renderer path as production export — no “builder-only” section components.

---

## 8. API (`apps/api`, file-backed)

| Method | Path | Purpose |
| ------ | ---- | ------- |
| `GET` | `/health` | Existing health |
| `GET` | `/clones` | List + prerequisite summary |
| `POST` | `/clones` | Create from template (`aurelia` \| `blank`) |
| `GET` | `/clones/:slug` | Full config + meta |
| `PUT` | `/clones/:slug` | Zod validate + write `config.json` |
| `POST` | `/clones/:slug/assets` | Upload into clone `assets/` |
| `GET` | `/clones/:slug/prerequisites` | Checklist status |
| `POST` | `/clones/:slug/export?format=next\|static` | Zip download (`next` implemented; `static` returns `501` until phase 2) |

**Auth:** none in MVP (local/trusted). Optional shared secret later.

**Errors:**

- Invalid body → `400` + Zod issue paths for forms  
- Export with failed prerequisites → `409` + prerequisite IDs  
- Zip failure → `500` + logged detail; no partial file

---

## 9. Export zip (`format=next`)

Zip name: `<slug>-site.zip`.

Contents:

- Next app derived from `export-template/` (fork of `apps/web` app routes + a **vendored copy** of `@cinematic/section-library`, `@cinematic/animation-engine`, and `@cinematic/ui` source into `packages/` inside the zip so the buyer does not need this monorepo)  
- `site.config.json` (validated `CloneConfig`)  
- `public/` assets referenced by the config (copied files)  
- Root `package.json` / `pnpm-workspace.yaml` for the small exported workspace  
- `README.md` — `pnpm install && pnpm build && pnpm start` / Vercel notes  

Buyer receives a **ready project**, not a SaaS tenant.

`format=static` (phase 2): prebuilt static output when feasible with cinematic JS. In MVP the builder shows the option **disabled**; API returns `501` if called.

---

## 10. Template stabilization (same milestone)

While wiring config loading:

- Fix broken sections, assets, and interactions in the Aurelia default so it is the quality bar for every clone.  
- Home + `/residences` + `/residences/[slug]` must render from `CloneConfig`.  
- Preserve existing animation behavior; do not regress reduced-motion paths.

Exact bug list is discovered during implementation (visual + smoke against running `pnpm dev`), not invented here.

---

## 11. Testing (MVP smoke)

1. Zod round-trip: Aurelia seed → parse → serialize equals structurally.  
2. Empty/blank clone: prerequisites fail; export returns `409`.  
3. Export zip contains `package.json` and `site.config.json`.  
4. Preview bridge: changing `theme.primary` updates CSS variable in iframe.  
5. `pnpm typecheck` / targeted package tests stay green for touched packages.

---

## 12. Implementation order (for the later plan)

1. `CloneConfig` Zod + Aurelia seed migration  
2. API CRUD + prerequisites + file store  
3. Web: load config by `clone` query + PreviewBridge  
4. Builder: shell layout, checklist, section forms, theme, iframe  
5. Export zip (`format=next`)  
6. Template bugfix pass + smoke  
7. Stub/UI affordance for `format=static`

---

## 13. Success criteria

The suite is “ready to use” when an operator can:

1. Open builder, create a clone from Aurelia.  
2. See a prerequisites list covering the full brief.  
3. Edit colors and section content with a live side-by-side preview.  
4. Complete prerequisites and download a Next.js zip that installs and builds.  
5. Run the default Aurelia site without critical broken sections.

---

## 14. Non-goals reminder

Full SaaS PRD (roles, domains, analytics, media CDN, versioning envelopes) remains future work. This MVP intentionally uses files and a single template to sell clones quickly.
