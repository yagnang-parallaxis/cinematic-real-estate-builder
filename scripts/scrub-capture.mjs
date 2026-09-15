import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

/**
 * Scrub capture. Walks an absolute scroll range in fine steps, writing one
 * screenshot per step plus, at each step, the on-screen bounds of every text
 * run and image so a seam can be judged by numbers rather than by eye.
 *
 * Usage: node scripts/scrub-capture.mjs <url> <label> <fromPx> <toPx> <steps> [w] [h]
 */
const [url, label] = process.argv.slice(2);
const from = Number(process.argv[4] ?? 0);
const to = Number(process.argv[5] ?? 4000);
const steps = Number(process.argv[6] ?? 12);
const width = Number(process.argv[7] ?? 1440);
const height = Number(process.argv[8] ?? 900);

if (!url || !label) {
  console.error("usage: node scripts/scrub-capture.mjs <url> <label> <from> <to> <steps> [w] [h]");
  process.exit(1);
}

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, ".screenshots", `scrub-${label}`);
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(6500);

const report = [];
const stride = (to - from) / Math.max(1, steps - 1);

for (let i = 0; i < steps; i += 1) {
  const y = Math.round(from + stride * i);
  await page.evaluate((top) => scrollTo({ top, behavior: "instant" }), y);
  await page.waitForTimeout(500);

  const frame = await page.evaluate(() => {
    const vw = innerWidth;
    const vh = innerHeight;
    const clipped = [];
    const visible = [];

    for (const node of document.querySelectorAll("h1,h2,h3,p,span,text,textPath,img,svg")) {
      const r = node.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) continue;
      if (r.bottom < 0 || r.top > vh || r.right < 0 || r.left > vw) continue;
      const cs = getComputedStyle(node);
      if (cs.visibility === "hidden" || Number(cs.opacity) < 0.05) continue;
      const label = `${node.tagName.toLowerCase()}.${(node.className || "").toString().slice(0, 30)}`;
      const box = [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)];
      visible.push({ label, box });
      /* A text run leaving the viewport on any edge is a clipped seam. */
      const isText = !["img", "svg"].includes(node.tagName.toLowerCase());
      if (isText && (r.left < -1 || r.right > vw + 1 || r.top < -1 || r.bottom > vh + 1)) {
        clipped.push({ label, box, text: (node.textContent || "").trim().slice(0, 34) });
      }
    }

    return { scrollY: Math.round(scrollY), clipped: clipped.slice(0, 12), count: visible.length };
  });

  report.push(frame);
  await page.screenshot({ path: path.join(outDir, `y-${String(y).padStart(6, "0")}.png`) });
}

await writeFile(
  path.join(outDir, "scrub.json"),
  `${JSON.stringify({ url, from, to, steps, viewport: { width, height }, report }, null, 2)}\n`,
);

for (const f of report) {
  console.log(
    `y=${f.scrollY} visible=${f.count} clipped=${f.clipped.length}${
      f.clipped.length ? ` → ${f.clipped.map((c) => `${c.label}[${c.box}]`).join(" ")}` : ""
    }`,
  );
}
console.log(`wrote ${outDir}`);

await browser.close();
