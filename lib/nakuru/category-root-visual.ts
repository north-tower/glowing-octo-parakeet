import type { CategoryIconKey } from "@/lib/nakuru/category-icons";
import type { TopCategoryTint } from "@/lib/nakuru/data/constants";
import type { ListingMode } from "@/lib/nakuru/types";

const ROOT_ICON: Record<string, CategoryIconKey> = {
  vehicles: "car",
  "real-estate": "home",
  "mobile-phones-tablets": "smartphone",
  electronics: "tv",
  "home-garden": "cooking-pot",
  "fashion-and-beauty": "shirt",
  "health-and-beauty": "spray-bottle",
  "babies-and-kids": "bed",
  "animals-and-pets": "home",
  "agriculture-and-foodstuff": "salad",
  "hobbies-art-sport": "watch",
  "office-and-commercial-equipment-tools": "wrench",
  "repair-and-construction": "wrench",
  "business-and-industry": "grid",
  jobs: "bolt",
  "seeking-work-cvs": "bolt",
  services: "wrench",
  stays: "bed",
  taxi: "taxi",
  rider: "taxi",
};

export function iconForCategorySlug(
  slug: string,
  listingMode: ListingMode,
): CategoryIconKey {
  if (ROOT_ICON[slug]) return ROOT_ICON[slug]!;
  if (listingMode === "property") return "home";
  if (listingMode === "cars") return "car";
  if (listingMode === "services") return "wrench";
  return "grid";
}

export function tintForListingMode(mode: ListingMode): TopCategoryTint {
  if (mode === "property") return "green";
  if (mode === "cars") return "sand";
  if (mode === "services") return "pink";
  return "teal";
}