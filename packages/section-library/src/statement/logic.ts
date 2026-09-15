import type { FitTier } from "@cinematic/ui";

import type { StatementContent, StatementFigure, StatementVariant } from "./types";

/** A statement is one thought; past four lines it stops reading as one. */
export function clampStatementLines(lines: string[], max = 4): string[] {
  return lines
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, max);
}

/** The figures row is laid out as a single line, so it caps at four columns. */
export function clampFigures(figures: StatementFigure[] | undefined, max = 4): StatementFigure[] {
  if (!figures) {
    return [];
  }

  return figures.filter((figure) => figure.value.trim() && figure.label.trim()).slice(0, max);
}

/**
 * Only `panorama` sets its copy over a photograph, so only it needs the
 * legibility scrims and the lighter type treatment.
 */
export function isOverMedia(variant: StatementVariant): boolean {
  return variant === "panorama";
}

/** The heading tier steps down as the variant carries more supporting content. */
export function headingTier(variant: StatementVariant): FitTier {
  switch (variant) {
    case "panorama":
      return "display";
    case "figures":
      return "h3";
    case "callout":
      return "h2";
    default: {
      const exhaustive: never = variant;
      return exhaustive;
    }
  }
}

export function headingClass(variant: StatementVariant): string {
  return `t-${headingTier(variant)}`;
}

export function hasAccents(content: StatementContent): boolean {
  return content.variant === "callout" && Boolean(content.imageSrc || content.secondaryImageSrc);
}
