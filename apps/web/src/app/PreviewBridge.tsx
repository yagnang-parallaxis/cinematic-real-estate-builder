"use client";

import { applyThemeToCssVars, cloneConfigSchema } from "@cinematic/schemas";
import { useEffect } from "react";

import { useClonePreview } from "../lib/clone-context";

export const PREVIEW_MESSAGE = "cinematic:preview";
export const PREVIEW_READY_MESSAGE = "cinematic:preview-ready";

/**
 * The builder side of the preview: it pushes a whole `CloneConfig` into the
 * iframe on every debounced save. Theme tokens go straight onto the document
 * element — a CSS variable change costs no re-render — and the config itself
 * goes into context, where the sections pick it up.
 *
 * Mounted only when the page was opened with `?preview=1`.
 */
export function PreviewBridge() {
  const preview = useClonePreview();
  const setLiveConfig = preview?.setLiveConfig;

  useEffect(() => {
    if (!setLiveConfig) {
      return;
    }

    const onMessage = (event: MessageEvent) => {
      const payload = event.data as { type?: unknown; config?: unknown } | null;
      if (!payload || payload.type !== PREVIEW_MESSAGE) {
        return;
      }

      const parsed = cloneConfigSchema.safeParse(payload.config);
      if (!parsed.success) {
        return;
      }

      for (const [token, value] of Object.entries(applyThemeToCssVars(parsed.data.theme))) {
        document.documentElement.style.setProperty(token, value);
      }
      setLiveConfig(parsed.data);
    };

    window.addEventListener("message", onMessage);
    /* The iframe usually finishes loading after the first save, so ask for one. */
    window.parent?.postMessage({ type: PREVIEW_READY_MESSAGE }, "*");

    return () => window.removeEventListener("message", onMessage);
  }, [setLiveConfig]);

  return null;
}
