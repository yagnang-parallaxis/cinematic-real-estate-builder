import { applyThemeToCssVars, type CloneConfig } from "@cinematic/schemas";

/** Colours arrive from config, so keep anything that could close the rule out. */
function safeValue(value: string): string {
  return value.replace(/[;{}<>]/g, "").trim();
}

/**
 * The clone's palette, bound on `:root` rather than on a wrapper, because the
 * fixed chrome, the loader and the body background all read the same tokens.
 */
export function ThemeStyleTag({ theme }: { theme: CloneConfig["theme"] }) {
  const declarations = Object.entries(applyThemeToCssVars(theme))
    .map(([token, value]) => `${safeValue(token)}: ${safeValue(value)};`)
    .join("");

  return <style>{`:root{${declarations}}`}</style>;
}
