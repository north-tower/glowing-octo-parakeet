import type { ListingMode } from "@/lib/nakuru/types";
import type { SideRailIcon } from "@/lib/nakuru/data/constants";

export function listingModeRailIcon(mode: ListingMode): SideRailIcon {
  switch (mode) {
    case "property":
      return "home";
    case "cars":
      return "car";
    case "services":
      return "wrench";
    default:
      return "shopping-bag";
  }
}