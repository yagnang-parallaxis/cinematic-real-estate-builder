import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

/*
 * The branded composition is the page's own first screen now, not the cover, so
 * this waits the boot plate out rather than pinning it up with `?loader=1`.
 */
const url = process.env.PROTOTYPE_URL ?? "http://localhost:3000/";
const outDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  ".screenshots/loading",
);
await mkdir(outDir, { recursive: true });

const viewports = [
  { name: "1440x900", width: 1440, height: 900 },
  { name: "1280x800", width: 1280, height: 800 },
  { name: "1024x768", width: 1024, height: 768 },
  { name: "768x1024", width: 768, height: 1024 },
  { name: "430x932", width: 430, height: 932 },
  { name: "390x844", width: 390, height: 844 },
];

const browser = await chromium.launch();

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForSelector(".boot-plate", { state: "detached", timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(1600);
  const metrics = await page.evaluate(() => {
    const stage = document.querySelector(".curtain-stage");
    const flank = document.querySelector(".curtain-flank");
    const title = document.querySelector(".curtain-stage .hero-title");
    const place = document.querySelector(".curtain-stage .hero-place");
    const bar = document.querySelector(".curtain-tagline");
    const box = (el) => {
      if (!el) {
        return null;
      }
      const rect = el.getBoundingClientRect();
      const computed = getComputedStyle(el);
      return {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        w: Math.round(rect.width),
        h: Math.round(rect.height),
        display: computed.display,
        fontSize: computed.fontSize,
      };
    };
    return {
      visible: Boolean(stage),
      title: title?.textContent,
      place: place?.textContent,
      flank: box(flank),
      wordmark: box(title),
      placeBox: box(place),
      tagline: box(bar),
    };
  });
  console.log(JSON.stringify({ name: viewport.name, ...metrics }, null, 2));
  await page.screenshot({ path: path.join(outDir, `${viewport.name}.png`) });
  await page.close();
}

await browser.close();
