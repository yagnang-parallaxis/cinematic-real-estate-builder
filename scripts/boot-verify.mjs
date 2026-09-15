import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

/**
 * Boot verification. For each breakpoint, and with and without reduced motion:
 * forces scroll input while the cover is up, then checks that the page did not
 * travel, that the lock was released when the cover left, and that scrolling
 * works afterwards.
 *
 * Usage: node scripts/boot-verify.mjs [url]
 */
const url = process.argv[2] ?? "http://localhost:3000/";
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, ".screenshots", "boot-verify");
await mkdir(outDir, { recursive: true });

const SIZES = [
  { label: "390", width: 390, height: 844 },
  { label: "834", width: 834, height: 1112 },
  { label: "1440", width: 1440, height: 900 },
];

const browser = await chromium.launch();
let failed = 0;

for (const size of SIZES) {
  for (const calm of [false, true]) {
    const tag = `${size.label}${calm ? "-calm" : ""}`;
    const context = await browser.newContext({
      viewport: { width: size.width, height: size.height },
      deviceScaleFactor: 1,
      reducedMotion: calm ? "reduce" : "no-preference",
      hasTouch: size.width < 992,
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e).slice(0, 160)));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text().slice(0, 160));
    });

    await page.goto(url, { waitUntil: "commit", timeout: 60000 });
    await page.waitForTimeout(900);

    const coverUp = await page.evaluate(() => Boolean(document.querySelector(".boot-plate")));
    for (let i = 0; i < 6; i += 1) {
      await page.mouse.wheel(0, 700);
      await page.keyboard.press("PageDown");
      await page.keyboard.press("End");
    }
    await page.waitForTimeout(300);
    const travelled = await page.evaluate(() => Math.round(scrollY));

    await page.waitForSelector(".boot-plate", { state: "detached", timeout: 20000 }).catch(() => {});
    await page.waitForFunction(
      () => document.documentElement.getAttribute("data-boot") === "open",
      null,
      { timeout: 20000 },
    ).catch(() => {});
    await page.waitForSelector(".curtain-stage", { state: "detached", timeout: 20000 }).catch(() => {});
    await page.waitForTimeout(400);
    const atUncover = await page.evaluate(() => ({
      y: Math.round(scrollY),
      locked: document.documentElement.hasAttribute("data-scroll-locked"),
      rootOverflow: document.documentElement.style.overflow || "",
      boot: document.documentElement.getAttribute("data-boot"),
      curtain: Boolean(document.querySelector(".curtain-stage")),
      heroTop: Math.round(document.getElementById("hero")?.getBoundingClientRect().top ?? 9999),
    }));

    await page.mouse.wheel(0, 900);
    await page.waitForTimeout(1400);
    const after = await page.evaluate(() => Math.round(scrollY));
    await page.screenshot({ path: path.join(outDir, `${tag}.png`) });

    const problems = [];
    if (!coverUp) problems.push("no cover at 900ms");
    if (travelled !== 0) problems.push(`page travelled ${travelled}px under the cover`);
    if (atUncover.y !== 0) problems.push(`uncovered at ${atUncover.y}px rather than the top`);
    if (atUncover.heroTop > 8) problems.push(`hero at ${atUncover.heroTop}px rather than the top`);
    if (atUncover.curtain) problems.push("gate still in the page after uncover");
    if (atUncover.boot !== "open") problems.push(`boot phase ${atUncover.boot} rather than open`);
    if (atUncover.locked || atUncover.rootOverflow === "hidden") problems.push("lock not released");
    if (after <= 0) problems.push("scroll dead after uncover");
    if (errors.length) problems.push(`console: ${[...new Set(errors)].join(" | ")}`);

    if (problems.length) failed += 1;
    console.log(`${problems.length ? "FAIL" : "ok  "} ${tag}  ${problems.join("; ")}`);

    await context.close();
  }
}

await browser.close();
console.log(failed ? `${failed} configuration(s) failed` : "all configurations pass");
process.exit(failed ? 1 : 0);
