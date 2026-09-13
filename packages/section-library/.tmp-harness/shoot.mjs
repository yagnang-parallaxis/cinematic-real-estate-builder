import { readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { chromium } from "playwright";

const dir = new URL("./", import.meta.url).pathname;
const template = readFileSync(`${dir}page.html`, "utf8");
const section = readFileSync(`${dir}section.html`, "utf8");
writeFileSync(`${dir}page.built.html`, template.replace("{{SECTION}}", section));

// A tiny static server: ES module imports are blocked over file://.
const root = new URL("../../../", import.meta.url).pathname;
const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript" };
const server = createServer((request, response) => {
  const path = decodeURIComponent(new URL(request.url, "http://x").pathname);
  try {
    const body = readFileSync(`${root}${path}`);
    response.writeHead(200, {
      "content-type": types[path.slice(path.lastIndexOf("."))] ?? "text/plain",
    });
    response.end(body);
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise((resolve) => server.listen(4599, resolve));

const url = "http://localhost:4599/packages/section-library/.tmp-harness/page.built.html";

const browser = await chromium.launch();

async function open(width, height, reduced = false) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    reducedMotion: reduced ? "reduce" : "no-preference",
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => console.log("pageerror:", error.message));
  page.on("console", (message) => {
    if (message.type() === "error") {
      console.log("console:", message.text());
    }
  });
  await page.goto(url);
  await page.waitForFunction("window.__ready === true");
  await page.waitForTimeout(600);
  return { context, page };
}

function geometry() {
  const plot = document.querySelector(".concept-plot").getBoundingClientRect();
  const points = [
    [62, 330],
    [452, 214],
    [1138, 92],
  ];
  const dots = [...document.querySelectorAll(".concept-stop-dot")];
  const check = [0, 2, 5].map((stopIndex, i) => {
    const rect = dots[stopIndex].getBoundingClientRect();
    const [x, y] = points[i];
    return {
      stopIndex,
      dx: +(rect.left + rect.width / 2 - (plot.left + (x / 1200) * plot.width)).toFixed(1),
      dy: +(rect.top + rect.height / 2 - (plot.top + (y / 420) * plot.height)).toFixed(1),
    };
  });
  const panels = [...document.querySelectorAll(".concept-panel")].map((el) => {
    const r = el.getBoundingClientRect();
    return { left: Math.round(r.left), right: Math.round(r.right), height: Math.round(r.height) };
  });
  const screen = document.querySelector(".concept-screen").getBoundingClientRect();
  const overflow = [...document.querySelectorAll(".concept-panel")].map((el) =>
    Math.round(el.scrollHeight - el.clientHeight),
  );
  return {
    plot: { w: Math.round(plot.width), h: Math.round(plot.height) },
    check,
    panels,
    screen: { top: Math.round(screen.top), height: Math.round(screen.height) },
    overflow,
    state: window.__state,
  };
}

// Desktop pin
{
  const { context, page } = await open(1440, 900);
  for (const target of [0, 0.34, 0.67, 1]) {
    await page.evaluate((t) => window.__scrollToProgress(t), target);
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${dir}desktop-${String(target).replace(".", "_")}.png` });
    console.log(target, JSON.stringify(await page.evaluate(geometry)));
  }
  await context.close();
}

// Desktop, reduced motion
{
  const { context, page } = await open(1440, 900, true);
  await page.screenshot({ path: `${dir}desktop-reduced.png`, fullPage: true });
  console.log("reduced", JSON.stringify(await page.evaluate(geometry)));
  await context.close();
}

// Compact strip
{
  const { context, page } = await open(390, 844);
  await page.evaluate(() =>
    document.querySelector(".concept-area").scrollIntoView({ block: "start" }),
  );
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${dir}compact-0.png` });
  await page.evaluate(() => {
    const track = document.querySelector(".concept-track");
    track.scrollTo({ left: track.clientWidth * 2 });
    track.dispatchEvent(new Event("scroll"));
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${dir}compact-route.png` });
  console.log("compact", JSON.stringify(await page.evaluate(geometry)));
  await context.close();
}

await browser.close();
server.close();
