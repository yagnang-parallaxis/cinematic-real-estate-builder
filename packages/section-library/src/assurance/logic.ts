import type { AssuranceRow } from "./types";

export const MAX_ASSURANCE_ROWS = 5;

/**
 * Drops rows that cannot be rendered as a disclosure — no title to press, or a
 * duplicate id, which would point two `aria-controls` at the same panel — and
 * caps the list so the section stays a short answer rather than a document.
 */
export function normalizeRows(rows: AssuranceRow[], max = MAX_ASSURANCE_ROWS): AssuranceRow[] {
  const seen = new Set<string>();
  const kept: AssuranceRow[] = [];

  for (const row of rows) {
    if (row.title.trim().length === 0 || row.id.trim().length === 0 || seen.has(row.id)) {
      continue;
    }
    seen.add(row.id);
    kept.push(row);
    if (kept.length === Math.max(0, max)) {
      break;
    }
  }

  return kept;
}

/**
 * Next open set after pressing a row. Exclusive accordions collapse everything
 * else on open; the default lets the reader hold several answers side by side.
 */
export function toggleOpenRows(open: readonly string[], id: string, exclusive = false): string[] {
  const isOpen = open.includes(id);

  if (exclusive) {
    return isOpen ? [] : [id];
  }

  return isOpen ? open.filter((entry) => entry !== id) : [...open, id];
}

/** Open set on first paint, filtered to ids that survived normalisation. */
export function initialOpenRows(
  rows: AssuranceRow[],
  defaultOpenIds: readonly string[] = [],
  exclusive = false,
): string[] {
  const available = new Set(rows.map((row) => row.id));
  const wanted = [...new Set(defaultOpenIds)].filter((id) => available.has(id));

  return exclusive ? wanted.slice(0, 1) : wanted;
}

/** Arrow, Home and End targets for roving focus across the row headers. */
export function moveFocusIndex(current: number, length: number, key: string): number | null {
  if (length === 0) {
    return null;
  }

  switch (key) {
    case "ArrowDown":
      return (current + 1) % length;
    case "ArrowUp":
      return (current - 1 + length) % length;
    case "Home":
      return 0;
    case "End":
      return length - 1;
    default:
      return null;
  }
}

export function rowHeaderId(id: string): string {
  return `assurance-header-${id}`;
}

export function rowPanelId(id: string): string {
  return `assurance-panel-${id}`;
}
