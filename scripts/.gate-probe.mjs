import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

/**
 * Probe how the original (or local) gate/preloader behaves: first visit vs
 * reload, auto-play vs scroll-scrub, and whether a curtain remains as a first
 * screen after the sequence finishes.
 *
 * Usage: node scripts/.gate-probe.mjs [url] [label]
 */
const url = process.argv[2] ?? "https://www.era-residence.com/";
const label = process.argv[3] ?? "ref-gate";
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, ".screenshots", label);
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();

const snap = async (name) => {
  const state = await page.evaluate(() => {
    const sel = [
      "[class*='load']",
      "[class*='preloader']",
      "[class*='loader']",
      "[class*='cover']",
      "[class*='curtain']",
      "[class*='gate']",
      "[class*='intro']",
      "[id*='load']",
      "[id*='preloader']",
      ".boot-plate",
      "#opening",
      "#hero",
    ].join(",");
    const nodes = [...document.querySelectorAll(sel)].slice(0, 40).map((n) => {
      const cs = getComputedStyle(n);
      const r = n.getBoundingClientRect();
      return {
        tag: n.tagName.toLowerCase(),
        id: n.id,
        cls: (n.className || "").toString().slice(0, 120),
        display: cs.display,
        vis: cs.visibility,
        opacity: Number(cs.opacity).toFixed(3),
        pos: cs.position,
        z: cs.zIndex,
        rect: [Math.round(r.top), Math.round(r.left), Math.round(r.width), Math.round(r.height)],
        text: (n.textContent || "").trim().replace(/\s+/g, " ").slice(0, 60),
      };
    });
    let storage = {};
    try {
      storage = { ...sessionStorage };
    } catch {
      storage = { error: "blocked" };
    }
    let local = {};
    try {
      local = { ...localStorage };
    } catch {
      local = { error: "blocked" };
    }
    return {
      t: Math.round(performance.now()),
      href: location.href,
      htmlCls: document.documentElement.className.slice(0, 200),
      htmlAttr: [...document.documentElement.attributes].map((a) => `${a.name}=${a.value}`).slice(0, 20),
      bodyCls: document.body ? document.body.className.slice(0, 200) : "",
      scrollY: Math.round(scrollY),
      scrollH: document.documentElement.scrollHeight,
      overflow: getComputedStyle(document.documentElement).overflow,
      bodyOverflow: document.body ? getComputedStyle(document.body).overflow : "",
      h1: [...document.querySelectorAll("h1")].map((n) => n.textContent?.trim().slice(0, 50)),
      session: storage,
      local,
      nodes,
    };
  });
  await page.screenshot({ path: path.join(outDir, `${name}.png`) });
  return state;
};

await page.goto(url, { waitUntil: "commit", timeout: 60000 });
const a0 = await snap("01-commit");
await page.waitForTimeout(1500);
const a1 = await snap("02-1s");
await page.waitForTimeout(2500);
const a2 = await snap("03-4s");
await page.waitForTimeout(3500);
const a3 = await snap("04-7s");
await page.waitForTimeout(4000);
const a4 = await snap("05-11s");

/* Try to scroll while/after the sequence — does the gate stay a first screen? */
await page.mouse.wheel(0, 1200);
await page.waitForTimeout(800);
const a5 = await snap("06-wheeled");
await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
await page.waitForTimeout(600);
const a6 = await snap("07-back-top");

const firstVisit = { a0, a1, a2, a3, a4, a5, a6 };

await page.reload({ waitUntil: "commit", timeout: 60000 });
const b0 = await snap("08-reload-commit");
await page.waitForTimeout(1500);
const b1 = await snap("09-reload-1s");
await page.waitForTimeout(3500);
const b2 = await snap("10-reload-5s");
await page.mouse.wheel(0, 900);
await page.waitForTimeout(700);
const b3 = await snap("11-reload-wheeled");

const reload = { b0, b1, b2, b3 };

const summary = {
  url,
  firstVisit: {
    times: [a0.t, a1.t, a2.t, a3.t, a4.t],
    scrollY: [a0.scrollY, a1.scrollY, a2.scrollY, a3.scrollY, a4.scrollY, a5.scrollY, a6.scrollY],
    scrollH: [a0.scrollH, a1.scrollH, a4.scrollH, a6.scrollH],
    htmlCls: [a0.htmlCls, a2.htmlCls, a4.htmlCls],
    htmlAttr: [a0.htmlAttr, a2.htmlAttr, a4.htmlAttr],
    bodyCls: [a0.bodyCls, a2.bodyCls, a4.bodyCls],
    overflow: [a0.overflow, a2.overflow, a4.overflow],
    h1: [a0.h1, a4.h1, a6.h1],
    session: [a0.session, a4.session, a6.session],
    local: [a0.local, a4.local],
    nodeCount: [a0.nodes.length, a4.nodes.length],
    notable: {
      at1s: a1.nodes.filter((n) => n.display !== "none" && n.opacity !== "0.000" && n.rect[2] > 100),
      at7s: a3.nodes.filter((n) => n.display !== "none" && n.opacity !== "0.000" && n.rect[2] > 100),
      at11s: a4.nodes.filter((n) => n.display !== "none" && n.opacity !== "0.000" && n.rect[2] > 100),
      backTop: a6.nodes.filter((n) => n.display !== "none" && n.opacity !== "0.000" && n.rect[2] > 100),
    },
  },
  reload: {
    times: [b0.t, b1.t, b2.t],
    scrollY: [b0.scrollY, b1.scrollY, b2.scrollY, b3.scrollY],
    htmlCls: [b0.htmlCls, b2.htmlCls],
    htmlAttr: [b0.htmlAttr, b2.htmlAttr],
    bodyCls: [b0.bodyCls, b2.bodyCls],
    session: [b0.session, b2.session],
    h1: [b0.h1, b2.h1],
    notable: {
      at1s: b1.nodes.filter((n) => n.display !== "none" && n.opacity !== "0.000" && n.rect[2] > 100),
      at5s: b2.nodes.filter((n) => n.display !== "none" && n.opacity !== "0.000" && n.rect[2] > 100),
    },
  },
};

await writeFile(path.join(outDir, "probe.json"), JSON.stringify({ summary, firstVisit, reload }, null, 2));
console.log(JSON.stringify(summary, null, 2));
await browser.close();
