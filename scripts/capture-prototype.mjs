import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const url = process.env.PROTOTYPE_URL ?? "http://localhost:3000";
const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".screenshots");

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();

async function capture(name, viewport) {
  const page = await browser.newPage({ viewport });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  const file = path.join(outDir, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  await page.close();
  console.log(`wrote ${file}`);
}

await capture("desktop", { width: 1440, height: 900 });
await capture("mobile", { width: 390, height: 844 });

const mobileMenu = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobileMenu.goto(url, { waitUntil: "networkidle" });
const menuButton = mobileMenu.getByRole("button", { name: "Menu" });
const loader = mobileMenu.locator('[role="status"][aria-busy="true"]');
if ((await menuButton.count()) && !(await loader.count())) {
  await menuButton.click();
  await mobileMenu.waitForTimeout(500);
  await mobileMenu.screenshot({
    path: path.join(outDir, "mobile-menu.png"),
    fullPage: true,
  });
}
await mobileMenu.close();

await browser.close();
