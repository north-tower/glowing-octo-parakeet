import type { LucideIcon } from "lucide-react";
import {
  BedDouble,
  Building2,
  Car,
  CarTaxiFront,
  ChefHat,
  Footprints,
  Handshake,
  Home,
  LandPlot,
  LayoutGrid,
  Shirt,
  ShoppingBasket,
  Smartphone,
  SprayCan,
  Tv,
  Watch,
  Wrench,
  Zap,
} from "lucide-react";
import type { CategoryTint } from "@/components/app/category/browse/categories";
import {
  isCategoryIconKey,
  type CategoryIconKey,
} from "@/lib/nakuru/category-icons";
import { listingModeOf } from "@/lib/nakuru/listing-mode";
import type { Listing } from "@/lib/nakuru/types";

export type CategoryPlaceholder = {
  tint: CategoryTint;
  icon: LucideIcon;
  key: CategoryIconKey;
};

const BY_ICON: Record<CategoryIconKey, CategoryPlaceholder> = {
  smartphone: { key: "smartphone", icon: Smartphone, tint: "violet" },
  tv: { key: "tv", icon: Tv, tint: "indigo" },
  "cooking-pot": { key: "cooking-pot", icon: ChefHat, tint: "stone" },
  shirt: { key: "shirt", icon: Shirt, tint: "rose" },
  shoe: { key: "shoe", icon: Footprints, tint: "rose" },
  salad: { key: "salad", icon: ShoppingBasket, tint: "lime" },
  watch: { key: "watch", icon: Watch, tint: "amber" },
  home: { key: "home", icon: Home, tint: "teal" },
  "home-sale": { key: "home-sale", icon: Building2, tint: "emerald" },
  "land-plot": { key: "land-plot", icon: LandPlot, tint: "teal" },
  car: { key: "car", icon: Car, tint: "amber" },
  bolt: { key: "bolt", icon: Zap, tint: "orange" },
  "spray-bottle": { key: "spray-bottle", icon: SprayCan, tint: "cyan" },
  wrench: { key: "wrench", icon: Wrench, tint: "stone" },
  grid: { key: "grid", icon: LayoutGrid, tint: "stone" },
  bed: { key: "bed", icon: BedDouble, tint: "sky" },
  taxi: { key: "taxi", icon: CarTaxiFront, tint: "orange" },
};

const BY_MODE: Record<string, CategoryPlaceholder> = {
  shop: { key: "salad", icon: ShoppingBasket, tint: "lime" },
  property: BY_ICON.home,
  cars: BY_ICON.car,
  services: { key: "bolt", icon: Handshake, tint: "emerald" },
  stays: BY_ICON.bed,
  taxi: BY_ICON.taxi,
  rider: BY_ICON.taxi,
};

/** Category-aware placeholder: tinted field + that category's icon, never a generic T-shirt. */
export function listingPlaceholder(item: Listing): CategoryPlaceholder {
  if (isCategoryIconKey(item.e)) return BY_ICON[item.e];
  const mode = listingModeOf(item);
  return BY_MODE[mode] ?? BY_MODE[item.c] ?? BY_ICON.grid;
}

export function placeholderForIconKey(key: CategoryIconKey): CategoryPlaceholder {
  return BY_ICON[key];
}
