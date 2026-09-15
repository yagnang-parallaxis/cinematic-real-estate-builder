import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

/**
 * Motion probe. Two passes over one URL:
 *
 *  1. `boot` — samples the page every animation frame from navigation until the
 *     cover layer has gone, recording the cover's own computed motion state,
 *     whether the document is scroll-locked, and where the scroll position sits.
 *     This is what makes "when does the loader leave / when does scroll unlock"
 *     a measured number instead of an impression.
 *  2. `handoff` — walks the first few viewports in fine steps, recording each
 *     top-level section's rect plus any sticky/pinned descendant, so seams and
 *     dead gaps show up as a table.
 *
 * Usage: node scripts/motion-probe.mjs <url> <label> [width] [height]
 */
const url = process.argv[2];
const label = process.argv[3];
const width = Number(process.argv[4] ?? 1440);
const height = Number(process.argv[5] ?? 900);

if (!url || !label) {
  console.error("usage: node scripts/motion-probe.mjs <url> <label> [w] [h]");
  process.exit(1);
}

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, ".screenshots", `motion-${label}`);
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width, height },
  deviceScaleFactor: 1,
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
});
const page = await context.newPage();

/*
 * The sampler is installed before any document script runs, so t=0 is the
 * document's own start rather than whenever the driver got around to asking.
 */
await page.addInitScript(() => {
  const w = /** @type {Record<string, unknown>} */ (window);
  const samples = [];
  w.__motionSamples = samples;
  w.__wheelBlocked = 0;

  addEventListener(
    "wheel",
    (event) => {
      if (event.defaultPrevented) w.__wheelBlocked = Number(w.__wheelBlocked) + 1;
    },
    { passive: true },
  );

  const t0 = performance.now();

  /* The cover is whatever fixed layer currently paints over the whole viewport. */
  const findCover = () => {
    let best = null;
    for (const node of document.body ? document.body.querySelectorAll("*") : []) {
      const cs = getComputedStyle(node);
      if (cs.position !== "fixed" || cs.display === "none") continue;
      const r = node.getBoundingClientRect();
      if (r.width < innerWidth * 0.9 || r.height < innerHeight * 0.9) continue;
      if (cs.visibility === "hidden" || Number(cs.opacity) === 0) continue;
      const z = Number(cs.zIndex) || 0;
      if (!best || z >= best.z) {
        best = { node, z, cs, r };
      }
    }
    return best;
  };

  const tick = () => {
    const t = Math.round(performance.now() - t0);
    const cover = findCover();
    const bodyCs = document.body ? getComputedStyle(document.body) : null;
    const htmlCs = getComputedStyle(document.documentElement);
    samples.push({
      t,
      ready: document.readyState,
      cover: cover
        ? {
            tag: cover.node.tagName.toLowerCase(),
            cls: (cover.node.className || "").toString().slice(0, 80),
            z: cover.z,
            opacity: Number(cover.cs.opacity).toFixed(3),
            clip: cover.cs.clipPath === "none" ? "" : cover.cs.clipPath,
            transform: cover.cs.transform === "none" ? "" : cover.cs.transform,
            top: Math.round(cover.r.top),
          }
        : null,
      scrollY: Math.round(scrollY),
      /* Any of these three is a scroll lock; record all so the mechanism is visible. */
      lock: [
        bodyCs && /hidden|clip/.test(bodyCs.overflow) ? "body-overflow" : "",
        htmlCs && /hidden|clip/.test(htmlCs.overflow) ? "html-overflow" : "",
        bodyCs && bodyCs.position === "fixed" ? "body-fixed" : "",
        htmlCs.getPropertyValue("--lenis-stopped") ? "lenis" : "",
      ]
        .filter(Boolean)
        .join("+"),
      wheelBlocked: w.__wheelBlocked,
    });
    if (t < 9000) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});

const failures = [];
page.on("requestfailed", (r) => failures.push(`${r.failure()?.errorText} ${r.url().slice(0, 120)}`));
page.on("console", (m) => {
  if (m.type() === "error") failures.push(`console: ${m.text().slice(0, 200)}`);
});

await page.goto(url, { waitUntil: "commit", timeout: 60000 });

/* Boot filmstrip: dense early, then coarser, covering the whole hold + exit. */
const bootStops = [120, 300, 500, 800, 1100, 1500, 1900, 2200, 2500, 2900, 3400, 4200, 5200];
let last = 0;
for (const stop of bootStops) {
  await page.waitForTimeout(Math.max(0, stop - last));
  last = stop;
  await page
    .screenshot({ path: path.join(outDir, `boot-${String(stop).padStart(5, "0")}.png`) })
    .catch(() => {});
}

const boot = await page.evaluate(() => window.__motionSamples ?? []);

/*
 * Collapse the frame stream into the transitions that matter: the cover's
 * appearance and departure, the first change in each field.
 */
const digest = [];
let prev = null;
for (const s of boot) {
  const key = JSON.stringify([s.cover && s.cover.cls, s.cover && s.cover.opacity, s.lock, s.ready]);
  if (key !== prev) {
    digest.push(s);
    prev = key;
  }
}

const coverGone = boot.find((s) => s.t > 200 && !s.cover);
const maxScrollDuringCover = boot
  .filter((s) => s.cover)
  .reduce((acc, s) => Math.max(acc, s.scrollY), 0);

/* Handoff pass: fine-grained walk of the opening chapters. */
await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
await page.waitForTimeout(600);

const stepPx = Math.round(height / 3);
const walk = [];
const totalHeight = await page.evaluate(() => document.documentElement.scrollHeight);
const walkEnd = Math.min(totalHeight - height, height * 6);

for (let y = 0; y <= walkEnd; y += stepPx) {
  await page.evaluate((top) => scrollTo({ top, behavior: "instant" }), y);
  await page.waitForTimeout(420);
  const frame = await page.evaluate(() => {
    const vh = innerHeight;
    const sections = [...document.querySelectorAll("main > *, body > section, main > section")]
      .map((node) => {
        const r = node.getBoundingClientRect();
        if (r.bottom < -vh || r.top > vh * 2) return null;
        const sticky = [...node.querySelectorAll("*")]
          .filter((n) => {
            const cs = getComputedStyle(n);
            return cs.position === "sticky" || cs.position === "fixed";
          })
          .slice(0, 3)
          .map((n) => {
            const sr = n.getBoundingClientRect();
            const cs = getComputedStyle(n);
            return {
              cls: (n.className || "").toString().slice(0, 46),
              top: Math.round(sr.top),
              h: Math.round(sr.height),
              transform: cs.transform === "none" ? "" : cs.transform.slice(0, 60),
            };
          });
        return {
          id: node.id || (node.className || "").toString().slice(0, 46) || node.tagName,
          top: Math.round(r.top),
          h: Math.round(r.height),
          sticky,
        };
      })
      .filter(Boolean);
    return { scrollY: Math.round(scrollY), sections };
  });
  walk.push(frame);
  await page
    .screenshot({ path: path.join(outDir, `walk-${String(y).padStart(5, "0")}.png`) })
    .catch(() => {});
}

await writeFile(
  path.join(outDir, "motion.json"),
  `${JSON.stringify(
    {
      url,
      viewport: { width, height },
      coverGoneAtMs: coverGone ? coverGone.t : null,
      maxScrollDuringCover,
      lockMechanisms: [...new Set(boot.map((s) => s.lock).filter(Boolean))],
      wheelBlockedTotal: boot.length ? boot[boot.length - 1].wheelBlocked : 0,
      digest,
      walk,
      failures: [...new Set(failures)],
    },
    null,
    2,
  )}\n`,
);

console.log(`cover gone at: ${coverGone ? `${coverGone.t}ms` : "still present at 9s"}`);
console.log(`scroll during cover: max ${maxScrollDuringCover}px`);
console.log(`lock mechanisms seen: ${[...new Set(boot.map((s) => s.lock).filter(Boolean))].join(", ") || "none"}`);
console.log(`frames: ${boot.length}, walk steps: ${walk.length}`);
console.log(`wrote ${outDir}`);

await browser.close();
