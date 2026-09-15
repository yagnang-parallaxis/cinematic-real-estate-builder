import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

/**
 * Cover timeline. Watches one selector (the preloader / cover layer) and every
 * descendant from navigation onward, recording per frame the properties that
 * actually carry a cover's exit — opacity, clip-path, transform, visibility,
 * display — plus the class list, since most cover choreography is driven by a
 * class flip rather than by inline style.
 *
 * Usage: node scripts/cover-timeline.mjs <url> <label> <coverSelector> [w] [h]
 */
const [url, label, selector] = process.argv.slice(2);
const width = Number(process.argv[5] ?? 1440);
const height = Number(process.argv[6] ?? 900);

if (!url || !label || !selector) {
  console.error("usage: node scripts/cover-timeline.mjs <url> <label> <coverSelector> [w] [h]");
  process.exit(1);
}

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, ".screenshots", `cover-${label}`);
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });

await page.addInitScript((sel) => {
  const w = /** @type {Record<string, unknown>} */ (window);
  const frames = [];
  w.__coverFrames = frames;
  const t0 = performance.now();

  const snap = (node) => {
    const cs = getComputedStyle(node);
    const r = node.getBoundingClientRect();
    return {
      cls: (node.className || "").toString().slice(0, 90),
      tag: node.tagName.toLowerCase(),
      display: cs.display,
      visibility: cs.visibility,
      opacity: Number(cs.opacity).toFixed(3),
      clip: cs.clipPath === "none" ? "" : cs.clipPath,
      transform: cs.transform === "none" ? "" : cs.transform,
      rect: [Math.round(r.top), Math.round(r.height)],
      text: (node.textContent || "").trim().slice(0, 40),
    };
  };

  const tick = () => {
    const t = Math.round(performance.now() - t0);
    const host = document.querySelector(sel);
    frames.push({
      t,
      exists: Boolean(host),
      host: host ? snap(host) : null,
      kids: host ? [...host.querySelectorAll("*")].slice(0, 14).map(snap) : [],
      htmlCls: document.documentElement.className.slice(0, 120),
      bodyCls: document.body ? document.body.className.slice(0, 120) : "",
      scrollY: Math.round(scrollY),
      scrollH: document.documentElement.scrollHeight,
    });
    if (t < 10000) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}, selector);

await page.goto(url, { waitUntil: "commit", timeout: 60000 });
await page.waitForTimeout(10500);

const frames = await page.evaluate(() => window.__coverFrames ?? []);

/* Report only the frames where something the eye could notice changed. */
const key = (f) =>
  JSON.stringify([
    f.exists,
    f.host && [f.host.display, f.host.visibility, f.host.opacity, f.host.clip, f.host.transform],
    f.kids.map((k) => [k.cls, k.opacity, k.clip, k.transform, k.rect[0]]),
    f.htmlCls,
    f.bodyCls,
    f.scrollH,
  ]);

const changes = [];
let prev = null;
for (const f of frames) {
  const k = key(f);
  if (k !== prev) {
    changes.push(f);
    prev = k;
  }
}

await writeFile(
  path.join(outDir, "cover.json"),
  `${JSON.stringify({ url, selector, viewport: { width, height }, frames: frames.length, changes }, null, 2)}\n`,
);

const gone = frames.find((f) => f.t > 200 && (!f.exists || f.host.display === "none"));
console.log(`frames ${frames.length}, change points ${changes.length}`);
console.log(`cover removed/hidden at: ${gone ? `${gone.t}ms` : "not within 10s"}`);
console.log(`wrote ${outDir}/cover.json`);

await browser.close();
