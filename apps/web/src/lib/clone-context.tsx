"use client";

import type { CloneConfig, SectionKey } from "@cinematic/schemas";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface ClonePreviewValue {
  /** The live override when the builder has pushed one, otherwise the server config. */
  config: CloneConfig;
  setLiveConfig: (config: CloneConfig) => void;
}

export const ClonePreviewContext = createContext<ClonePreviewValue | null>(null);

/**
 * Holds the config the server rendered with, plus whatever the builder last
 * pushed over `postMessage`. Sections read the override so a form edit lands in
 * the preview without a navigation.
 */
export function ClonePreviewProvider({
  serverConfig,
  children,
}: {
  serverConfig: CloneConfig;
  children: ReactNode;
}) {
  const [liveOverride, setLiveOverride] = useState<CloneConfig | null>(null);

  const value = useMemo<ClonePreviewValue>(
    () => ({ config: liveOverride ?? serverConfig, setLiveConfig: setLiveOverride }),
    [liveOverride, serverConfig],
  );

  return <ClonePreviewContext.Provider value={value}>{children}</ClonePreviewContext.Provider>;
}

export function useClonePreview(): ClonePreviewValue | null {
  return useContext(ClonePreviewContext);
}

/** The config to render with: the live override if there is one, else the server's. */
export function useCloneConfig(serverConfig: CloneConfig): CloneConfig {
  return useContext(ClonePreviewContext)?.config ?? serverConfig;
}

/** Hidden sections keep their config; they are skipped at render time. */
export function isSectionVisible(config: CloneConfig, key: SectionKey): boolean {
  return config.sectionVisibility?.[key] !== false;
}
