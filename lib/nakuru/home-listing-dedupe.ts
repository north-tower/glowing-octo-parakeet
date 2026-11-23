import type { Listing } from "@/lib/nakuru/types";

const MIN_PICKED_GRID = 8;

/** Drop listings already in the Fresh row; backfill so the grid can show at least {@link MIN_PICKED_GRID}. */
export function dedupeListings(
  items: Listing[],
  freshRow: Listing[],
): Listing[] {
  const freshIds = new Set(freshRow.map((i) => String(i.id)));
  const deduped: Listing[] = [];
  const rest: Listing[] = [];

  for (const item of items) {
    if (freshIds.has(String(item.id))) continue;
    rest.push(item);
  }

  deduped.push(...rest);

  if (deduped.length >= MIN_PICKED_GRID || items.length < MIN_PICKED_GRID) {
    return deduped;
  }

  const used = new Set(deduped.map((i) => String(i.id)));
  for (const item of items) {
    if (deduped.length >= MIN_PICKED_GRID) break;
    const id = String(item.id);
    if (used.has(id)) continue;
    deduped.push(item);
    used.add(id);
  }

  return deduped;
}