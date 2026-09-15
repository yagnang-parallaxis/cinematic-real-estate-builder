import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const url = process.argv[2] ?? "http://localhost:3000/";
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, ".screenshots", "gate-local");
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e).slice(0, 160)));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text().slice(0, 160));
});

const snap = async (name) => {
  const state = await page.evaluate(() => ({
    boot: document.documentElement.getAttribute("data-boot"),
    plate: Boolean(document.querySelector(".boot-plate")),
    curtain: Boolean(document.querySelector(".curtain-stage")),
    opening: Boolean(document.querySelector(".home-open.is-opening")),
    locked: document.documentElement.hasAttribute("data-scroll-locked"),
    scrollY: Math.round(scrollY),
    heroTop: Math.round(document.getElementById("hero")?.getBoundingClientRect().top ?? 9999),
    h1: [...document.querySelectorAll("h1")].map((n) => n.textContent?.trim().slice(0, 40)),
    seen: sessionStorage.getItem("cinematic:boot-seen"),
  }));
  await page.screenshot({ path: path.join(outDir, `${name}.png`) });
  return state;
};

await page.goto(url, { waitUntil: "commit", timeout: 60000 });
const a0 = await snap("01-commit");
await page.waitForTimeout(1500);
const a1 = await snap("02-1s");
await page.waitForFunction(
  () => document.documentElement.getAttribute("data-boot") === "gate",
  null,
  { timeout: 20000 },
).catch(() => {});
await page.waitForTimeout(1200);
const aGate = await snap("03-gate");
await page.waitForFunction(
  () =>
    document.documentElement.getAttribute("data-boot") === "open" &&
    !document.querySelector(".curtain-stage"),
  null,
  { timeout: 25000 },
);
await page.waitForTimeout(400);
const a2 = await snap("04-open");
await page.mouse.wheel(0, 900);
await page.waitForTimeout(800);
const a3 = await snap("05-wheeled");

await page.reload({ waitUntil: "commit", timeout: 60000 });
const b0 = await snap("05-reload-commit");
await page.waitForTimeout(1200);
const b1 = await snap("06-reload-1s");

console.log(JSON.stringify({ first: { a0, a1, aGate, a2, a3 }, reload: { b0, b1 }, errors }, null, 2));
await browser.close();
