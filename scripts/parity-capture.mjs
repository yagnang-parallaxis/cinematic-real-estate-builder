import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

/**
 * Side-by-side parity capture. Walks one URL at a given viewport, writing a
 * screenshot filmstrip plus a JSON probe of the computed type scale, font
 * stacks, section inventory and horizontal-overflow offenders.
 *
 * Usage: node scripts/parity-capture.mjs <url> <label> [width] [height] [steps]
 */
const url = process.argv[2];
const label = process.argv[3];
const width = Number(process.argv[4] ?? 1440);
const height = Number(process.argv[5] ?? 900);
const maxSteps = Number(process.argv[6] ?? 14);

if (!url || !label) {
  console.error("usage: node scripts/parity-capture.mjs <url> <label> [w] [h] [steps]");
  process.exit(1);
}

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, ".screenshots", label);
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width, height },
  deviceScaleFactor: 1,
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
});

const failures = [];
page.on("requestfailed", (request) => {
  failures.push(`${request.failure()?.errorText} ${request.url().slice(0, 140)}`);
});
page.on("console", (message) => {
  if (message.type() === "error") failures.push(`console: ${message.text().slice(0, 240)}`);
});

await page.goto(url, { waitUntil: "load", timeout: 60000 });
await page.addStyleTag({
  content:
    "nextjs-portal, [data-next-badge-root], [data-nextjs-dev-indicator] { display: none !important; }",
});
await page.waitForTimeout(4500);
await page.waitForSelector(".boot-plate", { state: "detached", timeout: 12000 }).catch(() => {});
await page.waitForTimeout(1200);

const probe = await page.evaluate(() => {
  const styleOf = (selector) => {
    const node = document.querySelector(selector);
    if (!node) return null;
    const cs = getComputedStyle(node);
    return {
      selector,
      fontFamily: cs.fontFamily,
      fontSize: cs.fontSize,
      lineHeight: cs.lineHeight,
      letterSpacing: cs.letterSpacing,
      textTransform: cs.textTransform,
      color: cs.color,
    };
  };

  const overflow = [];
  const docWidth = document.documentElement.clientWidth;
  for (const node of document.querySelectorAll("body *")) {
    const rect = node.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;
    if (rect.right > docWidth + 1 || rect.left < -1) {
      overflow.push({
        tag: node.tagName.toLowerCase(),
        cls: String(node.className ?? "").slice(0, 70),
        left: Math.round(rect.left),
        right: Math.round(rect.right),
      });
    }
    if (overflow.length > 40) break;
  }

  const logo = document.querySelector(".nav-logo");
  const rail = document.querySelector(".nav-rail");
  const chromeBottom = Math.max(
    logo?.getBoundingClientRect().bottom ?? 0,
    rail?.getBoundingClientRect().bottom ?? 0,
  );
  const decorInChrome = [...document.querySelectorAll(".decor-safe:not(.decor-bleed)")]
    .filter((node) => {
      const rect = node.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return false;
      const onScreen =
        rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth;
      return onScreen && rect.top < chromeBottom - 1;
    })
    .map((node) => ({
      cls: String(node.className ?? "").slice(0, 70),
      top: Math.round(node.getBoundingClientRect().top),
      chromeBottom: Math.round(chromeBottom),
    }));

  const chrome = document.querySelector(".nav-chrome");

  const headings = [...document.querySelectorAll("h1,h2,h3")].slice(0, 24).map((node) => {
    const cs = getComputedStyle(node);
    return {
      tag: node.tagName.toLowerCase(),
      text: (node.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 46),
      fontFamily: cs.fontFamily.split(",")[0],
      fontSize: cs.fontSize,
      lineHeight: cs.lineHeight,
      letterSpacing: cs.letterSpacing,
    };
  });

  const sections = [...document.querySelectorAll("section, [data-tone], main > div")]
    .slice(0, 40)
    .map((node) => ({
      tag: node.tagName.toLowerCase(),
      id: node.id || null,
      tone: node.getAttribute("data-tone"),
      cls: String(node.className ?? "").slice(0, 60),
      h: Math.round(node.getBoundingClientRect().height),
    }));

  return {
    url: location.href,
    viewport: { w: innerWidth, h: innerHeight },
    scrollHeight: document.documentElement.scrollHeight,
    docScrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    fonts: [...new Set([...document.fonts].map((f) => `${f.family} ${f.weight} ${f.status}`))],
    body: styleOf("body"),
    h1: styleOf("h1"),
    headings,
    sections,
    overflow: overflow.slice(0, 25),
    chrome: {
      contrast: chrome?.getAttribute("data-nav-contrast") ?? null,
      scrim: chrome?.hasAttribute("data-nav-scrim") ?? false,
      bandBottom: Math.round(chromeBottom),
      decorInChrome,
    },
  };
});

await writeFile(path.join(outDir, "probe.json"), JSON.stringify(probe, null, 2));
const steps = Math.min(maxSteps, Math.max(1, Math.ceil(probe.scrollHeight / (height * 0.9))));
const chromeHits = [...(probe.chrome?.decorInChrome ?? [])];
for (let step = 0; step < steps; step += 1) {
  const y = Math.round(step * height * 0.9);
  await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
  await page.waitForTimeout(1000);
  const stepChrome = await page.evaluate(() => {
    const logo = document.querySelector(".nav-logo");
    const rail = document.querySelector(".nav-rail");
    const chromeBottom = Math.max(
      logo?.getBoundingClientRect().bottom ?? 0,
      rail?.getBoundingClientRect().bottom ?? 0,
    );
    return [...document.querySelectorAll(".decor-safe:not(.decor-bleed)")]
      .filter((node) => {
        const rect = node.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return false;
        const onScreen =
          rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth;
        return onScreen && rect.top < chromeBottom - 1;
      })
      .map((node) => String(node.className ?? "").slice(0, 70));
  });
  chromeHits.push(...stepChrome.map((cls) => ({ y, cls })));
  await page.screenshot({ path: path.join(outDir, `${String(step).padStart(2, "0")}-y${y}.png`) });
}

console.log(
  JSON.stringify(
    {
      label,
      width,
      scrollHeight: probe.scrollHeight,
      horizontalOverflow: probe.horizontalOverflow,
      overflowCount: probe.overflow.length,
      decorInChrome: chromeHits.length,
    },
    null,
    2,
  ),
);

if (failures.length) {
  console.log("--- errors ---");
  console.log([...new Set(failures)].slice(0, 20).join("\n"));
}

await browser.close();
