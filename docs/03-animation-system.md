# Animation System Design

## A Builder-Configurable Motion Primitive Library

**Status:** Draft for architecture review
**Depends on:** [`docs/01-product-requirements.md`](01-product-requirements.md) — Section 16 (Animation System), ANI-1..ANI-6, ACC-4; [`docs/02-reference-analysis.md`](02-reference-analysis.md) — Sections 11-20 (motion pattern observations)
**Scope of this document:** Design only — the primitive catalogue, its configuration surface, and its builder/runtime contract. No implementation code, no library-specific APIs.

---

## 1. Purpose and Design Philosophy

The PRD (Principle 5) requires that animation be authored entirely through **bounded, named presets** — never through code, timelines, or expressions. This document defines the complete primitive set that satisfies that requirement for a cinematic real-estate website, grounded in the interaction vocabulary observed in `docs/02-reference-analysis.md` (reveal-by-mask, counter-parallax, pinned tabbed browsers, magnetic buttons, scroll-progress-driven text, etc.), generalized into reusable, parameterized building blocks.

Every primitive in this catalogue follows one shape, so the builder can render one generic "Animation" inspector panel rather than a bespoke UI per effect:

```
Primitive = Trigger + Initial State + Final State + Timing + Scroll Behavior + Responsive Overrides + Reduced-Motion Fallback
```

This shape is what makes the system **buildable as configuration** (Section 4) rather than as code: a section/block stores a small JSON-like record (a "no-code" description of one of these primitives), and the renderer interprets that record the same way regardless of which specific animation engine implements it underneath.

### 1.1 Two Animation Families

Consistent with the reference-analysis finding in Section 15 ("Generalizable lesson"), every primitive below is tagged as one of:

- **One-time (entry) effect** — plays once when its trigger condition is met (load or first scroll-into-view). Cheap, safe to keep active at every breakpoint and even in a lightly-reduced-motion mode. _(fade, fade-up, fade-down, slide, scale, image zoom on entry, image reveal, clip-path reveal, text reveal, word reveal, character reveal, menu reveal, page transition, counter.)_
- **Continuous (scroll-coupled) effect** — stays coupled to scroll position or an ongoing loop for as long as its section is relevant. More expensive, more prone to jank on low-power/touch devices, and the first candidate for simplification or disabling on mobile/tablet. _(parallax, horizontal scroll, sticky storytelling, pinned sections, carousel autoplay, marquee.)_

This distinction drives the default responsive/reduced-motion behavior documented per primitive below, and should be a property the builder can read (not just a documentation note) so it can warn a user who, for example, tries to enable a continuous effect on a section marked as performance-sensitive.

### 1.2 Shared Vocabulary (used by every primitive's spec)

| Field                                  | Meaning                                                                                                                                                                                                                                    |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Trigger**                            | The event that starts the primitive: `on-load`, `on-scroll-enter` (element crosses a viewport threshold), `on-scroll-progress` (continuously driven by scroll position within a defined range), `on-click`, `on-hover`, `on-route-change`. |
| **Initial state**                      | The authored "before" state of the element, expressed as an offset from its natural layout position/appearance — never as raw CSS.                                                                                                         |
| **Final state**                        | The element's natural, laid-out appearance — always the same regardless of preset, so disabling an animation or falling back to reduced-motion simply means "start there instead of at the initial state."                                 |
| **Duration**                           | Bounded numeric range in milliseconds/seconds, exposed as a labeled scale (e.g., Fast / Normal / Slow / Cinematic) rather than a free-text field, per ANI-1.                                                                               |
| **Delay**                              | Time or scroll-offset before the primitive starts after its trigger fires; supports a **stagger** value when applied to a group of children (list items, gallery cells, character/word groups).                                            |
| **Easing**                             | Chosen from a small curated named list (e.g., Standard, Ease Out, Ease In-Out, Soft Spring, Snap) — never a raw cubic-bezier/spring-constant input field.                                                                                  |
| **Scroll behavior**                    | For scroll-coupled primitives: `play-once` (fires and detaches), `scrub` (tightly bound to scroll position, can run forward/backward), or `pin` (element/section is held in place while progressing).                                      |
| **Configurable properties**            | The bounded parameter set exposed in the builder's Animation inspector tab for this primitive.                                                                                                                                             |
| **Desktop / Tablet / Mobile behavior** | The primitive's default intent at each of the builder's three breakpoints (Section 17 of the PRD), and which parameters, if any, become breakpoint-overridable.                                                                            |
| **Reduced-motion behavior**            | What the primitive does when `prefers-reduced-motion` is active (ANI-4) or the builder's simulated reduced-motion toggle is on (ANI-5) — every primitive must define this, with no exceptions.                                             |

---

## 2. The Animation Profile (Context for Every Primitive)

Before the per-primitive catalogue, one structural point: no primitive is ever configured in a vacuum. Every website has one active **Animation Profile** (ANI-3) — a named bundle that sets the _default_ intensity/duration/easing for each primitive category (Reveal, Parallax, Scroll-driven, Transitions, Hover). A section/block that hasn't been explicitly customized inherits from the profile; a section/block with explicit overrides keeps them even if the profile changes later.

```
Animation Profile (e.g., "Cinematic", "Subtle", "Minimal")
  → default duration band per family (one-time vs. continuous)
  → default easing choice
  → default intensity/distance scale
  → global reduced-motion policy (Off / Reduced / Static — see Section 13.4)
    ↓
Section/Block-level primitive assignment
  → primitive choice (e.g., Fade Up) — or "None"
  → optional per-instance override of any bounded parameter
  → optional per-breakpoint override (Section 17 RES-3)
```

This inheritance model is what lets a Designer role (Section 6.3/26 of the PRD) restyle a site's entire motion feel in one action (swap the Animation Profile) while an Editor's per-section choices remain intact — directly satisfying ANI-3's acceptance criterion.

---

## 3. Fade

**Purpose:** The simplest entry effect — an element materializes in place. Used as the default, lowest-ceremony reveal for any block that needs _some_ motion without drawing attention to itself (e.g., body copy, secondary labels).

**Trigger:** `on-scroll-enter` (default) or `on-load` for above-the-fold content.

**Initial state:** Fully transparent (0% opacity), no positional offset.

**Final state:** Fully opaque, natural position.

**Duration:** Short–Normal (bounded range, e.g., 300-800ms), defaulting from the active Animation Profile's "one-time" band.

**Delay:** 0 by default; supports a stagger value when applied to a list of sibling elements (each child delayed incrementally after the previous).

**Easing:** Ease Out (default) or Standard.

**Scroll behavior:** `play-once` — plays a single time when the element crosses the configured viewport-entry threshold, then detaches its scroll listener.

**Configurable properties:** Duration band, delay/stagger, easing choice, viewport-entry threshold (e.g., "trigger when 20% visible").

**Desktop behavior:** Full effect as specified.

**Tablet behavior:** Identical to desktop — a one-time, low-cost effect with no performance concern.

**Mobile behavior:** Identical to desktop.

**Reduced-motion behavior:** Element appears at final state instantly (opacity jumps to 100% with no transition), or with a very short (≤150ms) cross-fade — never fully suppressed to a hard cut, since a fade is already the gentlest primitive and a short cross-fade avoids a jarring pop-in.

---

## 4. Fade Up

**Purpose:** The default, most-used reveal in this genre of site (per reference-analysis Section 14) — text and content blocks appear to rise gently into place, reinforcing the page's vertical scroll direction.

**Trigger:** `on-scroll-enter` (default) or `on-load` for hero-level content.

**Initial state:** Transparent and offset downward from final position by a bounded distance (e.g., 16-48px).

**Final state:** Opaque, natural position (offset = 0).

**Duration:** Normal (e.g., 500-900ms).

**Delay:** 0 by default; stagger supported for sibling groups (e.g., a row of cards each rising in sequence).

**Easing:** Ease Out (default) — a fast start that settles gently, matching a "rising into place" feel.

**Scroll behavior:** `play-once`.

**Configurable properties:** Distance/offset (Subtle / Standard / Pronounced), duration band, delay/stagger, easing, viewport-entry threshold.

**Desktop behavior:** Full effect; commonly the platform-wide default for headings and paragraph blocks.

**Tablet behavior:** Identical to desktop.

**Mobile behavior:** Identical to desktop; offset distance may be automatically scaled down slightly on narrow viewports to avoid the element traveling a disproportionate fraction of a short screen height (a builder-managed default, not a manual override requirement).

**Reduced-motion behavior:** Offset is removed entirely (no vertical travel); only the opacity fade (or an instant appearance) remains, consistent with vestibular-safety guidance to eliminate large positional motion first.

---

## 5. Fade Down

**Purpose:** The inverse of Fade Up — content appears to settle downward into place. Used sparingly, typically for elements that should feel like they're "descending from above" (e.g., a dropdown-adjacent label, an element anchored to a ceiling-like layout position, or simply for deliberate visual variety against a Fade Up-heavy page).

**Trigger:** `on-scroll-enter`.

**Initial state:** Transparent and offset upward from final position by a bounded distance.

**Final state:** Opaque, natural position.

**Duration:** Normal.

**Delay:** 0 by default; stagger supported.

**Easing:** Ease Out.

**Scroll behavior:** `play-once`.

**Configurable properties:** Distance/offset, duration band, delay/stagger, easing, viewport-entry threshold.

**Desktop behavior:** Full effect.

**Tablet behavior:** Identical to desktop.

**Mobile behavior:** Identical to desktop, with the same automatic offset-scaling as Fade Up.

**Reduced-motion behavior:** Offset removed; opacity-only (or instant) appearance, identical policy to Fade Up.

---

## 6. Slide

**Purpose:** A directional reveal along the horizontal axis (left/right), used for content that should feel like it's entering from off-stage — e.g., a two-column split where an image or text block slides in from its adjacent edge, or a gallery/carousel slide's incoming panel (reference-analysis Section 10).

**Trigger:** `on-scroll-enter`, or `on-click`/`on-tab-change` when used as a carousel/tab-content transition rather than a page-scroll reveal.

**Initial state:** Transparent (optional) and offset horizontally (left or right, configurable) from final position by a bounded distance, often set relative to the element's own width (e.g., "enter from 100% of its width").

**Final state:** Opaque, natural position.

**Duration:** Normal–Slow, depending on distance.

**Delay:** 0 by default; stagger supported for side-by-side sibling groups.

**Easing:** Ease Out (scroll-triggered) or Ease In-Out (tab/carousel-triggered, since it must also visually "hand off" from the outgoing slide).

**Scroll behavior:** `play-once` for scroll-triggered use; not scroll-coupled at all when driven by click/tab-change instead.

**Configurable properties:** Direction (left/right), distance (relative to element width or an absolute bounded value), duration, delay/stagger, easing, opacity-combined-with-slide toggle.

**Desktop behavior:** Full effect, including the two-column "counter-directional" variant (left column slides from the left, right column from the right) observed in the reference analysis's Interior section pattern.

**Tablet behavior:** Full effect at the shared breakpoint tier appropriate to the section's layout (see Section 17 RES-3 for how a section's overall layout — stacked vs. split — governs which tier a Slide instance falls into).

**Mobile behavior:** When the underlying layout has already stacked to a single column (common at this breakpoint), the Slide direction typically becomes vertical-equivalent (behaves like Fade Up) rather than horizontal, since a horizontal slide reads poorly in a narrow single-column layout — this is a builder-level default translation, not a manual override burden on the user.

**Reduced-motion behavior:** Positional offset removed entirely; falls back to an opacity-only (or instant) appearance.

---

## 7. Scale

**Purpose:** An entry effect where an element grows (or shrinks) into its final size — used for cards, icons, badges, and circular buttons that should feel like they're "settling" into place with a touch of weight, distinct from a flat fade.

**Trigger:** `on-scroll-enter` or `on-load`.

**Initial state:** Transparent (optional) and scaled down (or up, for a "settle from oversized" variant) from final size by a bounded percentage (e.g., 85%-98% of final size for a subtle effect).

**Final state:** Opaque, 100% scale.

**Duration:** Short–Normal.

**Delay:** 0 by default; stagger supported (e.g., a grid of amenity icons scaling in sequentially).

**Easing:** Soft Spring (default, for a natural "settle" feel) or Ease Out.

**Scroll behavior:** `play-once`.

**Configurable properties:** Start scale percentage, direction (grow-in vs. shrink-in), duration, delay/stagger, easing, opacity-combined toggle.

**Desktop behavior:** Full effect.

**Tablet behavior:** Identical to desktop.

**Mobile behavior:** Identical to desktop — a low-cost, one-time effect appropriate at every breakpoint.

**Reduced-motion behavior:** Scale delta removed (starts and ends at 100%); only an opacity fade (or instant appearance) remains.

---

## 8. Image Zoom

**Purpose:** A hover- or entry-driven subtle magnification of an image within a fixed, clipped frame — the "living photograph" effect used pervasively across card and gallery imagery in the reference analysis (Section 17: the `[hover='img']` pattern).

**Trigger:** `on-hover` (desktop primary use case) or `on-scroll-enter` (a slower, one-time "breathing" zoom variant for hero/full-bleed imagery).

**Initial state:** Image at 100% scale (hover variant) or slightly over-scaled beyond frame (entry variant, so the zoom-out settles to final size — see below); frame `overflow` is always clipped so the image never visually exceeds its container.

**Final state:** Hover variant: image scaled up slightly (e.g., 104-112%) while hovered, returning to 100% on hover-exit. Entry variant: image settles to 100% (or a designer-set resting scale) once its one-time zoom completes.

**Duration:** Hover variant: Short, symmetric in/out. Entry variant: Slow–Cinematic (a slow "breathing" zoom over several seconds is common for hero backgrounds).

**Delay:** Typically 0; entry variant supports a delay to sequence after other hero elements have revealed.

**Easing:** Ease Out (hover) or Standard/linear-ish (a continuous slow entry zoom).

**Scroll behavior:** Hover variant is not scroll-coupled. Entry variant is `play-once` (triggers, then may continue as an ambient loop — see "configurable properties").

**Configurable properties:** Zoom intensity (percentage range), direction (zoom-in vs. zoom-out-to-rest), duration, easing, "continue as ambient loop after entry" toggle, frame clip on/off.

**Desktop behavior:** Both hover and entry variants available.

**Tablet behavior:** Hover variant behaves per the platform's pointer-detection rule (Section 17 of `docs/02-reference-analysis.md`: hover effects gated to non-touch, wide-enough viewports) — enabled on a mouse-capable tablet, disabled on a touch-only one; entry variant always available (not hover-dependent).

**Mobile behavior:** Hover variant disabled (no persistent hover state on touch); entry/"breathing" variant remains available since it is not interaction-dependent.

**Reduced-motion behavior:** Hover variant: disabled entirely (no scale change on hover/tap). Entry/ambient variant: the one-time settle-to-rest may still occur at reduced intensity (a smaller zoom delta), but any continuous ambient looping is disabled — a static resting image is shown instead.

---

## 9. Image Reveal

**Purpose:** An image's entry treatment as it scrolls into view — the image appears to emerge into its frame (commonly paired with a slight scale-settle and/or a masked wipe), distinct from a plain fade (reference-analysis Section 15).

**Trigger:** `on-scroll-enter`.

**Initial state:** Image container is masked/clipped to reveal 0% of the image (or a directional partial mask), and the image itself may be slightly over-scaled and/or offset, so revealing the mask _and_ settling the scale/position happen together.

**Final state:** Fully unmasked, 100% scale, natural position.

**Duration:** Normal–Slow.

**Delay:** 0 by default; stagger supported when several images reveal as a set (e.g., a gallery grid entering together).

**Easing:** Ease Out or Ease In-Out.

**Scroll behavior:** `play-once`.

**Configurable properties:** Reveal direction (e.g., bottom-to-top, left-to-right, center-out), combined scale-settle toggle and intensity, duration, delay/stagger, easing.

**Desktop behavior:** Full effect, including directional variants.

**Tablet behavior:** Identical to desktop.

**Mobile behavior:** Identical to desktop — a one-time, moderate-cost effect acceptable at every breakpoint; the reference analysis found no evidence of this being disabled on mobile.

**Reduced-motion behavior:** The mask/wipe motion is removed (image is simply present, unmasked, at load-of-viewport); an optional short opacity cross-fade may remain, but no directional wipe or scale-settle motion plays.

---

## 10. Clip-Path Reveal

**Purpose:** The general-purpose masking primitive that underlies several other reveals (text line reveals, divider "lines drawing themselves in," decorative frame reveals) per the reference analysis's Section 14 finding (a `clip-path` driven by a scroll/tween "progress" value, rather than opacity-only animation). Exposed here as its own primitive because it is independently useful for **any** shape-masked reveal — not just text or photos (e.g., revealing a decorative divider line, an icon, or a custom shape).

**Purpose (restated for the builder):** "Wipe" an element into view along a defined edge or shape, giving a more deliberate, designed unveiling than a fade.

**Trigger:** `on-scroll-enter` (`play-once`) or `on-scroll-progress` (`scrub`, when tied continuously to scroll position rather than firing once).

**Initial state:** Element clipped to 0% visible area along the configured axis/shape (e.g., a horizontal line clipped to zero width; a panel clipped along its top edge).

**Final state:** Fully unclipped (100% visible).

**Duration:** Normal–Slow for `play-once`; N/A (driven by scroll position, not time) for `scrub`.

**Delay:** Supported for `play-once` mode; not applicable in `scrub` mode (position _is_ the delay mechanism).

**Easing:** Ease Out / Ease In-Out for `play-once`; linear (progress-mapped) for `scrub`, since easing in a scrubbed effect is better expressed by adjusting the trigger's start/end scroll range than by a time-based curve.

**Scroll behavior:** Configurable between `play-once` and `scrub` (unique among the "reveal" family in exposing this choice explicitly) — `pin` is not applicable to this primitive directly (see Pinned Sections, Section 15 below, for cases needing both).

**Configurable properties:** Clip axis/direction (top/bottom/left/right/radial/custom shape preset), mode (`play-once` vs. `scrub`), duration or scroll-range (start/end offsets), delay (play-once only), easing (play-once only).

**Desktop behavior:** Full effect in both modes.

**Tablet behavior:** Identical to desktop.

**Mobile behavior:** `play-once` mode identical to desktop; `scrub` mode remains available since it is comparatively cheap (a single CSS property driven by scroll position) but should default to a shorter scroll-range so the effect fully resolves within a shorter mobile scroll distance.

**Reduced-motion behavior:** Element is presented fully unclipped immediately; no wipe or scrub motion plays, in either mode.

---

## 11. Text Reveal

**Purpose:** The default treatment for headings and paragraph blocks as they enter view — the block-level counterpart to Word Reveal/Character Reveal below, used when per-word or per-character granularity is unnecessary (reference-analysis Section 14: applied to nearly every heading/paragraph on the reference site).

**Trigger:** `on-scroll-enter` or `on-load` (hero-level headings).

**Initial state:** The text block is clipped/masked (via Clip-Path Reveal, Section 10) and/or offset and transparent, hidden as a whole unit.

**Final state:** Fully visible, unmasked, natural position.

**Duration:** Normal.

**Delay:** 0 by default; when applied to multiple lines within one block, an internal per-line stagger is a configurable variant (distinct from Word/Character Reveal, which stagger at finer grain).

**Easing:** Ease Out.

**Scroll behavior:** `play-once`.

**Configurable properties:** Reveal technique (mask-wipe vs. fade+offset), direction, per-line stagger on/off and amount, duration, delay, easing, viewport-entry threshold.

**Desktop behavior:** Full effect; the platform default for most headings.

**Tablet behavior:** Identical to desktop.

**Mobile behavior:** Identical to desktop — confirmed by the reference analysis as a technique kept active at every breakpoint (a one-time, low-cost effect).

**Reduced-motion behavior:** Text is presented at final state immediately; no mask-wipe, offset, or stagger motion plays. This is treated as a strict requirement (ACC-4) since large-scale masked text motion is one of the more perceptible effects for motion-sensitive visitors.

---

## 12. Word Reveal

**Purpose:** A finer-grained text reveal where individual words appear in sequence — used for short, high-impact lines (hero headlines, pull-quotes, section-defining statements) where a per-word cadence adds deliberate pacing beyond a single block-level reveal.

**Trigger:** `on-scroll-enter` or `on-load`.

**Initial state:** Each word is individually masked/offset and transparent; words are laid out in their natural flow position so line-wrapping is unaffected by the animation.

**Final state:** All words fully visible in natural position.

**Duration:** Per-word duration is short, but the overall perceived duration is governed by the stagger interval multiplied by word count — the builder should show an estimated total duration given the bound text, not just the per-word value.

**Delay:** Stagger interval between words (bounded range, e.g., 20-80ms per word) plus an overall start delay.

**Easing:** Ease Out.

**Scroll behavior:** `play-once`.

**Configurable properties:** Per-word stagger interval, reveal technique (mask-wipe vs. fade+offset), direction, overall start delay, easing, viewport-entry threshold, maximum-word-count guard (see below).

**Desktop behavior:** Full effect.

**Tablet behavior:** Identical to desktop.

**Mobile behavior:** Identical to desktop; because mobile line-wrapping differs from desktop (more, shorter lines), the builder should re-flow the same per-word stagger against the mobile-wrapped layout rather than preserving the desktop line breaks.

**Reduced-motion behavior:** All words are presented at final state simultaneously and instantly; no per-word stagger or motion plays.

**Builder guardrail:** Because per-word (and especially per-character) reveals scale in perceived duration and DOM cost with content length, the builder should warn (not block) when this preset is applied to a content field bound to long or variable-length copy (e.g., a CMS-bound paragraph that an Editor might later replace with a much longer sentence) and suggest Text Reveal instead for such bindings.

---

## 13. Character Reveal

**Purpose:** The finest-grained text reveal, animating individual characters — reserved for very short, high-impact strings (a wordmark, a single evocative word, a large numeral) where per-character cadence creates a distinctly premium, deliberate feel; not intended for running copy.

**Trigger:** `on-scroll-enter` or `on-load`.

**Initial state:** Each character is individually masked/offset and transparent.

**Final state:** All characters fully visible in natural position.

**Duration:** Per-character duration is very short; total perceived duration follows the same stagger × count logic as Word Reveal, at a finer interval.

**Delay:** Stagger interval between characters (bounded, shorter range than Word Reveal, e.g., 8-30ms per character) plus an overall start delay.

**Easing:** Ease Out or Soft Spring (a springy per-character settle is a common premium variant).

**Scroll behavior:** `play-once`.

**Configurable properties:** Per-character stagger interval, reveal technique (mask-wipe, fade+offset, or fade+scale), direction, overall start delay, easing, viewport-entry threshold, maximum-character-count guard.

**Desktop behavior:** Full effect.

**Tablet behavior:** Identical to desktop.

**Mobile behavior:** Identical to desktop; the same content-length guardrail from Word Reveal applies more strictly here, since character-count scales even faster with longer bound content.

**Reduced-motion behavior:** All characters are presented at final state simultaneously and instantly; no stagger or motion plays.

**Builder guardrail:** This preset should be offered only on fields the builder knows are short and fixed-ish in length (e.g., a Project name, a short accent label) — for any CMS-bound field without a sensible max length, the inspector should recommend Text Reveal or Word Reveal instead, consistent with Section 12's guardrail but stricter.

---

## 14. Parallax

**Purpose:** A background or decorative layer moves at a different rate than the foreground content/scroll rate, creating a sense of depth — applied across backgrounds, decorative accents, and (per reference-analysis Section 13) even opposing two-column layouts where adjacent columns drift in different directions.

**Trigger:** `on-scroll-progress` (continuous, tied to the element's position relative to the viewport for as long as it is on screen).

**Initial state:** Layer at its authored base position, offset from its "would-be static" position by the amount needed so that, combined with its drift over the full scroll range, it ends centered/aligned as designed.

**Final state:** N/A in the play-once sense — the layer continuously tracks scroll position within its active range; its "final" state is simply wherever the scroll range places it, with the effect naturally stopping contribution once the element leaves the tracked range.

**Duration:** N/A (position-driven, not time-driven).

**Delay:** N/A, though a "start offset" (how far into the element's viewport transit the effect begins ramping) is configurable.

**Easing:** Linear (position-mapped) by default; an optional smoothing/lerp amount can be exposed to soften abrupt scroll-speed changes without introducing a time-based curve.

**Scroll behavior:** `scrub`, continuously coupled to scroll position; never `play-once` or `pin` (pinning is a separate primitive, Section 16).

**Configurable properties:** Direction (up/down/left/right), speed/intensity (relative multiplier against native scroll speed, clamped to a safe range), axis lock, "disable below breakpoint" toggle, smoothing amount.

**Desktop behavior:** Full effect, including multi-layer/counter-directional setups (distinct layers configured with different intensities/directions within the same section).

**Tablet behavior:** Enabled by default at reduced intensity relative to desktop (a conservative default the platform applies, distinct from the reference site's binary on/off — giving our builder finer control per Section 29 of `docs/02-reference-analysis.md`'s recommendation to improve on the reference's two-bucket approach); explicitly overridable per instance.

**Mobile behavior:** Disabled by default (matching the reference-analysis finding that continuous scroll-coupled effects are the first to be turned off on mobile for performance), with an explicit opt-in override available per instance for a designer who has tested performance and wants it enabled anyway.

**Reduced-motion behavior:** Disabled entirely; the layer renders at its natural static position with zero scroll-coupled offset.

---

## 15. Horizontal Scroll

**Purpose:** Converts vertical scroll input into horizontal motion of an inner content track while its containing section is in view — used for a wide, sequential narrative (e.g., a location storyline, a route/path illustration) that reads better as a left-to-right sequence than a stacked vertical one (reference-analysis Section 11).

**Trigger:** `on-scroll-progress`, active only while the section occupies its pinned range in the viewport (this primitive inherently composes with Pinned Sections, Section 16).

**Initial state:** Inner track positioned at its horizontal start (e.g., translated fully to one side, showing its first "panel").

**Final state:** Inner track fully translated to its horizontal end, showing its last panel, at the point the user has scrolled through the section's full pinned range.

**Duration:** N/A (scroll-range-driven); the _scroll distance_ required to traverse the full track is the configurable analogue of duration.

**Delay:** N/A.

**Easing:** Linear (direct 1:1 scroll-to-position mapping) by default; an optional "slow scroll" damping factor is configurable to intentionally require more vertical scroll input per unit of horizontal travel, matching the reference site's "slow scroll" modifier observed alongside this pattern.

**Scroll behavior:** `scrub`, composed with `pin` (see Section 16) for the containing section.

**Configurable properties:** Track content (an ordered set of panels/blocks, each independently content-bound), scroll-distance-per-panel (governs how much vertical scroll each horizontal "panel" consumes), damping/slow-scroll factor, entry/exit transition style (how the section releases from pinning), internal reveal timing for sub-elements within each panel (composes with Text/Image Reveal primitives).

**Desktop behavior:** Full pinned, scroll-hijacked horizontal experience.

**Tablet behavior:** Portrait tablet: falls back to the Mobile behavior below (touch-drag strip). Landscape tablet with pointer/scroll input comparable to desktop: may retain the desktop behavior if the section is explicitly configured to allow it, but defaults to the touch-drag fallback for safety, since ScrollTrigger-style scroll-hijacking is fragile on touch input generally (per the reference-analysis Section 29 finding about the risk of assuming landscape-width devices are safe to treat as desktop).

**Mobile behavior:** Replaced entirely by an ordinary horizontally swipeable strip (native touch-scroll, no scroll-hijacking) with an explicit "drag to see more" affordance shown to the visitor — this is a **defined fallback layout**, not a degraded version of the same mechanism, matching the reference-analysis Section 11 finding.

**Reduced-motion behavior:** The pinning/scroll-hijack behavior is disabled; content is presented as an ordinary vertically-stacked (or horizontally swipeable, matching the mobile fallback) sequence of panels in natural document flow, so all content remains reachable without requiring the scroll-coupled mechanism.

---

## 16. Sticky Storytelling

**Purpose:** A section where a persistent visual/media element remains in place while accompanying text or data changes underneath/around it as the user scrolls — e.g., a fixed image or quote backdrop against which several supporting statements scroll past in sequence. Distinct from Horizontal Scroll (which converts scroll to horizontal motion) and from Pinned Sections generically (Section 16 below covers the _mechanism_; this primitive covers the specific **"fixed media + advancing narrative text"** authoring pattern built on top of it).

**Trigger:** `on-scroll-progress`, active while the section occupies its pinned range.

**Initial state:** The persistent element (image/quote/video) is in its resting position and visible; the first narrative "beat" (text/data block) is in its entry state.

**Final state:** The persistent element remains visible throughout; each narrative beat, in turn, reaches its revealed state and then (depending on configuration) either remains or itself exits before the next beat enters.

**Duration:** N/A directly (scroll-range-driven); each beat's _share_ of the section's total scroll range is configurable.

**Delay:** N/A; beat-to-beat sequencing is governed by scroll-range allocation, not time delay.

**Easing:** Linear scroll-to-progress mapping for the pin/hold mechanism; each individual beat's reveal-in/reveal-out sub-animation uses its own composed primitive (typically Fade Up or Text Reveal) with its own easing.

**Scroll behavior:** `pin` (the persistent element and overall section) with `scrub`-driven sub-animations for each beat.

**Configurable properties:** Number and content of narrative beats (each independently content-bound), scroll-range share per beat (equal split by default, adjustable), the persistent element's own presentation (static, slow ambient zoom via Image Zoom, or a background Parallax layer), beat transition style (cross-fade vs. sequential reveal/hide), exit behavior once the last beat completes.

**Desktop behavior:** Full pinned storytelling experience.

**Tablet behavior:** Landscape: may retain the pinned experience if explicitly enabled, defaulting to the mobile fallback otherwise; portrait: mobile fallback.

**Mobile behavior:** Falls back to an ordinary stacked sequence — the persistent element is shown once (e.g., as a section-level background or a leading image) followed by each narrative beat in normal vertical flow, rather than attempting to hold anything fixed on a small viewport.

**Reduced-motion behavior:** Renders as the same stacked, unpinned sequence used for the mobile fallback, regardless of breakpoint — pinning is fundamentally a motion-dependent technique, so reduced-motion mode always uses the static-flow presentation.

---

## 17. Pinned Sections

**Purpose:** The general mechanism underlying Horizontal Scroll and Sticky Storytelling, exposed as its own primitive because a section can be pinned without either of those specific authored patterns — e.g., a section whose background/tone simply holds in place slightly longer than normal document flow would allow, for pacing purposes (reference-analysis Section 12), or a tabbed content browser (the Amenities pattern) where tab-driven content swaps happen while the section is held in the viewport.

**Trigger:** `on-scroll-progress`, once the section reaches the top (or a configured offset) of the viewport.

**Initial state:** Section enters normal scroll flow like any other section, up to the point it reaches its pin-start offset.

**Final state:** Section releases from its pinned position once the user has scrolled through its configured pinned duration (expressed as a scroll distance, e.g., "hold for 150% of one viewport height of additional scroll"), resuming normal document flow immediately after.

**Duration:** N/A directly; the **pinned scroll distance** (how much additional scroll the section consumes while held) is the primary configurable analogue.

**Delay:** N/A; a pin-start offset (how far the section's top edge must be from the viewport top before pinning engages) is configurable.

**Easing:** N/A for the pin mechanism itself (it is a binary held/released state, not an eased property); any content changes that occur _while_ pinned use their own composed primitive's easing.

**Scroll behavior:** `pin`, optionally combined with `scrub` for content that advances within the pinned range (tab-driven content, as in the Amenities pattern, may instead advance via `on-click` while still visually pinned).

**Configurable properties:** Pinned scroll distance, pin-start offset, release behavior (snap vs. gradual release), what advances while pinned (nothing/decorative only, a scrub-driven sub-animation, or click/tab-driven content swap), whether a persistent secondary control (e.g., a tab bar with a sliding active-indicator) is shown during the pin.

**Desktop behavior:** Full pinning mechanism available as the foundation for any of the composed patterns above.

**Tablet behavior:** Same landscape/portrait split as Horizontal Scroll and Sticky Storytelling — enabled by default only in landscape, and only when explicitly confirmed safe for the section's specific content (since a tab-driven pinned browser, unlike a scroll-hijacked one, is less risky on touch and may reasonably stay enabled more often).

**Mobile behavior:** Disabled; the section's content is presented in normal, unpinned document flow. If the section had tab-driven content (as in a Tabbed Feature Browser use of this primitive), the tabs remain functional as an ordinary in-flow tab control — only the "hold the section in the viewport" behavior is removed.

**Reduced-motion behavior:** Disabled; behaves identically to the Mobile fallback described above, at any breakpoint.

---

## 18. Carousel

**Purpose:** A single-slide-at-a-time browsing pattern for an ordered set of content (benefits, residence types, gallery images) with explicit prev/next and positional controls — the "one slide, numbered pagination" pattern used repeatedly in the reference analysis (Section 10).

**Trigger:** `on-click` (prev/next/pagination controls) as the primary driver; optional `on-load`-started autoplay as a secondary, opt-in driver.

**Initial state:** The first (or a configured starting) slide is shown at its revealed state; adjacent slides are positioned off-stage (per the Slide primitive) or hidden, ready to enter on navigation.

**Final state:** N/A as a single state — the carousel persists in whichever slide is currently active; "final" applies per-transition (the incoming slide reaching its revealed state).

**Duration:** Per-transition duration (Normal), applied to the slide-change animation, not to the carousel as a whole.

**Delay:** N/A for manual navigation; for autoplay, the inter-slide dwell time is configurable.

**Easing:** Ease In-Out (a transition that must read well in both directions, since a visitor can navigate forward or backward).

**Scroll behavior:** Not scroll-coupled by default — navigation is click/tap-driven; the carousel's _entry into view_ may itself use a one-time reveal primitive (e.g., Fade Up) the first time it scrolls into the viewport, distinct from its internal slide-to-slide mechanism.

**Configurable properties:** Slide source (a bound Gallery/Residence-type/Benefit list), transition style (cross-fade, slide, or composed with Text/Image Reveal on the incoming slide's content per reference-analysis Section 10), autoplay on/off and dwell time, pause-on-hover/interaction toggle, loop (wrap from last to first) on/off, pagination style (numbered counter, dots, progress bar), swipe/drag enabled toggle.

**Desktop behavior:** Full effect; prev/next controls typically carry their own small hover micro-interaction (a nudge toward the pointer direction, per reference-analysis Section 17) as a composed Hover preset, not a separate primitive.

**Tablet behavior:** Identical to desktop, with drag/swipe navigation enabled alongside click controls.

**Mobile behavior:** Drag/swipe becomes the primary navigation method; prev/next controls remain present but the carousel must be fully operable by swipe alone.

**Reduced-motion behavior:** Autoplay is disabled unconditionally (an auto-advancing, looping visual change is one of the clearest reduced-motion violations); manual slide-to-slide transitions switch to an instant cut or a very short cross-fade rather than a sliding/masked transition; incoming-slide content reveal (Text/Image Reveal) also degrades per those primitives' own reduced-motion rules.

---

## 19. Marquee

**Purpose:** A continuously looping horizontal scroll of repeated/tiled content, used for ambient decorative motion (e.g., drifting cloud imagery, a logo strip, a tag/keyword strip) rather than for content the visitor is meant to actively browse (reference-analysis Section 13, cloud-layer marquee).

**Trigger:** `on-scroll-enter` (starts looping once the element is in view) — not scroll-position-coupled; it runs on its own continuous loop timer once active, independent of further scroll input.

**Initial state:** Content track at its loop start position.

**Final state:** N/A — the primitive is a continuous, non-terminating loop for as long as the element remains in view (it pauses, rather than "completes," when scrolled out of view, to avoid wasted work).

**Duration:** The time for one full loop cycle (bounded range, e.g., Slow/Standard/Fast presets rather than a raw seconds field).

**Delay:** N/A (continuous loop, not a one-time timed entrance).

**Easing:** Linear (constant velocity is the defining character of a marquee; an eased marquee would read as broken/stuttering).

**Scroll behavior:** Not scroll-position-coupled; visibility-gated only (plays while in view, pauses while off-screen — a performance guard, not an authored effect).

**Configurable properties:** Direction (left/right), speed, content source (an ordered media/text list, auto-tiled/duplicated for seamless looping), pause-on-hover toggle, gap/spacing between repeated items.

**Desktop behavior:** Full continuous loop.

**Tablet behavior:** Identical to desktop.

**Mobile behavior:** Identical to desktop by default, since a marquee is comparatively cheap (simple constant-rate transform, no scroll-position math) — but the builder should offer a "reduce to static strip" override for sections a designer judges too decoration-heavy for a specific low-power target audience.

**Reduced-motion behavior:** Looping motion is disabled; the content displays as a static strip (a single, non-repeating pass of the content, or the content laid out in an ordinary wrapped row) rather than a continuously moving one — this primitive's core purpose _is_ continuous motion, so reduced-motion mode necessarily changes its presentation substantially, not just its timing.

---

## 20. Counter

**Purpose:** A numeral that animates from a start value up (or down) to its final bound value as it enters view — used for statistics, result counts (e.g., a live filtered-listing result count), or key project figures (e.g., "25 residences").

**Trigger:** `on-scroll-enter` (first appearance) or `on-data-change` (re-triggers when the bound number changes, e.g., a filter result count updating).

**Initial state:** Displayed value at a configured start number (commonly 0).

**Final state:** Displayed value equals the bound data value exactly, formatted per its configured display rules (decimal places, thousands separator, unit suffix).

**Duration:** Short–Normal; may optionally scale with the numeric distance being traveled (a counter jumping from 0 to 4 vs. 0 to 2,500 may warrant different perceived pacing), exposed as a duration-scaling toggle rather than a manual per-instance calculation.

**Delay:** 0 by default; supported for sequencing multiple counters in a stat row.

**Easing:** Ease Out (fast increment at the start, settling in near the final value) is the conventional choice; linear is offered as an alternative for a more mechanical, "ticking" feel.

**Scroll behavior:** `play-once` on first entry; `on-data-change` re-triggers are not scroll-coupled at all (they fire immediately when the bound value changes, regardless of scroll position, since the element is already in view when a filter/data change occurs).

**Configurable properties:** Start value, duration (fixed or distance-scaled), easing, number formatting (decimals, separators, prefix/suffix), re-trigger behavior on data change (animate vs. snap instantly to the new value).

**Desktop behavior:** Full effect.

**Tablet behavior:** Identical to desktop.

**Mobile behavior:** Identical to desktop — a low-cost, one-time (or infrequent, data-driven) effect appropriate at every breakpoint.

**Reduced-motion behavior:** The numeral snaps directly to its final/updated value with no incrementing animation, on both first entry and any subsequent data-driven change.

---

## 21. Menu Reveal

**Purpose:** The transition governing the site-wide navigation menu opening/closing — covers both the trigger icon's own morph (e.g., a hamburger-to-close transformation) and the overlay panel's entrance/exit (reference-analysis Section 18).

**Trigger:** `on-click` (the menu trigger control), plus `on-click` on a backdrop/close-control or any in-menu link for the reverse (closing) transition.

**Initial state (opening):** Overlay panel off-stage or fully transparent/masked and typically slightly offset (per a composed Fade/Slide/Clip-Path Reveal); trigger icon in its "closed/menu" glyph state.

**Final state (opening):** Overlay panel fully visible, occupying its full intended area (commonly full-viewport); trigger icon in its "open/close" glyph state; focus is programmatically moved into the opened menu for keyboard/screen-reader users.

**Duration:** Normal, for both the panel transition and the icon morph (kept close in timing so they read as one coordinated action).

**Delay:** An internal stagger for the menu's own link list is a common configurable variant (links revealing in sequence just after the panel itself appears), composing with Fade Up or Text Reveal.

**Easing:** Ease Out (opening), Ease In (closing) — an asymmetric pair is a common refinement, though a single Ease In-Out is an acceptable simpler default.

**Scroll behavior:** Not scroll-coupled; purely click-driven. Background page scroll is locked while the menu is open (a behavioral requirement, not an animation parameter, but one the builder should enforce automatically).

**Configurable properties:** Panel transition style (fade, slide-in-from-edge, or clip-path wipe), icon morph style, internal link-list stagger on/off and amount, backdrop treatment (dim/blur/none), close triggers enabled (backdrop click, escape key, link click — escape-key and focus-trap behavior should be non-optional for accessibility, not user-configurable off).

**Desktop behavior:** This primitive governs the mobile-style overlay specifically; on breakpoints where the Navigation component is configured to show an inline link list instead (Section 21 above / PRD Section 15), Menu Reveal is simply not invoked, since there is no overlay to open.

**Tablet behavior:** Governed by whichever Navigation layout (inline vs. overlay) is active at that breakpoint per the Navigation component's own responsive configuration — Menu Reveal behaves identically to whichever of Desktop/Mobile behavior corresponds to the active layout.

**Mobile behavior:** The primary, expected use case — full overlay open/close transition as described above.

**Reduced-motion behavior:** The panel appears/disappears with an instant or very short (≤150ms) cross-fade only; no slide or clip-path wipe motion plays. The icon morph, being a small, localized glyph change, may keep a brief transition. Focus-trap and escape-to-close behavior are unaffected by reduced-motion (they are accessibility requirements, not visual motion).

---

## 22. Page Transition

**Purpose:** The choreographed handoff between two pages on internal navigation (e.g., Home → Residence Detail), so navigation feels like a continuous, branded experience rather than a hard reload (reference-analysis Section 19).

**Trigger:** `on-route-change`, intercepting an internal link click before the browser's default navigation completes.

**Initial state (outgoing):** Current page fully visible.

**Final state (outgoing) / Initial state (incoming):** An intermediate covered/transitional state (e.g., a full-viewport overlay wipe, or a brief reappearance of the Loading Experience's branded preloader) that visually separates "leaving page A" from "entering page B."

**Final state (incoming):** New page fully visible and interactive, with its own entry animations (Sections 3-13 above, as configured per its sections) proceeding normally from that point.

**Duration:** Short–Normal, deliberately brief so navigation doesn't feel sluggish — this is a transition, not a scene change.

**Delay:** N/A; the incoming page's own content-level entry animations (hero fade-up, etc.) may have a small additional delay layered on top so they don't compete visually with the tail of the page-transition overlay.

**Easing:** Ease In-Out.

**Scroll behavior:** Not scroll-coupled; purely navigation-event-driven. The new page should load already scrolled to its top (or to a specific anchor, e.g., `#hero`) before its transition completes.

**Configurable properties:** Transition style (overlay fade, overlay wipe/clip-path, or "reprise the branded preloader" per Section 20 of `docs/02-reference-analysis.md`), duration, whether the outgoing and incoming pages cross-fade or fully sequence (outgoing completes, then incoming begins), scroll-restoration behavior (top vs. preserved vs. anchor-target).

**Desktop behavior:** Full transition.

**Tablet behavior:** Identical to desktop.

**Mobile behavior:** Identical to desktop, typically with a shorter default duration given generally faster perceived navigation expectations on mobile and to minimize any felt delay before new content is interactive.

**Reduced-motion behavior:** Reduces to an instant or near-instant (≤150ms) cross-fade between pages, with no wipe/overlay choreography — navigation should never feel delayed or visually elaborate for a visitor who has requested reduced motion; scroll-restoration behavior (top-of-page/anchor) is preserved regardless.

---

## 4. Builder Integration Model

This section specifies how the catalogue above becomes something a non-technical user actually configures, satisfying BLD-6 ("no code/HTML/CSS/JS/GSAP surface exists") and ANI-1/ANI-2.

### 4.1 The Animation Inspector Tab

Every section and block in the builder (Section 11 of the PRD) exposes an **Animation** tab in its right-panel inspector (Section 11.1) with this fixed structure, regardless of which primitive is selected:

1. **Primitive picker** — a visual, categorized list (grouped as Reveal / Text / Media / Scroll-Driven / Loop / Chrome, mirroring the families in this document) with a "None" option always first and always available (ANI-2).
2. **Live preview toggle** — replays the selected primitive on demand within the canvas without requiring a full page scroll/reload, so a user can iterate quickly.
3. **Parameter controls** — only the bounded, named controls defined in that primitive's "Configurable properties," rendered as sliders/segmented-controls/dropdowns — never free-text numeric or code fields (ANI-1).
4. **Responsive override toggle** — per Section 17 of the PRD (RES-3), any parameter can be pinned to "same as Desktop" (default) or given an explicit Tablet/Mobile override; primitives whose spec above defines a fixed non-negotiable breakpoint behavior (e.g., Parallax defaulting off on Mobile) surface that as a pre-set, still-overridable default rather than a hidden rule.
5. **Reduced-motion preview** — a one-click toggle (ANI-5) that re-renders the live preview as it will appear under reduced motion, so the person configuring the animation can see its fallback without needing OS-level settings access.

### 4.2 Inheritance and Override Resolution

For any given element at render time, the effective animation configuration resolves in this order (each step only overriding fields the prior step left unset):

```
1. Primitive's own specified defaults (this document)
2. Active Animation Profile's family-level defaults (Section 2)
3. Section/Block-level explicit primitive assignment + parameter overrides
4. Breakpoint-specific override (Tablet/Mobile), if present
5. Reduced-motion policy (Section 13.4) — applied last, and always wins
```

This resolution order is what allows ANI-3's acceptance criterion (swapping the Animation Profile changes site-wide feel while explicit per-section overrides persist) and ANI-6 (the whole resolved configuration is captured as part of the versioned website configuration, Section 36 of the PRD, so Draft/Published/Rollback apply to animation exactly as they do to content and theme).

### 4.3 Validation and Guardrails the Builder Must Enforce

- Duration, delay, and intensity fields are always range-bounded per primitive (never arbitrary numeric entry), satisfying ANI-1 structurally rather than through user discipline.
- Continuous/scroll-coupled primitives (Parallax, Horizontal Scroll, Sticky Storytelling, Pinned Sections) applied to more than a platform-defined threshold of sections on one page trigger a non-blocking performance warning in the builder (supporting PERF-5 in the PRD), since stacking many pinned/scroll-hijacked sections compounds jank risk.
- Word Reveal and Character Reveal carry the content-length guardrails specified in Sections 12-13 above.
- Every primitive's reduced-motion behavior specified above is the **platform-enforced floor**: a user can choose a gentler reduced-motion fallback than specified, but cannot disable reduced-motion handling entirely, satisfying ANI-4/ACC-4 as non-negotiable rather than opt-in.

---

## 5. Cross-Reference Summary

| Primitive           | Family                         | Continuous?        | Default off on Mobile?                            | PRD Preset Category (Section 16) |
| ------------------- | ------------------------------ | ------------------ | ------------------------------------------------- | -------------------------------- |
| Fade                | One-time                       | No                 | No                                                | Reveal                           |
| Fade Up             | One-time                       | No                 | No                                                | Reveal                           |
| Fade Down           | One-time                       | No                 | No                                                | Reveal                           |
| Slide               | One-time                       | No                 | No (re-flows to vertical-equivalent when stacked) | Reveal                           |
| Scale               | One-time                       | No                 | No                                                | Reveal                           |
| Image Zoom          | Hover / One-time               | Hover variant only | Hover variant disabled (no hover on touch)        | Hover/interaction, Reveal        |
| Image Reveal        | One-time                       | No                 | No                                                | Reveal                           |
| Clip-Path Reveal    | One-time or continuous (scrub) | Only in scrub mode | No (shorter range on mobile)                      | Reveal                           |
| Text Reveal         | One-time                       | No                 | No                                                | Reveal                           |
| Word Reveal         | One-time                       | No                 | No                                                | Reveal                           |
| Character Reveal    | One-time                       | No                 | No                                                | Reveal                           |
| Parallax            | Continuous                     | Yes                | Yes                                               | Parallax                         |
| Horizontal Scroll   | Continuous                     | Yes                | Yes (fallback layout)                             | Scroll-driven                    |
| Sticky Storytelling | Continuous                     | Yes                | Yes (fallback layout)                             | Scroll-driven                    |
| Pinned Sections     | Continuous                     | Yes                | Yes (unpinned flow)                               | Scroll-driven                    |
| Carousel            | Interaction-driven             | Only if autoplay   | No (autoplay disabled only under reduced-motion)  | Transitions                      |
| Marquee             | Continuous                     | Yes                | No (cheap; opt-out available)                     | Transitions                      |
| Counter             | One-time / data-driven         | No                 | No                                                | Reveal                           |
| Menu Reveal         | Interaction-driven             | No                 | No (this _is_ the mobile pattern)                 | Transitions                      |
| Page Transition     | Navigation-driven              | No                 | No (shorter duration default)                     | Transitions                      |

---

## 6. What This Document Deliberately Does Not Specify

Consistent with `docs/01-product-requirements.md` Principle 5 and this document's stated scope:

- No animation engine, library, or API is chosen or referenced as an implementation requirement here (GSAP/ScrollTrigger/Lenis are the PRD's stated frontend direction, Section 28, but this catalogue is expressed engine-agnostically so it could in principle be implemented against any capable animation runtime).
- No exact numeric default values (specific millisecond durations, pixel offsets, percentage intensities) are fixed — those belong to the Animation Profile presets ("Cinematic," "Subtle," "Minimal") to be defined during visual design, not to this structural document.
- No code, timeline syntax, or configuration schema (JSON shape, field names) is specified — this document defines the _conceptual_ record each primitive needs, leaving concrete schema design to implementation planning.
