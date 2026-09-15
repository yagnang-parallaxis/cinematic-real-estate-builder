import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { compactTypeNumerators, desktopTypeNumerators } from "./typography";

/**
 * The reference renders no size off its own scale, and the only way to keep that
 * true as sections are added is to check it at the source rather than in a
 * screenshot: every `font-size` authored in this package has to resolve to a
 * numerator on the scale.
 *
 * Rendered sizes are deliberately *not* what is checked. A fitted heading
 * renders at `token × measured scale`, so its rendered size is derived rather
 * than authored, and a rendered-size audit would report every fit as an offender.
 * Resolving the source is what distinguishes the two.
 */
const numerators = new Set<number>([
  ...Object.values(desktopTypeNumerators),
  ...Object.values(compactTypeNumerators),
]);

/**
 * Sizes that are not screen-space lengths at all, with the reason. A `font-size`
 * inside an SVG `viewBox` is a user-space length the viewport scales again, so a
 * token would be the wrong unit rather than the right one.
 */
const userSpaceProperties = new Map([
  ["--seal-ring-units", "SVG user units inside the brand seal's 120-unit viewBox"],
]);

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
  text: readFileSync(file, "utf8"),
}));

/**
 * Every value a custom property is given anywhere in the package. A property
 * declared once per breakpoint has several, and all of them have to hold.
 */
function customPropertyValues(): Map<string, string[]> {
  const values = new Map<string, string[]>();

  for (const { text } of sources) {
    for (const match of text.matchAll(/^\s*(--[\w-]+):\s*([^;]+);/gm)) {
      const name = match[1]!;
      const value = match[2]!.trim();
      values.set(name, [...(values.get(name) ?? []), value]);
    }
  }

  return values;
}

const propertyValues = customPropertyValues();

/** Every way a value can read once its custom properties are substituted in. */
function expand(value: string, depth = 0): string[] {
  const reference = /var\((--[\w-]+)(?:,[^)]*)?\)/.exec(value);
  if (!reference || depth > 8) {
    return [value];
  }

  const name = reference[1]!;
  if (userSpaceProperties.has(name)) {
    return [value.replace(reference[0], "user-space")];
  }

  const substitutes = propertyValues.get(name);
  if (!substitutes) {
    return [value.replace(reference[0], "undefined-property")];
  }

  return substitutes.flatMap((substitute) =>
    expand(value.replace(reference[0], `(${substitute})`), depth + 1),
  );
}

/**
 * A resolved size is on the scale when every viewport-relative term it carries
 * is a scale numerator, and it carries no absolute length of its own. A bare
 * multiplier (a fit scale, a companion ratio) is fine — that is the point of it.
 */
function offScaleTerms(resolved: string): string[] {
  const offenders = [...resolved.matchAll(/([\d.]+)(vw|vh|svh|px|rem|ch)/g)].filter(
    ([, size, unit]) => unit !== "vw" || !numerators.has(Number(size)),
  );

  return offenders.map(([term]) => term);
}

/** Every `font-size` declaration in the package, paired with its file. */
function authoredSizes(): { file: string; value: string }[] {
  return sources.flatMap(({ name, text }) =>
    [...text.matchAll(/font-size:\s*([^;]+);/g)].map((match) => ({
      file: name,
      value: match[1]!.trim(),
    })),
  );
}

describe("authored font sizes", () => {
  it("finds the declarations it is meant to be checking", () => {
    expect(authoredSizes().length).toBeGreaterThan(20);
    expect(propertyValues.get("--text-display")?.length).toBe(2);
  });

  it("resolves every authored size to numerators on the scale", () => {
    const offenders = authoredSizes().flatMap(({ file, value }) =>
      expand(value)
        .flatMap(offScaleTerms)
        .map((term) => `${file}: font-size: ${value} → ${term}`),
    );

    expect(offenders).toEqual([]);
  });

  it("names every size that is deliberately not on the scale", () => {
    for (const [property, reason] of userSpaceProperties) {
      expect(propertyValues.has(property)).toBe(true);
      expect(reason.length).toBeGreaterThan(0);
    }
  });
});
