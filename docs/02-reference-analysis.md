# Reference Website Analysis

## Frontend Architecture Teardown — era-residence.com

**Purpose:** This document is a frontend-architect-level teardown of the reference site (era-residence.com), produced by inspecting the downloaded static HTML (Webflow-generated markup, `data-*` behavior hooks, and embedded CSS custom properties/media queries) for the homepage, the apartments listing page, a residence detail page, and the contact page. It is a **pattern catalogue**, not a spec to imitate. Every observation is written as a generalizable interaction/architecture pattern our platform's builder and renderer should be able to _express as configuration_ — never as a description to be pixel-matched or code-copied.

No source code, class names, copy, imagery, or brand assets from the reference site are reproduced here beyond what is necessary to name the pattern. Marketing copy is paraphrased, never quoted at length.

**Confirmed technical signals** (from script includes and CSS custom properties in the markup, informing the "why" behind several observations below): GSAP 3 + ScrollTrigger + SplitText + CustomEase for animation; Lenis for smooth/virtual scrolling; Barba.js for page-transition orchestration; Lottie for a vector animation; a token-driven design system expressed as CSS custom properties (`--_colors---base-{0..1000}--*`, `--_units---u-{4..272}`, `--_special-units---scale-ratio`); exactly **one** real responsive breakpoint (992px) plus a touch/coarse-pointer media-query exception — not three.

---

## 1. Page Structure

**CONTENT**
A small, focused page set: Home (a long-scroll flagship page compositing nearly every content category), Apartments listing (filterable/sortable grid), Apartment detail (one page per unit, ~25 total), Contact. No blog, no separate Amenities/Location/Timeline pages — those live as sections _within_ the homepage rather than as standalone routes.

**LAYOUT**
Every page shares one outer shell: a fixed/persistent header+nav, a `<main>` transition container holding the page-specific section stack, and a shared footer. Pages are built from vertically stacked, full-viewport-ish `<section>` blocks, each independently tagged with a background-tone attribute (light/color/dark) and a theme class that recolors nav/text contrast as it scrolls into view.

**ANIMATION**
None at the page-structure level itself — structure is the substrate that per-section animation attaches to.

**INTERACTION**
Internal navigation is anchor-link driven on the homepage (nav items scroll/jump to `#hero`, sections) and route-driven between Home/Apartments/Detail/Contact.

**RESPONSIVE BEHAVIOR**
Section order and inventory do not change between breakpoints; only intra-section layout, spacing, and a small number of visibility toggles change (see Section 28-29).

**Generalizable lesson:** a small number of page _types_, each a reusable template driven by structured content, plus one long-form composited home page, covers the whole product story. This validates keeping the MVP page list short (Section 10 of the PRD) rather than growing many shallow pages.

---

## 2. Navigation

**CONTENT**
Logo (also a "back to top" link), a small link set (Select an Apartment, Book a call, Contact), and on the homepage a "Menu" trigger. A secondary persistent element sits with the nav: a numeric scroll-progress readout and a "Scroll" affordance.

**LAYOUT**
Logo top-left, primary links top-right on desktop; on mobile the link set collapses behind a single "Menu" trigger. The scroll-progress indicator is a thin bar with a moving "thumb" and a two-digit counter, positioned as part of the same fixed header cluster.

**ANIMATION**
Nav elements fade/slide in on load with the rest of the hero (not before it). The scroll-progress fill animates continuously with scroll position, not on a timer. Link labels use a two-line "slide" hover treatment (see Section 17).

**INTERACTION**
The "Book a call" link opens a modal (site-wide, reachable from many places, not just nav) rather than navigating away. "Menu" toggles a full-screen overlay (Section 18). The logo doubles as a "scroll to top" affordance.

**RESPONSIVE BEHAVIOR**
Below the single breakpoint, the desktop inline link list is replaced entirely by the hamburger-triggered overlay menu; nothing is simply hidden without a mobile equivalent — every desktop nav action remains reachable through the mobile menu.

**Generalizable lesson:** navigation is deliberately minimal (3-4 links) because the real navigational surface is the long homepage scroll itself; a heavy mega-menu would undercut the cinematic pacing. Our builder's "Navigation" theme controls (Section 15 of the PRD) should support this minimal, CTA-forward pattern as a first-class preset, not just a generic link list.

---

## 3. Hero

**CONTENT**
Primary wordmark/heading, a place-name subheading, a single sentence of positioning copy that is _split around an inline day/night toggle_ (the toggle's two labels sit mid-sentence, grammatically part of the headline), a full-bleed background image with two variants (day/night), 2-3 interactive "hotspot" annotations layered on the image, and one circular primary CTA.

**LAYOUT**
Full-viewport section, centered headline stack, background image filling the section behind the text with top/bottom gradient overlays for legibility, CTA anchored toward the bottom.

**ANIMATION**
Headline and subheading reveal in on page load/entry (not scroll-triggered, since they're above the fold at load). Hotspot markers carry a continuous, looping "pulse" (a soft expanding ring) to draw the eye without requiring interaction. Switching the day/night toggle cross-fades the background image and swaps a "theme" layer that recolors surrounding chrome to match.

**INTERACTION**
The day/night toggle is a tab control embedded inside the headline sentence — clicking either label swaps the hero image and re-themes the section instantly. Hovering/tapping a hotspot opens a small floating annotation card (a short claim + supporting sentence) positioned near that hotspot. The CTA uses a "magnetic" hover effect: its label visually pulls toward the cursor within a small radius before springing back on mouse-leave.

**RESPONSIVE BEHAVIOR**
Hotspot markers and the magnetic CTA behavior are desktop-only (hover-dependent); on mobile the hotspots likely remain tappable to open the same annotation card, but without the magnetic/hover embellishment. Vertical spacing collapses substantially on mobile to keep the headline and CTA both visible without excessive scroll.

**Generalizable lesson:** a hero is not just an image+headline; this one encodes a micro-interaction (day/night) as _part of the copy_ and layers discoverable annotation hotspots on the background image. Our Animation/Hero section type (Section 16 of the PRD) should support "hotspot annotation" as a configurable block, and "image variant toggle" (e.g., day/night, seasonal) as a bindable content pattern, not just a single static hero image field.

---

## 4. Typography

**CONTENT** _(structural role, not literal type choices)_
A clear role-based type scale is in use: a large display heading role (site title / big section headlines), a mid heading tier used for section titles and card headings, a body-copy tier, a small "label" tier used pervasively for nav items, data labels, and captions, and an accent/script-like tier used for short evocative words (e.g., a place name under a big headline).

**LAYOUT**
Headings are frequently centered within a constrained column narrower than the full grid, even inside a full-width section — text measure is deliberately kept short for readability and cinematic pacing, rather than spanning the full viewport width.

**ANIMATION**
Headings and the accent tier reveal via a scroll- or load-triggered progressive reveal (see Section 14, "Text Reveal") rather than appearing instantly; body copy reveals as a block rather than word-by-word.

**INTERACTION**
Interactive text (links, nav items, tab labels) carries a two-layer "slide" hover state (Section 17), distinguishing it visually from static headings/body copy even before any color change.

**RESPONSIVE BEHAVIOR**
Type sizes step down fluidly between breakpoints via a scale-ratio variable rather than jumping between hand-tuned fixed sizes per breakpoint; a small number of elements switch between a "desktop" and "mobile" heading tag/size pairing outright (e.g., swapping which heading role is used, not just resizing).

**Generalizable lesson:** confirms the PRD's Section 15 design-token requirement for a role-based type scale (H1-H6, label, caption, accent) with fluid, ratio-driven step scaling as the default, plus the ability to override the tier used per breakpoint for specific headings (RES-3 in the PRD).

---

## 5. Colors

**CONTENT** _(structural role, not literal palette)_
A small set of background "tones" is used as a repeating rhythm down the page: a neutral/light tone, a brand-color tone, and a dark tone — sections are explicitly tagged with which tone they use, and text/nav contrast is tagged separately ("on-color", "on-brand", "on-dark", "on-light") so the same components can sit correctly on any background.

**LAYOUT**
Background tone changes are used as a pacing device — they mark section boundaries and give the long homepage scroll visual rhythm/breathing room, roughly alternating rather than clustering many same-tone sections together.

**ANIMATION**
As the user scrolls past a tone boundary, the fixed header/nav's contrast mode updates to match the section currently under it (light nav on dark sections, dark nav on light sections), implying a scroll-position-driven theme switch on the persistent chrome, not just on in-flow content.

**INTERACTION**
No direct color-picking interaction on the public site; color exists purely as a designed system.

**RESPONSIVE BEHAVIOR**
Tone/contrast pairing rules are unaffected by breakpoint — the same "on-X" contrast logic applies at every screen size.

**Generalizable lesson:** validates the PRD's Section 15 color-token model (background + "on-background" text variants) and additionally suggests a concrete builder feature not yet explicit in the PRD: the persistent header/nav should be able to **auto-contrast** against whatever section tone is currently in view, driven by each section's assigned tone — worth adding as an explicit Design System / Navigation requirement.

---

## 6. Grid

**CONTENT** _(structural role)_
A single responsive column grid underlies every section, with named column-span variants (e.g., a narrower centered measure, a wider multi-column split) selected per content block rather than one fixed grid used everywhere.

**LAYOUT**
Full-bleed elements (backgrounds, images) sit outside the grid/container; text and structured content sit inside a centered, max-width container using the grid's column variants for split layouts (e.g., a two-column "image left / text right" residence highlight).

**ANIMATION**
Not directly animated; the grid is a static layout substrate.

**INTERACTION**
None directly; the grid is invisible structure.

**RESPONSIVE BEHAVIOR**
Multi-column variants (e.g., a 4- or 5-column split) collapse to a single stacked column below the breakpoint; a couple of column-span choices differ explicitly between mobile and desktop rather than purely reflowing.

**Generalizable lesson:** confirms Section 11/17 of the PRD — the builder's section/block system should offer a constrained set of named column-span/layout variants per section (not freeform arbitrary column counts), each with a defined, designer-authored mobile collapse behavior.

---

## 7. Spacing

**CONTENT** _(structural role)_
Vertical rhythm is built from a small set of reusable spacer units rather than ad hoc margins — the same handful of spacer sizes recur constantly between headings, paragraphs, and section blocks.

**LAYOUT**
Spacer sizing is context-aware: several spacing choices are explicitly doubled or given a much larger value specifically in the mobile layout versus desktop for the same visual position (e.g., extra breathing room above a heading that stacks differently on mobile), rather than one spacing value serving both.

**ANIMATION**
Not directly animated.

**INTERACTION**
None.

**RESPONSIVE BEHAVIOR**
The spacing scale itself is shared across breakpoints, but individual spacer _choices_ at specific positions are frequently breakpoint-specific — this is one of the most commonly overridden properties between desktop and mobile in the whole site.

**Generalizable lesson:** directly validates the PRD's RES-3/RES-5 requirement that spacing be breakpoint-overridable at specific instances even though the underlying scale (Section 15's spacing tokens) is global — spacing is not "automatically responsive" everywhere in practice, and the builder should make per-instance mobile spacing overrides easy, not exceptional.

---

## 8. Image Usage

**CONTENT**
Two distinct image "modes" are used deliberately: lifestyle/architectural photography (ambient scenes, terraces, interiors) for storytelling sections, and flat schematic/technical diagrams (unit floor-plate illustrations, a block-position diagram with a compass) for the residence listing and detail pages. A recurring numbered "camera angle" naming convention suggests a planned shoot supplying a consistent image set across sections.

**LAYOUT**
Photography is typically full-bleed/cropped to fill its container; schematic unit imagery is deliberately _not_ cropped (rendered at natural aspect ratio, "contain" style) so floor-plate proportions stay accurate.

**ANIMATION**
Images reveal in via scroll-triggered "slide" or masked reveals (Section 15) rather than popping in; several images carry independent parallax drift (Section 13) distinct from the reveal-in animation.

**INTERACTION**
Gallery and unit images open a full-screen lightbox with pagination on click/tap; schematic unit images have a small hover-revealed "expand" affordance signaling the lightbox is available.

**RESPONSIVE BEHAVIOR**
All images ship with multiple resolution variants and a modern-format fallback chain, selected by viewport via `sizes`/`srcset` rather than one fixed asset serving every device — this is applied uniformly, with no exceptions observed even for decorative imagery.

**Generalizable lesson:** confirms MED-3 (responsive/format variants) in the PRD, and adds a concrete content-model nuance: the Residence/Floor Plan entity (Section 13 of the PRD) should distinguish **"schematic/technical" media** (uncropped, contain-fit, diagram-like) from **"lifestyle" media** (croppable, fill-style) as a media _usage mode_, since the reference site visibly treats them with different fit/crop rules.

---

## 9. Video Usage

**CONTENT**
Two video use-cases: ambient, muted, looping decorative footage (small looping close-ups used as recurring visual accents scattered through several sections) and — by inference from the tech stack rather than direct observation — potential larger ambient background video use elsewhere in the same family of sections.

**LAYOUT**
Decorative looping video is small and positioned as an accent element near text or image content, not full-viewport; it is explicitly paired with a poster image for the pre-play frame.

**ANIMATION**
The clip loops continuously and silently; some instances carry their own parallax offset (drifting slightly on scroll) in addition to looping playback, and are explicitly play/paused based on viewport visibility rather than always running.

**INTERACTION**
No visible transport controls (muted, autoplay-in-view, loop) — it behaves as a living decorative element, not user-operated media.

**RESPONSIVE BEHAVIOR**
The visibility-based play/pause behavior (`data-video-playpause`-style gating) implies video is not decoded/played at all when its containing section is off-screen — an explicit performance guard, presumably applied consistently at every breakpoint including mobile data constraints.

**Generalizable lesson:** validates MED-5/MED-6 (poster images, play/pause-on-visibility) in the PRD, and suggests adding an explicit "ambient/decorative video" mode to the Media/Animation system — muted, looped, no controls, visibility-gated playback — as a distinct, lower-ceremony preset from a full "hero background video" block.

---

## 10. Gallery Behavior

**CONTENT**
Two gallery patterns recur: a numbered-pagination **carousel** (used for benefits, residence-type overview, interior highlights) showing one slide at a time with prev/next and a progress indicator; and a **grid-into-lightbox** pattern (used for the residence detail media set) where thumbnails open a full-screen viewer with its own pagination.

**LAYOUT**
Carousels show a single large slide (image + heading + description) with a compact numbered pager below; the lightbox-style gallery shows a primary image plus a horizontally arranged set of secondary images (photos, schematic plan) beside/below it.

**ANIMATION**
Carousel slide changes cross-fade/slide the image and independently re-trigger a text reveal on the incoming slide's heading/description (they do not just cut instantly — incoming text re-enters as if freshly scrolled to). A thin progress-fill bar animates between the current and next pager position.

**INTERACTION**
Carousels: click prev/next arrows (which nudge slightly toward the pointer on hover) or the numbered pager. Lightbox: click any thumbnail to open, with its own internal prev/next/pagination, independent of the underlying page scroll.

**RESPONSIVE BEHAVIOR**
On mobile, at least one gallery/media row switches from a laid-out grid to a horizontally swipeable strip (with a "drag to see more" hint shown only on mobile) rather than keeping the desktop grid at a smaller size.

**Generalizable lesson:** confirms the PRD's Gallery entity needs both a "carousel" and a "lightbox" presentation mode (Sections 13/16), and that carousel slide transitions should re-trigger the incoming slide's text-reveal animation rather than being purely visual — an animation-system nuance worth adding to the Reveal/Transition preset definitions (Section 16 of the PRD).

---

## 11. Horizontal Scrolling

**CONTENT**
Used specifically for the Location "concept" narrative: an intro statement, a "between two cities" positioning statement, and a stylized route/path illustration (an abstracted map-like graphic with labeled waypoints, not an embedded interactive map).

**LAYOUT**
A pinned viewport-height "screen" contains a wider inner "track" that is dragged/scrolled sideways while the outer section stays visually fixed — i.e., vertical scroll input is captured and translated into horizontal motion of the inner content while the section is in view.

**ANIMATION**
As the horizontal track advances, individual sub-blocks (headline lines, the path illustration's labels) reveal progressively rather than all at once; the whole horizontal section is also wrapped in a "slow scroll" modifier, suggesting the vertical scroll speed is deliberately dampened while inside it for a more deliberate pace.

**INTERACTION**
Primarily scroll/wheel-driven on desktop; the same content is also explicitly touch-draggable, since a "drag to see more" hint is shown specifically on mobile for this content.

**RESPONSIVE BEHAVIOR**
The pinned scroll-hijack behavior described above is a desktop pattern; on mobile the equivalent content switches to an ordinary horizontally-swipeable strip with an explicit drag affordance rather than attempting the same scroll-jacking on touch (which is fragile on mobile browsers) — a deliberate, not incidental, difference.

**Generalizable lesson:** horizontal-scroll/pin sections are powerful but should be modeled as a distinct, opt-in **section layout type** (not a generic animation) with an explicit, separate mobile fallback layout (swipeable strip) defined as part of the same section template — this should be reflected as its own entry in the Section 16 (Scroll-driven) and Section 17 (Responsive) requirements rather than assumed to "just work" responsively.

---

## 12. Sticky Sections

**CONTENT**
Applied to: the horizontal Location sequence (Section 11 above), the Amenities tab browser (image + description pinned while tab content swaps), and an Architecture section intro (headline/quote pinned briefly against a moving background).

**LAYOUT**
A section is wrapped in an outer "scroll area" and inner "screen"/"track" pairing; the outer area is taller than one viewport, and while the user scrolls through that extra height, the inner "screen" holds its position (pinned) while its content changes underneath/within it.

**ANIMATION**
While pinned, content changes are driven by scroll progress or by explicit tab clicks (Amenities) rather than by time; leaving the pinned range releases the section back into normal document flow smoothly.

**INTERACTION**
In the Amenities case, pinning is combined with a persistent tab bar (with a sliding underline indicator) so the user can also jump directly to a specific amenity instead of only scrubbing through via scroll.

**RESPONSIVE BEHAVIOR**
No CSS `position: sticky` was present in the inspected styles — pinning is implemented as a scroll-driven, JS-controlled state (consistent with a GSAP ScrollTrigger-style pin) rather than a lightweight CSS sticky element; this is a meaningfully heavier technique and one that should be applied selectively.

**Generalizable lesson:** "pin a section while its internal content advances" should be modeled as a distinct, constrained Section 16 preset ("pinned section") with a bounded set of internal-content-swap variants (image+text tab swap, horizontal track, quote-over-background) rather than an open-ended pinning primitive — this keeps it authorable without code while preserving the effect's premium feel.

---

## 13. Parallax

**CONTENT**
Applied broadly and subtly: background images drifting slower/faster than foreground text in quote and CTA sections; two-column interior sections where the left and right image columns drift in _opposite_ vertical directions as you scroll (a counter-parallax); small decorative looping video accents drifting independently of the surrounding layout; a location background image and its overlay clouds drifting at different rates from the foreground content.

**LAYOUT**
Parallax is applied to background/decorative layers, essentially never to primary readable text, preserving legibility.

**ANIMATION**
Effects range from a single background layer moving opposite to scroll direction, to more elaborate multi-layer setups (e.g., "image moves up" + "decorative accent moves down" simultaneously within the same section) for added depth.

**INTERACTION**
Purely scroll-position-driven; no direct user control.

**RESPONSIVE BEHAVIOR**
A "mobile off" flag is explicitly applied to at least one parallax-heavy pair of columns, i.e., some parallax is deliberately disabled on mobile rather than scaled down — consistent with mobile devices' typically lower scroll-jank tolerance and battery/performance constraints.

**Generalizable lesson:** confirms Section 16's Parallax preset category, and adds a concrete rule for our Animation Profile system (ANI-3/ANI-4 in the PRD): parallax intensity should support an explicit **"off on mobile"** state per assignment, not just a reduced-intensity variant, since the reference implementation treats this as a binary toggle for at least some instances.

---

## 14. Text Reveal

**CONTENT**
Applied to nearly every heading, paragraph, and label on the site as the default treatment for incoming text, at both page-load (hero) and scroll-entry (everything below the fold).

**LAYOUT**
N/A (a text-treatment, not a layout pattern).

**ANIMATION**
The embedded styles show a clip-path driven by a numeric "progress" value — i.e., text is masked and progressively "un-clipped" as a tween/scroll-progress value advances, rather than simply animating opacity. This allows line-level or block-level reveals where text appears to unmask from a hidden state rather than fade from transparent. Divider lines use the same progress-driven approach (a line "drawing" itself in).

**INTERACTION**
Purely automatic on scroll-into-view or page-load; not user-triggered.

**RESPONSIVE BEHAVIOR**
The same reveal mechanism is applied at every breakpoint; no evidence of it being disabled on mobile (unlike parallax), suggesting the platform team judged text reveal to be cheap/robust enough to keep everywhere, including touch devices.

**Generalizable lesson:** confirms ANI-1/ANI-2 in the PRD (Reveal preset family) and adds an implementation-relevant detail: a clip-path/mask-based reveal (vs. a simple opacity/transform fade) is what gives this category of site its distinctive "unveiling" quality — worth calling out explicitly as a preferred technique under the hood for the "Reveal" preset family, while still exposing it to users only as named options (e.g., "Line reveal", "Mask reveal") per Principle 5 of the PRD (no code/timeline editing).

---

## 15. Image Reveal

**CONTENT**
Applied to nearly every full-size photograph as it enters the viewport, and to the day/night hero image swap.

**LAYOUT**
N/A (a media-treatment, not a layout pattern).

**ANIMATION**
A "slide" reveal is the dominant pattern (the image appears to slide/scale into its frame as if emerging from behind a mask, frequently paired with the container clipping any overflow), distinct from the schematic unit diagrams which do not carry this treatment (they load in flat, matching their "technical drawing" role rather than "photographic" role). The hero's day/night swap is a straightforward cross-fade rather than a directional reveal.

**INTERACTION**
Automatic on scroll-entry; no user interaction required. Separately, several images are individually hoverable to reveal a small "expand" affordance (leading into the lightbox — see Section 10).

**RESPONSIVE BEHAVIOR**
Applied consistently across breakpoints; no evidence of disabling on mobile (like text reveal, and unlike parallax) — likely because it is a one-time entry animation rather than a continuous scroll-coupled effect, so its performance cost is much lower.

**Generalizable lesson:** the platform should distinguish, in its Reveal preset family, between **continuous scroll-coupled effects** (candidates for mobile-off, e.g., parallax) and **one-time entry effects** (safe to keep everywhere, e.g., text/image reveal) — this is a useful axis for the "reduced-motion" and "mobile performance" guardrails in Sections 16/17/32 of the PRD, since blanket-disabling all animation on mobile would remove low-cost, high-value effects unnecessarily.

---

## 16. Section Transitions

**CONTENT**
The transition _between_ two adjacent sections, as distinct from animation _within_ a section.

**LAYOUT**
Sections are tagged with a background "tone", and several are given a `clip`-style container so a section's background can be visually contained/clipped at its own boundary rather than bleeding into the next section.

**ANIMATION**
Tone changes between sections are handled by crossfading dedicated "theme" overlay layers positioned at the seam between two sections (rather than the whole section instantly switching color), producing a soft gradient-like handoff between a light and a dark or brand-colored section. A couple of sections use an angled/clipped section boundary (a slanted cut rather than a hard horizontal line) as a graphic transition device.

**INTERACTION**
None; purely scroll-position-driven.

**RESPONSIVE BEHAVIOR**
The angled/clipped boundary treatment is explicitly desktop-only in at least one instance, reverting to a plain rectangular boundary on mobile — consistent with keeping mobile layouts simpler and more predictable.

**Generalizable lesson:** "section-to-section tone handoff" and "angled section boundary" are both good candidates for the PRD's Section 16 "Transitions" preset category, each as an explicit, named, toggleable option on a per-section-boundary basis (not something the user has to construct from primitives), with the angled variant defaulting to a plain boundary on mobile.

---

## 17. Hover Interactions

**CONTENT**
A consistent hover vocabulary is reused across the whole site rather than being bespoke per component: (1) a two-line text "slide" — the current label slides out while a duplicate slides in from behind, used on nearly every link/nav item/button label; (2) an image "scale up slightly" zoom inside a fixed, clipped frame; (3) a card "lift" via a fading drop-shadow plus elevated stacking order; (4) an icon "scale up" (e.g., social icons); (5) a "magnetic" pull on a small number of circular CTA buttons, where the whole button subtly follows the cursor within a radius; (6) a "spotlight" list behavior where hovering one item in a group dims its siblings.

**LAYOUT**
Hover-affected elements are pre-structured with the "before/after" state already present in the markup (e.g., a duplicated label pair for the slide effect) rather than the effect being purely a CSS transform on a single element — enabling the two-layer slide illusion.

**ANIMATION**
Each hover pattern uses its own short, consistent duration/easing pair (fast for icon scale, deliberately long/soft for card-lift shadows) rather than one global hover timing — hover feedback is tuned per component type.

**INTERACTION**
All hover effects are gated to pointer-capable, wide-enough viewports (the ≥992px breakpoint) — none of them are attempted on touch, avoiding the classic "stuck hover state" problem on mobile.

**RESPONSIVE BEHAVIOR**
Below the breakpoint, hover effects are simply absent (not replaced by a tap-equivalent animation) — the interaction model on mobile relies on tap/navigation alone for these elements, which is a deliberate simplification rather than a gap.

**Generalizable lesson:** confirms Section 16's Hover/interaction preset category and strongly suggests the platform ship a **small, curated set of named hover presets** (slide-label, image-zoom, card-lift, icon-scale, magnetic-pull, spotlight-group) rather than exposing generic "on-hover" animation authoring — matching Principle 5 of the PRD — with hover presets automatically disabled below the responsive breakpoint by platform default, not a per-user setting.

---

## 18. Menu Transitions

**CONTENT**
A single "Menu" entry point that expands into a full-screen navigation overlay containing the same core links as the desktop nav (Home, Select an Apartment, Book a call, Contact) plus a small brand mark.

**LAYOUT**
The overlay covers the entire viewport in a dark tone, with a large "Menu" title at the top and a vertically stacked link list below; a dedicated "close"/backdrop-tap target sits behind the panel.

**ANIMATION**
The menu icon itself morphs between two states (an open "hamburger"-style icon and a "close" state) rather than being replaced instantly; the overlay panel and backdrop presumably animate in as a reveal/fade (consistent with the site's general reveal vocabulary) rather than snapping open.

**INTERACTION**
Opens via the header's menu trigger; closes via a dedicated close control, a backdrop tap, or by selecting any link inside it (each link is wired to close the menu on click, so navigating away always leaves the menu in a closed state on return).

**RESPONSIVE BEHAVIOR**
This overlay _is_ the mobile/narrow-viewport navigation pattern — on desktop, the same links are simply shown inline in the header instead, so the overlay menu and the inline nav are two presentations of one underlying link set, not two different menus.

**Generalizable lesson:** the builder's Navigation component (Section 11/15 of the PRD) should treat "inline desktop nav" and "full-screen mobile overlay menu" as two renderings of a single configured link list, with the overlay's open/close transition and icon-morph as a bundled, non-optional part of the Navigation theme rather than something assembled from separate pieces.

---

## 19. Page Transitions

**CONTENT**
Transition behavior when navigating between Home, Apartments, a residence detail page, and Contact.

**LAYOUT**
Each page's main content is wrapped in a dedicated transition container tagged with a page "namespace" — a structural signal (consistent with a page-transition library) that lets an animation layer distinguish which page is leaving and which is entering.

**ANIMATION**
Not directly visible in static markup, but the presence of a dedicated page-transition library alongside per-page namespacing strongly implies a choreographed outgoing/incoming transition (e.g., an overlay wipe or the preloader reappearing briefly) rather than a hard browser navigation cut.

**INTERACTION**
Triggered by any internal link click; presumably intercepts navigation to play the transition before/while swapping page content, rather than a full hard reload.

**RESPONSIVE BEHAVIOR**
No evidence this differs by breakpoint; page transitions are a document-level concern, not a layout one.

**Generalizable lesson:** confirms Section 16's "page transition" preset and Section 12/28's renderer requirement in the PRD: our Next.js renderer should support a lightweight, configurable route-transition layer (e.g., a brief branded overlay) as a first-class, toggleable feature of the Animation Profile — distinct from, but coordinated with, the Loading Experience (Section 20) so the two don't visually compete.

---

## 20. Loading Experience

**CONTENT**
A branded preloader: the site's wordmark and place-name lockup, a short tagline, and a thin progress indicator — i.e., the loading screen doubles as a first micro-dose of brand storytelling rather than a generic spinner.

**LAYOUT**
Full-viewport overlay, centered brand lockup, progress element below it, with a large decorative background graphic (an architectural line-art motif) behind the text.

**ANIMATION**
A progress bar fills (via a track + fill pairing) as assets load; the whole overlay presumably fades/wipes away once loading completes, revealing the hero already in place underneath (there are two nested preloader layers — an outer "master" one and an inner per-page one — suggesting the outer persists briefly across page transitions while the inner is page-specific).

**INTERACTION**
None; it is a passive, automatic sequence gating first paint of interactive content.

**RESPONSIVE BEHAVIOR**
No breakpoint-specific differences observed; the same branded loader is used at every screen size, appropriately since the pattern is lightweight (text + a bar), not media-heavy.

**Generalizable lesson:** a branded, progress-driven preloader (vs. a generic spinner) reinforces the "cinematic" positioning from the very first moment; this supports adding an explicit, optional "Branded Loading Screen" as a configurable, content-bound element (logo, tagline, progress style) in the Publishing/Rendering requirements (Sections 12/23 of the PRD) rather than treating first-load purely as a performance concern with no brand surface.

---

## 21. Location Section

**CONTENT**
A multi-part narrative: a short concept statement, a "between two places" positioning line, a stylized route/path graphic connecting the property to nearby reference points, a master-plan/site image, and a closing address/region label block. Distances/points-of-interest are implied by the "path with labels" graphic rather than a data table.

**LAYOUT**
Combines the horizontal pinned-scroll pattern (Section 11) for the concept/positioning portion with a subsequent full-width parallax section for the master-plan image and address label — i.e., "Location" is not one layout, but a sequence of two different section types back-to-back.

**ANIMATION**
Heavy use of text reveal, counter-parallax on flanking decorative video accents, and progressive reveal of the path graphic's labels as that portion scrolls by.

**INTERACTION**
A circular CTA ("view available apartments") is embedded partway through, letting a persuaded visitor jump straight to inventory without finishing the section; the master-plan image reuses the same "hotspot pin" component seen in the hero (present in markup even where no pins are currently populated), implying pins-on-plan is a reusable, general capability rather than hero-specific.

**RESPONSIVE BEHAVIOR**
The master-plan/path imagery becomes horizontally drag-scrollable on mobile with an explicit "drag to see more" hint, rather than shrinking a wide graphic to fit — preserving legibility of a wide illustrative graphic instead of scaling it down illegibly.

**Generalizable lesson:** the Location content entity (Section 13 of the PRD) should support an ordered points-of-interest list rendered either as a data list _or_ as labels on a stylized path/map graphic, and the same "hotspot pin" component used in the Hero should be reusable on a Location master-plan/site image — the PRD's Gallery/Location sections should note this component reuse explicitly so the builder implements one configurable "hotspot" block rather than several bespoke ones.

---

## 22. Architecture Section

**CONTENT**
A short section-defining headline, a single pull-quote attributed to the architecture/design team, and a supporting full-bleed image — deliberately brief and quote-led rather than data-heavy (specs and materials appear in other sections instead).

**LAYOUT**
A pinned intro (headline + quote) sits over/against a full-bleed parallax background image, flanked by small decorative looping video accents; the headline uses an auto-fit-to-width technique so it always spans consistently regardless of exact copy length.

**ANIMATION**
Standard text reveal on headline/quote, background parallax, and the section's own light/brand tone crossfade at its boundaries (Section 16).

**INTERACTION**
A circular "Book a call" CTA is embedded directly in this section (desktop only) — positioning a conversion point right after an emotionally-led architecture story, rather than only at the page's final CTA.

**RESPONSIVE BEHAVIOR**
The pinned/parallax treatment and the in-section CTA are explicitly desktop-only; mobile presumably receives the same content in normal scroll flow without the pin.

**Generalizable lesson:** validates treating "Architecture" as a lightweight, quote-led content pattern (headline + attributed quote + hero image) rather than a heavy spec sheet — the Project Information entity (Section 13 of the PRD) should keep a dedicated short-form "design philosophy quote" field distinct from the longer structured specs table, since the reference site visibly separates these into different sections with different tones.

---

## 23. Residence Section

**CONTENT**
Present at three levels of detail: (1) a homepage-level "browse by unit type" carousel (bedrooms, area range, one description line, a CTA into the filtered listing) per residence type; (2) a full listing page with schematic card imagery, unit number/block/floor, bedroom count, area, extra outdoor area, and completion date; (3) a full detail page per unit (Section 24 below expands this).

**LAYOUT**
The homepage carousel is a full-slide-per-type layout (title, image, data, description) with numbered pagination; the listing page is a responsive card grid; the detail page is a two-column split (persistent info column + media column).

**ANIMATION**
Carousel slide changes re-trigger text/image reveal on the incoming slide (Section 10); listing cards reveal in as a group on scroll entry; the detail page's primary and gallery images each carry their own entry reveal.

**INTERACTION**
Listing cards lift with a soft shadow and elevate above siblings on hover (desktop); the detail page's info column scrolls independently of its media column via its own internal scroll region, letting a visitor keep scrolling technical info without losing the media in view (and vice versa).

**RESPONSIVE BEHAVIOR**
The detail page's two-column split (info column + media column) restacks on mobile with **media promoted above** the info column and made horizontally swipeable — a deliberate re-ordering, not just a stacked collapse of the desktop order.

**Generalizable lesson:** the Residence entity (Section 13 of the PRD) is validated in full — bedrooms, area, additional outdoor area, block/floor, completion/status, and a type grouping are all first-class fields in the reference site. The **independently-scrolling info-vs-media split** on the detail page, and the **mobile reordering** (media before info), are concrete, reusable Residence Detail template behaviors worth naming explicitly in Section 11 of the PRD's builder requirements.

---

## 24. Amenities

**CONTENT**
A fixed set of named amenities (e.g., a gated-community concept, pool/wellness facilities, parking, spa/gym, landscaping), each with a short title and one descriptive sentence plus a supporting photo — presented as a browsable set rather than a checklist.

**LAYOUT**
A pinned, viewport-height section where one amenity's image+description is shown at a time, with a persistent tab bar of all amenity names anchored at the bottom carrying a sliding underline indicator that tracks the active tab.

**ANIMATION**
Switching tabs cross-fades/reveals the new amenity's image and text; the underline indicator animates (slides/resizes) to sit under the newly active tab label; the section's background image carries its own subtle parallax drift independent of the tab-switch.

**INTERACTION**
Selectable via the tab bar directly, or by scrolling through the pinned range (both are wired to the same underlying state); a circular "Book a call" CTA is anchored in this section on desktop.

**RESPONSIVE BEHAVIOR**
The pin/tab-bar-with-underline pattern is presumably retained on mobile in a simplified form (this is a click/tap-driven component, not a hover-dependent one, so it degrades more gracefully than hover-only patterns) — the desktop-only elements here are the pin itself and the anchored CTA rather than the tab interaction.

**Generalizable lesson:** the Amenity entity (Section 13 of the PRD) is validated (name + description + image, no need for a separate icon field to be mandatory). The "pinned single-item-at-a-time browser with a tracking tab-underline" is a distinct, reusable Section 16/11 pattern worth naming explicitly (e.g., a "Tabbed Feature Browser" section type) since it recurs conceptually wherever a small named set of things (amenities, benefits, unit types) needs sequential, story-led presentation.

---

## 25. Construction / Roadmap

**CONTENT**
Presented as a compact accordion rather than a visual timeline graphic: a small number of expandable rows (developer identity, sales & marketing partner, licensing/permit status, current construction-year status), each collapsed to a title with a "+" icon and expanding to reveal one paragraph of detail. One row explicitly mentions that construction progress can be followed via an external live stream — a link-out pattern rather than embedded live video.

**LAYOUT**
A simple vertical list of accordion rows with a divider line under each expanded row's content, inside an otherwise plain section (no pinning/parallax here — a deliberately calmer, information-first section after several highly cinematic ones).

**ANIMATION**
Row titles reveal on scroll-entry like other headings; expanding a row is a straightforward height/opacity reveal of its content with the "+" icon presumably rotating to an "×"/"-" state (a plus-to-cross icon toggle is present in the markup).

**INTERACTION**
Click/tap a row's title to expand or collapse it; presumably only one (or any number of) rows can be open at a time — the markup does not indicate an exclusive-accordion constraint, so this is a builder decision rather than a fixed pattern.

**RESPONSIVE BEHAVIOR**
No breakpoint-specific structural differences observed; an accordion collapses naturally to any width without special-casing, which is likely why this section — unlike most others — carries no visible mobile-specific overrides.

**Generalizable lesson:** this is a meaningfully different, calmer pattern from the rest of the page and validates two things for the PRD: (1) the Timeline/Project Information entities (Section 13) should support an **accordion/FAQ-style presentation** as an alternative to a graphical milestone timeline, since real construction-status communication is often more textual/legal (permits, licensing, phase status) than visual; (2) an optional **external live-stream link** field is a valuable, low-effort addition to the Project Information entity for active-construction projects.

---

## 26. Contact

**CONTENT**
Multiple contact channels presented as distinct, labeled blocks rather than one generic form: an email link, sales-office and general-location addresses (each linking out to Google Maps), a phone number, a WhatsApp link, and social profile links — plus, separately, a "Book a call" CTA that opens the site-wide enquiry-form modal. A stylized illustrated map graphic (not an embedded interactive map) carries a single labeled pin showing the sales office and its opening hours.

**LAYOUT**
A centered header ("Contact us") above a row of labeled contact-method blocks, a social-icon row with separators, then a full-width illustrated map graphic with one pin overlay, and a circular CTA — followed by the same closing CTA + footer used elsewhere.

**ANIMATION**
Standard text reveal on each labeled block as it scrolls in; the map graphic carries a parallax drift; the pin likely shares the pulsing-marker treatment used elsewhere (hero, location).

**INTERACTION**
Each contact method is a direct-action link (`mailto:`, `tel:`, maps deep-link, WhatsApp deep-link) rather than requiring the visitor to copy text manually; the actual lead-capture form lives in the shared modal (Section 21 of the PRD's Contact/Lead requirements — name, email, phone, message, plus hidden honeypot and UTM-tracking fields observed in that modal's markup).

**RESPONSIVE BEHAVIOR**
The multi-column contact-method row collapses to a stacked single column on mobile; no other structural changes observed.

**Generalizable lesson:** confirms the Contact Information entity (Section 13 of the PRD) needs distinct sub-fields for email, phone, WhatsApp/messaging, and one-or-more physical locations (each independently map-linkable), not a single freeform "contact details" blob — and that the actual enquiry form and the "contact info display" are two separate, reusable pieces (a sitewide modal vs. a page section), matching the PRD's separation of the Lead-capture form (Section 21) from the Contact Information content entity (Section 13).

---

## 27. Footer

**CONTENT**
A "back to top" affordance, a phone number, a sales-office address, a legal-links row (privacy policy, terms of use — both linking to downloadable documents), a copyright line with an auto-updating year, and an agency-credit line.

**LAYOUT**
A dark-toned closing section stacked directly below the final CTA block; content organized into a small number of labeled columns/blocks rather than a dense multi-column sitemap-style footer.

**ANIMATION**
Consistent with the rest of the site's reveal vocabulary for its headings/labels; nothing footer-specific beyond that.

**INTERACTION**
"Back to top" scrolls (presumably smoothly, given the sitewide smooth-scroll library) to the very top of the page; legal links open external PDF documents; the credit line links to the building agency's own site.

**RESPONSIVE BEHAVIOR**
Column blocks stack vertically on mobile; no other special-casing observed.

**Generalizable lesson:** the footer is deliberately minimal (no sitemap, no newsletter signup, no secondary nav) — validates keeping the platform's default Footer section lightweight and content-bound to the Contact Information entity plus a small legal-links list and copyright, rather than defaulting to a large multi-column footer template.

---

## 28. Mobile Behavior

**CONTENT**
No content is removed on mobile relative to desktop; the same sections and copy appear, just re-laid-out.

**LAYOUT**
Extensive use of paired "desktop-only" / "mobile-only" blocks throughout the markup (rather than one block with responsive CSS alone) — several components are structurally different, not just restyled, between the two states (e.g., the residence detail page's media-before-info reordering in Section 23; the hotspot/diagram block moving position within the header area on mobile).

**ANIMATION**
Continuous, scroll-coupled effects (parallax, pinned/scroll-hijacked sections) are selectively disabled on mobile (Sections 11-13); one-time entry effects (text reveal, image reveal) are kept. Hover-dependent effects (Section 17) are absent by construction (they are gated to pointer/width media conditions, so touch devices never trigger them, hover or otherwise).

**INTERACTION**
Horizontal drag/swipe replaces several desktop scroll- or hover-driven interactions (media rows, the location path/master-plan graphic) with an explicit "drag to see more" hint shown only in the mobile layout. A dedicated media query further detects landscape-oriented, coarse-pointer (touch) devices specifically — i.e., the site distinguishes "small screen" from "touch input" as separate conditions in at least one place, not just one combined breakpoint.

**RESPONSIVE BEHAVIOR**
_(this topic **is** the responsive-behavior analysis; see above.)_

**Generalizable lesson:** mobile is treated as a genuine second design pass for specific components (not a pure reflow of the desktop layout), while the underlying content and section inventory stay identical. The PRD's RES-3 (breakpoint content/structure overrides) is well-justified; the builder should make "swap to a touch-drag strip" and "reorder media above info" first-class, named responsive overrides for Gallery- and Residence-Detail-type sections specifically, since both recur here.

---

## 29. Tablet Behavior

**CONTENT**
No content differences from mobile were observed — the site does not appear to treat tablet as a distinct content tier.

**LAYOUT**
Critically, **the reference site has only one real breakpoint** (992px) plus a touch/coarse-pointer-specific exception — there is no dedicated "tablet" layout tier. A tablet in portrait orientation (typically narrower than 992px) receives the same layout as a phone; a tablet in landscape orientation (typically wider than 992px) receives the same layout as desktop, hover effects and all, despite being a touch device.

**ANIMATION**
Follows directly from the layout bucket a given tablet falls into — a landscape tablet gets desktop-tier parallax/pin/hover treatment; a portrait tablet gets the mobile-tier (reduced) treatment.

**INTERACTION**
The one explicit touch-aware exception (the landscape + coarse-pointer media query, Section 28) suggests at least one place where the team found the naive "landscape = desktop" assumption caused a problem specifically for touch landscape devices and patched it — implying this two-bucket strategy has a known rough edge at exactly this device class.

**RESPONSIVE BEHAVIOR**
This is a deliberate simplification, not an oversight (it is consistent across the whole stylesheet) — but it does mean a landscape tablet visitor can receive hover-only affordances (magnetic buttons, hover-reveal expand icons) that they cannot actually trigger with touch, and a portrait-tablet visitor gets the phone layout on a notably larger screen than phones, potentially under-using available width.

**Generalizable lesson:** this is the clearest place where our platform should **improve on**, not copy, the reference approach. The PRD's three-tier Desktop/Tablet/Mobile builder model (Section 17) is the right call precisely because it closes this gap: it lets a designer give landscape tablets a real touch-safe layout instead of inheriting desktop hover-dependent affordances, and let portrait tablets use more of their width than a phone layout would. Any "two-bucket" (mobile-or-desktop) responsive shortcut in our own component defaults should be treated as a known trade-off, not a template to imitate.

---

## Cross-Cutting Technical Observations (For Architecture, Not Imitation)

These are stack-level inferences from script includes and CSS custom properties, useful context for our own Section 27/28 (Backend/Frontend) architecture decisions — not requirements to replicate the same libraries:

- **Design tokens as CSS custom properties**: a numeric color-scale naming convention (a 0-1000 scale per palette "lane") and a matching spacing-unit naming convention (`u-4` through `u-272`) are used consistently everywhere, confirming that a _token system_, not hand-set values, drove the whole visual language — directly validating the PRD's Design System requirement (Section 15) at the implementation-signal level, independent of our own token naming.
- **A fluid type-scale ratio variable** drives font-size stepping, rather than fixed per-breakpoint sizes — supporting the PRD's "automatically responsive" typography classification (Section 17).
- **A single real breakpoint** (992px) plus a touch-specific exception — a leaner responsive strategy than our three-tier model, called out as an explicit gap to close in Section 29, not a pattern to copy.
- **No CSS `position: sticky`** was found; pinning behavior is JS/scroll-library driven — a heavier technique than CSS sticky, reinforcing that "pinned section" should be a deliberately-chosen, named preset (Section 12 above) rather than a default.
- **Reveal animations use scroll/tween-driven clip-path masking**, not opacity alone — a specific, reusable technique worth documenting for whichever animation implementation approach is chosen for our renderer (Section 28 of the PRD), while still only exposing it to end users as a named preset.
- **All hover-dependent effects are explicitly gated to `min-width: 992px`** in the stylesheet itself, not left to `:hover` support alone — confirming hover effects should be suppressed by breakpoint/pointer type at the platform level, not merely by relying on touch devices simply never firing `:hover`.
- **A page-transition library with per-page namespacing** and **a virtual/smooth-scroll library** are both present sitewide — consistent with the PRD's chosen frontend direction (GSAP/ScrollTrigger + Lenis, Section 28), suggesting that direction is well-matched to this category of site.

## What We Should NOT Copy (Restated for This Document)

- No literal copy, imagery, logo, architect/partner names, or brand assets from era-residence.com may appear in our product, its seed content, its templates, or its marketing.
- No Webflow-specific class names, `data-*` attribute names, or literal CSS/JS from the reference site should appear in our schema, component names, or code — every pattern above must be re-designed against our own content/animation/theme model.
- The reference site's **two-bucket responsive strategy** (Section 29) and its **entirely hover-only micro-interactions on desktop** are identified gaps/trade-offs to consciously improve on, not conventions to inherit by default.
- The reference site is one bespoke, hand-built implementation of these patterns; our obligation is to generalize each pattern into reusable, non-technical, structured configuration (per Principle 11/13 of `docs/01-product-requirements.md`), never to reproduce this specific implementation.
