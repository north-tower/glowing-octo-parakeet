const KEY = "nh:savedListings";

function parse(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data.filter((x): x is string => typeof x === "string" && x.length > 0);
  } catch {
    return [];
  }
}

/** Call only from effects — not during render. */
export function readSavedListingIds(): string[] {
  try {
    return parse(localStorage.getItem(KEY));
  } catch {
    return [];
  }
}

export function writeSavedListingIds(ids: string[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    /* quota / private mode */
  }
}

export function withToggledSavedId(ids: string[], id: string): string[] {
  const key = String(id);
  if (ids.includes(key)) return ids.filter((x) => x !== key);
  return [...ids, key];
}
