import type { Residence, ResidenceFilters, ResidenceSort, ResidenceStatus } from "./types";

/** Past four photographs the media column stops reading as one unit. */
export const MAX_RESIDENCE_PHOTOS = 4;

/** How many "other residences" the detail page offers at the foot of the page. */
export const MAX_SIMILAR_RESIDENCES = 4;

export const RESIDENCE_SORTS: ResidenceSort[] = ["relevant", "area-asc", "area-desc"];

export const RESIDENCE_STATUSES: ResidenceStatus[] = ["available", "reserved", "sold"];

const STATUS_LABELS: Record<ResidenceStatus, string> = {
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
};

const FLOOR_WORDS = ["Ground", "First", "Second", "Third", "Fourth", "Fifth"];

/** A search param arrives as a string, a repeated string, or not at all. */
export type RawParam = string | string[] | undefined;

function firstParam(raw: RawParam): string {
  if (Array.isArray(raw)) {
    return (raw[0] ?? "").trim();
  }
  return (raw ?? "").trim();
}

/**
 * Read `?type=` against the types the inventory actually contains, so a stale
 * or hand-edited link falls back to the full listing rather than an empty grid.
 */
export function parseTypeParam(raw: RawParam, known: readonly string[]): string | "all" {
  const value = firstParam(raw).toLowerCase();
  if (!value || value === "all") {
    return "all";
  }
  return known.find((id) => id.toLowerCase() === value) ?? "all";
}

export function parseBedroomsParam(raw: RawParam, known: readonly number[]): number | "all" {
  const value = firstParam(raw);
  if (!value || value.toLowerCase() === "all") {
    return "all";
  }
  const count = Number.parseInt(value, 10);
  if (!Number.isFinite(count)) {
    return "all";
  }
  return known.includes(count) ? count : "all";
}

export function parseSortParam(raw: RawParam): ResidenceSort {
  const value = firstParam(raw).toLowerCase();
  return RESIDENCE_SORTS.includes(value as ResidenceSort) ? (value as ResidenceSort) : "relevant";
}

/** Every bedroom count present in the inventory, ascending — the filter's options. */
export function bedroomOptions(residences: readonly Residence[]): number[] {
  const counts = new Set<number>();
  for (const residence of residences) {
    if (Number.isFinite(residence.bedrooms) && residence.bedrooms > 0) {
      counts.add(Math.trunc(residence.bedrooms));
    }
  }
  return [...counts].sort((a, b) => a - b);
}

/** Every type present in the inventory, in the order the inventory lists them. */
export function typeOptions(residences: readonly Residence[]): { id: string; label: string }[] {
  const seen = new Map<string, string>();
  for (const residence of residences) {
    if (!seen.has(residence.type)) {
      seen.set(residence.type, residence.typeLabel);
    }
  }
  return [...seen].map(([id, label]) => ({ id, label }));
}

export function filterResidences(
  residences: readonly Residence[],
  filters: ResidenceFilters,
): Residence[] {
  return residences.filter((residence) => {
    if (filters.type !== "all" && residence.type !== filters.type) {
      return false;
    }
    if (filters.bedrooms !== "all" && residence.bedrooms !== filters.bedrooms) {
      return false;
    }
    return true;
  });
}

/** Sorts by interior area. Ties keep the authored order, so the grid never jitters. */
export function sortResidences(residences: readonly Residence[], sort: ResidenceSort): Residence[] {
  const list = [...residences];
  if (sort === "relevant") {
    return list;
  }
  const direction = sort === "area-asc" ? 1 : -1;
  return list
    .map((residence, index) => ({ residence, index }))
    .sort((a, b) => {
      const delta = (a.residence.interiorSqm - b.residence.interiorSqm) * direction;
      return delta !== 0 ? delta : a.index - b.index;
    })
    .map((entry) => entry.residence);
}

export function selectResidences(
  residences: readonly Residence[],
  filters: ResidenceFilters,
  sort: ResidenceSort,
): Residence[] {
  return sortResidences(filterResidences(residences, filters), sort);
}

/** True once any control has moved off its default, which is when Reset earns its place. */
export function isFiltered(filters: ResidenceFilters, sort: ResidenceSort): boolean {
  return filters.type !== "all" || filters.bedrooms !== "all" || sort !== "relevant";
}

/**
 * A short signature of the current controls. Keying the grid on it replays the
 * entry reveal when the results change, instead of reloading the page.
 */
export function filterSignature(filters: ResidenceFilters, sort: ResidenceSort): string {
  return `${filters.type}:${filters.bedrooms}:${sort}`;
}

/** The listing URL for a given set of controls; defaults are left out of the query. */
export function buildListingQuery(filters: ResidenceFilters, sort: ResidenceSort): string {
  const params = new URLSearchParams();
  if (filters.type !== "all") {
    params.set("type", filters.type);
  }
  if (filters.bedrooms !== "all") {
    params.set("bedrooms", String(filters.bedrooms));
  }
  if (sort !== "relevant") {
    params.set("sort", sort);
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function formatArea(sqm: number): string {
  if (!Number.isFinite(sqm) || sqm <= 0) {
    return "—";
  }
  return `${Math.round(sqm)} m²`;
}

/** The extra outdoor area, written as the reference category writes it: `"+ 46 m²"`. */
export function formatOutdoor(sqm: number): string {
  if (!Number.isFinite(sqm) || sqm <= 0) {
    return "—";
  }
  return `+ ${Math.round(sqm)} m²`;
}

export function formatFloor(floor: number): string {
  if (!Number.isFinite(floor)) {
    return "—";
  }
  const level = Math.trunc(floor);
  if (level < 0) {
    return `${Math.abs(level)} below ground`;
  }
  const word = FLOOR_WORDS[level];
  return word ? `${word} floor` : `Floor ${level}`;
}

export function formatBedrooms(bedrooms: number, one: string, many: string): string {
  if (!Number.isFinite(bedrooms) || bedrooms <= 0) {
    return "—";
  }
  const count = Math.trunc(bedrooms);
  return `${count} ${count === 1 ? one : many}`;
}

/** Status is always words. Colour is a second signal, never the only one. */
export function statusLabel(status: ResidenceStatus): string {
  return STATUS_LABELS[status] ?? "Available";
}

export function isEnquirable(status: ResidenceStatus): boolean {
  return status !== "sold";
}

export function formatResultCount(
  count: number,
  wording: { one: string; many: string; none: string },
): string {
  if (!Number.isFinite(count) || count <= 0) {
    return wording.none;
  }
  const whole = Math.trunc(count);
  return `${whole} ${whole === 1 ? wording.one : wording.many}`;
}

export function findResidence(
  residences: readonly Residence[],
  slug: string,
): Residence | undefined {
  const wanted = slug.trim().toLowerCase();
  if (!wanted) {
    return undefined;
  }
  return residences.find((residence) => residence.slug.toLowerCase() === wanted);
}

/**
 * Other units worth a look: same type first, in the authored order, then the
 * rest of the inventory. The unit being viewed is never offered back.
 */
export function similarResidences(
  residences: readonly Residence[],
  slug: string,
  max = MAX_SIMILAR_RESIDENCES,
): Residence[] {
  const limit = Math.max(0, max);
  if (limit === 0) {
    return [];
  }
  const current = findResidence(residences, slug);
  const rest = residences.filter((residence) => residence.slug !== current?.slug);
  if (!current) {
    return rest.slice(0, limit);
  }
  const sameType = rest.filter((residence) => residence.type === current.type);
  const otherType = rest.filter((residence) => residence.type !== current.type);
  return [...sameType, ...otherType].slice(0, limit);
}

export function clampPhotos<T extends { id: string; src: string }>(
  photos: readonly T[],
  max = MAX_RESIDENCE_PHOTOS,
): T[] {
  const limit = Math.max(0, max);
  const seen = new Set<string>();
  const kept: T[] = [];
  for (const photo of photos) {
    if (kept.length >= limit) {
      break;
    }
    if (!photo.id.trim() || !photo.src.trim() || seen.has(photo.id)) {
      continue;
    }
    seen.add(photo.id);
    kept.push(photo);
  }
  return kept;
}

export interface ResidenceMediaItem {
  id: string;
  src: string;
  alt: string;
  caption: string;
  /** Short label shown beneath the frame: a room name, or the drawing's name. */
  label: string;
  /** Drawings are contained inside their frame; photographs may fill it. */
  fit: "cover" | "contain";
}

/**
 * The media column's items in lightbox order: photographs first, then the key
 * plan and the floor plan, which are drawings and so are never cropped.
 */
export function residenceMedia(
  residence: Residence,
  labels: { schematic: string; plan: string },
): ResidenceMediaItem[] {
  const photos = clampPhotos(residence.photos);
  const items: ResidenceMediaItem[] = photos.map((photo) => ({
    id: photo.id,
    src: photo.src,
    alt: photo.alt,
    caption: photo.caption,
    label: photo.room,
    fit: "cover",
  }));

  for (const [key, drawing, label] of [
    ["schematic", residence.schematic, labels.schematic],
    ["plan", residence.plan, labels.plan],
  ] as const) {
    if (drawing?.src?.trim()) {
      items.push({
        id: `${key}-${residence.slug}`,
        src: drawing.src,
        alt: drawing.alt,
        caption: drawing.caption,
        label,
        fit: "contain",
      });
    }
  }

  return items;
}

/** How many of the media items are photographs rather than drawings. */
export function photoCount(items: readonly ResidenceMediaItem[]): number {
  return items.filter((item) => item.fit === "cover").length;
}

export { formatCounter, nextImageIndex, previousImageIndex, wrapIndex } from "../interiors/logic";
