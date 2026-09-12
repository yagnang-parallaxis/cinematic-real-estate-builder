import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const url = process.env.PROTOTYPE_URL ?? "http://localhost:3000";
const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".screenshots/hero");
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
  await page.evaluate(() => window.scrollTo(0, 0));
}

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport });
  await prepare(page);
  const metrics = await page.evaluate(() => {
    const title = document.querySelector(".hero-title");
    const place = document.querySelector(".hero-place");
    const tabs = document.querySelector(".hero-tabs");
    const cta = document.querySelector(".hero-cta");
    const pins = document.querySelector(".hero-pins");
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
      title: box(title),
      place: box(place),
      tabs: box(tabs),
      cta: box(cta),
      pins: pins ? getComputedStyle(pins).display : null,
    };
  });
  console.log(JSON.stringify({ name: viewport.name, ...metrics }, null, 2));
  await page.screenshot({ path: path.join(outDir, `${viewport.name}.png`) });
  await page.close();
}

const night = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await prepare(night);
const nightTab = night.getByRole("tab", { name: /by night/i });
if (await nightTab.count()) {
  await nightTab.click();
  await night.waitForTimeout(500);
  await night.screenshot({ path: path.join(outDir, "1440x900-night.png") });
}

await browser.close();
