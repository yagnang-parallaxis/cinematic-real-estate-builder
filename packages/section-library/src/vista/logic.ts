import type { VistaContent } from "./types";

export function hasVistaPlate(content: Pick<VistaContent, "quote" | "imageSrc">): boolean {
  return content.quote.trim().length > 0 && content.imageSrc.trim().length > 0;
}

export function vistaCite(content: Pick<VistaContent, "attribution" | "credit">): string[] {
  return [content.attribution, content.credit].filter((line): line is string => Boolean(line?.trim()));
}
