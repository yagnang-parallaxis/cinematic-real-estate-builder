import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const url = process.env.PROTOTYPE_URL ?? "http://localhost:3000";
const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".screenshots/nav");
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
  await page.waitForTimeout(1800);
  await page.evaluate(() => window.scrollTo(0, 0));
}

async function measure(page) {
  return page.evaluate(() => {
    const logo = document.querySelector(".nav-logo");
    const rail = document.querySelector(".nav-rail");
    const progress = document.querySelector(".nav-progress");
    const scroll = document.querySelector(".nav-scroll");
    const menu = document.querySelector(".nav-menu-btn");
    const desk = document.querySelector(".nav-rail-desk");
    const styles = (el) => {
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
        color: computed.color,
      };
    };
    return {
      viewport: { w: window.innerWidth, h: window.innerHeight },
      offset: getComputedStyle(document.documentElement).getPropertyValue("--nav-offset").trim(),
      cell: getComputedStyle(document.documentElement).getPropertyValue("--nav-cell").trim(),
      logo: styles(logo),
      rail: styles(rail),
      progress: styles(progress),
      scroll: styles(scroll),
      menu: styles(menu),
      desk: styles(desk),
    };
  });
}

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport });
  await prepare(page);
  const metrics = await measure(page);
  console.log(JSON.stringify({ name: viewport.name, ...metrics }, null, 2));
  await page.screenshot({ path: path.join(outDir, `${viewport.name}.png`) });
  await page.close();
}

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await prepare(mobile);
const menuButton = mobile.getByRole("button", { name: /menu/i });
if (await menuButton.count()) {
  await menuButton.click();
  await mobile.waitForTimeout(600);
  await mobile.screenshot({ path: path.join(outDir, "390x844-menu.png") });
}

const desktopHover = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await prepare(desktopHover);
const primary = desktopHover.locator(".nav-primary");
if (await primary.count()) {
  await primary.hover();
  await desktopHover.waitForTimeout(400);
  await desktopHover.screenshot({ path: path.join(outDir, "1440x900-hover.png") });
}

await browser.close();
