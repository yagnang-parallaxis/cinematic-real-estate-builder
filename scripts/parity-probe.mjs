import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

/**
 * Deep type/spacing probe used for reference parity work. Samples the largest
 * rendered instance of each text role plus nav chrome, so the local scale can
 * be lined up against the reference tier by tier.
 *
 * Usage: node scripts/parity-probe.mjs <url> <label> [width] [height]
 */
const url = process.argv[2];
const label = process.argv[3];
const width = Number(process.argv[4] ?? 1440);
const height = Number(process.argv[5] ?? 900);

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, ".screenshots", label);
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height } });
await page.goto(url, { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(5000);
await page.waitForSelector(".boot-plate", { state: "detached", timeout: 12000 }).catch(() => {});
await page.waitForTimeout(800);

const data = await page.evaluate(() => {
  const round = (value) => Math.round(Number.parseFloat(value) * 100) / 100;

  const buckets = new Map();
  for (const node of document.querySelectorAll("body *")) {
    const text = (node.textContent ?? "").trim();
    if (!text) continue;
    const hasOwnText = [...node.childNodes].some(
      (child) => child.nodeType === 3 && (child.textContent ?? "").trim().length > 1,
    );
    if (!hasOwnText) continue;
    const cs = getComputedStyle(node);
    const size = round(cs.fontSize);
    const key = `${node.tagName.toLowerCase()}|${size}|${cs.fontFamily.split(",")[0].replace(/"/g, "")}`;
    if (!buckets.has(key)) {
      buckets.set(key, {
        tag: node.tagName.toLowerCase(),
        fontSize: size,
        family: cs.fontFamily.split(",")[0].replace(/"/g, ""),
        weight: cs.fontWeight,
        lineHeight: round(cs.lineHeight),
        lhRatio: round(Number.parseFloat(cs.lineHeight) / Number.parseFloat(cs.fontSize)),
        letterSpacing: cs.letterSpacing,
        transform: cs.textTransform,
        count: 0,
        sample: text.replace(/\s+/g, " ").slice(0, 40),
      });
    }
    buckets.get(key).count += 1;
  }

  const roles = [...buckets.values()].sort((a, b) => b.fontSize - a.fontSize);

  const sections = [...document.querySelectorAll("main section, main > div > section, section")]
    .map((node) => {
      const rect = node.getBoundingClientRect();
      const cs = getComputedStyle(node);
      return {
        cls: String(node.className ?? "").slice(0, 44),
        id: node.id || null,
        height: Math.round(rect.height),
        vh: Math.round((rect.height / innerHeight) * 100) / 100,
        padTop: cs.paddingTop,
        padBottom: cs.paddingBottom,
        padLeft: cs.paddingLeft,
        bg: cs.backgroundColor,
      };
    })
    .filter((s) => s.height > 40);

  return {
    viewport: { w: innerWidth, h: innerHeight },
    scrollHeight: document.documentElement.scrollHeight,
    vhCount: Math.round((document.documentElement.scrollHeight / innerHeight) * 10) / 10,
    roles: roles.slice(0, 34),
    sectionCount: sections.length,
    sections: sections.slice(0, 30),
  };
});

await writeFile(path.join(outDir, "typeprobe.json"), JSON.stringify(data, null, 2));
console.log(
  `${label}: ${data.roles.length} roles, ${data.sectionCount} sections, ${data.vhCount}vh`,
);
await browser.close();
