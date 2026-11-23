import type { Listing } from "@/lib/nakuru/types";

/** Drop listings already shown in earlier home rows (e.g. Fresh / Verified). */
export function excludePriorRailIds(
  items: Listing[],
  prior: Listing[][],
): Listing[] {
  const seen = new Set(prior.flat().map((i) => String(i.id)));
  return items.filter((i) => !seen.has(String(i.id)));
}