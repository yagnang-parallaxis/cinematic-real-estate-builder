/**
 * Draws the key plan and the floor plan for every Aurelia residence.
 *
 * The inventory in `apps/web/src/content/residences.ts` is the single source of
 * truth: the numbers, blocks, floors and areas are read from it, and only the
 * room programme (which rooms a type contains, and their relative sizes) lives
 * here, because that is drawing data rather than page content.
 *
 * Run with:  node --experimental-strip-types scripts/build-residence-plans.mts
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { residences } from "../apps/web/src/content/residences.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(HERE, "../apps/web/public/residences");

/* A drawing is a drawing: it carries its own sheet colours rather than a tone. */
const PAPER = "#f2efe7";
const INK = "#1f2a36";
const FAINT = "#9aa1a9";
const FONT = "Helvetica, Arial, sans-serif";

const SHEET_W = 1200;
const SHEET_H = 840;
const MARGIN = 64;

interface RoomSpec {
  name: string;
  /** Relative area; the whole programme is scaled to the unit's interior area. */
  weight: number;
}

interface LevelSpec {
  label: string;
  /** Long side divided by short side, so each level keeps a plausible footprint. */
  aspect: number;
  rooms: RoomSpec[];
}

/** Bedroom sizes in descending order, so a fourth bedroom is the smallest. */
function bedrooms(count: number, sizes: number[]): RoomSpec[] {
  return Array.from({ length: count }, (_, index) => ({
    name: index === 0 ? "Main bedroom" : `Bedroom ${index + 1}`,
    weight: sizes[index] ?? sizes[sizes.length - 1] ?? 11,
  }));
}

function programme(type: string, beds: number): LevelSpec[] {
  if (type === "garden") {
    return [
      {
        label: "Garden level",
        aspect: 1.5,
        rooms: [
          { name: "Living & kitchen", weight: 44 },
          ...bedrooms(beds, [17, 13, 12, 12]),
          { name: "Bath", weight: 6 },
          { name: "Shower room", weight: 4 },
          { name: "Hall", weight: 8 },
          { name: "Utility", weight: 4 },
        ],
      },
      {
        label: "Lower level",
        aspect: 1.25,
        rooms: [
          { name: "Workshop", weight: 16 },
          { name: "Store", weight: 12 },
          { name: "Stair", weight: 5 },
          { name: "Plant", weight: 5 },
        ],
      },
    ];
  }

  if (type === "penthouse") {
    return [
      {
        label: "Roof level",
        aspect: 1.7,
        rooms: [
          { name: "Living & kitchen", weight: 54 },
          ...bedrooms(beds, [20, 14, 13, 13]),
          { name: "Bath", weight: 8 },
          { name: "Shower room", weight: 5 },
          { name: "Hall", weight: 9 },
          { name: "Stair to roof", weight: 6 },
          { name: "Utility", weight: 5 },
        ],
      },
    ];
  }

  return [
    {
      label: "Residence level",
      aspect: 1.55,
      rooms: [
        { name: "Living & kitchen", weight: 38 },
        ...bedrooms(beds, [17, 12, 11, 11]),
        { name: "Bath", weight: 6 },
        { name: "Shower room", weight: 4 },
        { name: "Hall", weight: 6 },
        { name: "Store", weight: 4 },
        { name: "Utility", weight: 3 },
      ],
    },
  ];
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface PlacedRoom extends Rect {
  name: string;
  area: number;
}

/**
 * Squarified treemap. Rooms come out as rectangles close to square, which is
 * what makes the result read as a plan rather than as a bar chart.
 */
function squarify(items: { name: string; area: number }[], frame: Rect): PlacedRoom[] {
  const placed: PlacedRoom[] = [];
  const queue = [...items].sort((a, b) => b.area - a.area);
  let rect = { ...frame };
  let remaining = queue.reduce((sum, item) => sum + item.area, 0);

  const worst = (row: typeof queue, side: number, scale: number) => {
    const total = row.reduce((sum, item) => sum + item.area, 0) * scale;
    const rowSide = total / side;
    let ratio = 1;
    for (const item of row) {
      const other = (item.area * scale) / rowSide;
      ratio = Math.max(ratio, Math.max(rowSide / other, other / rowSide));
    }
    return ratio;
  };

  while (queue.length > 0) {
    const horizontal = rect.w >= rect.h;
    const side = horizontal ? rect.h : rect.w;
    const scale = (rect.w * rect.h) / remaining;

    const row: typeof queue = [queue.shift() as (typeof queue)[number]];
    while (queue.length > 0) {
      const next = queue[0] as (typeof queue)[number];
      if (worst([...row, next], side, scale) > worst(row, side, scale)) {
        break;
      }
      row.push(queue.shift() as (typeof queue)[number]);
    }

    const rowArea = row.reduce((sum, item) => sum + item.area, 0) * scale;
    const depth = rowArea / side;
    let offset = 0;

    for (const item of row) {
      const length = ((item.area * scale) / rowArea) * side;
      placed.push(
        horizontal
          ? { name: item.name, area: item.area, x: rect.x, y: rect.y + offset, w: depth, h: length }
          : {
              name: item.name,
              area: item.area,
              x: rect.x + offset,
              y: rect.y,
              w: length,
              h: depth,
            },
      );
      offset += length;
    }

    remaining -= row.reduce((sum, item) => sum + item.area, 0);
    rect = horizontal
      ? { x: rect.x + depth, y: rect.y, w: rect.w - depth, h: rect.h }
      : { x: rect.x, y: rect.y + depth, w: rect.w, h: rect.h - depth };

    if (rect.w < 0.5 || rect.h < 0.5) {
      break;
    }
  }

  return placed;
}

function escapeText(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function round(value: number): string {
  return (Math.round(value * 100) / 100).toString();
}

function label(
  x: number,
  y: number,
  text: string,
  size: number,
  options: { anchor?: string; fill?: string; weight?: number; spacing?: number } = {},
): string {
  const { anchor = "start", fill = INK, weight = 400, spacing = 0 } = options;
  return `<text x="${round(x)}" y="${round(y)}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" letter-spacing="${spacing}" fill="${fill}" text-anchor="${anchor}">${escapeText(text)}</text>`;
}

function sheet(body: string, height = SHEET_H): string {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SHEET_W} ${height}" width="${SHEET_W}" height="${height}" preserveAspectRatio="xMidYMid meet" role="img">`,
    `<rect width="${SHEET_W}" height="${height}" fill="${PAPER}"/>`,
    body,
    "</svg>",
  ].join("\n");
}

/** Diagonal hatching, drawn line by line rather than as a fill pattern. */
function hatched(rect: Rect, step = 14): string {
  const lines: string[] = [];
  for (let offset = -rect.h; offset < rect.w; offset += step) {
    const x1 = Math.max(rect.x + offset, rect.x);
    const y1 = rect.y + Math.max(-offset, 0);
    const x2 = Math.min(rect.x + offset + rect.h, rect.x + rect.w);
    const y2 = rect.y + Math.min(rect.w - offset, rect.h);
    if (x2 <= x1) {
      continue;
    }
    lines.push(
      `<line x1="${round(x1)}" y1="${round(y1)}" x2="${round(x2)}" y2="${round(y2)}" stroke="${FAINT}" stroke-width="1"/>`,
    );
  }
  return `<g opacity="0.7">${lines.join("")}</g>`;
}

function northArrow(cx: number, cy: number): string {
  return [
    `<g stroke="${INK}" fill="none" stroke-width="1.6">`,
    `<circle cx="${cx}" cy="${cy}" r="20"/>`,
    `<path d="M ${cx} ${cy + 12} L ${cx} ${cy - 12} M ${cx - 5} ${cy - 5} L ${cx} ${cy - 12} L ${cx + 5} ${cy - 5}"/>`,
    "</g>",
    label(cx, cy + 38, "N", 12, { anchor: "middle", spacing: 1 }),
  ].join("");
}

function scaleBar(x: number, y: number, pxPerMetre: number): string {
  const span = 5 * pxPerMetre;
  const parts: string[] = [
    `<g stroke="${INK}" stroke-width="1.2">`,
    `<line x1="${round(x)}" y1="${round(y)}" x2="${round(x + span)}" y2="${round(y)}"/>`,
  ];
  for (let metre = 0; metre <= 5; metre += 1) {
    const tick = x + metre * pxPerMetre;
    parts.push(
      `<line x1="${round(tick)}" y1="${round(y - 5)}" x2="${round(tick)}" y2="${round(y + 5)}"/>`,
    );
  }
  parts.push("</g>");
  parts.push(label(x, y + 22, "0", 11, { fill: FAINT }));
  parts.push(label(x + span, y + 22, "5 m", 11, { anchor: "end", fill: FAINT }));
  return parts.join("");
}

function titleBlock(lines: string[], x: number, y: number): string {
  return [
    `<line x1="${round(x)}" y1="${round(y - 26)}" x2="${round(x + 360)}" y2="${round(y - 26)}" stroke="${INK}" stroke-width="1"/>`,
    label(x, y, lines[0] ?? "", 13, { weight: 600, spacing: 2.4 }),
    label(x, y + 22, lines[1] ?? "", 13, { fill: INK }),
    label(x, y + 42, lines[2] ?? "", 12, { fill: FAINT }),
  ].join("");
}

/* Floor plan -------------------------------------------------------------- */

function floorPlan(residence: (typeof residences)[number]): string {
  const levels = programme(residence.type, residence.bedrooms);
  const totalWeight = levels
    .flatMap((level) => level.rooms)
    .reduce((sum, room) => sum + room.weight, 0);
  /* The labelled rooms add up to the unit's interior area. */
  const scaleToSqm = residence.interiorSqm / totalWeight;

  const levelAreas = levels.map((level) => ({
    level,
    sqm: level.rooms.reduce((sum, room) => sum + room.weight, 0) * scaleToSqm,
  }));

  /* Each level's footprint in metres, then one shared px-per-metre for the sheet. */
  const footprints = levelAreas.map(({ level, sqm }) => {
    /* The footprint is the gross area: walls and thresholds sit outside the rooms. */
    const gross = sqm * 1.1;
    const width = Math.sqrt(gross * level.aspect);
    return { width, depth: gross / width };
  });

  const drawW = SHEET_W - MARGIN * 2;
  const drawTop = MARGIN + 54;
  const drawH = SHEET_H - drawTop - 150;
  const gapMetres = 2.4;
  const outdoorDepth = Math.min(
    4.2,
    Math.max(1.8, residence.outdoorSqm / (footprints[0]?.width ?? 10)),
  );

  const metresWide =
    footprints.reduce((sum, print) => sum + print.width, 0) + gapMetres * (footprints.length - 1);
  const metresDeep = Math.max(...footprints.map((print) => print.depth)) + outdoorDepth + 1.2;
  const pxPerMetre = Math.min(drawW / metresWide, drawH / metresDeep);

  const originX = MARGIN + (drawW - metresWide * pxPerMetre) / 2;
  const originY = drawTop;

  const parts: string[] = [];
  let cursor = originX;

  levelAreas.forEach(({ level, sqm }, index) => {
    const print = footprints[index];
    if (!print) {
      return;
    }
    const w = print.width * pxPerMetre;
    const h = print.depth * pxPerMetre;
    const x = cursor;
    const y = originY;
    cursor += w + gapMetres * pxPerMetre;

    parts.push(label(x, y - 16, level.label.toUpperCase(), 11, { spacing: 2, fill: FAINT }));

    const wall = 7;
    const rooms = squarify(
      level.rooms.map((room) => ({ name: room.name, area: room.weight * scaleToSqm })),
      { x: x + wall, y: y + wall, w: w - wall * 2, h: h - wall * 2 },
    );

    /* Outdoor area first, so the envelope wall draws over its edge. */
    if (index === 0 && residence.outdoorSqm > 0) {
      const oh = outdoorDepth * pxPerMetre;
      const outdoor = { x, y: y + h, w, h: oh };
      parts.push(
        hatched(outdoor),
        `<rect x="${round(x)}" y="${round(y + h)}" width="${round(w)}" height="${round(oh)}" fill="none" stroke="${FAINT}" stroke-width="1.4" stroke-dasharray="7 5"/>`,
        `<rect x="${round(x + w / 2 - 96)}" y="${round(y + h + oh / 2 - 13)}" width="192" height="26" fill="${PAPER}"/>`,
        label(
          x + w / 2,
          y + h + oh / 2 + 5,
          `${residence.outdoorLabel} · ${residence.outdoorSqm} m²`,
          13,
          { anchor: "middle", fill: INK },
        ),
      );
    }

    parts.push(
      `<rect x="${round(x)}" y="${round(y)}" width="${round(w)}" height="${round(h)}" fill="${PAPER}"/>`,
    );

    for (const room of rooms) {
      parts.push(
        `<rect x="${round(room.x)}" y="${round(room.y)}" width="${round(room.w)}" height="${round(room.h)}" fill="none" stroke="${INK}" stroke-width="1.6"/>`,
      );
      if (room.w > 74 && room.h > 40) {
        const cx = room.x + room.w / 2;
        const cy = room.y + room.h / 2;
        parts.push(label(cx, cy - 2, room.name, 12, { anchor: "middle" }));
        parts.push(
          label(cx, cy + 16, `${Math.round(room.area)} m²`, 11, { anchor: "middle", fill: FAINT }),
        );
      } else if (room.w > 46 && room.h > 22) {
        parts.push(
          label(room.x + room.w / 2, room.y + room.h / 2 + 4, room.name, 10, {
            anchor: "middle",
            fill: FAINT,
          }),
        );
      }
    }

    /* External wall, drawn last and heavy, with window openings on the outdoor side. */
    parts.push(
      `<rect x="${round(x)}" y="${round(y)}" width="${round(w)}" height="${round(h)}" fill="none" stroke="${INK}" stroke-width="${wall}"/>`,
    );

    if (index === 0) {
      const openings = 3;
      const openW = (w * 0.62) / openings;
      const startX = x + (w - openW * openings - (openings - 1) * 18) / 2;
      for (let i = 0; i < openings; i += 1) {
        const ox = startX + i * (openW + 18);
        parts.push(
          `<rect x="${round(ox)}" y="${round(y + h - wall / 2 - 1)}" width="${round(openW)}" height="${round(wall + 2)}" fill="${PAPER}"/>`,
          `<line x1="${round(ox)}" y1="${round(y + h)}" x2="${round(ox + openW)}" y2="${round(y + h)}" stroke="${INK}" stroke-width="1.4"/>`,
        );
      }
    }

    parts.push(label(x + w, y - 16, `${Math.round(sqm)} m²`, 11, { anchor: "end", fill: FAINT }));
  });

  parts.push(northArrow(SHEET_W - MARGIN - 24, MARGIN + 14));
  parts.push(scaleBar(SHEET_W - MARGIN - 5 * pxPerMetre, SHEET_H - MARGIN - 26, pxPerMetre));
  parts.push(
    titleBlock(
      [
        "AURELIA RESIDENCES",
        `${residence.name} — ${residence.typeLabel}`,
        `${residence.bedrooms} bedrooms · ${residence.interiorSqm} m² inside · ${residence.outdoorSqm} m² ${residence.outdoorLabel.toLowerCase()} · ${residence.block} block, ${residence.floorLabel.toLowerCase()}`,
      ],
      MARGIN,
      SHEET_H - MARGIN - 44,
    ),
  );

  return sheet(parts.join("\n"));
}

/* Key plan ---------------------------------------------------------------- */

const KEY_H = 700;

function keyPlan(residence: (typeof residences)[number]): string {
  const onFloor = residences.filter((other) => other.floor === residence.floor);
  const blocks = [...new Set(onFloor.map((other) => other.block))];

  const drawW = SHEET_W - MARGIN * 2;
  const rowH = 132;
  const rowGap = 74;
  const top = MARGIN + 62;

  const parts: string[] = [];

  blocks.forEach((block, rowIndex) => {
    const units = onFloor.filter((other) => other.block === block);
    const totalArea = units.reduce((sum, unit) => sum + unit.interiorSqm, 0);
    const gap = 8;
    const usable = drawW - gap * (units.length - 1);
    const y = top + rowIndex * (rowH + rowGap);

    parts.push(
      label(MARGIN, y - 16, `${block.toUpperCase()} BLOCK`, 11, { spacing: 2, fill: FAINT }),
    );

    let x = MARGIN;
    for (const unit of units) {
      const w = (unit.interiorSqm / totalArea) * usable;
      const isThis = unit.slug === residence.slug;
      parts.push(
        `<rect x="${round(x)}" y="${round(y)}" width="${round(w)}" height="${rowH}" fill="${isThis ? INK : "none"}" stroke="${isThis ? INK : FAINT}" stroke-width="${isThis ? 3 : 1.6}"/>`,
      );
      parts.push(
        label(x + w / 2, y + rowH / 2 + 2, unit.number, 22, {
          anchor: "middle",
          fill: isThis ? PAPER : FAINT,
          weight: isThis ? 600 : 400,
        }),
      );
      parts.push(
        label(x + w / 2, y + rowH / 2 + 24, `${unit.interiorSqm} m²`, 11, {
          anchor: "middle",
          fill: isThis ? PAPER : FAINT,
        }),
      );
      x += w + gap;
    }

    /* The path runs between the blocks; the water sits below the lower one. */
    if (rowIndex < blocks.length - 1) {
      const pathY = y + rowH + rowGap / 2;
      parts.push(
        `<line x1="${MARGIN}" y1="${round(pathY)}" x2="${SHEET_W - MARGIN}" y2="${round(pathY)}" stroke="${FAINT}" stroke-width="1.2" stroke-dasharray="4 8"/>`,
        label(MARGIN, pathY - 10, "Walking path", 11, { fill: FAINT }),
      );
    }
  });

  const waterY = top + blocks.length * (rowH + rowGap) - rowGap + 46;
  parts.push(
    `<path d="M ${MARGIN} ${round(waterY)} q 24 -9 48 0 t 48 0 t 48 0 t 48 0 t 48 0 t 48 0 t 48 0 t 48 0 t 48 0 t 48 0 t 48 0 t 48 0 t 48 0 t 48 0 t 48 0 t 48 0 t 48 0 t 48 0 t 48 0 t 48 0 t 48 0 t 48 0" fill="none" stroke="${FAINT}" stroke-width="1.4"/>`,
    label(MARGIN, waterY + 28, "The channel", 11, { fill: FAINT }),
  );

  parts.push(northArrow(SHEET_W - MARGIN - 24, MARGIN + 14));
  parts.push(
    titleBlock(
      [
        "AURELIA RESIDENCES",
        `Key plan — ${residence.floorLabel}`,
        `${residence.name} shown solid · ${residence.block} block · ${onFloor.length} homes on this floor`,
      ],
      MARGIN,
      KEY_H - MARGIN - 24,
    ),
  );

  return sheet(parts.join("\n"), KEY_H);
}

/* ------------------------------------------------------------------------- */

await mkdir(OUT_DIR, { recursive: true });

for (const residence of residences) {
  await writeFile(resolve(OUT_DIR, `plan-${residence.number}.svg`), floorPlan(residence), "utf8");
  await writeFile(resolve(OUT_DIR, `key-${residence.number}.svg`), keyPlan(residence), "utf8");
}

console.log(`Wrote ${residences.length * 2} drawings to ${OUT_DIR}`);
