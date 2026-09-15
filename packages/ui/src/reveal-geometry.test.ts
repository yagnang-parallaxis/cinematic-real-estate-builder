import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * A reveal's "from" state is gated by an IntersectionObserver watching the
 * reveal element, and an element clipped away reports an empty intersection
 * rect. A `clip-path` authored on the reveal element itself therefore holds its
 * own entry closed: the observer is never told the element arrived, the revealed
 * state is never set, and the content stays hidden for the life of the page —
 * silently, and only for the call sites that happen to use that variant.
 *
 * So the clip has to sit on a box *inside* the observed element. That is a
 * source-level invariant, checked here rather than in a screenshot because the
 * failure is invisible in the markup and only shows up as content that never
 * appears.
 */
function cssFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      return cssFiles(path);
    }
    return entry.name.endsWith(".css") ? [path] : [];
  });
}

const sources = cssFiles(__dirname).map((file) => ({
  name: file.slice(__dirname.length + 1),
  text: readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, ""),
}));

interface Rule {
  file: string;
  selectors: string[];
  body: string;
}

/**
 * Every innermost declaration block. `[^{}]` cannot cross a brace, so an
 * at-rule's prelude never matches and the block inside it does — which is all
 * this needs, since a nested block carries its own selector.
 */
function rules(): Rule[] {
  return sources.flatMap(({ name, text }) =>
    [...text.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
      file: name,
      selectors: match[1]!.split(",").map((selector) => selector.trim()),
      body: match[2]!,
    })),
  );
}

/** The compound the rule actually styles, after the last combinator. */
function subject(selector: string): string {
  return selector.split(/\s+|>|\+|~/).filter(Boolean).at(-1) ?? "";
}

/** A reveal element is the one the observer watches: `.reveal`, however qualified. */
function isRevealElement(compound: string): boolean {
  const classes = [...compound.matchAll(/\.([\w-]+)/g)].map(([, name]) => name);
  return classes.includes("reveal") || compound.includes("[data-reveal");
}

const clipped = rules().flatMap(({ file, selectors, body }) => {
  const declarations = [...body.matchAll(/(?:^|;)\s*clip-path:\s*([^;]+)/g)]
    .map((match) => match[1]!.trim())
    .filter((value) => value !== "none");

  return declarations.length === 0
    ? []
    : selectors.map((selector) => ({ file, selector, declarations }));
});

describe("reveal clip geometry", () => {
  it("finds the clipped rules it is meant to be checking", () => {
    expect(clipped.length).toBeGreaterThan(0);
    expect(clipped.some(({ selector }) => selector.includes(".reveal-mask"))).toBe(true);
  });

  it("never clips the element the observer watches", () => {
    const offenders = clipped
      .filter(({ selector }) => isRevealElement(subject(selector)))
      .map(({ file, selector, declarations }) => `${file}: ${selector} → ${declarations[0]}`);

    expect(offenders).toEqual([]);
  });
});
