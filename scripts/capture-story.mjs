import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const url = process.env.PROTOTYPE_URL ?? "http://localhost:3000";
const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".screenshots/story");
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

async function prepare(page, band = "intro") {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(2400);
  await page.evaluate((target) => {
    const story = document.querySelector("#story");
    const intro = document.querySelector(".story-intro");
    const browserEl = document.querySelector(".story-browser");
    const node = target === "browser" ? browserEl : intro ?? story;
    node?.scrollIntoView({ block: "start" });
  }, band);
  await page.waitForTimeout(800);
}

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport });
  await prepare(page, "intro");
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
        fontSize: computed.fontSize,
        display: computed.display,
      };
    };
    const story = document.querySelector("#story");
    return {
      tone: story?.getAttribute("data-nav-tone"),
      nav: document.querySelector(".nav-chrome")?.getAttribute("data-nav-contrast"),
      title: box(document.querySelector(".story-title")),
      flanks: box(document.querySelector(".story-flanks")),
      tagline: box(document.querySelector(".story-tagline")),
      slideTitle: box(document.querySelector(".story-slide-title")),
      media: box(document.querySelector(".story-slide-media")),
      pag: box(document.querySelector(".story-pag")),
    };
  });
  console.log(JSON.stringify({ name: viewport.name, band: "intro", ...metrics }, null, 2));
  await page.screenshot({ path: path.join(outDir, `${viewport.name}-intro.png`) });
  await page.close();
}

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport });
  await prepare(page, "browser");
  await page.screenshot({ path: path.join(outDir, `${viewport.name}-slide.png`) });
  const next = page.getByRole("button", { name: /next reason/i });
  if (await next.count()) {
    await next.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(outDir, `${viewport.name}-slide-2.png`) });
  }
  await page.close();
}

await browser.close();
