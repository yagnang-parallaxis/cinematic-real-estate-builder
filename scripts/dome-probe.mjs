import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

/**
 * Dome probe. Walks an absolute scroll range in fine strides and measures the
 * rising arch's *silhouette* at each step, so its width and height eases can be
 * derived as numbers instead of guessed from a filmstrip.
 *
 * The two sites draw the dome differently — the reference is an HTML box whose
 * top corners carry a large `border-radius`, ours is an SVG arc path — so the
 * silhouette is sampled rather than read off either representation: a fixed set
 * of viewport rows, each probed for the dome's left and right edge. A circle is
 * then least-squares fitted to those edge points, which makes "what radius is
 * this arch, and where is its centre" the same question on both sites.
 *
 * The curved heading is measured alongside it, because the arch's radius is also
 * the arc length the heading is laid along: `fontSize / textRadius` is the
 * proportion that has to survive any change to the rise.
 *
 * Usage: node scripts/dome-probe.mjs <url> <label> <from> <to> <steps> [w] [h] [--shots]
 */
const [url, label] = process.argv.slice(2);
const from = Number(process.argv[4] ?? 0);
const to = Number(process.argv[5] ?? 4000);
const steps = Number(process.argv[6] ?? 24);
const width = Number(process.argv[7] ?? 1440);
const height = Number(process.argv[8] ?? 900);
const shots = process.argv.includes("--shots");
/* Our dome is an SVG path; anything without this selector is searched for as a
 * rounded box instead, which is how the reference's is found. */
const selector = process.argv.find((a) => a.startsWith("--dome="))?.slice(7) ?? ".arch-dome";

if (!url || !label) {
  console.error(
    "usage: node scripts/dome-probe.mjs <url> <label> <from> <to> <steps> [w] [h] [--shots]",
  );
  process.exit(1);
}

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, ".screenshots", `dome-${label}`);
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width, height },
  deviceScaleFactor: 1,
  /* The static pose has to be measurable too, not just the scrub. */
  reducedMotion: process.argv.includes("--calm") ? "reduce" : "no-preference",
});
await page.goto(url, { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(7000);

const report = [];
const stride = (to - from) / Math.max(1, steps - 1);

for (let i = 0; i < steps; i += 1) {
  const want = Math.round(from + stride * i);
  await page.evaluate((top) => scrollTo({ top, behavior: "instant" }), want);
  await page.waitForTimeout(420);

  const frame = await page.evaluate((domeSelector) => {
    const vw = innerWidth;
    const vh = innerHeight;

    /* Rows sampled for the silhouette, as fractions of the viewport height. */
    const ROWS = 28;

    /** Least-squares circle through edge points (Kåsa fit). */
    function fitCircle(points) {
      if (points.length < 3) {
        return null;
      }
      let sx = 0;
      let sy = 0;
      let sxx = 0;
      let syy = 0;
      let sxy = 0;
      let sxz = 0;
      let syz = 0;
      let sz = 0;
      for (const [x, y] of points) {
        const z = x * x + y * y;
        sx += x;
        sy += y;
        sxx += x * x;
        syy += y * y;
        sxy += x * y;
        sxz += x * z;
        syz += y * z;
        sz += z;
      }
      const n = points.length;
      /* Solve the 3×3 normal equations for (a, b, c) in x²+y² = ax + by + c. */
      const m = [
        [sxx, sxy, sx, sxz],
        [sxy, syy, sy, syz],
        [sx, sy, n, sz],
      ];
      for (let col = 0; col < 3; col += 1) {
        let pivot = col;
        for (let r = col + 1; r < 3; r += 1) {
          if (Math.abs(m[r][col]) > Math.abs(m[pivot][col])) {
            pivot = r;
          }
        }
        if (Math.abs(m[pivot][col]) < 1e-9) {
          return null;
        }
        [m[col], m[pivot]] = [m[pivot], m[col]];
        for (let r = 0; r < 3; r += 1) {
          if (r === col) continue;
          const f = m[r][col] / m[col][col];
          for (let k = col; k < 4; k += 1) {
            m[r][k] -= f * m[col][k];
          }
        }
      }
      const a = m[0][3] / m[0][0];
      const b = m[1][3] / m[1][1];
      const c = m[2][3] / m[2][2];
      const cx = a / 2;
      const cy = b / 2;
      const r = Math.sqrt(Math.max(0, c + cx * cx + cy * cy));
      return { cx, cy, r };
    }

    /**
     * The dome as an HTML box with rounded top corners — the reference's shape.
     * Only accepted when the corner radius is a real arch (a good fraction of
     * the box width), so a card with a 4px radius is never mistaken for one.
     */
    function cssDome() {
      let best = null;
      for (const node of document.querySelectorAll("div,section,span,figure,main,article")) {
        const r = node.getBoundingClientRect();
        if (r.width < vw * 0.1 || r.height < 40) continue;
        if (r.bottom < vh * 0.5) continue;
        const cs = getComputedStyle(node);
        const tl = parseFloat(cs.borderTopLeftRadius);
        const tr = parseFloat(cs.borderTopRightRadius);
        if (!Number.isFinite(tl) || !Number.isFinite(tr)) continue;
        if (Math.min(tl, tr) < r.width * 0.25) continue;
        const opaque =
          cs.backgroundColor !== "rgba(0, 0, 0, 0)" && cs.backgroundColor !== "transparent";
        if (!opaque) continue;
        if (!best || r.width > best.rect.width) {
          best = {
            rect: r,
            tl,
            tr,
            bg: cs.backgroundColor,
            cls: (node.getAttribute("class") || "").slice(0, 70),
            tag: node.tagName,
          };
        }
      }
      if (!best) {
        return null;
      }
      const { rect, tl, tr } = best;
      /* Radii are clamped by CSS to at most half the box in each axis. */
      const rl = Math.min(tl, rect.width / 2, rect.height);
      const rr = Math.min(tr, rect.width / 2, rect.height);
      const inside = (x, y) => {
        if (y < rect.top || y > rect.bottom || x < rect.left || x > rect.right) return false;
        if (y < rect.top + rl && x < rect.left + rl) {
          const dx = rect.left + rl - x;
          const dy = rect.top + rl - y;
          return dx * dx + dy * dy <= rl * rl;
        }
        if (y < rect.top + rr && x > rect.right - rr) {
          const dx = x - (rect.right - rr);
          const dy = rect.top + rr - y;
          return dx * dx + dy * dy <= rr * rr;
        }
        return true;
      };
      return {
        kind: "css",
        describe: { tag: best.tag, cls: best.cls, bg: best.bg, radius: [rl, rr] },
        box: [rect.left, rect.top, rect.width, rect.height],
        inside,
      };
    }

    /**
     * The dome as an SVG filled path — ours. Probed with `isPointInFill` rather
     * than by parsing `d`, so the measurement does not depend on how the path
     * happens to be written.
     */
    function svgDome(selector) {
      const node = document.querySelector(selector);
      const owner = node?.ownerSVGElement;
      if (!node || !owner || typeof node.isPointInFill !== "function") {
        return null;
      }
      const ctm = node.getScreenCTM();
      if (!ctm) {
        return null;
      }
      const inverse = ctm.inverse();
      const point = owner.createSVGPoint();
      const box = node.getBBox();
      const inside = (x, y) => {
        point.x = x;
        point.y = y;
        const local = point.matrixTransform(inverse);
        return node.isPointInFill(local);
      };
      const tl = new DOMPoint(box.x, box.y).matrixTransform(ctm);
      const br = new DOMPoint(box.x + box.width, box.y + box.height).matrixTransform(ctm);
      return {
        kind: "svg",
        describe: { tag: node.tagName, cls: (node.getAttribute("class") || "").slice(0, 70) },
        box: [tl.x, tl.y, br.x - tl.x, br.y - tl.y],
        inside,
      };
    }


    const dome = svgDome(domeSelector) ?? cssDome();
    if (!dome) {
      return { scrollY: Math.round(scrollY), vw, vh, dome: null };
    }

    /** Edge of the dome on one row, to sub-pixel by bisection from the centre. */
    function edge(y, direction) {
      const cx = vw / 2;
      if (!dome.inside(cx, y)) {
        return null;
      }
      let inside = cx;
      let outside = direction > 0 ? vw : 0;
      if (dome.inside(outside, y)) {
        return outside;
      }
      for (let i = 0; i < 24; i += 1) {
        const mid = (inside + outside) / 2;
        if (dome.inside(mid, y)) {
          inside = mid;
        } else {
          outside = mid;
        }
      }
      return inside;
    }

    const rows = [];
    const edges = [];
    for (let i = 0; i < ROWS; i += 1) {
      const y = Math.min(vh - 0.5, (vh * i) / (ROWS - 1));
      const left = edge(y, -1);
      const right = edge(y, 1);
      if (left === null || right === null) continue;
      rows.push({ y: round(y), left: round(left), right: round(right), w: round(right - left) });
      /* Only rows still on the curve inform the fit; a clipped row is a chord. */
      if (left > 1 && right < vw - 1) {
        edges.push([left, y], [right, y]);
      }
    }

    /* Apex: highest row carrying any dome, bisected against the row above it. */
    let apexY = null;
    if (rows.length > 0) {
      const firstPainted = rows[0].y;
      let above = Math.max(0, firstPainted - vh / (ROWS - 1));
      let below = firstPainted;
      if (dome.inside(vw / 2, above)) {
        apexY = above;
      } else {
        for (let i = 0; i < 24; i += 1) {
          const mid = (above + below) / 2;
          if (dome.inside(vw / 2, mid)) {
            below = mid;
          } else {
            above = mid;
          }
        }
        apexY = below;
      }
    }

    const fit = fitCircle(edges);

    /* The curved heading: its tier, and the radius of the arc it is set on. */
    const heading = (() => {
      /*
       * Widest `textPath` on the page, not the first: a page can carry several
       * (ours has the navigation seal's circular mark) and the one on the dome
       * is by a long way the longest.
       */
      let node = null;
      for (const candidate of document.querySelectorAll("textPath")) {
        const box = candidate.getBoundingClientRect();
        if (!node || box.width > node.getBoundingClientRect().width) {
          node = candidate;
        }
      }
      node = node ?? document.querySelector("text");
      if (!node) {
        return null;
      }
      const cs = getComputedStyle(node);
      const r = node.getBoundingClientRect();
      const href = node.getAttribute("href") || node.getAttribute("xlink:href") || "";
      let arc = null;
      const target = href.startsWith("#") ? document.querySelector(href) : null;
      if (target && typeof target.getPointAtLength === "function") {
        const owner = target.ownerSVGElement;
        const ctm = target.getScreenCTM();
        const total = target.getTotalLength();
        if (owner && ctm && total > 0) {
          const pts = [];
          for (let i = 0; i <= 8; i += 1) {
            const p = target.getPointAtLength((total * i) / 8);
            const s = new DOMPoint(p.x, p.y).matrixTransform(ctm);
            pts.push([s.x, s.y]);
          }
          const f = fitCircle(pts);
          const span = Math.hypot(pts[0][0] - pts[8][0], pts[0][1] - pts[8][1]);
          /* Screen length of the arc, via the fitted radius and its chord. */
          const screenLength = f ? 2 * f.r * Math.asin(Math.min(1, span / (2 * f.r))) : null;
          arc = {
            radius: f ? round(f.r) : null,
            centreY: f ? round(f.cy) : null,
            /* `getTotalLength` is in user units; the fit is in screen pixels. */
            userLength: round(total),
            chord: round(span),
            screenLength: screenLength === null ? null : round(screenLength),
          };
        }
      }
      /*
       * Width the copy wants at this tier, with the fit taken off. This is the
       * headroom: a `textLength` above it spreads the words, below it squeezes
       * their tracking, and the reference sets none at all.
       */
      let naturalLength = null;
      if (typeof node.getComputedTextLength === "function") {
        const set = node.getAttribute("textLength");
        if (set !== null) {
          node.removeAttribute("textLength");
        }
        naturalLength = round(node.getComputedTextLength());
        if (set !== null) {
          node.setAttribute("textLength", set);
        }
      }

      return {
        text: (node.textContent || "").trim().slice(0, 48),
        naturalLength,
        fontSize: round(parseFloat(cs.fontSize)),
        letterSpacing: cs.letterSpacing,
        family: cs.fontFamily.split(",")[0].replace(/["']/g, ""),
        textLength: node.getAttribute("textLength") || "",
        box: [r.left, r.top, r.width, r.height].map(round),
        opacity: round(Number(getComputedStyle(node.closest("text") ?? node).opacity)),
        arc,
      };
    })();

    /* Ancestors of the dome, so the pin the rise is scrubbed by can be found. */
    const chain = [];
    {
      let node = document.querySelector(domeSelector);
      if (!node) {
        /* CSS dome: re-find it the same way, then walk up from there. */
        for (const candidate of document.querySelectorAll("section,div")) {
          const cs = getComputedStyle(candidate);
          const rect = candidate.getBoundingClientRect();
          if (
            parseFloat(cs.borderTopLeftRadius) >= rect.width * 0.25 &&
            rect.width >= vw * 0.1 &&
            rect.bottom >= vh * 0.5
          ) {
            node = candidate;
          }
        }
      }
      let up = node;
      for (let i = 0; up && i < 5; i += 1) {
        const rect = up.getBoundingClientRect();
        const cs = getComputedStyle(up);
        chain.push({
          tag: up.tagName,
          cls: (up.getAttribute("class") || "").slice(0, 50),
          box: [rect.left, rect.top, rect.width, rect.height].map(round),
          position: cs.position,
        });
        up = up.parentElement;
      }
    }

    function round(value) {
      return Math.round(value * 100) / 100;
    }

    return {
      scrollY: Math.round(scrollY),
      vw,
      vh,
      kind: dome.kind,
      describe: dome.describe,
      box: dome.box.map(round),
      apexY: apexY === null ? null : round(apexY),
      visibleHeight: apexY === null ? null : round(vh - apexY),
      widthAtFloor: rows.length ? rows[rows.length - 1].w : null,
      widthMax: rows.length ? Math.max(...rows.map((r) => r.w)) : null,
      fit: fit ? { cx: round(fit.cx), cy: round(fit.cy), r: round(fit.r) } : null,
      rows,
      heading,
      chain,
    };
  }, selector);

  report.push({ want, ...frame });
  if (shots) {
    await page.screenshot({ path: path.join(outDir, `y-${String(want).padStart(6, "0")}.png`) });
  }
}

await writeFile(
  path.join(outDir, "dome.json"),
  `${JSON.stringify({ url, from, to, steps, viewport: { width, height }, report }, null, 2)}\n`,
);

console.log(
  ["want", "got", "apexY", "visH", "wFloor", "wMax", "fit.r", "fit.cy", "font", "arcR"].join("\t"),
);
for (const f of report) {
  const h = f.heading;
  console.log(
    [
      f.want,
      f.scrollY,
      f.apexY ?? "-",
      f.visibleHeight ?? "-",
      f.widthAtFloor ?? "-",
      f.widthMax ?? "-",
      f.fit?.r ?? "-",
      f.fit?.cy ?? "-",
      h ? `${h.fontSize}@${h.opacity}` : "-",
      h?.arc?.radius ?? "-",
    ].join("\t"),
  );
}
console.log(`wrote ${path.join(outDir, "dome.json")}`);

await browser.close();
