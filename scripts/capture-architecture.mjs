import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const url = process.env.PROTOTYPE_URL ?? "http://localhost:3000";
const outDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  ".screenshots/architecture",
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

async function prepare(page) {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(2400);
  await page.evaluate(() => {
    document.querySelector("#architecture")?.scrollIntoView({ block: "end" });
  });
  await page.waitForTimeout(1400);
}

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport });
  await prepare(page);
  const metrics = await page.evaluate(() => {
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
    const section = document.querySelector("#architecture");
    return {
      tone: section?.getAttribute("data-nav-tone"),
      nav: document.querySelector(".nav-chrome")?.getAttribute("data-nav-contrast"),
      heading: box(document.querySelector(".architecture-heading")),
      quote: box(document.querySelector(".architecture-quote")),
      materials: box(document.querySelector(".architecture-materials")),
      cta: box(document.querySelector(".architecture-cta")),
      ctaWrap: box(document.querySelector(".architecture-cta-wrap")),
    };
  });
  console.log(JSON.stringify({ name: viewport.name, ...metrics }, null, 2));
  await page.screenshot({ path: path.join(outDir, `${viewport.name}.png`) });
  await page.close();
}

await browser.close();
