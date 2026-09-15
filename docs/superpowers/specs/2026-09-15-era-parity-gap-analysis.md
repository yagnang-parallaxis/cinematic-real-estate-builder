# Era Parity — Gap Analysis and Backlog

**Date:** 2026-09-15
**Scope:** visual and interaction parity between the local Aurelia clone (`apps/web` +
`packages/section-library` + `packages/ui`) and the reference language catalogued in
`docs/02-reference-analysis.md`.
**Goal:** a clone template that reads as the same design language at every breakpoint, with no
layout, contrast or motion defects.

> **Boundary.** This is a parity target against a *pattern language*, not a pixel-copy target.
> No reference copy, imagery, class names or code is reproduced. Every item below is written
> against our own tokens, sections and content model. Where the reference made a trade-off we
> consider wrong (see P2-6), we deliberately diverge.

---

## 0. How this was measured

Two scripts were added so parity can be re-checked on demand rather than by eye:

| Script | What it produces |
| --- | --- |
| `scripts/parity-capture.mjs <url> <label> [w] [h] [steps]` | A scroll filmstrip into `.screenshots/<label>/` plus `probe.json` (overflow offenders, font load state, section inventory). |
| `scripts/parity-probe.mjs <url> <label> [w] [h]` | `typeprobe.json` — every distinct rendered text role (size, leading, tracking, weight, family, instance count) sorted largest first, plus per-section heights. |
| `scripts/motion-probe.mjs <url> <label> [w] [h]` | `motion.json` — a per-frame sample from navigation until the cover has gone (cover state, scroll position, which lock mechanism is engaged), then a fine walk of the opening chapters recording each section's rect and its sticky descendants. Plus `boot-*.png` / `walk-*.png` filmstrips. |
| `scripts/cover-timeline.mjs <url> <label> <coverSelector> [w] [h]` | `cover.json` — every frame in which the cover layer or any descendant changed opacity, clip, transform or class. This is how "when does the preloader actually leave, and by what animation" becomes a number. |
| `scripts/scrub-capture.mjs <url> <label> <from> <to> <steps> [w] [h]` | `scrub.json` — walks an absolute scroll range and reports, per step, every text run that crosses a viewport edge. Also exposes scroll hijacking: a step that does not land on the requested offset was overridden by the page. |
| `scripts/dome-probe.mjs <url> <label> <from> <to> <steps> [w] [h] [--shots] [--calm] [--dome=sel]` | `dome.json` — walks a scroll range in fine strides and measures the rising arch's **silhouette** per step: its left and right edge on 28 viewport rows, the apex bisected to sub-pixel, a least-squares circle fitted to the edge points, and the curved heading's tier, arc radius, forced `textLength` and *natural* length. The silhouette is sampled rather than read off either site's markup — the reference draws its dome as an HTML box with a large `border-radius`, ours as an SVG arc path — so "what radius is this arch and where is its centre" is the same question on both. `--calm` measures the reduced-motion pose. |
| `scripts/boot-verify.mjs [url]` | Pass/fail across 390 / 834 / 1440 × (normal, reduced motion): forces wheel, `PageDown` and `End` while the cover is up, then asserts the page did not travel, that it was uncovered at the top, that the lock was released, and that scrolling works afterwards. |

Both were run against the reference and against `localhost:3000` at 1440×900 and 390×844. The
type-role dump is the highest-signal artefact: it makes "which tier is this actually rendering
at" a diff instead of an argument.

**Re-run the whole comparison:**

```bash
node scripts/parity-capture.mjs https://www.era-residence.com/ ref-desk 1440 900 12
node scripts/parity-capture.mjs http://localhost:3000/ loc-desk 1440 900 12
node scripts/parity-probe.mjs   https://www.era-residence.com/ ref-desk 1440 900
node scripts/parity-probe.mjs   http://localhost:3000/ loc-desk 1440 900
```

---

## 1. What was already close before this pass

Worth stating explicitly, because it bounds how much is left:

- **The token scale is already correct.** `packages/ui/src/typography.ts` numerators
  (192/136/96/63/40/28 desktop, 96/73/56/40/28 compact), the two scale ratios (16 / 4.16), the
  tracking and the leading per tier all land on the reference's rendered values to the decimal.
  Body (11.7px), label (9.9px, 700, 0.048em) and caption matched exactly at both widths.
- **One real breakpoint at 992px**, matching the reference's own strategy.
- **The tone system** (`[data-tone]` + `data-nav-tone` auto-contrast on fixed chrome) is a
  faithful, better-factored version of the reference's background-tone rhythm.
- **Section inventory and order** match (14 reference sections vs 15 local).
- **The reveal family** (`packages/ui/src/motion.css`) already uses clip-path masking rather
  than opacity fades, which is the reference's defining reveal texture.
- **Reduced-motion is respected throughout** — every section CSS file carries a
  `prefers-reduced-motion` block, and the pinned/scrubbed sections drop to a static composition.
- **No horizontal overflow** at 390 / 834 / 1440.

---

## 2. Fixed in this pass

| # | Gap | Fix | Files |
| --- | --- | --- | --- |
| F1 | Display face was Italiana — a light, wide, low-contrast roman. The reference language is a condensed high-contrast Didone. This was the single largest visual difference on every screen. | Display tier moved to Bodoni Moda (already in the repo as the arch face), with `font-optical-sizing: auto` so hairlines thin out at display sizes. Arch face collapsed onto the same family. | `apps/web/src/app/fonts.ts`, `apps/web/src/app/layout.tsx`, `packages/ui/src/styles.css`, `packages/ui/src/typography.ts` |
| F2 | Hero wordmark rendered at 108px desktop / 60px compact against the reference's 172.8 / 90, with leading 0.96 instead of 0.875. | Hero title, script and sentence moved onto the shared scale (`--text-display`, accent, `--text-h4`), fitted to the measure. | `packages/ui/src/styles.css`, `packages/section-library/src/hero/Hero.tsx` |
| F3 | No auto-fit. The reference sizes display headings to span their measure regardless of copy length; ours used fixed sizes, so a longer clone name would overflow. | New `useFitText` primitive plus pure `fitScale`/`quantiseScale` geometry, applied to the hero lockup and the story title. Server renders the full tier; the client only ever reduces it. | `packages/section-library/src/shared/fit-text.ts`, `.../useFitText.ts`, `.../hero/Hero.tsx`, `.../story/Storytelling.tsx` |
| F4 | Story chapter title used an off-scale `clamp(2.4rem, 7.6vw, 7.75rem)` with tracking `-0.03em`. The reference has **zero** off-scale sizes. | Snapped to `--text-display` with display tracking/leading, fitted. | `packages/ui/src/styles.css` |
| F5 | **Arch curve text clipped at both ends below ~500px** — "THREE REASONS TO RETURN" rendered as "EE REASONS TO RET". Natural text width exceeded the arc length. | Heading is now laid along a measured span of the arc (`archTextLength` + SVG `textLength` / `lengthAdjust="spacing"`). Fits any copy at any width, and the words now spread with the dome for free. The content's `curvedWordSpacing` knob became the spread multiplier. **Superseded in §2f**: forcing the length is what took the tracking negative below 992px, so the same guarantee is now met by deriving the *size* from the arc, and a forced length survives only as the fallback for copy no size on the scale can absorb. | `packages/section-library/src/arch/logic.ts`, `.../arch/ArchReveal.tsx` |
| F6 | **Fixed nav unreadable over the route section's floral spray** — dark ink on magenta petals. | Spray seated below the `--gutter-top` chrome band and reduced, so the corner motif survives without entering the rail. | `packages/ui/src/sections/concept.css` |
| F7 | Compact hero showed only sky — the narrow crop of the photograph meant the subject never entered the first viewport. | Hero runway shortened on compact (180svh → 140svh) so the building lands ~70% down the first screen, as the reference does. | `packages/ui/src/styles.css` |
| F8 | Compact hero sentence wrapped arbitrarily mid-clause. | Sentence holds the two gutters with the day/night toggle dropped to its own row. | `packages/ui/src/styles.css` |
| F9 | Story chapter stack was vertically centred, so the title floated mid-screen. The reference paces title-top / plate-centre / pager-and-copy-foot. | `justify-content: space-between` on the browser, plate flexes, media centres in the remainder. | `packages/ui/src/styles.css` |
| F10 | Primary nav item had no rule under it. | Rule on the slide frame so it holds while the two label layers travel. | `packages/ui/src/styles.css` |
| F11 | Body grotesque was a normal-width Archivo; the reference grotesque is an extended cut. | Archivo loaded with its `wdth` axis, body roles set to `wdth 108` via `--font-body-width`. | `apps/web/src/app/fonts.ts`, `packages/ui/src/styles.css` |

Verification: `pnpm typecheck` and `pnpm test` (441 tests, including 14 new) pass; `eslint` reports
no new findings; no horizontal overflow and no console errors at 390 / 834 / 1440, on `/` and
`/residences`, with and without `prefers-reduced-motion`.

---

## 2b. Fixed in the motion pass

Measured, not eyeballed: the reference's own boot was timed with `cover-timeline.mjs`, and the
opening chapters were walked with `scrub-capture.mjs` on both sites at 1440×900.

**What the reference actually does at boot.** An empty dark plate covers the page from first paint
until the document is genuinely ready — 5.09s on a cold load here, with the web fonts becoming
active at 3.37s. The plate carries no content of its own and never animates: it is simply removed.
The virtual scroller is initialised *stopped* at that same instant, so the page is held still while
the first screen plays its entry, and released afterwards. Our boot was measured against that.

| # | Gap | Fix | Files |
| --- | --- | --- | --- |
| M1 | **The page was never held still while the cover was up.** A wheel, `PageDown` or `End` travelled the document behind an opaque plate, and a restored scroll offset put the visitor mid-page before the plate had even rendered. Lifting it then dropped them into a section that had never played its entry — this was the "flash / jump into hero". Measured: 2562px of travel under the cover. | A `lockScroll` primitive that holds the *root's* overflow (`body { overflow: hidden }` alone does nothing — the propagation rule applies to the root) and swallows wheel, touch and the page keys. Scroll restoration is forced to manual and the page reset to the top. Now 0px of travel, released exactly when the plate leaves. | `packages/section-library/src/shared/scroll-lock.ts`, `.../loading/LoadingScreen.tsx` |
| M2 | **A CSS-only lock does not stop the virtual scroller.** It moves the page by script, which `overflow: hidden` permits, so it kept travelling under the cover. Commanding it from the lock does not work either: it is imported dynamically, so it frequently does not exist when the lock is taken. | The lock publishes `data-scroll-locked` on the root; `SmoothScroll` watches that attribute and stops/starts itself. Correct however the two are ordered. | `packages/section-library/src/shared/SmoothScroll.tsx`, `.../shared/scroll-lock.ts` |
| M3 | **The hold was a bare 2s timer** regardless of what had arrived, so the cover lifted while the hero photograph and the display face were still in flight — and because headings are fitted, the fit then re-ran visibly. | `shouldUncover` gates on fonts ready + hero image decode + `load`. The configured `maxDurationMs` became the *floor* (the composition still has to be readable) and `BOOT_GRACE_MS` the ceiling, so a slow connection cannot strand anyone. | `packages/section-library/src/loading/logic.ts`, `.../LoadingScreen.tsx` |
| M4 | **The progress rule was a linear fiction** animated over the hold — it arrived whether or not the page had. | `bootProgress` blends elapsed time with measured readiness, so the rule always moves and jumps forward when something real lands. Driven from `--loader-progress` rather than a keyframe. | `packages/section-library/src/loading/logic.ts`, `packages/ui/src/styles.css` |
| M5 | **The exit was an opacity dissolve.** A dissolve reveals the whole composed page at once, with the nav and hero already in their final state — the defining reason the opening read as a cut rather than a reveal. | The plate is drawn up off the page (`clip-path` collapsing upward over 900ms) with the composition travelling up and out a shade ahead of it, and the hero cued 430ms *into* the lift so the lockup's own unmask plays as the plate clears it. The two overlap instead of playing in turn. | `packages/ui/src/styles.css`, `packages/section-library/src/loading/LoadingScreen.tsx` |
| M6 | **The seeded clone's loader wordmark read "Me / Pass"** while the hero read "Aurelia Residences" — two different brands back to back across the handoff. Source content was already correct; the seeded config had drifted. | Realigned the seeded config with `apps/web/src/content/site.ts`. | `data/clones/aurelia/config.json` |
| M7 | **The arch force-scrolled to the story section at 90% progress** — a 2.6s programmatic travel with `lock: true`, which overrode the visitor's own scrolling and made the arch→story seam a snap. Measured: requested offsets of 3467 / 3700 / 3933 all landed on 4320. The reference has no such move. | Removed. The seam is scroll distance only, and it now retraces exactly on the way back up. | `packages/section-library/src/arch/ArchReveal.tsx`, `.../arch/logic.ts`, `.../arch/arch.test.ts` |
| M8 | **A dead gap between the held hero frame and the arch rise.** The lead was a full viewport in which the only thing that changed was a 5% zoom, so the dome then started from a standstill. | Lead cut to 36svh, so the settle runs into the rise. | `packages/ui/src/sections/home-open.css` |
| M9 | **The hero CTA was scaled by `--hero-zoom` along with the photograph**, which pushed its ring ~83px below the fold as the dome rose. The push-in belongs to the image; chrome over it should stay where the visitor left it. | Scale removed from the CTA layer. | `packages/ui/src/styles.css` |
| M10 | Housekeeping found on the way: a stale unused `loader-out` keyframe and `.animate-loader-out` utility; no `scrollbar-gutter`, so taking the scrollbar away during any lock shifted the page sideways. | Removed the dead rule; `scrollbar-gutter: stable` on the root. | `apps/web/src/app/globals.css` |
| M11 | `eslint` could not see `scripts/**/*.mjs` properly: they were given only Node globals although their `page.evaluate` bodies are compiled in the page. 135 of the repo's 184 errors were this. | Both global sets applied to that file group. | `eslint.config.mjs` |

Verification: `pnpm typecheck` and `pnpm test` (444 tests, including 12 new for the boot model)
pass. `scripts/boot-verify.mjs` passes all six configurations (390 / 834 / 1440 × normal and
reduced motion) with no console errors.

### 2c. Motion residuals — what is still not ditto

Stated plainly, because the pass above fixed the *character* of the boot and the *mechanics* of the
opening seams without closing every difference.

**M-R1 · The opening is structurally a different move.** ~~This is the largest remaining motion
difference and it is not a tuning problem.~~ **Closed in the opening pass — see §2c-2.** On the
reference, the loading composition is not an overlay at all: it is the page's own first screen, and
it stays put while the hero photograph is revealed *through an arch mask that grows from nothing to
full-bleed* across roughly two viewports — so the wordmark screen and the photograph are one
continuous move. Ours was a fixed overlay that lifted to reveal a hero which was already
full-bleed, and the wordmark was shown twice: once on the plate, once as the hero lockup.

**M-R2 · Nav contrast through the arch rise.** ~~At the point where the dome has closed over the
photograph, the fixed top-right rail is dark ink sitting partly on the light dome and partly on the
photograph behind it.~~ **Closed in the opening pass — see §2c-2, O6.** The tone flip was tied to the
progress at which the dome covers the hero CTA, which is not the same question as what the chrome
band is sitting on. Now read off the apex. What remains at that seam is the P1-1 class — the seal
over a bright part of the photograph is soft, which the reference has too
(`.screenshots/ref-desk/04-y3240.png`) — not a tone decision.

**M-R3 · Dome proportions.** ~~Still open, and deliberately not closed in the opening pass. Ours
reaches full stage width earlier in its rise than the reference's, and the curved heading is set at
a larger tier relative to the arc length.~~ **Both halves are closed — the dome in §2c-3, the curved
heading in §2f.** The guess about the curved heading turned out to be wrong in its mechanism: the
tier was already identical to the reference's at both breakpoints, and what differed was how far the
line wrapped, for a reason that was not a constant in this codebase but the width of the face. It was
folded into P1-2 and closed there, by deriving the size from the arc instead.

**M-R4 · Not compared this pass.** Nav scroll-progress pacing, hover-slide timings, the day/night
re-theme and the hero pin hotspots were not measured against the reference — reduced-motion
correctness was verified for all of them, and the page-transition overlay (P2-1) is untouched, but
"does the nav progress rule advance like theirs" is still an open question rather than a closed one.
**Effort ~4h to measure and tune.**

**Recorded as matching, not residual:** the curved heading leaving the top of the viewport as the
dome closes. This looked like a defect (`text` box top at −350px) until the reference was measured
doing the same thing at the equivalent point.

**Outside this pass:** 49 `eslint` errors remain, all pre-existing and all in
`packages/section-library/.tmp-harness/*` (a scratch capture harness) plus two unused imports in
`scripts/audit-chrome.mjs`.

---

## 2c-2. Fixed in the opening pass — M-R1 and M-R2

This closes the structural residual above: the opening is now the same *move* as the reference's,
not a differently-built equivalent.

### How the opening works now

Three things in sequence, of which only the first is an overlay:

1. **The boot plate** (`.boot-plate`) is a fixed, opaque, content-free layer, server-rendered so it
   covers the page from first paint. It owns exactly what it owned before — the scroll lock, the
   readiness gate, the measured progress rule — and nothing else. It holds until fonts, the hero
   image decode and `load` have all landed (measured: 3.15s on a cold dev load), fades over 420ms
   and unmounts at 3.6s, releasing the lock and firing `cinematic:open`. This is the reference's
   own behaviour: a bare dark plate that is simply removed once the page is genuinely ready.
2. **The curtain** (`Curtain`, inside `home-open`) is the page's first *screen*, in the page rather
   than over it. An ink plate carrying the brand lockup, the flanking captions and the tagline, with
   an arch cut out of it. It is server-rendered, so it is already composed behind the plate and the
   plate's removal reveals a finished screen rather than starting one.
3. **The rise.** Scrolling grows the arch from nothing to full bleed over 200svh (140svh compact).
   The wordmark leaves early, the tagline earlier still, the captions last. At full bleed the plate
   has nothing left to paint and hides itself.

The seam is the part worth stating precisely, because it is what makes this one gesture rather than
two: **the curtain has no photograph of its own.** The plate is a hole, and what shows through it is
the hero's own media, pinned at its first frame by `.home-open.is-opening`. The curtain's scroll
room is a spacer ahead of the hero exactly as long as the pin — verified: run 1800px, hero top
1800px at 1440×900; 1182/1182 at 390; 1557/1557 at 834 — so when the hold is released the frame the
visitor has been looking at through the arch is already the hero's. Nothing is handed over, which
is why there is nothing to mismatch.

| # | Gap | Fix | Files |
| --- | --- | --- | --- |
| O1 | **M-R1 · the loading composition was an overlay, not the first screen.** | The composition moved into an in-page pinned screen with its own arch. Geometry and pacing are a pure module with tests — the window, its cap radius, the plate path (one `evenodd` path with two subpaths, so the hole is exact at every frame with nothing to keep in sync), the ring, each fade, and whether the plate is spent. | `packages/section-library/src/home-open/{curtain.ts,curtain.test.ts,Curtain.tsx,HomeOpen.tsx}`, `packages/ui/src/sections/home-open.css` |
| O2 | **M-R1 · the wordmark was shown twice** — once on the plate, once as the hero lockup. | One instance, and it is the hero's: the same lines at the same display tier, fitted by the same hook, drawn on the plate instead of in the hero. Extracted as `Lockup` so there is one implementation rather than two that must agree, and the hero takes `showLockup={!curtain}`. There is exactly one `h1` on the page (asserted in the capture). | `packages/section-library/src/hero/{Lockup.tsx,Hero.tsx}`, `.../home-open/{Curtain.tsx,HomeOpen.tsx}` |
| O3 | **The plate carried a composition that had to be geometry-matched to the page under it.** Any mismatch is a flash at the exact moment the visitor is first looking. | Stripped to a bare plate. Nothing to match, and the wordmark's fit pass now resolves *behind* an opaque plate rather than snapping in view. `.loader` renamed `.boot-plate` throughout, including the eight script references. | `packages/section-library/src/loading/{LoadingScreen.tsx,logic.ts}`, `packages/ui/src/styles.css`, `scripts/{boot-verify,parity-capture,probe,audit-chrome,capture-loading}.mjs` |
| O4 | **The hero's supporting sentence read as label copy sliced by the arch edges** while the rise was in progress — it belongs to the composition the arch finishes *on*. | Hidden while `is-opening`, fading in as the plate is spent. Scoped to `.hero` rather than to the class, since the plate's own lockup carries the same class names. | `packages/ui/src/sections/home-open.css` |
| O5 | **With no lockup above it, the sentence sat at 23% of the first screen** and rode up under the nav links as the station scrolled. | Takes the foot of the station instead — 55%, which is where the reference sits it (53%) — and that also gives it its whole leave travel before it reaches the chrome band, so it is gone rather than crossing the links. | `packages/ui/src/styles.css` |
| O6 | **M-R2 · nav contrast through the rise** was decided by a progress threshold. | Both the curtain's and the dome's tone are now read off the geometry: the chrome flips when the arch *apex* enters the chrome band (16% of the stage), which is the thing that actually decides what the links are sitting on. On a landscape stage the dome's radius is half the width, so its apex settles below the band and the chrome correctly stays `on-media` for the whole rise — which is what the reference does (`ref-desk/04-y3240.png`). | `packages/section-library/src/arch/{logic.ts,ArchReveal.tsx,arch.test.ts}`, `.../home-open/curtain.ts` |
| O7 | **The plate ran off the side of a phone.** The shell's grid column took its width from its content, so the fit pass was handed the unfitted width back and never reduced anything. | `grid-template-columns: minmax(0, 1fr)`. The same trap applies to any fitted heading in a grid; noted here because it is invisible until the copy is long. | `packages/ui/src/sections/home-open.css` |

### Divergences taken knowingly

- **The reference's plate is unbranded during the hold; ours is too, but only until ready.** The
  reference shows a bare plate for ~5s and *then* its composition. Ours shows a bare plate until
  ready and then the composition, which is the same shape of experience driven by measurement
  rather than by a duration.
- **Reduced motion parks the arch rather than scrubbing it** (`CURTAIN_STATIC_PROGRESS`, 0.62 — a
  656×533 window on a 1440×900 stage) with the run collapsed to 100svh, so the plate is passed
  rather than played through. Scroll is still tracked in that path, because "is the plate spent" has
  to be answered however the visitor gets past it — otherwise a fixed plate covers the page for
  good.
- **The photograph does not travel behind the window** during the rise as the reference's appears
  to. It is held at the hero's first frame. This is what buys the seamless release; it costs a
  little of the reference's depth. Now measured rather than assumed — see §2c-3, "the photograph
  behind the window".

Verification: `pnpm typecheck` clean; `pnpm test` 508 passing (477 section-library, including 25 new
for the curtain geometry, 14 ui, 17 animation-engine). `scripts/boot-verify.mjs` passes all six
configurations — 0px of travel under the cover, uncovered at the top, lock released, scroll alive
after. `scripts/cover-timeline.mjs` on `.boot-plate` records the hold/fade/unmount above with
`scrollY` 0 throughout. Opening captured at 1440, 834, 390 and 1440 reduced-motion across the rise,
past the seam and back to the top (`.screenshots/open-*`); the dome seam re-captured at
`.screenshots/scrub-loc-dome`.

---

## 2c-3. Fixed in the dome pass — M-R3

M-R3 was left open because the only reference frames of the dome were 810px strides, too coarse to
derive an ease from. `scripts/dome-probe.mjs` was written to close that gap: it walks the rise in
50px strides and measures the silhouette per frame rather than reading either site's markup, so the
two are comparable despite being built differently.

### What the reference's dome actually does

The guess in M-R3 was that the reference used a different ease. It uses **no ease, and no growth at
all.** Its dome is a box the width of the stage and half as tall, with both top corners rounded by
half the width — a semicircle over a rectangle — and it simply **translates up the stage at scroll
speed**. What looks like a dome growing wider is a fixed circle rising past the viewport floor: the
chord the floor cuts through it lengthens on its own.

Measured at 1440×900 and confirmed at 390×844 (`.screenshots/dome-ref-1440`, `dome-ref-390b`):

| | 1440×900 | 390×844 |
| --- | --- | --- |
| Fitted radius through the whole rise | 720 — half the stage width | 195 — half the stage width |
| Apex travel per 50px of scroll | 50px | 50px |
| Rise, floor to stage top | 900px — one viewport | 850px — one viewport |
| Full-bleed hold before the next chapter | ~450px | — |

Widths it painted at the stage floor as the apex rose, which is what pins the shape family: visible
height 100 → 730px wide, 300 → 1169, 500 → 1371, 700 → 1439.

**The curved heading, measured on the same frames.** Its tier is 56.7px at 1440 and 37.5px at 390 —
which is `--text-h3` and `--text-h4` on our own scale, to the decimal. Its lettering runs on a full
circle *concentric with the dome*, radius 608.4 against the dome's 720. Its letter-spacing is
constant at −0.016em and the words spread by an animated `word-spacing` alone, 0.078em → 1.411em,
linear with the rise — so the run grows 493 → 796px while the letters inside each word never move
relative to one another. Apex to cap top holds at **61px** for the whole rise.

### What ours was doing, and what changed

| # | Gap | Fix | Files |
| --- | --- | --- | --- |
| D1 | **The dome arrived already 46% of the stage wide.** `ARCH_H_FROM` was 0.09, so the first frame of the rise put a 662px-wide segment on a 1440px stage with no travel behind it — the single largest reason ours read as reaching full width earlier than the reference's. | `ARCH_H_FROM` is 0. The dome starts from nothing, as the reference's does from below the floor. | `packages/section-library/src/arch/logic.ts` |
| D2 | **The rise was eased where the reference has no ease.** `ARCH_H_EASE` 0.88 front-loaded it, which on top of D1 put ours 80–100px ahead of the reference's height for most of the rise. | Linear. A translation at scroll speed has no ease to copy. | `.../arch/logic.ts` |
| D3 | **The rise stopped a semicircle short of covering the stage.** `ARCH_H_TO` 0.97 was capped at the radius, so the apex settled at y=180 and never closed — `extended` existed in the geometry type but nothing ever set it, and a dead `.arch-cap` gradient was there to fake the corners. | `ARCH_H_TO` is 1 and the cap is gone, so past the circle's own centre the dome grows straight sides and finishes as a semicircle on a rectangle — the reference's shape. `extended` is now set from the geometry, and a test asserts the two path branches agree where they meet. `.arch-cap` and the unused `capOpacity` / `coversStage` removed. | `.../arch/logic.ts`, `packages/ui/src/sections/arch.css`, `.../arch/arch.test.ts` |
| D4 | **The rise rate was incidental.** 200svh of section minus a 100svh sticky stage is 900px of scrub, of which `ARCH_SETTLE` 0.9 and a `riseAfter` of 0.1 spent 729px on the rise — so the apex moved 1.23px per px of scroll, and the first 90px of the section was dead. | `ARCH_SETTLE` is *derived* — `100 / (ARCH_SCROLL_VH - 100)` — which is the rate itself expressed as a constraint: one viewport of scroll for one viewport of rise, whatever the section height. At `ARCH_SCROLL_VH` 250 that is a 900px rise and a 450px full-bleed hold, which is the reference's own pacing. `riseAfter` dropped at the call site, since a delay ahead of a dome that starts from nothing is scroll in which nothing happens. | `.../arch/logic.ts`, `.../home-open/HomeOpen.tsx` |
| D5 | **The lettering sat on the rim.** `archTextInset` chased three clamps at once — stage height, visible height and radius — and settled on 90, measuring 25.7px from apex to cap top against the reference's 61. | A constant fraction of the dome's radius (`ARCH_TEXT_INSET`), like the reference's concentric circle. Set so the measured gap lands on 61. | `.../arch/logic.ts`, `.../arch/ArchReveal.tsx` |
| D6 | **Nav contrast would have regressed on the back of D3.** `archNavTone` flipped to paper ink when the *apex* entered the chrome band; with the dome now closing over the stage the apex reaches the band, so the links would have gone dark over corners that are still photograph. | The question is whether the dome has reached the *corners* of the band, not whether its apex has entered it — the two diverge because the dome is a slice of a circle. Read off a new `archHalfWidthAt` primitive. On a landscape stage this correctly never flips, which is what the reference does at the top of its own rise (`dome-ref-1440/y-003600.png`: apex at the stage top, both corners still photograph, its chrome still over-media). | `.../arch/logic.ts`, `.../arch/arch.test.ts` |

### What the local dome measures now

Probed the same way (`.screenshots/dome-loc-tuned`, 50px strides at 1440×900):

- Visible height 6 → 900 in exact 50px steps per 50px of scroll — **1:1, linear**, over 906px, then
  held at full bleed for the following 450px.
- Fitted radius 720 for every frame.
- Width at the floor against the reference at equal visible height: 106 → 750 (reference's circle
  gives 753), 306 → 1177, 506 → 1375, 706 → 1440. Inside measurement noise.
- Apex to heading cap top: **61px**, against the reference's 60.4–61.4.

A test pins the four reference widths directly, so the shape family is anchored to something outside
the codebase rather than to a constant someone can quietly change.

### The photograph behind the window

Recorded in §2c-2 as a knowing divergence "as the reference's appears to". It does, and by how much
is now measured: its hero image is 1440×1296 and its top travels 0 → −372px across the 1800px of the
opening — about a fifth of scroll speed, decelerating (−25 by 200, −145 by 600, −302 by 1200, −372 by
1800).

**Not adopted, and the reason is structural rather than a matter of effort.** Our seam works because
the curtain's scroll room is a spacer *ahead of* the hero exactly as long as the pin, so at the moment
the hold is released the hero's natural first frame is already the frame on screen. A drift behind the
window is at its maximum at exactly that moment, so it would have to be zero at the release to keep
the seam — and a drift that returns to zero is a wobble, not depth. Starting the image lower and
drifting to zero does not work either: the image is flush with the top of its window, so there is
nothing above it to expose. The only version that holds is the reference's own plumbing, where the
opening and the hero share one scroll timeline and the curtain overlaps the hero's runway instead of
preceding it. That re-opens the seam the last pass closed and verified at three widths, for a 372px
parallax on a 900px frame. Left alone deliberately; the target is written down above for whoever
takes the re-plumbing on.

### Residuals — honestly

**The curved heading wraps too far around the dome, and M-R3's diagnosis of it was wrong.** ~~The
line covers 77–84% of the dome's width where the reference's covers 45–49%.~~ **Closed in the
curved-heading pass — see §2f.** It is not the tier — both render 56.7px at 1440 and both step down
on compact — and it is not the arc geometry, which now matches. It is the **face**. At the same
rendered size the reference's condensed Didone needs ~530px for its 27-character line; Bodoni Moda
needs ~914px for our 23-character one, 1.7× wider per character. No constant in this repo can absorb
that: closing it means the size comes off the arc length rather than off the scale, which is exactly
**P1-2**, or the display face changes. The first of the two is what was done; the diagnosis here held
up, and the number it predicted — that the size has to fall to hold the proportion — is why the
desktop line is now 40.95px rather than 56.7px.

**The spread mechanism differs.** ~~The reference opens **word gaps only**. Ours distributes the
spread across every gap, because it comes from `textLength` with `lengthAdjust="spacing"`.~~ **Also
closed in §2f**, and by the same change: once the size is fitted, the run no longer has to be forced
to the arc, so `textLength` comes off and the animated `word-spacing` underneath it works. F5's
guarantee is now met by sizing rather than by squeezing, and a forced length survives only for copy
no size on the scale can absorb.

**The compact and tablet squeeze is untouched (P1-2).** ~~Below 992px the arc is short enough that
`textLength` forces the run *below* the copy's natural width — at 834 it is 621px against a natural
905 — so the tracking goes negative and the words touch. Visible in
`dome-loc-834/y-003250.png`.~~ **Closed in §2f**: the run is not forced at any width, so at 834 it is
723px against a natural 723px. `curvedWordSpacing` was left at 1.15 here because it had saturated the
fill clamp and had no effect left to give; it is now a 0–1 fraction of the spread's own headroom and
is authored as 1.

**The hold ends differently.** The reference's dome keeps translating through its hold, so its heading
leaves the top of the viewport during it. Ours holds the closed composition still for the 450px and
the heading leaves at the end, when the sticky stage releases. Verified unclipped throughout and
leaving cleanly (`.screenshots/scrub-dome-seam`).

Verification: `pnpm typecheck` clean; 485 section-library and 14 ui tests pass. `scripts/boot-verify.mjs`
passes all six configurations (390 / 834 / 1440 × normal and reduced motion). No horizontal overflow at
any of the three widths, and the only console error is the pre-existing `ERR_ABORTED` on the
bougainvillea video (P1-5). The rise, the hold and the seam into the story chapter captured at 1440,
834, 390 and 1440 reduced-motion (`.screenshots/dome-loc-*`, `scrub-dome-seam`).

---

## 2d. Fixed in the type and framing pass — all three P0s

| # | P0 | Fix | Files |
| --- | --- | --- | --- |
| F12 | P0-1 · Auto-fit reached only the hero lockup and the story title, so `/residences` broke its title over four lines and the location heading orphaned a word. | Fitting lifted into `RevealLines` behind a `fit` tier prop, so a heading opts in with one attribute instead of repeating the hook. Tiers are classes (`.fit-tier-*`), not inline sizes, so media queries can still step a heading down. Applied to the residences title, the residence name, every statement variant and the location plaque — which fits as one scope, so the place name and its script scale together. The architecture heading was *removed* from the fit set: it is a sentence meant to wrap, so it took `t-h2` and `text-wrap: balance` instead. | `packages/section-library/src/shared/Reveal.tsx`, `.../residences/{ResidenceGrid,ResidenceDetail}.tsx`, `.../statement/{Statement.tsx,logic.ts}`, `.../location/Location.tsx`, `.../architecture/{Architecture.tsx,logic.ts}`, `packages/ui/src/styles.css`, `packages/ui/src/sections/{statement,location,arch}.css` |
| F13 | P0-2 · Ten authored sizes sat off the scale, plus the accent script's two bespoke sizes. | Two tiers added rather than hard-coded: a **micro** role (numerator 9, `0.32em`, 700) for the menu trigger, scene counter and scroll label, and an explicit **accent** numerator (120/72) distinct from display. The scripts that pair with a heading now derive from it through `--accent-companion` (0.625) instead of carrying their own size, which is what let the hero place, the loader place and the location shore drop their overrides. The nav seal's SVG size moved into user-space units (`--seal-ring-units`). | `packages/ui/src/typography.ts`, `packages/ui/src/index.ts`, `packages/ui/src/styles.css`, `packages/ui/src/sections/{location,arch,contact}.css`, `packages/section-library/src/{navigation/Navigation.tsx,loading/LoadingScreen.tsx}` |
| F14 | P0-3 · Hero framing was two magic runway heights tied to one photograph, and the day/night toggle cross-faded the image while the chrome stayed put. | Framing is now authored as intent — `framing.subject` (where the residence sits down the photograph) and `framing.land` (where it should land in the first viewport) — and the runway is *derived* from them: `runway = land / subject`. The three stations divide that travel instead of carrying their own number. `framing.focus` authors the horizontal crop, the one axis `object-position` actually governs here. The authored values reproduce the tuned 180svh / 140svh exactly, so nothing moved; swapping in a differently composed photograph now re-frames by editing `subject`. Day/night carries a tone: `on-media` scrims the chrome against a bright sky, `on-media-night` lifts the scrim and brightens the hairlines, and the black grades pull back to 55%. The chrome samples tone on scroll, so the hero announces the change on `cinematic:nav-tone` rather than waiting for one. | `packages/section-library/src/hero/{Hero.tsx,logic.ts,types.ts,hero.test.ts}`, `.../navigation/{Navigation.tsx,logic.ts,types.ts}`, `packages/ui/src/styles.css`, `packages/clone-mcp/src/{brief.ts,schema-guide.ts}`, `apps/web/src/content/site.ts`, `data/clones/aurelia/config.json` |

A new unit test keeps F13 from regressing: `packages/ui/src/authored-sizes.test.ts` reads every CSS
file, expands the custom properties and asserts each authored `font-size` resolves to a numerator in
`typography.ts` or to an explicitly allowlisted exception (SVG user units). It was canary-tested
against an injected `font-size: 17px`.

Verification: `pnpm typecheck` clean across `ui`, `section-library`, `clone-mcp` and `web`; 451
section-library tests and 12 ui tests pass; `eslint` clean on the touched paths. Measured at 390 and
1440: hero runway 1182 / 1620 (unchanged), chrome contrast flips `on-media` → `on-media-night` on the
toggle with no scroll, grade opacity 1 → 0.55, and under `prefers-reduced-motion` both the image and
the grades report `transition: none`. No horizontal overflow, no console errors.

---

## 2e. Fixed after the P0 pass — the mask reveal held its own entry closed

Recorded in §2d as a known blocker: the interiors heading's `Reveal` never fired its
IntersectionObserver, so that heading stayed hidden at every width.

| # | Gap | Fix | Files |
| --- | --- | --- | --- |
| F15 | **A `Reveal` whose "from" state clipped the element away could never be revealed.** `.reveal[data-reveal="mask"]` hid the element with `clip-path: inset(0 0 110% 0)` — the same element the observer was watching. An element clipped to nothing reports an empty intersection rect, so the observer answered `isIntersecting: false`, `intersectionRatio: 0` for a heading sitting squarely in the middle of the viewport, never fired again (the ratio could not change), and the clip stayed. Measured on the live page: the heading's own probe returned ratio 0 while its unclipped parent returned 0.97, and removing the clip-path flipped the same element to ratio 1. The interiors heading was the only casualty because it is the only call site using the element-level mask — every other mask heading goes through `RevealLines`, whose per-line masking overrode `clip-path` to `none` and so accidentally dodged the bug. | The clip moved off the observed element onto a `.reveal-mask` box rendered inside it, so the observer always measures an unclipped border box. The per-line mask became its own `lines` variant rather than a `mask` variant that undoes the mask, which let the `clip-path: none` override be deleted instead of restated. Headings using `RevealLines` render exactly the same DOM as before. | `packages/ui/src/motion.css`, `packages/section-library/src/shared/Reveal.tsx` |

A source-level test keeps this from returning: `packages/ui/src/reveal-geometry.test.ts` asserts no
CSS rule in the package clips the element the observer watches. It is a source check rather than a
rendered one because the failure is invisible in the markup — it shows up only as content that
never appears. Canary-tested by moving the clip back onto `.reveal[data-reveal="mask"]`, which fails
the test by name.

Verification: `pnpm typecheck` clean; 451 section-library tests and 14 ui tests (2 new) pass. On the
live page at 390 / 834 / 1440, with and without `prefers-reduced-motion`: the heading holds its
`inset(0 0 110% 0)` from-state before entry, passes through `inset(0 0 64% 0)` mid-entry and settles
at `inset(0 0 -25% 0)`; under reduced motion it cuts (`transition-duration: 1e-05s`) rather than
travelling. No console errors. The reveals still open on entry are the ones that should be —
inactive amenity tabs, off-screen concept panels and gallery shots outside the compact strip.

---

## 2f. Fixed in the curved-heading pass — P1-2

The dome pass closed M-R3's geometry and left one number open: the curved heading covered 77–84% of
the dome's width where the reference's covers 45–51%, and below 992px `textLength` was forcing the
run *below* the copy's natural width, so the tracking went negative and the words touched.

Both were the same defect seen from two ends. The size came off the type scale and the run length
came off the arc, so the line's proportions were whatever the two happened to produce at a given
width — and what they produce depends on the face. At the same rendered size Bodoni Moda sets our
23-character line in 16.12em where the reference's condensed Didone sets its 27-character one in
8.39em, 1.7× wider per character (measured on both live pages). On a wide dome that surplus went
into wrap; on a narrow one there was no arc to give and it came out of the tracking.

### What changed

| # | Gap | Fix | Files |
| --- | --- | --- | --- |
| T1 | **The size was authored and the run was derived — the wrong way round.** `--arch-curve` named an `h3`/`h4` tier and `archTextLength` set the run to 92% of the arc, so the rendered line was a function of the dome rather than of the copy. Nothing in between could hold a proportion. | The run is left at its own width and the *size* is derived, from three bounds in order of authority: the run may not need more than `ARCH_TEXT_FILL` of the path (hard — this is F5's guarantee, now met by sizing rather than by squeezing); the line at rest covers `ARCH_TEXT_COVERAGE_REST` of the dome's width; and it is never above the tier asked for nor below `--arch-curve-min`, the smallest tier the display face still reads as a heading at. Solved by bisection on the two monotone bounds. | `packages/section-library/src/arch/logic.ts`, `packages/ui/src/sections/arch.css` |
| T2 | **A floor was unavoidable, and it belongs on the scale.** Every bound in the fit is scale-invariant — coverage is a ratio of two lengths that both scale with the dome — so the rule on its own puts a 390px stage at 13px. Legibility does not scale; that is a physical fact, not a constant to tune. | `--arch-curve-min: var(--text-h6)`. On compact this resolves to the same numerator as `--arch-curve`, which is the honest answer there: a 390px dome has no arc to give back. `FIT_FLOOR` — the display fit's own floor, reused rather than restated — is where even that stops, and is the one case a forced length is still for. | `packages/ui/src/sections/arch.css`, `.../arch/logic.ts` |
| T3 | **The lettering's rim margin only held at one size.** `archTextInset` was a fixed fraction of the radius, tuned so the apex-to-cap gap measured 61px at the desktop tier. The baseline sits off the path by `dy` and the caps rise above that, both proportional to the font size — so any change of size moved the lettering off the margin the dome pass had just measured. | The inset is the margin plus the size: `rx · ARCH_CAP_GAP + fontSize · ARCH_TEXT_RIDE_EM`. The ride is measured, not modelled — probed at 1440, 834 and 390 it is 1.134em at all three. The 61px gap now holds at every size and every width, which it did not before. | `.../arch/logic.ts` |
| T4 | **The spread and the fit were the same mechanism, so they fought.** `textLength` is what made the words open as the dome rose, and it overrides the `word-spacing` the reference uses. Recorded in §2c-3 as a knowing divergence; it is also why `curvedWordSpacing` had saturated and had no effect left to give. | The reference's mechanism, now that it is affordable: the path spans a **fixed** arc (`ARCH_TEXT_SPAN`, as the reference's does — its path measures the same arc at every frame) and the words spread by animated `word-spacing` into the headroom between the copy's natural width and the coverage cap. Word spacing is only ever added, never subtracted, so there is no value of progress or of the content knob that squeezes the line. `curvedWordSpacing` became a 0–1 fraction of that headroom and has real effect again. | `.../arch/logic.ts`, `.../arch/ArchReveal.tsx`, `.../arch/types.ts`, `apps/web/src/content/arch.ts`, `data/clones/*/config.json` |
| T5 | **The fit needs the copy's width in the face that actually loaded**, which is a client measurement, and it must not read the size it is about to change. | Two hidden twins in the same SVG: one at `--arch-curve` giving both the token size in px and the copy's natural width per em, one at `--arch-curve-min` giving the floor — which is a token, not a number this file can know. Re-measured on `document.fonts.ready` and on resize. The size is written as an inline length on the live line, so no authored size moves off the scale. | `.../arch/ArchReveal.tsx`, `packages/ui/src/sections/arch.css` |
| T6 | **The line carried a bespoke +0.06em of tracking**, off the scale, costing 11% of the run's width in a face that was already the problem. | `-0.016em` — the `h3` tracking on our own scale, and the reference's own measured value on this line. Worth 1.75em of the 16.12em the line was asking for. | `packages/ui/src/sections/arch.css` |
| T7 | **The fit landed on the baseline chord, and the painted line is wider than that.** Half a glyph hangs past the run at each end, and the end glyphs are rotated far enough out of upright to project wider still — worth 4 points of coverage, which is the difference between meeting the acceptance and missing it. Caught by probing after the first cut of the fit, not by reasoning. | `ARCH_GLYPH_OVERHANG_EM`, measured at 1.18em where the line rests and 1.37em at its widest wrap. The coverage bounds are stated as painted width, which is what the acceptance is about. | `.../arch/logic.ts` |

### What it measures now

Probed at 50px strides (`scripts/dome-probe.mjs`), against the same reference runs the dome pass used:

| At 1440×900 | Before | After | Reference |
| --- | --- | --- | --- |
| Rendered size | 56.7px | 40.95px | 56.7px (condensed face) |
| Coverage of the dome's width, at rest → closed | 56.3% → 83.7% | **42.5% → 49.7%** | 33.7% → 50.7% |
| Coverage of the dome's width *at that frame*, late rise | 77–84% | **48.5–49.7%** | 45–51% |
| Apex to cap top | 61.0px | **61.1–61.4px** | 60.2–61.4px |
| `textLength` forced on the run | 793 → 1375 | **never set** | never set |
| Word spacing at the closed dome | 0 (overridden) | **0.95em** | 1.411em |

| Compact | Before | After |
| --- | --- | --- |
| 834×1112 — run forced to / natural | 621 / 905 — **a 0.69× squeeze** | 723 / 723 — **not forced** |
| 834 — size, apex to cap top | 56.13px, 8.9px | 50.28px, **35.0px** |
| 390×844 — run forced to / natural | 290 / 423 — **a 0.69× squeeze** | 338 / 338 — **not forced** |
| 390 — size, apex to cap top | 26.25px, 3.6px | 23.51px, **17.0px** |
| 390 — coverage | 76% | 81.6% (the reference's own is 78–91%) |

The acceptance named copy up to 40 characters at 360px. Measured in the browser at 320 / 360 / 390 /
834 / 1440 / 1920 with three samples of 23, 35 and 41 characters, the face's metrics read off each
width and run through the real fit: **no forced length, no clipping and no horizontal overflow in any
of the eighteen combinations.** The 41-character line at 360px renders at 13.4px — small, but that is
41 characters of this face on a 360px dome, and it is set rather than squeezed.

### Residuals — honestly

**The compact tier is smaller than the reference's, not larger.** P1-2's original acceptance asked
for the compact curve to read "at or near the `h3` tier", which at 390 is 37.5px — the reference's
own compact size, to the decimal. That is arithmetically unreachable in this face: 23 characters at
37.5px is 604px of run on a 149px lettering circle, 4.03 radians of arc, where the dome's top half
offers 3.14 and the rim margin leaves ~2.2. The reference fits 37.5px there because its line is
314px, not 604px. So compact now renders 23.5px at 390 and 50.3px at 834 — both *below* where they
were, and both with their tracking intact, which is the trade the re-measurement in §2c-3 said this
item would have to make. **Closing this properly needs a condensed display face**, and there is no
condensed cut of Bodoni Moda and nothing else licensed in the repo to use; adding one is a design
decision about the type system, not a fix to this geometry, so it is left written down rather than
taken.

**The line still starts wider than the reference's.** 42.5% of the dome at rest against their 33.7%.
It closes to the same figure (49.7% against 50.7%), which is the frame the acceptance is about, but
the reference's line has more room to open and so more of its spread reads as movement: it grows
1.61× across the rise where ours grows 1.20×. Taking the resting coverage down to theirs means 32px
at 1440, which trades the size the heading reads at for the size of the animation. Left at the
closed-dome match deliberately.

**Compact coverage is high, and that is the face again.** 81.6% at 390 and 81.9% at 834, against the
desktop's 49.7%. It is not a defect so much as the same 1.7× showing up where there is no arc to
absorb it — and it is inside the band the reference itself sits in on compact (78–91% at 390). The
lettering wraps to 1.113 radians either side of the apex there, which is `ARCH_TEXT_FILL ×
ARCH_TEXT_SPAN` and was set to the reference's own compact wrap (63.8°) rather than to the
geometric limit.

Verification: `pnpm typecheck` clean; 495 section-library tests and 14 ui tests pass (`arch.test.ts`
rewritten around the fit — the no-squeeze and no-clip properties are asserted across nine widths ×
three copy lengths × five progress values rather than at one stage); `eslint` clean on the touched
paths. `scripts/boot-verify.mjs` passes all six configurations (390 / 834 / 1440 × normal and reduced
motion). The rise re-probed at 1440, 834 and 390 (`.screenshots/dome-p12b-*`).

---

## 2g. Hero lockup restore and trailing compact gutters

The opening curtain kept the boot plate (good) but stole the hero's lockup: `showLockup={!curtain}`
left the first screen a photograph with a caption on it. Restored the hero's own lockup and delayed
its unmask until the arch is spent, so the post-curtain composition matches the pre-curtain hero
(wordmark, Harbor script, sentence, day/night, runway). Compact trailing sections were running
body copy under the left seal and clipping amenity tabs; gutters now clear the chrome at 390/834,
and the amenity rail can scroll instead of truncating the last tab.

---

## 2h. Gate is the once-only preloader

The in-page curtain was the wrong model. On the reference, `master-preloader` / `.preloader`
is a **fixed overlay**: dark plate, then branded composition, then a **time-driven** arch
opening onto the hero, then the overlay is gone. `sessionStorage.hasVisited` is set during
the first visit. After that the visitor is on the normal hero at `scrollY` 0 — there is no
200svh scrub chapter, and scrolling the hero does not retrace a gate.

| # | Gap | Fix | Files |
| --- | --- | --- | --- |
| G1 | **The arch was a persistent first scroll screen.** Reloading skipped the boot plate but left a curtain spacer ahead of the hero, so every visit started by scrubbing a gate. | The gate is a fixed overlay driven by `curtainPlayProgress` (hold, then rise). When spent it unmounts, `data-boot` becomes `open`, and the hero is the first page. Session skip (`cinematic:boot-seen`) hides it before paint. `?loader=1` / `?preview=1` still force replay. | `packages/section-library/src/home-open/{curtain.ts,Curtain.tsx,HomeOpen.tsx}`, `.../loading/{logic.ts,LoadingScreen.tsx}`, `packages/ui/src/sections/home-open.css` |
| G2 | **Scroll unlocked when the plate faded**, so a wheel during the arch travelled the hero behind a sequence that is supposed to play itself. | Lock is held until `cinematic:gate`. Nested with the plate: reduced motion can spend the gate while the plate is still fading without releasing early. | `.../loading/LoadingScreen.tsx`, `scripts/boot-verify.mjs` |
| G3 | **P1-5 · two floral `<video>`s shared one source**, aborting `/flowers/bougainvillea-flowers_02.webm` on every load. Off-screen clips also decoded. | Adjacent seats no longer share a file. Playback is visibility-gated (`preload="none"`, pause off-screen). | `.../concept/{FloralCorner.tsx,logic.ts}`, `apps/web/src/content/concept.ts`, `data/clones/*/config.json` |
| G4 | **P1-3 (partial) · hover-only affordances fired on coarse pointers ≥992px.** | `hover-slide`, hero pin hover, and magnetic CTA now also require `(hover: hover) and (pointer: fine)`. | `packages/ui/src/styles.css`, `.../hero/Hero.tsx` |
| G5 | **P1-4 (partial) · compact concept panels padded only to `--nav-offset`.** | Compact panel gutter is `max(--nav-offset, --gutter-x)` so copy cannot start at the viewport edge. Desktop pin already clips the sticky screen. | `packages/ui/src/sections/concept.css` |
| G6 | **Reload restored a mid-hero scroll offset**, so a second visit could land on the runway instead of the post-gate first screen. | Skip path forces `scrollRestoration = "manual"` and `scrollTo(0)` (also on `pageshow`). | `.../loading/LoadingScreen.tsx` |
| G7 | **Nav chrome sat on top of the gate** (curtain `z-index: 6` vs rails at 60). | Gate overlay is 80, below the boot plate (90) and above the chrome. | `packages/ui/src/sections/home-open.css` |
| G8 | **Compact copy ran under the seal and MENU** — `--gutter-x` was only `--nav-offset`. Amenity 4:5 stage ate the tablet first screen; interiors showed an EXPAND chip without hover; amenity/contact display lines overflowed the new measure. | Compact `--gutter-x` clears the chrome cell. Amenity stage is shorter below 992px; amenity/contact headings now `fit`. Interiors EXPAND is desktop/hover-only; remaining hover treatments require a fine pointer. | `packages/ui/src/styles.css`, `.../sections/{amenity-browser,interiors,assurance,contact,concept}.css`, `packages/ui/src/motion.css`, `.../amenity-browser/AmenityBrowser.tsx`, `.../contact/Contact.tsx` |
| G9 | **Lock was effect-only**, so a slow hydrate (seen at 834) let `End` travel the page under the plate. | Bootstrap now publishes `data-boot=veil` on a first visit; CSS `overflow: hidden` holds until `open`. | `.../loading/logic.ts`, `packages/ui/src/styles.css` |

The hero lockup from §2g stays: after the gate leaves, the visitor sees the restored hero
(wordmark, Harbor script, sentence, day/night), not a caption on a photograph.

---

## 2i. Chrome-safe decoration, fitted-heading hold, and remaining P1s

This pass closed the P1 items that were still open after §2h, plus the user-visible P2s that
could land without a CI golden harness.

| # | Gap | Fix | Files |
| --- | --- | --- | --- |
| I1 | **P1-1 · decoration still sat in the chrome band.** `.decor-safe` was named but not inset. | Top-corner `.decor-safe:not(.decor-bleed)` is `top: var(--gutter-top)`. Concept florals and statement accents opt in. Bleed layers declare `data-nav-scrim`; the rail then gets paper ink plus a text shadow. `parity-capture.mjs` reports `decorInChrome` per step. | `packages/ui/src/{motion.css,styles.css,chrome-decor.test.ts}`, `packages/section-library/src/{concept,statement,shared/Section.tsx,navigation/logic.ts}` |
| I2 | **P1-4 · mid-pin concept copy peeked into the rail.** Desktop clip was `overflow: hidden` only, so horizontal travel could still paint into the columns. Coming panels sat at 40% opacity. | Sticky screen clips with `clip-path: inset(0 var(--gutter-x))`. Coming/past copy is opacity 0. Amenity titles at 390 get extra right padding and `fit="h3"` (measured: "The courtyard" ends at 353px on a 390px stage). | `packages/ui/src/sections/{concept,amenity-browser}.css`, `.../concept/Concept.tsx`, `.../amenity-browser/AmenityBrowser.tsx` |
| I3 | **P1-6 · fitted headings jumped after swap, and `/residences` veiled.** `display: swap` plus a post-font re-fit produced a size jump; first visit to any route published `data-boot=veil`. | `adjustFontFallback` on display and body. Fitted headings stay at opacity 0 until fonts + one measure (`data-fit-ready`), with a 2.1s CSS ceiling. Bootstrap veils only `/`. | `apps/web/src/app/fonts.ts`, `packages/section-library/src/shared/useFitText.ts`, `packages/ui/src/styles.css`, `.../loading/logic.ts` |
| I4 | **P1-3 remainder · hover lifts still fired on coarse pointers.** | Hero ring/tab/pin and residence-card lifts join the existing `(min-width: 992px) and (hover: hover) and (pointer: fine)` gate. | `packages/ui/src/{styles.css,sections/residences.css}` |
| I5 | **P2-1 · page transition fought the loader.** | Overlay is `display: none` while `data-boot` is `veil`/`gate`. `shouldPlayPageTransition` skips while the cover is up. | `apps/web/src/app/PageTransition.tsx`, `packages/ui/src/sections/page-transition.css`, `packages/section-library/src/transition/logic.ts` |
| I6 | **P2-3 / P2-4 / P2-5.** Lightbox and compact media-first were already built; this pass nested `lockScroll` so the virtual scroller cannot travel behind a viewer, and added `compact: "off" \| "on"` on `Parallax` (default off). | Dialog Escape is not swallowed by the page lock. | `packages/section-library/src/{shared/scroll-lock.ts,shared/Parallax.tsx,interiors,residences}` |
| I7 | **P2-6 / P2-8.** Keep one 992px breakpoint (parity with the reference). Capture scripts hide Next's badge; `devIndicators: false` on the web app. | Decision recorded here rather than inventing a tablet numerator table. | `apps/web/next.config.ts`, `scripts/parity-capture.mjs` |

**Measured in this pass.** `pnpm boot-verify` — 6/6 (390 / 834 / 1440 × normal / reduced-motion).
`/` and `/residences` at 390: no document overflow; amenity titles clear the right edge;
`/residences` heading visible after fit-ready; `/residences/011` compact composition shows
breadcrumbs, type, name, then media. Builder lists both clones once the API is up. GET
`/clones` returns Aurelia and 7 Seasons.

**Honest residuals.** (1) Compact arch heading still needs a condensed Didone — nothing licensed
in-repo (P1-2). (2) P2-7 golden filmstrips are not in CI. (3) P2-2 later-stack seams and M-R4
nav-progress pacing are untouched. (4) Nest watch used to miss `dist/main` because incremental
`tsbuildinfo` lived outside `dist` while `deleteOutDir` wiped the emit; `tsBuildInfoFile` is now
`./dist/.tsbuildinfo`. (5) Next 16 still paints an N badge in some embeds despite
`devIndicators: false` — capture CSS hides it; Cursor's in-IDE browser does not.

---

Priorities: **P0** blocks "looks like the same site". **P1** blocks "no issues at any breakpoint".
**P2** is the long tail to ~100%.

Effort is in ideal engineering hours for one person already oriented in this codebase.

---

### P0 — closed

All three P0s are done. See §2d for what shipped and how each acceptance criterion was met.

#### P0-1 · Extend auto-fit to every display-tier heading — **done**

**Gap.** `useFitText` is wired to the hero lockup and the story title only. Every other display
heading is still fixed-size, so long clone copy wraps into shapes the reference never produces.
Visible now on `/residences`, where the page title breaks across four lines, and on the location
heading, which orphans a single word onto line two.

**Files.** `packages/section-library/src/architecture/Architecture.tsx`,
`.../location/Location.tsx`, `.../statement/Statement.tsx`, `.../residences/*`,
`apps/web/src/app/residences/ResidencesSite.tsx`; matching rules in `packages/ui/src/styles.css`
and the per-section CSS.

**Approach.** Same shape as the hero: `--<section>-fit` custom property multiplying the token
size, `white-space: nowrap` on the measured line, hook supplies the scale. Prefer lifting the
wiring into `RevealLines`/a small `FitHeading` wrapper rather than repeating it seven times.

**Acceptance.** For each display-tier heading: no wrap at ≥992px; at 390px no single word
overflows the gutter; rendered size equals the token size whenever the copy fits; seeding a clone
with a name 3× longer than Aurelia's produces no overflow and no scale below `FIT_FLOOR`.

**Effort.** 5h. **Depends on.** Nothing — the primitive exists.

---

#### P0-2 · Retire the remaining off-scale font sizes — **done**

**Gap.** The reference renders **zero** sizes off its token scale. The latest local probe still
shows ten off-token sizes at 1440: `128.3, 118.8, 103.68, 101.95, 72, 46.8, 39.6, 14.4, 8.6` plus
the accent script's two bespoke sizes.

Two caveats before chasing the list. First, **fitted headings are exempt** — a fit result is a
token size multiplied by a measured scale, so `103.68` and similar are derived, not authored, and
the check must compare against `token × fit` rather than against the raw token. Second, the audit
is therefore best expressed as "no *authored* size outside the scale", which is a source-level
check (grep for `font-size:` with a literal) as much as a rendered one.

**Files.** `packages/ui/src/styles.css`, `packages/ui/src/sections/{vista,statement,contact,arch}.css`,
`packages/ui/src/typography.ts`.

**Approach.** Diff `typeprobe.json` against the numerator table in `typography.ts` and rewrite each
offender as a token reference. Two genuinely missing tiers should be *added* to the scale rather
than hard-coded: a **micro-label** (the reference's 8.1px / 0.32em / 700 cut, used for the menu
trigger and counters) and an explicit **accent** size distinct from `--text-display`.

**Acceptance.** No literal `font-size` value outside the token set remains in `packages/ui`;
every entry in `typeprobe.json` maps to a numerator in `typography.ts` or to a fitted heading; a
unit test asserts the authored size set is a subset of the token set.

**Effort.** 4h. **Depends on.** P0-1 for the headings it touches.

---

#### P0-3 · Hero photograph framing and the day/night swap — **done, approach corrected**

**Gap.** Two things. (a) The hero crop is tuned by runway height rather than by art direction, so
the subject's position in the first viewport is incidental — F7 corrected compact by shortening
the runway, which is a workaround, not a model. (b) The reference cross-fades the background *and*
re-themes surrounding chrome on the day/night toggle; ours cross-fades the image only.

**Files.** `packages/section-library/src/hero/Hero.tsx`, `.../hero/types.ts`,
`packages/ui/src/styles.css`, `packages/schemas/src/clone-config.ts`, `data/clones/aurelia/config.json`.

**Approach.** Add a per-breakpoint focal point to the hero media content model
(`focal: { desktop: [x,y], compact: [x,y] }`) driving `object-position`, so framing is authored
rather than emergent. Extend `data-hero-variant` to carry a tone so the night variant re-themes
the nav and the section's `--tone-*` pair.

> **Correction — the `object-position` half of this approach cannot work here.** Measured at both
> breakpoints: the source is 1920×1728, the media box is 390×1182 compact and 1440×1620 desktop.
> `object-fit: cover` therefore scales the photograph to the *box height* and discards width only —
> 923px of 1313 at compact, 360px of 1800 at desktop. There is no vertical crop at any breakpoint,
> so `object-position`'s y component is a no-op and a focal point cannot move the subject up into
> the first viewport. The vertical control is the runway height, which is exactly what F7 used.
> The real defect was never that the runway controls the framing — it was that `140svh` / `180svh`
> were magic numbers tied to one photograph. See §2d for the model that shipped instead.

**Acceptance.** Compact and desktop both show the building within the first viewport with the
focal point authored, not derived from runway height; switching to night re-colours nav contrast
within one transition; reduced motion cuts rather than cross-fades.

**Effort.** 6h. **Depends on.** Schema change ⇒ re-seed `data/clones/aurelia`.

---

### P1 — blocks "responsive with no issues"

#### P1-1 · Decorative layers must respect the chrome band — **done**

**Gap.** F6 fixed one instance by hand. The rule is not enforced: any floral, parallax accent or
full-bleed media can still land under the fixed rail and destroy nav contrast. The nav's
`data-nav-contrast` samples the *section tone*, which says nothing about what decoration is
painted on top of it.

**Files.** `packages/ui/src/motion.css`, `packages/ui/src/styles.css`,
`packages/ui/src/sections/concept.css`, `packages/section-library/src/navigation/Navigation.tsx`.

**Approach.** Two halves. (1) A `.decor-safe` convention: decorative absolutely-positioned layers
are inset by `--gutter-top` / `--gutter-x` unless they explicitly opt out. (2) A fallback for the
opt-outs — let a section declare `data-nav-scrim`, which gives the chrome the same treatment
`on-media` already gets (paper ink plus a soft text shadow).

**Acceptance.** At every 10% scroll step, at 390 / 834 / 1440, the nav rail and logo meet 4.5:1
against whatever is actually rendered behind them. Add this as an assertion in
`scripts/parity-capture.mjs` so it is checked, not remembered.

**Closed in §2i.** `.decor-safe` insets top-corner decoration by `--gutter-top`;
concept florals and statement accents opt in; a section that still needs to bleed
declares `data-nav-scrim` and the rail gets a readable shadow. `parity-capture.mjs`
now reports `decorInChrome` at every filmstrip step.

**Effort.** 5h.

---

#### P1-2 · Arch curve sizing on compact — **done**

**Closed in the curved-heading pass — see §2f**, with one residual that is a type-system decision
rather than geometry: the compact tier now lands *below* the reference's 37.5px rather than above it,
because 37.5px of this face needs 4.03 radians of arc on a dome that offers 2.2. Everything else in
the acceptance is met and measured.

**Gap.** F5 stopped the clipping, but the compact arch heading now renders at ~22px against the
reference's equivalent ~37.5px tier, and on long copy `lengthAdjust="spacing"` compresses tracking
toward zero rather than reducing glyph size.

**Re-measured in the dome pass, and it is bigger than a compact defect.** Two numbers to work from.
(1) The squeeze is real and quantified: at 834×1112 the run is forced to 621px against a natural
905px, so the tracking goes negative and words touch (`dome-loc-834/y-003250.png`); at 390 it is 290
against 423. (2) The reason it bites at all is the face. At the same rendered size the reference's
condensed Didone needs ~530px for its 27-character line where Bodoni Moda needs ~914px for our
23-character one — 1.7× wider per character — so our line needs 88° of arc where theirs needs 50°,
and on a narrow stage there is no arc to give. This is also why the desktop line wraps 77–84% of the
dome's width against the reference's 45–49% (§2c-3). So P1-2 is the item that decides the curved
heading's proportions at *every* width, not just compact.

**Note the constraint the fix has to respect.** `textLength` is what guarantees the fit for arbitrary
clone copy (F5), and it overrides anything underneath it — including the `word-spacing` the reference
uses to spread its words. A size-from-arc approach needs the copy's *natural* length to decide when to
intervene, which is a client measurement; `dome-probe.mjs` reports `heading.naturalLength` per frame,
so the target is measurable before the code is written. `useFitText` is the existing precedent for the
measure-then-reduce shape.

**Files.** `packages/section-library/src/arch/logic.ts`, `packages/ui/src/sections/arch.css`.

**Approach.** Derive the curve font size from the arc length and the glyph count instead of
setting it in CSS — the same "fit to measure" idea as P0-1, one dimension over. Keep `textLength`
as the guarantee of last resort.

**Acceptance.** Tracking stays positive for copy up to 40 characters at 360px; the compact curve
reads at or near the `h3` tier; no clipping at 320–1920px. Added after the dome pass: the line covers
no more than ~55% of the dome's width at 1440 (`dome-probe.mjs` reports both), against 77–84% today
and 45–49% on the reference.

**Met:** the run is never forced and so never squeezed, at any of 320–1920 × 23/35/41 characters;
coverage at 1440 is 49.7% closed and 48.5–49.7% through the late rise. **Not met:** the compact tier,
for the reason above.

**Effort.** 5h, up from 3h now that the desktop wrap is in scope too. **Depends on.** F5 (done),
and the dome geometry in §2c-3, which is what the arc length is now measured against.

---

#### P1-3 · Landscape-tablet and coarse-pointer handling — **done**

Hover-slide, hero pin hover, the magnetic CTA, amenity tabs, interiors zoom,
assurance rows, contact social icons, the circle CTA, residence card lifts,
and the remaining hero ring/tab/pin hovers all require
`(min-width: 992px) and (hover: hover) and (pointer: fine)`. Tap equivalents
for pins, interiors shots, amenity tabs and residence media are on the click
path. Focus-visible treatments stay available without a pointer.

---

#### P1-4 · Concept horizontal track — edge behaviour — **done**

Desktop sticky screen clips to the chrome columns (`clip-path: inset(0 var(--gutter-x))`)
so mid-pin copy cannot paint into the rail. Coming/past panel copy is fully hidden
rather than peeking at 40% opacity. Headings are fitted. Compact panels keep the
G8 gutter. `textClearsViewportEdge` pins the inset rule in tests.

Amenity panel titles at 390 are fitted and given a right gutter so they no longer
kiss the viewport edge (measured: "The courtyard" ends at 353px on a 390px stage).

---

#### P1-5 · Ambient video: visibility gating and the aborted request — **done**

Adjacent floral seats no longer share a source. Clips `preload="none"` and pause off-screen.
Re-probed at 390 / 834 / 1440 on `/` and `/residences`: no page errors, no aborted
floral request in the console, no document horizontal overflow.

---

#### P1-6 · Web-font loading strategy — **done**

**Gap.** The display Didone is now load-bearing for the whole page's character, and it is
`display: swap`. First paint shows a fallback serif at fallback metrics, then reflows — and
because headings are now *fitted*, the fit re-runs after `document.fonts.ready`, so the reflow is
a visible size jump rather than just a glyph swap.

**Files.** `apps/web/src/app/fonts.ts`, `apps/web/src/app/layout.tsx`,
`packages/section-library/src/shared/useFitText.ts`.

**Approach.** Tune `adjustFontFallback` metrics for the display face so the fallback measures close
to Bodoni Moda, and hold the fitted headings at zero opacity until the first measurement lands
(the branded loader already covers first paint on the homepage — the gap is on `/residences` and
on preview reloads).

**Acceptance.** No visible heading size jump after font load on a cold cache at 3G throttling;
CLS < 0.05 on `/` and `/residences`.

**Closed in §2i.** `adjustFontFallback` is on for display and body. Fitted headings
(`RevealLines`, hero lockup, location plaque, story title) stay at opacity 0 until
`document.fonts` has loaded and one measure has run, with a 2s CSS ceiling so a
stalled face cannot leave the heading blank. A first visit to `/residences` no
longer publishes `data-boot=veil` (that lock belongs only to `/`).

**Effort.** 4h. **Depends on.** F3.

---

### P2 — the long tail to ~100%

| # | Item | Files | Acceptance | Effort |
| --- | --- | --- | --- | --- |
| P2-1 | **Page transitions.** — **done.** Overlay plays for internal navigation; it hides while `data-boot` is `veil`/`gate` so the loader is the only cover; session skip already prevents a loader replay; reduced motion is a 120ms fade. | `apps/web/src/app/PageTransition.tsx`, `packages/ui/src/sections/page-transition.css`, `packages/section-library/src/transition/logic.ts` | Internal navigation plays one overlay pass; the loader does not replay on client navigation; reduced motion cuts. | 5h |
| P2-2 | **Section-seam tone handoff coverage.** `.section-seam` is declared by the residence sections only; no homepage section uses it. Re-checked in the motion pass and **narrower than it looked**: the opening chapters are `media → color → color → color → light`, the one real change (vista → concept) is already handled by `.vista[data-tone] { background: var(--paper) }`, and hero → story is carried by the arch dome. So this is a survey of the *later* stack, not the opening. Left as a later-stack audit. | `packages/ui/src/motion.css`, each section's wrapper | Every adjacent tone pair either crossfades or is a deliberate hard cut recorded in the section config. | 3h |
| P2-3 | **Lightbox for gallery and residence media.** — **done** (was already built; this pass locked page scroll with `lockScroll` so the virtual scroller cannot travel behind the viewer). | `packages/section-library/src/interiors/*`, `.../residences/*` | Thumbnails open a focus-trapped viewer with keyboard prev/next and Escape; background scroll locked. | 6h |
| P2-4 | **Compact reordering on residence detail.** — **done** (already shipped: media first in source order, swipe strip below 992px, independent columns above). | `apps/web/src/app/residences/[slug]/ResidenceDetailSite.tsx`, `packages/ui/src/sections/residences.css` | At <992px media precedes info and is swipeable with a drag hint; at ≥992px the info column scrolls independently. | 4h |
| P2-5 | **Parallax "off on compact" as an explicit per-assignment flag.** — **done** on the primitive (`compact: "off" \| "on"`, default `"off"`). Schema authoring of per-layer flags is not wired; call sites keep the default. | `packages/section-library/src/shared/Parallax.tsx` | Each parallax assignment carries `compact: "off" \| "on"`; default off for continuous scroll-coupled layers, on for one-time entry reveals. | 3h |
| P2-6 | **Three-tier responsive model.** — **decided: keep one 992px breakpoint.** Matching the reference's own strategy is the parity target; a tablet numerator table would be an intentional divergence (see `docs/02-reference-analysis.md` §29) and is out of scope for this pass. | `packages/ui/src/styles.css`, `packages/ui/src/typography.ts` | A written decision in this doc, and if adopted, a compact/tablet/desktop numerator table with the same discipline as the current two. | 8h (if adopted) |
| P2-7 | **Visual regression harness.** Partial: `parity-capture.mjs` now reports `decorInChrome` per scroll step. Golden filmstrips in CI are not landed — user-visible parity was the priority. | `scripts/parity-capture.mjs`, CI | Golden filmstrips committed per breakpoint; CI fails on a >1% pixel delta outside an allowlist. | 5h |
| P2-8 | **Capture hygiene.** `devIndicators: false` on the web app; capture scripts also hide `nextjs-portal` / `[data-next-badge-root]` because Next 16 still paints a badge in some embeds. | `scripts/parity-capture.mjs`, `apps/web/next.config.ts` | Captures run with the dev indicator disabled. | 0.5h |

---

## 4. Suggested order

~~1. **P0-1** (extend auto-fit)~~ · ~~2. **P0-2** (retire off-scale sizes)~~ · ~~4. **P0-3** (hero
framing and day/night)~~ — all three landed, recorded in §2d.

~~and **P1-2** (arch curve sizing)~~ — closed in §2f, which also closed the second half of **M-R3**.

~~**P1-1**, **P1-3**, **P1-4**, **P1-5**, **P1-6**~~ — closed in §2i.

Remaining, in order if anyone continues:

1. **P1-2 residual** — a condensed display face (type-system decision, nothing licensed in-repo).
2. **P2-7** golden filmstrips in CI.
3. **P2-2** later-stack seam survey, **P2-5** schema wiring, **M-R4** nav-progress pacing.

Total to end of P1: closed, minus the unlicensed condensed face.
