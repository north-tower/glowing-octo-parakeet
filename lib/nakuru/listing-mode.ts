import type { Listing, ListingMode } from "@/lib/nakuru/types";

export function listingModeOf(item: Listing): ListingMode {
  if (item.listingMode) return item.listingMode;
  if (item.c === "services" || item.c === "taxi" || item.c === "rider") {
    return "services";
  }
  if (item.c === "property" || item.c === "cars") return item.c;
  return "shop";
}