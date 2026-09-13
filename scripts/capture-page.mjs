import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

/**
 * Walks the homepage top to bottom and writes one screenshot per scroll step,
 * so section work can be reviewed as a filmstrip.
 *
 * Usage: node scripts/capture-page.mjs [outputName] [width] [height]
 */
const url = process.env.PROTOTYPE_URL ?? "http://localhost:3000";
const label = process.argv[2] ?? "walk";
const width = Number(process.argv[3] ?? 1440);
const height = Number(process.argv[4] ?? 900);

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, ".screenshots", label);
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height } });

const failures = [];
page.on("requestfailed", (request) => {
  failures.push(`${request.failure()?.errorText} ${request.url().slice(0, 120)}`);
});
page.on("console", (message) => {
  if (message.type() === "error") {
    failures.push(`console: ${message.text().slice(0, 200)}`);
  }
});

await page.goto(url, { waitUntil: "load" });
await page.waitForTimeout(3000);

const total = await page.evaluate(() => document.body.scrollHeight);
const steps = Math.min(40, Math.ceil(total / (height * 0.9)));
console.log(JSON.stringify({ label, width, height, scrollHeight: total, steps }));

for (let step = 0; step < steps; step += 1) {
  const y = Math.round(step * height * 0.9);
  await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
  await page.waitForTimeout(900);
  await page.screenshot({
    path: path.join(outDir, `${String(step).padStart(2, "0")}-y${y}.png`),
  });
}

if (failures.length) {
  console.log("--- page errors ---");
  console.log([...new Set(failures)].slice(0, 25).join("\n"));
}

await browser.close();
