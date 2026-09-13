// src/concept/logic.ts
function clamp01(value) {
  if (Number.isNaN(value)) {
    return 0;
  }
  return Math.min(1, Math.max(0, value));
}
function pinProgress({ areaTop, areaHeight, viewportHeight, scrollY }) {
  const range = areaHeight - viewportHeight;
  if (range <= 0) {
    return 0;
  }
  return clamp01((scrollY - areaTop) / range);
}
function trackTranslation(progress, { trackWidth, viewportWidth }) {
  const distance = Math.max(0, trackWidth - viewportWidth);
  const shift = clamp01(progress) * distance;
  return shift === 0 ? 0 : -shift;
}
function activePanelIndex(progress, panelCount) {
  const stops = panelCount - 1;
  if (stops <= 0) {
    return 0;
  }
  return Math.min(stops, Math.max(0, Math.round(clamp01(progress) * stops)));
}
function panelEntryProgress(progress, panelCount, index) {
  const stops = panelCount - 1;
  if (stops <= 0) {
    return 1;
  }
  const step = 1 / stops;
  const start = (index - 1) * step;
  return clamp01((clamp01(progress) - start) / step);
}
function revealedWaypointCount(entry, total, span = 0.85) {
  if (total <= 0) {
    return 0;
  }
  if (span <= 0) {
    return total;
  }
  return Math.min(total, Math.ceil(clamp01(entry) / span * total));
}
function pinnedScrollSpan(panelCount, perPanel = 0.7, min = 1.5) {
  if (panelCount <= 0) {
    return min;
  }
  return Math.max(min, panelCount * perPanel);
}
function clampIndex(index, panelCount) {
  if (panelCount <= 0) {
    return 0;
  }
  return Math.min(panelCount - 1, Math.max(0, index));
}
function stripIndex(scrollLeft, panelWidth, panelCount) {
  if (panelWidth <= 0 || panelCount <= 0) {
    return 0;
  }
  return Math.min(panelCount - 1, Math.max(0, Math.round(scrollLeft / panelWidth)));
}
function labelPlacement(index) {
  return index % 2 === 0 ? "above" : "below";
}
function labelAlign(x, extent, edge = 0.14) {
  if (extent <= 0) {
    return "center";
  }
  const ratio = x / extent;
  if (ratio <= edge) {
    return "start";
  }
  if (ratio >= 1 - edge) {
    return "end";
  }
  return "center";
}
function toPercent(value, extent) {
  if (extent <= 0) {
    return 0;
  }
  return value / extent * 100;
}
function formatCount(value) {
  return String(value).padStart(2, "0");
}
export {
  activePanelIndex,
  clamp01,
  clampIndex,
  formatCount,
  labelAlign,
  labelPlacement,
  panelEntryProgress,
  pinProgress,
  pinnedScrollSpan,
  revealedWaypointCount,
  stripIndex,
  toPercent,
  trackTranslation
};
