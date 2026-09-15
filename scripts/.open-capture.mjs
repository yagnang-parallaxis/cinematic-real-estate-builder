import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const url = process.argv[2] ?? "http://localhost:3000/";
const label = process.argv[3] ?? "open";
const width = Number(process.argv[4] ?? 1440);
const height = Number(process.argv[5] ?? 900);
const calm = process.argv[6] === "calm";
const out = `.screenshots/${label}`;
await mkdir(out, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width, height },
  deviceScaleFactor: 1,
  reducedMotion: calm ? "reduce" : "no-preference",
  hasTouch: width < 992,
});
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 200)); });

await page.goto(url, { waitUntil: "commit", timeout: 60000 });
await page.waitForTimeout(900);
await page.screenshot({ path: `${out}/a-boot.png` });
await page.waitForSelector(".boot-plate", { state: "detached", timeout: 25000 }).catch(() => {});
await page.waitForTimeout(1700);
await page.screenshot({ path: `${out}/b-composed.png` });

const geo = await page.evaluate(() => {
  const spacer = document.querySelector("#opening");
  const hero = document.getElementById("hero");
  return {
    run: spacer ? Math.round(spacer.getBoundingClientRect().height) : null,
    heroTop: hero ? Math.round(hero.getBoundingClientRect().top + scrollY) : null,
    heroRunway: hero ? Math.round(hero.getBoundingClientRect().height) : null,
    docHeight: document.documentElement.scrollHeight,
    h1: [...document.querySelectorAll("h1")].map((n) => n.textContent?.trim().slice(0, 40)),
  };
});
console.log(JSON.stringify({ label, ...geo }, null, 2));

const run = geo.run ?? height * 2;
for (const frac of [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1]) {
  const y = Math.round(run * frac);
  await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${out}/c-${String(Math.round(frac * 100)).padStart(3, "0")}-y${y}.png` });
}
/* Past the seam: the hero's own runway. */
for (const extra of [200, 700, 1400]) {
  const y = run + extra;
  await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${out}/d-hero+${extra}.png` });
}
/* Back to the top: the rise must retrace. */
await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
await page.waitForTimeout(700);
await page.screenshot({ path: `${out}/e-back-to-top.png` });

if (errors.length) console.log("errors:", [...new Set(errors)].join(" | "));
await browser.close();
