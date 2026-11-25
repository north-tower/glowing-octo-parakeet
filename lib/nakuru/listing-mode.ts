import type { Listing, ListingMode } from "@/lib/nakuru/types";

const SERVICE_SLUG =
  /(?:^|-)(?:repair|repairs|plumbing|cleaning|electrician|salon|services?)(?:-|$)/i;

export function listingModeOf(item: Listing): ListingMode {
  if (item.c === "services" || item.c === "taxi" || item.c === "rider") {
    return "services";
  }
  if (SERVICE_SLUG.test(item.c)) return "services";
  if (item.c === "property" || item.c === "cars") return item.c;
  if (item.listingMode) return item.listingMode;
  return "shop";
}