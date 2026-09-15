import { chromium } from "playwright";

const url = process.env.PROTOTYPE_URL ?? "http://localhost:3000";
const selector = process.argv[2];
const width = Number(process.argv[3] ?? 1440);
const height = Number(process.argv[4] ?? 900);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height } });
await page.goto(url, { waitUntil: "load" });
await page.waitForSelector(".boot-plate", { state: "detached", timeout: 20000 }).catch(() => {});

const target = await page.$(selector);
if (target) {
  await target.scrollIntoViewIfNeeded();
}
await page.waitForTimeout(2000);

const report = await page.evaluate((sel) => {
  const nodes = [...document.querySelectorAll(sel)];
  return nodes.slice(0, 6).map((node) => {
    const rect = node.getBoundingClientRect();
    const style = getComputedStyle(node);
    return {
      cls: node.className.toString().slice(0, 70),
      revealed: node.getAttribute("data-revealed"),
      rect: {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        w: Math.round(rect.width),
        h: Math.round(rect.height),
      },
      clipPath: style.clipPath,
      opacity: style.opacity,
      transform: style.transform,
      fontSize: style.fontSize,
      text: (node.textContent ?? "").trim().slice(0, 60),
    };
  });
}, selector);

console.log(JSON.stringify(report, null, 2));
await browser.close();
