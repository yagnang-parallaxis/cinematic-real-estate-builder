# Reusable Component Library

## Section/Block Definitions for the Website Builder

**Status:** Draft for architecture review
**Depends on:** [`docs/01-product-requirements.md`](01-product-requirements.md) (content entities, Section 13; builder model, Section 11; roles/permissions), [`docs/02-reference-analysis.md`](02-reference-analysis.md) (observed patterns per component), [`docs/03-animation-system.md`](03-animation-system.md) (the 20 animation primitives referenced throughout)
**Scope of this document:** Component design only — conceptual content/layout/animation/responsive/accessibility schemas for each reusable builder component. No code, no database schema, no API contracts.

---

## 0. Conventions

Each component below is specified across seven fixed dimensions, so the builder can generate a consistent authoring UI (a Content tab, a Layout tab, an Animation tab, a Responsive/breakpoint control, and platform-enforced accessibility behavior) regardless of which component is selected — mirroring the Section 11.1 inspector model from the PRD and the Section 4.1 Animation Inspector model from the animation system doc.

**Content schema** field types used throughout (conceptual, not a serialization format):

| Type                  | Meaning                                                                                             |
| --------------------- | --------------------------------------------------------------------------------------------------- |
| Text                  | Short plain string (e.g., a heading, a label)                                                       |
| Rich Text             | Formatted text supporting basic inline styling and links                                            |
| Image / Video / Media | A single asset reference from the Media Library (Section 18, PRD); "Media" means either is accepted |
| Media List            | An ordered list of Image/Video references                                                           |
| Reference             | A link to another content entity or another page/section (e.g., a Residence, a CTA target)          |
| Reference List        | An ordered list of References                                                                       |
| Enum                  | A closed set of named options (rendered as a dropdown/segmented control, never free text)           |
| Boolean               | An on/off toggle                                                                                    |
| Number                | A bounded numeric value                                                                             |
| Struct                | A small fixed-shape record (e.g., one stat = value + label)                                         |
| List\<Struct\>        | An ordered list of Structs                                                                          |
| Date / Date Range     | A calendar value or span                                                                            |
| Coordinate            | A geographic point                                                                                  |
| Document              | A downloadable file reference (PDF, etc.) distinct from displayable Media                           |

Every component's **Content schema** additionally states which fields are **bound** to a PRD Section 13 content entity (e.g., "bound to Residence.bedrooms") versus **component-local** (authored directly on this instance, not shared elsewhere).

Every component's **Animation schema** names which of the 20 primitives from `docs/03-animation-system.md` apply, which is the _platform default_, and which alternates are offered — never introducing a new animation mechanism outside that catalogue. Where a small decorative loop (e.g., a hotspot pulse) is described, it is noted as a **composed micro-loop** built from existing primitives (typically Scale and/or Fade run continuously), not a 21st primitive.

Every component's **Responsive schema** states which properties are automatically fluid (PRD RES-2), which are explicitly breakpoint-overridable (PRD RES-3), and which carry a **structural** (not just visual) change at Tablet/Mobile — consistent with the reference-analysis Section 28 finding that some components require a genuinely different layout, not just a smaller one.

Every component's **Accessibility** section lists concrete, platform-enforced behaviors — per PRD Section 20 (Accessibility Requirements) and Section 16 ANI-4 (reduced motion) — not optional guidance.

---

# GLOBAL

## 1. Navigation

**Purpose:** The persistent site header and its mobile full-screen menu counterpart (one configured link set, two renderings — per `docs/02-reference-analysis.md` Section 18's lesson).

**Content schema**

| Field                     | Type           | Required | Notes                                                                                                           |
| ------------------------- | -------------- | -------- | --------------------------------------------------------------------------------------------------------------- |
| Logo                      | Image          | Required | Also serves as the "scroll to top" / home link                                                                  |
| Home target               | Reference      | Required | Default: site home page                                                                                         |
| Primary links             | Reference List | Required | Bounded count (e.g., 2-5); label + target per item                                                              |
| Primary CTA link          | Reference      | Optional | Visually distinguished (e.g., "Book a call"); opens a CTA modal/target rather than navigating, if so configured |
| Contact link              | Reference      | Optional |                                                                                                                 |
| Scroll progress indicator | Boolean        | Optional | Shows a fill bar + position readout tied to page scroll                                                         |
| Mobile menu tagline       | Text           | Optional | Shown inside the full-screen overlay only                                                                       |

**Layout schema**

- Variants: **Inline** (links shown directly in the header at Desktop) or **Overlay-always** (hamburger trigger at every breakpoint).
- Slots: Logo (leading), Link list (trailing, Desktop), Menu trigger (Tablet/Mobile, or always if Overlay-always).
- Persistent/fixed across scroll and across page navigation (does not remount on `PageTransition`).
- Reads the tone of whichever section is currently in view to auto-select its own contrast mode (light-on-dark vs. dark-on-light), per the reference-analysis Section 5 lesson.

**Animation schema**

- `MenuReveal` (default, governs the mobile overlay open/close and trigger-icon morph).
- Link hover treatment: a configurable Hover/interaction style (e.g., label-slide) from the PRD's Section 16 Hover/interaction category, applied uniformly to all nav links; desktop/pointer-capable only.
- Persists unaffected through `PageTransition`.

**Responsive schema**

- Desktop → Tablet/Mobile is a **structural** change (inline list replaced by overlay trigger), not a visual collapse — matches RES-3.
- Logo size and visible-link-count-before-overflow are breakpoint-tunable.

**Accessibility**

- Rendered as a `nav` landmark; a "skip to content" link precedes it in the tab order.
- Menu trigger exposes expanded/collapsed state to assistive technology; opening the overlay traps focus within it and returns focus to the trigger on close; Escape closes it.
- Current page is indicated to assistive technology, not by color alone.
- Auto-contrast switching is validated against the platform's contrast-check (DES-5) for every tone it can land on.

**Required media:** Logo (vector preferred).
**Optional media:** None.

---

## 2. Footer

**Purpose:** The closing, sitewide block — contact summary, legal, credits — deliberately minimal (reference-analysis Section 27 lesson).

**Content schema**

| Field                 | Type           | Required | Notes                                                    |
| --------------------- | -------------- | -------- | -------------------------------------------------------- |
| Logo                  | Image          | Optional |                                                          |
| Contact info          | Reference      | Required | Bound to the Contact Information entity (PRD Section 13) |
| Legal links           | Reference List | Optional | Bound to uploaded Documents (privacy policy, terms)      |
| Copyright line        | Text           | Required | Auto-includes the current year (dynamic, not hand-typed) |
| Credits line          | Text           | Optional | e.g., agency/build credit                                |
| "Back to top" control | Boolean        | Optional |                                                          |

**Layout schema**

- Single closing section, dark/tone-alternate by default; content organized into a small number of labeled blocks (Contact / Address / Legal) rather than a dense multi-column sitemap.

**Animation schema**

- `TextReveal`/`FadeUp` on headings/labels only (default); no continuous effects.

**Responsive schema**

- Blocks stack to a single column on Tablet/Mobile; no other structural change required.

**Accessibility**

- Rendered as a `contentinfo` landmark.
- "Back to top" has a descriptive accessible name and moves focus to the page's main heading on activation (not just a visual scroll).
- External/document links (PDFs) indicate their type/target to assistive technology.

**Required media:** None (Contact Information entity supplies the text).
**Optional media:** Logo.

---

## 3. PageTransition

**Purpose:** The choreographed handoff between pages on internal navigation (`docs/03-animation-system.md` Section 22) — a behavior component with no page-specific content of its own.

**Content schema**

| Field                   | Type | Required | Notes                                                |
| ----------------------- | ---- | -------- | ---------------------------------------------------- |
| Transition style        | Enum | Required | Overlay fade / overlay wipe / reprise Loading Screen |
| Scroll-restoration mode | Enum | Required | Top of page / preserve / anchor target               |

**Layout schema**

- Full-viewport overlay layer mounted once at the application-shell level (persists across every page), not per-page content.

**Animation schema**

- `PageTransition` primitive, exactly as specified in `docs/03-animation-system.md` Section 22.

**Responsive schema**

- Identical behavior at all breakpoints; default duration is shorter on Mobile (per the primitive's own spec).

**Accessibility**

- Announces the route change to assistive technology (e.g., moving focus to the new page's main heading, or an equivalent live-region announcement of the new page title) — navigation must never feel silent to a screen-reader user.
- Never traps focus.
- Reduced motion → instant/near-instant cross-fade (primitive's own rule); scroll-restoration behavior is preserved regardless of motion setting.

**Required media:** None (may reuse the brand mark if "reprise Loading Screen" style is selected).
**Optional media:** Brand mark/logo.

---

## 4. LoadingScreen

**Purpose:** The branded first-load (and optionally per-page) preloader — a first micro-dose of brand storytelling, not a generic spinner (reference-analysis Section 20).

**Content schema**

| Field                     | Type   | Required | Notes                                                              |
| ------------------------- | ------ | -------- | ------------------------------------------------------------------ |
| Logo/wordmark             | Image  | Required |                                                                    |
| Tagline                   | Text   | Optional |                                                                    |
| Progress style            | Enum   | Required | Bar / none                                                         |
| Decorative background art | Image  | Optional |                                                                    |
| Maximum display duration  | Number | Required | Hard timeout after which the page reveals regardless of load state |

**Layout schema**

- Full-viewport overlay, centered brand lockup with the progress element beneath it; an outer "master" instance may persist briefly across the first page's own instance (matching the nested pattern observed in the reference analysis).

**Animation schema**

- Brand lockup: `TextReveal`.
- Progress fill: a `ClipPathReveal` in `scrub` mode, driven by asset-load progress rather than scroll position.

**Responsive schema**

- Identical across all breakpoints (lightweight, text + a bar).

**Accessibility**

- Exposed to assistive technology as a busy/status region while active; removed from the accessibility tree entirely once complete (not just visually hidden).
- The mandatory maximum-duration fallback prevents an indefinite block on access to content.

**Required media:** Logo/wordmark.
**Optional media:** Decorative background art.

---

# CONTENT

## 5. Hero

**Purpose:** The page-opening, full-viewport statement section — headline, place, an optional embedded media toggle, and a primary action (reference-analysis Section 3).

**Content schema**

| Field                   | Type                                           | Required | Notes                                                                   |
| ----------------------- | ---------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| Heading                 | Text                                           | Required |                                                                         |
| Subheading/place label  | Text                                           | Optional |                                                                         |
| Supporting sentence     | Text                                           | Optional | May contain an embedded toggle (see below) as part of its phrasing      |
| Background media        | Media                                          | Required |                                                                         |
| Alternate media variant | Media                                          | Optional | e.g., a day/night or seasonal counterpart, paired with a toggle control |
| Toggle labels           | Struct (two labels)                            | Optional | Required if an alternate variant is set                                 |
| Hotspot annotations     | List\<Struct\{position, label, description\}\> | Optional | Bounded count (e.g., 1-4)                                               |
| Primary CTA             | Reference                                      | Required |                                                                         |
| Scroll indicator        | Boolean                                        | Optional |                                                                         |

**Layout schema**

- Variants: Full-bleed Image, Full-bleed Video, Split (media one side / text the other), Toggle-variant (media-swap embedded in the copy).
- Slots: heading, subheading, background/media, CTA, hotspot overlay layer.

**Animation schema**

- Heading: `TextReveal` or `WordReveal` (short headlines only, per the content-length guardrail in `docs/03-animation-system.md` Section 12).
- Subheading/CTA: `FadeUp`.
- Background: optional ambient `ImageZoom` (entry/breathing variant).
- Toggle switch: cross-fade between media variants (composed `Fade`).
- Hotspot markers: a composed micro-loop (continuous `Scale` + `Fade` pulse) drawing attention without requiring interaction.

**Responsive schema**

- Hotspot interaction and any magnetic-style CTA hover are Desktop/pointer-capable only; hotspots remain tap-operable on touch without the hover embellishment.
- Background media focal point/crop is breakpoint-overridable (RES-5).
- The toggle control remains fully functional at every breakpoint.

**Accessibility**

- Heading renders as the page's `H1`.
- Background media marked decorative (empty alt) unless it conveys unique information.
- Each hotspot is a real, keyboard-focusable control with a descriptive accessible name, not a bare clickable image region.
- Toggle exposes its pressed/active state to assistive technology.
- Reduced motion disables the ambient zoom and hotspot pulse loops; video backgrounds follow ACC-8 (captions/transcript if informational, always muted+no forced sound if ambient).

**Required media:** Background image or video.
**Optional media:** Alternate (toggle) media variant; hotspot marker icon; video poster image.

---

## 6. RichText

**Purpose:** General-purpose formatted text block — the workhorse for narrative copy that doesn't need a dedicated media pairing.

**Content schema**

| Field               | Type      | Required | Notes                                           |
| ------------------- | --------- | -------- | ----------------------------------------------- |
| Heading             | Text      | Optional |                                                 |
| Body                | Rich Text | Required |                                                 |
| Alignment           | Enum      | Required | Left / Center                                   |
| Column-span variant | Enum      | Required | Narrow-centered / Full-width / Two-column split |

**Layout schema**

- Slots: heading, body. Column-span variant governs the measure (line length) independent of the section's full width.

**Animation schema**

- `TextReveal` (default) or `FadeUp`; `WordReveal` available for short standalone statements (with the length guardrail applied).

**Responsive schema**

- Column measure follows the type/spacing token scale automatically (RES-2).
- Alignment is breakpoint-overridable (e.g., centered on Desktop, left-aligned on Mobile — an explicit pattern observed in the reference analysis).

**Accessibility**

- Heading level is contextual (set relative to the page outline, not hardcoded), never skipping a level.
- Links within the body meet link-purpose clarity (no bare "click here").

**Required media:** None.
**Optional media:** None.

---

## 7. ImageText

**Purpose:** A paired media+copy block — the most common "tell one story beat" unit (reference-analysis Sections 21-23).

**Content schema**

| Field   | Type      | Required | Notes |
| ------- | --------- | -------- | ----- |
| Heading | Text      | Optional |       |
| Body    | Rich Text | Required |       |
| Media   | Media     | Required |       |
| Caption | Text      | Optional |       |
| CTA     | Reference | Optional |       |

**Layout schema**

- Variants: Image-left/Text-right, Text-left/Image-right, Image-top/Text-bottom.
- Split ratio options (e.g., even, media-weighted, text-weighted).

**Animation schema**

- Default composed pair: `Slide` (media, entering from its adjacent edge) + `FadeUp` (text).
- Alternate: `ImageReveal` on the media instead of `Slide`.
- May optionally compose `ParallaxImage` on the media layer (authored separately, see Section 28) for a counter-scroll effect.

**Responsive schema**

- Tablet/Mobile **structurally** collapses to Image-top/Text-bottom regardless of the Desktop variant chosen (a required, not optional, fallback — matches RES-3/RES-4).
- Any counter-parallax pairing is disabled by default on Mobile per `ParallaxImage`'s own responsive rule.

**Accessibility**

- Media requires alt text unless purely decorative.
- DOM reading order matches the content's intended meaning at the Mobile stacked order (image-before-text vs. text-before-image is an authored choice, not left to visual position alone).

**Required media:** One image or video.
**Optional media:** None.

---

## 8. ImageGrid

**Purpose:** A structured, non-interactive-browsing grid of images (as opposed to `Gallery`'s lightbox/carousel behavior) — used for texture-setting collections (e.g., interior finishes, material swatches).

**Content schema**

| Field            | Type            | Required | Notes                                                                |
| ---------------- | --------------- | -------- | -------------------------------------------------------------------- |
| Media list       | Media List      | Required | Minimum 2 items                                                      |
| Per-item caption | Text (per item) | Optional |                                                                      |
| Grid variant     | Enum            | Required | Uniform 2/3/4-column / Masonry-mixed-span / Featured-plus-thumbnails |

**Layout schema**

- Column count is a first-class property per breakpoint (not purely fluid-derived).

**Animation schema**

- `ImageReveal` per item, staggered as a group.

**Responsive schema**

- Column count steps down explicitly per breakpoint (e.g., 4 → 2 → 1) — a required, named override, not automatic reflow alone.

**Accessibility**

- Each image requires alt text or an explicit decorative flag.
- Grid is exposed as a list (`list`/`listitem` roles) for assistive technology navigation; keyboard focus order follows visual order.

**Required media:** 2+ images.
**Optional media:** Per-item captions; a "lightbox-enabled" flag per item (promotes an item to open in a shared lightbox, composing `Gallery`'s viewer).

---

## 9. Gallery

**Purpose:** A browsable media collection with a full-screen viewer — the primary pattern for residence photo sets and project imagery (reference-analysis Section 10).

**Content schema**

| Field                | Type            | Required | Notes                                                                  |
| -------------------- | --------------- | -------- | ---------------------------------------------------------------------- |
| Media list           | Media List      | Required | 2+ items, each with required alt text                                  |
| Per-item caption     | Text (per item) | Optional |                                                                        |
| Lightbox enabled     | Boolean         | Required | Default: on                                                            |
| Pagination style     | Enum            | Required | Numbered counter / dots / progress bar                                 |
| Presentation variant | Enum            | Required | Grid-into-lightbox (default) / Carousel-embedded (composes `Carousel`) |

**Layout schema**

- Slots: primary/featured image (optional) + a thumbnail strip or grid, opening into a shared full-screen lightbox overlay.

**Animation schema**

- `ImageReveal` per item on entry.
- If Carousel-embedded: the `Carousel` primitive governs slide transitions.
- Lightbox open/close: composed `Fade` + `Scale`.

**Responsive schema**

- Thumbnail strip becomes a native horizontally-swipeable strip on Mobile (rather than reflowing to a stacked column) — ties to the same fallback pattern as `HorizontalGallery`.

**Accessibility**

- Lightbox is a modal dialog (`dialog` role, labelled, focus-trapped); Escape closes it; arrow keys navigate between images.
- Each image's alt text and caption surface inside the lightbox, not only on the thumbnail.
- Position is announced (e.g., "3 of 8") to assistive technology.

**Required media:** 2+ images/videos, each with alt text.
**Optional media:** Video items with poster images.

---

## 10. HorizontalGallery

**Purpose:** A wide, sequential media browsing experience presented as a pinned horizontal track on Desktop (reference-analysis Section 11) — the CONTENT-family authoring container for the `HorizontalScroll` primitive with discrete, snap-to panels.

**Content schema**

| Field                     | Type            | Required | Notes    |
| ------------------------- | --------------- | -------- | -------- |
| Media list                | Media List      | Required | 3+ items |
| Per-item caption          | Text (per item) | Optional |          |
| Item aspect/width variant | Enum            | Required |          |

**Layout schema**

- Desktop: pinned horizontal track (composes `HorizontalScroll`, `play-once`/panel-snapped mode).
- Tablet (portrait)/Mobile: native touch-drag strip with an explicit "drag to see more" affordance — a defined fallback layout, not a shrunk version of the desktop track.

**Animation schema**

- `HorizontalScroll` (Desktop default), panel-snapped.
- Per-item `ImageReveal` as each item enters the visible frame.

**Responsive schema**

- The Desktop→Mobile change is structural and mandatory per `HorizontalScroll`'s own specification (Section 15 of the animation system doc), including the Tablet landscape/portrait split defined there.

**Accessibility**

- Keyboard-operable (arrow keys/tab through items) regardless of drag-based interaction.
- The "drag to see more" hint is exposed to assistive technology as text, not only as a visual icon.
- Reduced motion → renders as an ordinary wrapped/stacked row, no pinned track.

**Required media:** 3+ images.
**Optional media:** Per-item captions.

---

## 11. Video

**Purpose:** Standalone video presentation — ambient/decorative, full-bleed background, or an inline contained player (reference-analysis Section 9).

**Content schema**

| Field                  | Type                            | Required                          | Notes                                                              |
| ---------------------- | ------------------------------- | --------------------------------- | ------------------------------------------------------------------ |
| Video source           | Video                           | Required                          |                                                                    |
| Poster image           | Image                           | Required                          |                                                                    |
| Caption/subtitle track | Document                        | Required if informational (ACC-8) |                                                                    |
| Transcript             | Document                        | Optional                          | Strongly recommended if informational                              |
| Playback config        | Struct\{autoplay, loop, muted\} | Required                          | Ambient/decorative variant forces autoplay+loop+muted, no controls |
| Controls visible       | Boolean                         | Required                          |                                                                    |

**Layout schema**

- Variants: Full-bleed background, Inline contained player, Ambient decorative loop (small, no controls).

**Animation schema**

- Optional ambient `ImageZoom`-style breathing scale (background variant).
- `ImageReveal`/`Fade` on entry.

**Responsive schema**

- The ambient decorative variant may be explicitly swapped for a static poster image on Mobile (an authored override for bandwidth-sensitive placements), distinct from the mandatory pause-when-off-screen behavior all video already follows.
- Inline player sizes fluidly.

**Accessibility**

- Captions/transcript are required for any informational video (ACC-8); decorative/ambient video is marked `aria-hidden`, muted, and control-less by construction.
- Exposed controls (inline variant) are fully keyboard-operable.
- Reduced motion pauses ambient autoplay loops; inline content still requires explicit user-initiated play regardless of motion setting.

**Required media:** Video file, poster image.
**Optional media:** Caption/subtitle file, transcript document.

---

## 12. Stats

**Purpose:** A short row/grid of key figures (e.g., unit count, area range) with an animated count-up (reference-analysis observations of numeric highlights).

**Content schema**

| Field      | Type                                        | Required | Notes     |
| ---------- | ------------------------------------------- | -------- | --------- |
| Heading    | Text                                        | Optional |           |
| Stat items | List\<Struct\{value, label, unit/suffix\}\> | Required | Minimum 2 |

**Layout schema**

- Variants: Row of stat blocks, Grid of stat blocks; equal-width columns by default.

**Animation schema**

- `Counter` per stat item, staggered.

**Responsive schema**

- Column count reduces and wraps per breakpoint (e.g., 4 → 2 → 1); `Counter` behavior itself is unchanged at every breakpoint (low-cost, per Section 20 of the animation doc).

**Accessibility**

- Each stat's value and label are exposed to assistive technology as one coherent unit, not fragmented by animation timing.
- Only the final value is announced by any live region (intermediate counting values are not read aloud).

**Required media:** None.
**Optional media:** A small icon per stat.

---

## 13. Quote

**Purpose:** A single attributed pull-quote — used for testimonial-style or design-philosophy statements (reference-analysis Sections 13 and 22).

**Content schema**

| Field                         | Type      | Required | Notes |
| ----------------------------- | --------- | -------- | ----- |
| Quote text                    | Rich Text | Required |       |
| Attribution name              | Text      | Optional |       |
| Attribution role/organization | Text      | Optional |       |
| Icon/mark                     | Image     | Optional |       |
| Background media              | Media     | Optional |       |

**Layout schema**

- Variants: Centered with background image + overlay; Split (icon column + quote column).

**Animation schema**

- `TextReveal` (quote), `FadeUp` (attribution).
- Optional composed `ParallaxImage` on background media.

**Responsive schema**

- Split variant stacks to a single column on Tablet/Mobile.
- Background parallax defaults off on Mobile per `ParallaxImage`'s own rule.

**Accessibility**

- Rendered as `blockquote` with `cite` for attribution.
- Background image marked decorative unless it conveys unique meaning.

**Required media:** None (a text-only quote is valid).
**Optional media:** Background image, icon/mark asset.

---

## 14. CTA

**Purpose:** A dedicated conversion moment — the closing "book a call / view apartments" pattern reused across nearly every page (reference-analysis Section 3, "Book a call" pattern; Section 26).

**Content schema**

| Field            | Type      | Required | Notes |
| ---------------- | --------- | -------- | ----- |
| Heading          | Text      | Required |       |
| Supporting line  | Text      | Optional |       |
| Primary action   | Reference | Required |       |
| Secondary action | Reference | Optional |       |
| Background media | Media     | Optional |       |

**Layout schema**

- Variants: Full-bleed background with centered text+button; Compact inline banner.

**Animation schema**

- `TextReveal` (heading), `FadeUp` (button).
- Optional composed `ParallaxImage` (background).
- Button hover: a magnetic-pull Hover/interaction style (Desktop/pointer-capable only).

**Responsive schema**

- Magnetic hover disabled on touch; background parallax off by default on Mobile.

**Accessibility**

- Action is a real, descriptively-labelled link/button (never generic "Click here").
- Text-over-background contrast is validated against the platform's contrast check (composes with DES-5).

**Required media:** None.
**Optional media:** Background image/video.

---

# REAL ESTATE

## 15. ProjectOverview

**Purpose:** The composed "what is this project" narrative — positioning statement, key figures, supporting story beats (reference-analysis Sections 21-22).

**Content schema**

| Field                      | Type              | Required | Notes                                                            |
| -------------------------- | ----------------- | -------- | ---------------------------------------------------------------- |
| Project reference          | Reference         | Required | Bound to the Project entity                                      |
| Positioning statement      | Rich Text         | Required |                                                                  |
| Key facts                  | Reference List    | Optional | Bound to `Stats` items                                           |
| Supporting narrative beats | List\<Reference\> | Optional | Each an `ImageText` instance                                     |
| Master-plan/site image     | Image             | Optional | May carry hotspot annotations (reusing the Hero hotspot pattern) |

**Layout schema**

- A fixed composition order: positioning statement (`RichText`/`Quote`-style) → key facts (`Stats`) → supporting narrative (`ImageText` instances) → optional master-plan block.

**Animation schema**

- Inherits each composed sub-component's own animation schema; the section as a whole may optionally use `PinnedSections` for a held introductory moment.

**Responsive schema**

- Each sub-component degrades per its own responsive schema; the master-plan hotspot image follows `Hero`'s hotspot touch/desktop rule.

**Accessibility**

- The composed heading structure remains one coherent outline — sub-components do not introduce duplicate top-level headings.

**Required media:** A master-plan or hero-equivalent project image.
**Optional media:** Supporting lifestyle imagery.

---

## 16. Architecture

**Purpose:** A short, quote-led design-philosophy section, deliberately lighter on data than `ProjectOverview` (reference-analysis Section 22 lesson).

**Content schema**

| Field                          | Type      | Required | Notes              |
| ------------------------------ | --------- | -------- | ------------------ |
| Heading                        | Text      | Required |                    |
| Design philosophy quote        | Reference | Required | A `Quote` instance |
| Architect/designer credit      | Text      | Optional |                    |
| Background image               | Image     | Required |                    |
| Materials/approach description | Rich Text | Optional |                    |

**Layout schema**

- A pinned intro (headline + quote over a background image) composing `Quote` with `PinnedSections`.

**Animation schema**

- `TextReveal` (heading/quote), `ParallaxImage` (background).
- Heading uses an auto-fit-to-width sizing behavior (a layout rule, not an animation).

**Responsive schema**

- Pin/parallax are Desktop-only per their underlying primitives; Tablet/Mobile render as normal stacked flow.

**Accessibility**

- Quote uses `blockquote`/`cite`; background image marked decorative.

**Required media:** Background image.
**Optional media:** Architect/designer credit mark.

---

## 17. BuildingExplorer

**Purpose:** The entry point for browsing a multi-building project — select a building, then drill into its floors/residences (composes the "Tabbed Feature Browser" pattern from reference-analysis Section 24).

**Content schema**

| Field                         | Type           | Required | Notes                                                |
| ----------------------------- | -------------- | -------- | ---------------------------------------------------- |
| Buildings                     | Reference List | Required | Minimum 1, each a `Building`                         |
| Selection mode                | Enum           | Required | Visual block-diagram picker / Tabbed list / Dropdown |
| Site-plan/block-diagram image | Image          | Optional | Used by the visual picker mode                       |

**Layout schema**

- Selecting a Building filters/reveals its `Floor`/`Residence` content below or within a pinned panel.

**Animation schema**

- `PinnedSections` (with a persistent selector shown during the pin) + a sliding active-indicator on the selector.
- Selection change: composed `Fade`/`Slide` cross-fade of the revealed content.

**Responsive schema**

- The visual diagram picker falls back to a plain list/dropdown selector on Mobile if the diagram is not legible at small size — an explicit, authored fallback, not automatic scaling.

**Accessibility**

- Tab-based selection mode uses the `tablist`/`tab`/`tabpanel` ARIA pattern.
- Diagram-based picker exposes each building as a real, labelled, keyboard-focusable control — never a bare clickable image region.

**Required media:** None strictly (a text-only building list is valid).
**Optional media:** Site-plan/block-diagram image.

---

## 18. Building

**Purpose:** One building's detail context — description plus its residence/floor inventory (reference-analysis Section 23).

**Content schema**

| Field             | Type           | Required | Notes                                     |
| ----------------- | -------------- | -------- | ----------------------------------------- |
| Name              | Text           | Required | Bound to the Building entity              |
| Description       | Rich Text      | Optional |                                           |
| Media             | Image          | Optional |                                           |
| Floor count       | Number         | Optional |                                           |
| Floors/Residences | Reference List | Required | Ordered `Floor` or `Residence` references |

**Layout schema**

- A detail-style header (name + description + media) followed by a residence/floor listing (composes `ResidenceGrid` or an ordered `Floor` list).

**Animation schema**

- `FadeUp` (header); the composed listing inherits its own component's animation schema.

**Responsive schema**

- Header media crop is breakpoint-overridable; the listing inherits its composed component's responsive schema.

**Accessibility**

- Building name is the heading directly above its listing, preserving a correct outline.

**Required media:** None.
**Optional media:** Building exterior image, floor-count diagram.

---

## 19. Floor

**Purpose:** One level within a building — its own residence subset plus a positional diagram (reference-analysis Section 23's block-position-diagram + compass pattern).

**Content schema**

| Field                         | Type               | Required | Notes |
| ----------------------------- | ------------------ | -------- | ----- |
| Floor label/number            | Text               | Required |       |
| Residences on this floor      | Reference List     | Required |       |
| Level diagram                 | Image              | Optional |       |
| Orientation/compass indicator | Struct\{rotation\} | Optional |       |

**Layout schema**

- A level-diagram header (highlighting this floor within the building) followed by the floor's residence list/grid.

**Animation schema**

- `FadeUp` (header), `ImageReveal` (diagram).

**Responsive schema**

- The level diagram may simplify to a label-only header on narrow viewports if it cannot scale legibly — an authored fallback, not forced shrinking.

**Accessibility**

- The diagram has a text alternative describing which units/floor it represents — never conveyed by visual position alone.

**Required media:** None.
**Optional media:** Level diagram/compass image.

---

## 20. Residence

**Purpose:** The single-unit detail page/section — the most content-rich component in the library (reference-analysis Section 23, in full).

**Content schema**

| Field                    | Type             | Required | Notes                                                        |
| ------------------------ | ---------------- | -------- | ------------------------------------------------------------ |
| Name/number              | Text             | Required | Bound to the Residence entity                                |
| Building/Floor reference | Reference        | Optional |                                                              |
| Status                   | Enum             | Required | Available / Reserved / Sold / Not released                   |
| Bedrooms, bathrooms      | Number           | Optional |                                                              |
| Interior area            | Number           | Required |                                                              |
| Terrace/garden area      | Number           | Optional |                                                              |
| Orientation              | Text             | Optional |                                                              |
| Price / display toggle   | Number + Boolean | Optional | Toggle controls public visibility (per PRD Open Decision #4) |
| Completion date          | Date             | Optional |                                                              |
| Description              | Rich Text        | Optional |                                                              |
| Feature tags             | Text List        | Optional | e.g., short capability chips                                 |
| Primary schematic image  | Image            | Required | Contain-fit, not cropped                                     |
| Photo gallery            | Reference        | Optional | A `Gallery` instance                                         |
| Floor Plan               | Reference        | Required | A `FloorPlan` instance                                       |
| Document downloads       | Document List    | Optional | e.g., a per-unit brochure PDF                                |
| Primary CTA              | Reference        | Required | e.g., "Submit a request"                                     |

**Layout schema**

- Desktop: two-column split — a persistent, **independently-scrollable** info column (specs, tags, tabs, CTA) alongside a media column (primary image + gallery).
- Mobile: media is promoted **above** the info column — a structural reorder, not a simple stack of the desktop order.
- An optional Info/Benefits tabbed sub-panel within the info column (description vs. feature-tag list).

**Animation schema**

- `ImageReveal` (primary image + gallery items).
- `FadeUp` (info column data items, staggered).
- `TextReveal` (headings).
- Tab switch (Info/Benefits): composed `Fade` cross-fade.

**Responsive schema**

- The media-before-info Mobile reorder is a first-class, required responsive rule (RES-3), not a fallback of last resort.
- The independently-scrolling info column behaves this way on Desktop/Tablet only; on Mobile it participates in normal single-column document flow.

**Accessibility**

- Status (available/reserved/sold) is conveyed in text, never by color alone.
- Document download links state file type/size.
- Feature tags are exposed as a real list to assistive technology.
- The independently-scrolling column remains keyboard-scrollable and never traps focus.

**Required media:** Primary schematic/plan image; the bound Floor Plan asset.
**Optional media:** Photo gallery; feature icons; brochure PDF.

---

## 21. ResidenceGrid

**Purpose:** The filterable/sortable listing of all residences in a project (reference-analysis Section 24, in full).

**Content schema**

| Field               | Type           | Required | Notes                                                         |
| ------------------- | -------------- | -------- | ------------------------------------------------------------- |
| Filter fields       | Enum List      | Required | Derived from underlying Residence data (e.g., type, bedrooms) |
| Sort options        | Enum           | Required | Relevance / Area ascending / Area descending                  |
| Residences          | Reference List | Required | Derived from the Project's Residence set                      |
| Live result counter | Boolean        | Optional |                                                               |

**Layout schema**

- Header (title + live count) → filter/sort control row → responsive card grid.
- Each card is a compact Residence summary: schematic image, number/block/floor, bed count/area, status.

**Animation schema**

- `FadeUp` entry for the grid, staggered.
- Card hover-lift (Desktop, composed Hover/interaction preset: soft shadow + elevated stacking).
- Filter/sort changes re-flow the grid via composed `Fade` (cards re-order/re-appear), never a hard reload.

**Responsive schema**

- Filter/sort controls remain compact selectors at every breakpoint.
- Grid column count steps down explicitly per breakpoint (e.g., 3 → 2 → 1).

**Accessibility**

- Filter/sort controls are real, labelled form controls.
- The live result count uses a polite ARIA live region so filter changes are announced.
- The card grid is exposed as a list; an empty-result state has a clear, text-based message.

**Required media:** None directly (cards pull required media from each Residence).
**Optional media:** None.

---

## 22. FloorPlan

**Purpose:** The visual + structured layout representation of a residence (reference-analysis Section 23 — presented as a lightbox-enabled image, not a bespoke interactive tool, for MVP).

**Content schema**

| Field                       | Type           | Required | Notes                          |
| --------------------------- | -------------- | -------- | ------------------------------ |
| Plan image/PDF              | Image/Document | Required | Bound to the Floor Plan entity |
| Associated Residence(s)     | Reference List | Required |                                |
| Room labels/dimensions      | List\<Struct\> | Optional | Structured, if available       |
| Alternate/furnished version | Image          | Optional |                                |

**Layout schema**

- Variants: Full-size lightbox-enabled image (default); Annotated (room labels overlaid, only if structured data is present).

**Animation schema**

- `ImageReveal` on entry; lightbox open composed as `Fade` + `Scale`.

**Responsive schema**

- Scales fluidly; annotated room labels hide below a minimum legible size, falling back to the plain image plus a "view full size" lightbox action.

**Accessibility**

- Alt text describes the plan's key facts (unit name, layout summary) since the image conveys structural information, not decoration.
- A PDF alternative is offered where available, for assistive technology and printing.

**Required media:** Floor plan image or PDF.
**Optional media:** Furnished/alternate variant; structured room-label data.

---

## 23. Amenities

**Purpose:** The pinned, tab-browsable feature showcase (reference-analysis Section 24, "Tabbed Feature Browser" pattern, in full).

**Content schema**

| Field     | Type           | Required | Notes                                                      |
| --------- | -------------- | -------- | ---------------------------------------------------------- |
| Amenities | Reference List | Required | Each bound to an Amenity entity (name, description, image) |

**Layout schema**

- A pinned single-item display (one amenity's image + description at a time) with a persistent tab bar of all amenity names, carrying a sliding active-indicator.

**Animation schema**

- `PinnedSections` (Desktop).
- Tab underline slide (composed indicator animation).
- `ImageReveal` + `TextReveal` per amenity on tab change.
- Optional `ParallaxImage` on the background image.

**Responsive schema**

- Pin disabled on Tablet-portrait/Mobile — falls back to an ordinary stacked list of amenity blocks (image + text per item), with the tab bar remaining as an in-flow jump-to control.

**Accessibility**

- Uses the ARIA `tablist`/`tab`/`tabpanel` pattern; the active tab is exposed via `aria-selected`, not only the visual underline.

**Required media:** At least one image per amenity.
**Optional media:** Icon per amenity; background parallax layer.

---

## 24. Location

**Purpose:** The composed location narrative — positioning statement, points of interest, and a map (reference-analysis Section 21, in full).

**Content schema**

| Field                   | Type                                       | Required | Notes                                       |
| ----------------------- | ------------------------------------------ | -------- | ------------------------------------------- |
| Address                 | Text                                       | Required | Bound to the Location entity                |
| Positioning statement   | Rich Text                                  | Optional |                                             |
| Points of interest      | List\<Struct\{name, category, distance\}\> | Optional |                                             |
| Region/area label       | Text                                       | Optional |                                             |
| Map                     | Reference                                  | Required | A `LocationMap` instance                    |
| Route/path illustration | Reference                                  | Optional | A `HorizontalGallery`/route-narrative block |

**Layout schema**

- Composes a narrative intro (`RichText`/`Quote`-style) → `LocationMap` → optional route/path narrative block.

**Animation schema**

- `TextReveal`, `ParallaxImage`; `HorizontalScroll` if the route/path narrative variant is used.

**Responsive schema**

- The route/path illustration becomes a touch-drag strip on Mobile (per `HorizontalScroll`'s own fallback).
- The points-of-interest list switches from graphic-labels to a plain text list on narrow viewports if the graphic is not legible.

**Accessibility**

- Point-of-interest names/distances are available as real text content even when also shown on a graphic — never graphic-only information.

**Required media:** None strictly (falls back to text-only).
**Optional media:** Master-plan/site image, route illustration, background imagery.

---

## 25. LocationMap

**Purpose:** The map itself — illustrated/stylized graphic or an interactive embed, with pin annotations (reference-analysis Section 26).

**Content schema**

| Field               | Type                                               | Required | Notes                                          |
| ------------------- | -------------------------------------------------- | -------- | ---------------------------------------------- |
| Coordinates         | Coordinate                                         | Required |                                                |
| Map style           | Enum                                               | Required | Illustrated graphic / Interactive embedded map |
| Primary pin label   | Text                                               | Required |                                                |
| Additional POI pins | List\<Struct\{position/coordinate, label, info\}\> | Optional |                                                |

**Layout schema**

- Full-width or contained map graphic/embed with pin overlay(s); a pin shows a small info card on hover/tap (e.g., name + hours, per the reference-analysis sales-office pattern).

**Animation schema**

- Illustrated variant: `ImageReveal`. Interactive embed: none authored (the map library governs its own rendering).
- Pin: a low-intensity composed pulse loop (continuous `Scale`).

**Responsive schema**

- Interactive embed remains usable via touch pinch/pan without trapping page scroll.
- Illustrated variant crops/reflows per breakpoint.

**Accessibility**

- Each pin is a real, labelled, keyboard-focusable control exposing its info-card content as text, never a hover-only tooltip.
- A text-equivalent address/external-map link is always present alongside an interactive embed, since embedded map widgets are frequently not fully keyboard/screen-reader operable (ACC-1/ACC-9).

**Required media:** Map graphic (illustrated variant only — none required for the interactive-embed variant, which renders from coordinates).
**Optional media:** Custom pin icon.

---

## 26. ConstructionTimeline

**Purpose:** Construction/roadmap milestones — as a visual timeline or a calmer accordion (reference-analysis Section 25, both variants validated).

**Content schema**

| Field      | Type                                                                 | Required | Notes                        |
| ---------- | -------------------------------------------------------------------- | -------- | ---------------------------- |
| Milestones | List\<Struct\{label, date/date-range, status, description, media\}\> | Required | Bound to the Timeline entity |

**Layout schema**

- Variants: Visual milestone timeline (connected graphic markers) or Accordion (expandable rows) — both first-class, selectable per project.

**Animation schema**

- Timeline variant: `FadeUp`/`TextReveal` per milestone, staggered along the line.
- Accordion variant: expand/collapse as a composed height + `Fade` reveal.

**Responsive schema**

- Timeline-graphic variant re-flows from horizontal to vertical orientation on Mobile if authored horizontally on Desktop.
- Accordion variant requires no structural change at any breakpoint.

**Accessibility**

- Milestone status (planned/in-progress/complete) is conveyed via text/icon+label, never color alone.
- Accordion rows are real disclosure widgets (`aria-expanded`, keyboard-operable).

**Required media:** None (text-only milestones are valid).
**Optional media:** Per-milestone image.

---

## 27. ConstructionUpdate

**Purpose:** A single dated progress entry (or a reverse-chronological feed of them), including the reference-analysis Section 25 "external live-stream link" lesson.

**Content schema**

| Field                     | Type            | Required | Notes                 |
| ------------------------- | --------------- | -------- | --------------------- |
| Title                     | Text            | Required |                       |
| Date                      | Date            | Required |                       |
| Body                      | Rich Text       | Required |                       |
| Media                     | Media List      | Optional | e.g., progress photos |
| External live-stream link | Reference (URL) | Optional |                       |

**Layout schema**

- Single-entry card variant, or a reverse-chronological list of entries (composes `ImageGrid`/`Gallery` for attached media).

**Animation schema**

- `FadeUp` entry; `ImageReveal` for attached media.

**Responsive schema**

- Attached media grid collapses per `ImageGrid`'s own responsive rule.

**Accessibility**

- Date is presented in an unambiguous, locale-appropriate format.
- The external live-stream link indicates it opens an external resource/new context.

**Required media:** None.
**Optional media:** Progress photos/video.

---

# INTERACTION

## 28. ParallaxImage

**Purpose:** A standalone, directly-placeable background/decorative depth layer — the authoring container for the `Parallax` primitive, most often composed inside other components (`Quote`, `CTA`, `Location`) rather than placed alone.

**Content schema**

| Field                   | Type       | Required | Notes                                    |
| ----------------------- | ---------- | -------- | ---------------------------------------- |
| Media                   | Media      | Required |                                          |
| Additional depth layers | Media List | Optional | For a multi-layer/counter-parallax setup |

**Layout schema**

- A full-bleed or contained background layer sitting behind foreground content.

**Animation schema**

- `Parallax` primitive (Section 14, `docs/03-animation-system.md`), exposing its full configurable property set directly (direction, intensity, axis lock, disable-below-breakpoint, smoothing).

**Responsive schema**

- Off by default on Mobile, reduced intensity by default on Tablet, per the primitive's own specification — explicitly overridable per instance.

**Accessibility**

- Purely decorative in virtually every use — marked `aria-hidden`/empty alt, since it never carries unique information on its own.
- Reduced motion disables the effect entirely (static resting position).

**Required media:** One image or video layer.
**Optional media:** Additional counter-moving decorative layers.

---

## 29. StickyStory

**Purpose:** The standalone authoring container for the `StickyStorytelling` primitive — a fixed media/quote element against which a sequence of narrative beats advances.

**Content schema**

| Field                    | Type                          | Required | Notes                        |
| ------------------------ | ----------------------------- | -------- | ---------------------------- |
| Persistent media/element | Media or Reference            | Required | e.g., an image, or a `Quote` |
| Narrative beats          | List\<Struct\{text, media\}\> | Required | Minimum 2                    |

**Layout schema**

- Composes `PinnedSections` + `StickyStorytelling` directly: persistent element fixed, beats advance within the pinned scroll range.

**Animation schema**

- `StickyStorytelling` primitive as specified; each beat's reveal composes `TextReveal`/`FadeUp`.

**Responsive schema**

- Falls back to an ordinary stacked sequence on Mobile and under reduced motion: the persistent element is shown once (e.g., as a leading image), followed by each beat in normal document flow — per the primitive's own specification.

**Accessibility**

- All beats and the persistent element's content are reachable, in the same logical order a screen reader would encounter normal stacked content, even though visually pinned for sighted scroll users.

**Required media:** One persistent media asset.
**Optional media:** Per-beat supporting imagery.

---

## 30. ScrollGallery

**Purpose:** The INTERACTION-family counterpart to `HorizontalGallery` — a continuously scrub-driven drift through images, without discrete panel snapping (reference-analysis Section 11's `scrub` mode distinction, `docs/03-animation-system.md` Section 15).

**Content schema**

| Field            | Type            | Required | Notes    |
| ---------------- | --------------- | -------- | -------- |
| Media list       | Media List      | Required | 3+ items |
| Per-item caption | Text (per item) | Optional |          |

**Layout schema**

- Composes `HorizontalScroll` in `scrub` mode without hard panel boundaries — a continuous drift-through-images experience rather than discrete slides.

**Animation schema**

- `HorizontalScroll` (`scrub`), per-item `ImageReveal` as each item crosses into the visible frame.

**Responsive schema**

- Identical fallback rule to `HorizontalGallery`: touch-drag strip on Tablet-portrait/Mobile.

**Accessibility**

- Identical requirements to `HorizontalGallery` (keyboard operability, drag hint exposed as text, reduced-motion fallback to a wrapped static row).

**Required media:** 3+ images.
**Optional media:** Per-item captions.

---

## 31. ImageReveal

**Purpose:** The standalone, directly-placeable authoring container for the `ImageReveal` primitive — for use wherever an author wants the effect on an image not already wrapped by a higher-level component (`Gallery`, `ImageText`, etc.).

**Content schema**

| Field | Type  | Required | Notes |
| ----- | ----- | -------- | ----- |
| Image | Image | Required |       |

**Layout schema**

- A contained or full-bleed frame matching the primitive's masking requirements.

**Animation schema**

- `ImageReveal` primitive, fully exposing its configurable properties (direction, scale-settle toggle and intensity, duration, easing).

**Responsive schema**

- Identical behavior at every breakpoint (a one-time, low-cost effect per the primitive's own spec).

**Accessibility**

- Alt text is required unless the image is explicitly marked decorative.
- Reduced motion → image presents fully unmasked immediately.

**Required media:** One image.
**Optional media:** None.

---

## 32. TextReveal

**Purpose:** The standalone authoring container for the `TextReveal`/`WordReveal`/`CharacterReveal` family — for applying a reveal to any text block not already wrapped by `RichText`, `Hero`, etc.

**Content schema**

| Field        | Type              | Required | Notes |
| ------------ | ----------------- | -------- | ----- |
| Text content | Text or Rich Text | Required |       |

**Layout schema**

- An inline wrapper that inherits the surrounding component's typography role (no layout of its own).

**Animation schema**

- A primitive picker choice among `TextReveal` / `WordReveal` / `CharacterReveal`, with the content-length guardrails from `docs/03-animation-system.md` Sections 12-13 enforced whenever Word or Character granularity is selected.

**Responsive schema**

- Identical behavior at every breakpoint (all three are one-time, low-cost effects).

**Accessibility**

- Reduced motion → text presents at final state instantly, per whichever primitive is selected.
- The underlying text content is always present in the DOM/accessibility tree regardless of animation state — the animation never gates content availability to assistive technology.

**Required media:** None.
**Optional media:** None.

---

# Cross-Component Composition Map

Several components are not typically placed standalone but are composed _inside_ other components. This table lists the primary composition relationships, so the builder's component picker can surface the right nesting options rather than presenting all 32 as equally standalone.

| Container component                      | Composes (typical)                                                                                                      |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| ProjectOverview                          | RichText/Quote, Stats, ImageText (×N), master-plan Hero-style hotspot block                                             |
| Architecture                             | Quote, PinnedSections (via StickyStory pattern)                                                                         |
| BuildingExplorer                         | Building (×N), Floor, Residence, tab/pin selector                                                                       |
| Building                                 | ResidenceGrid or Floor (×N)                                                                                             |
| Floor                                    | Residence (×N)                                                                                                          |
| Residence                                | Gallery, FloorPlan, feature-tag list, tabbed Info/Benefits panel                                                        |
| ResidenceGrid                            | Residence (card-summary form)                                                                                           |
| Location                                 | RichText/Quote, LocationMap, HorizontalGallery/route narrative                                                          |
| ConstructionUpdate                       | ImageGrid or Gallery (for attached media)                                                                               |
| Gallery                                  | Carousel (when the "Carousel-embedded" variant is selected)                                                             |
| CTA, Quote, Location, Architecture       | ParallaxImage (background layer)                                                                                        |
| Almost any component with a heading/body | TextReveal (as the underlying reveal mechanism for that field, when a component's own default doesn't already cover it) |

Components in the **INTERACTION** family (`ParallaxImage`, `StickyStory`, `ScrollGallery`, `ImageReveal`, `TextReveal`) are best understood as **primitive-authoring containers**: thin, directly-placeable wrappers around one animation primitive each, provided so a builder user can apply that primitive to a bare image/text/media block that isn't already produced by a higher-level CONTENT or REAL ESTATE component. They are not separate visual "looks" — they exist so no animation primitive from `docs/03-animation-system.md` is ever unreachable from the builder's component list.

---

# What This Document Deliberately Does Not Specify

Consistent with the scope stated at the top of this document and with `docs/01-product-requirements.md` Principle 5/11:

- No database schema, API contract, or component prop/type definition (TypeScript interfaces, Prisma models, JSON Schema) is specified — the field tables above are a conceptual content contract for implementation planning, not a serialization format.
- No exact default values (default duration bands, default column counts, default breakpoint pixel values) are fixed here — those belong to the Theme/Animation Profile defaults established during visual design (per `docs/03-animation-system.md` Section 6).
- No component's internal rendering markup, styling approach, or specific animation-engine invocation is specified — every animation reference points to a named primitive from `docs/03-animation-system.md`, kept engine-agnostic by design.
- No new animation mechanism is introduced beyond the 20 primitives already catalogued; where a component needs a small decorative loop (hotspot pulse, map-pin pulse), it is explicitly noted as a composition of existing primitives, not a new one.
