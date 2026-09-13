export type TabOrientation = "vertical" | "horizontal";

export interface PinRange {
  /** Document-space offset of the scroll area's top edge. */
  areaTop: number;
  areaHeight: number;
  viewportHeight: number;
}

export interface PinScroll extends PinRange {
  scrollY: number;
}

export interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface IndicatorFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function clamp01(value: number): number {
  if (Number.isNaN(value)) {
    return 0;
  }
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

/** Distance the page scrolls while the inner screen is held still. */
export function pinTravel(areaHeight: number, viewportHeight: number): number {
  const travel = areaHeight - viewportHeight;
  return travel > 0 ? travel : 0;
}

export function pinProgress({ areaTop, areaHeight, viewportHeight, scrollY }: PinScroll): number {
  const travel = pinTravel(areaHeight, viewportHeight);
  if (travel === 0) {
    return 0;
  }
  return clamp01((scrollY - areaTop) / travel);
}

/** Progress is split into `count` equal bands; a boundary belongs to the band above it. */
export function activeIndexFromProgress(progress: number, count: number): number {
  if (count <= 0) {
    return 0;
  }
  const band = Math.floor(clamp01(progress) * count);
  return band > count - 1 ? count - 1 : band;
}

/** Centre of the band that selects `index`, so a tab click lands clear of both edges. */
export function progressForIndex(index: number, count: number): number {
  if (count <= 0) {
    return 0;
  }
  const clamped = index < 0 ? 0 : index > count - 1 ? count - 1 : index;
  return (clamped + 0.5) / count;
}

export function scrollYForIndex(index: number, count: number, range: PinRange): number {
  const travel = pinTravel(range.areaHeight, range.viewportHeight);
  return Math.round(range.areaTop + progressForIndex(index, count) * travel);
}

/** Roving tab index, wrapping at both ends. */
export function rovingIndex(current: number, delta: number, count: number): number {
  if (count <= 0) {
    return 0;
  }
  return (((current + delta) % count) + count) % count;
}

export function arrowStep(key: string, orientation: TabOrientation): number {
  if (orientation === "vertical") {
    if (key === "ArrowUp") return -1;
    if (key === "ArrowDown") return 1;
    return 0;
  }
  if (key === "ArrowLeft") return -1;
  if (key === "ArrowRight") return 1;
  return 0;
}

export function formatIndexLabel(index: number, count: number): string {
  const pad = (value: number) => String(value < 0 ? 0 : value).padStart(2, "0");
  return `${pad(Math.min(index + 1, count))} / ${pad(count)}`;
}

/**
 * Indicator geometry measured from the active tab. `railScroll` keeps the
 * indicator with the content when the compact rail is scrolled sideways.
 */
export function indicatorFrame(
  tab: Box,
  rail: Box,
  railScroll: { x: number; y: number } = { x: 0, y: 0 },
): IndicatorFrame {
  return {
    x: tab.left - rail.left + railScroll.x,
    y: tab.top - rail.top + railScroll.y,
    width: tab.width,
    height: tab.height,
  };
}

export function tabDomId(base: string, panelId: string): string {
  return `${base}-tab-${panelId}`;
}

export function panelDomId(base: string, panelId: string): string {
  return `${base}-panel-${panelId}`;
}
