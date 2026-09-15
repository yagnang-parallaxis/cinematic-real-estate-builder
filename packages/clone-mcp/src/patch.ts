export type JsonRecord = Record<string, unknown>;

export function isPlainObject(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Merge semantics an agent can reason about: plain objects merge key by key,
 * arrays and scalars replace wholesale. Replacing arrays keeps ordered content
 * (hotspots, beats, residences) predictable instead of index-merged.
 */
export function deepMerge<T>(base: T, patch: unknown): T {
  if (patch === undefined) {
    return base;
  }
  if (!isPlainObject(base) || !isPlainObject(patch)) {
    return patch as T;
  }

  const merged: JsonRecord = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) {
      continue;
    }
    const current = merged[key];
    merged[key] =
      isPlainObject(current) && isPlainObject(value) ? deepMerge(current, value) : value;
  }

  return merged as T;
}

export function getPath(root: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (Array.isArray(acc)) {
      const index = Number(key);
      return Number.isInteger(index) ? acc[index] : undefined;
    }
    if (!isPlainObject(acc)) {
      return undefined;
    }
    return acc[key];
  }, root);
}

/**
 * Dotted paths whose values differ, so a tool can report what a brief touched
 * without echoing a 70 KB config back to the model. Arrays are compared as a
 * whole and reported at their own path.
 */
export function changedPaths(before: unknown, after: unknown, prefix = ""): string[] {
  if (isPlainObject(before) && isPlainObject(after)) {
    const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
    const paths: string[] = [];
    for (const key of keys) {
      paths.push(...changedPaths(before[key], after[key], prefix ? `${prefix}.${key}` : key));
    }
    return paths;
  }

  return JSON.stringify(before ?? null) === JSON.stringify(after ?? null) ? [] : [prefix];
}

/** Replace-or-insert by a string key, preserving order of existing entries. */
export function upsertBy<T extends JsonRecord>(
  items: readonly unknown[],
  key: keyof T & string,
  entry: T,
  merge: boolean,
): unknown[] {
  const identifier = entry[key];
  const index = items.findIndex(
    (item) => isPlainObject(item) && item[key] === identifier && identifier !== undefined,
  );

  if (index < 0) {
    return [...items, entry];
  }

  const next = [...items];
  const current = next[index];
  next[index] = merge && isPlainObject(current) ? deepMerge(current, entry) : entry;
  return next;
}
