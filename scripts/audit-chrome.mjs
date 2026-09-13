import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

/**
 * The navigation is fixed, so every section has to keep its own content clear
 * of the chrome's corners. This walks the page and reports any element that
 * overlaps the logo, the link rail, the progress column or the scroll cue.
 */
const url = process.env.PROTOTYPE_URL ?? "http://localhost:3000";
const width = Number(process.argv[2] ?? 1440);
const height = Number(process.argv[3] ?? 900);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height } });
await page.goto(url, { waitUntil: "load" });
await page.waitForSelector(".loader", { state: "detached", timeout: 20000 }).catch(() => {});
await page.waitForTimeout(1200);

const total = await page.evaluate(() => document.body.scrollHeight);
const steps = Math.ceil(total / (height * 0.75));
const seen = new Map();

for (let step = 0; step < steps; step += 1) {
  await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), step * height * 0.75);
  await page.waitForTimeout(320);

  const hits = await page.evaluate(() => {
    const chrome = [".nav-logo", ".nav-rail", ".nav-progress", ".nav-scroll"]
      .map((selector) => {
        const node = document.querySelector(selector);
        if (!node || getComputedStyle(node).display === "none") {
          return null;
        }
        return { selector, rect: node.getBoundingClientRect() };
      })
      .filter(Boolean);

    const overlaps = (a, b) =>
      a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

    const results = [];
    const candidates = document.querySelectorAll(
      "main h1, main h2, main h3, main h4, main p, main a, main button, main img, main li",
    );

    for (const node of candidates) {
      if (node.closest(".nav-chrome, .loader, .enquiry-modal")) {
        continue;
      }
      const style = getComputedStyle(node);
      if (style.visibility === "hidden" || style.display === "none" || style.opacity === "0") {
        continue;
      }
      const rect = node.getBoundingClientRect();
      if (rect.width < 4 || rect.height < 4 || rect.bottom < 0 || rect.top > window.innerHeight) {
        continue;
      }

      for (const item of chrome) {
        if (!overlaps(rect, item.rect)) {
          continue;
        }
        const section = node.closest("[data-tone]");
        results.push({
          chrome: item.selector,
          section: section?.id || section?.getAttribute("data-tone") || "unknown",
          tag: node.tagName.toLowerCase(),
          cls: (node.className?.baseVal ?? node.className ?? "").toString().split(" ")[0],
          text: (node.textContent ?? "").trim().slice(0, 40),
        });
      }
    }
    return results;
  });

  for (const hit of hits) {
    const key = `${hit.section} | ${hit.chrome} | ${hit.tag}.${hit.cls}`;
    if (!seen.has(key)) {
      seen.set(key, hit.text);
    }
  }
}

console.log(`viewport ${width}x${height} — ${seen.size} collision(s)\n`);
for (const [key, text] of [...seen.entries()].sort()) {
  console.log(`${key}\n    "${text}"`);
}

await browser.close();
