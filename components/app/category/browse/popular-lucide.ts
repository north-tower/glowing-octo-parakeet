import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Car,
  ChefHat,
  Home,
  Shirt,
  ShoppingBasket,
  Smartphone,
  SprayCan,
  Tv,
  Zap,
} from "lucide-react";
import type { CategoryTint } from "@/components/app/category/browse/categories";

export type PopularLucideDef = {
  icon: LucideIcon;
  tint: CategoryTint;
};

/** Lucide + tint per `TOPC` row index (popular rail uses `CAT_POPULAR`). */
export const POPULAR_LUCIDE_BY_TOPC_INDEX: Record<number, PopularLucideDef> = {
  0: { icon: Smartphone, tint: "violet" },
  1: { icon: Tv, tint: "indigo" },
  2: { icon: ChefHat, tint: "stone" },
  3: { icon: Shirt, tint: "rose" },
  5: { icon: ShoppingBasket, tint: "lime" },
  7: { icon: Building2, tint: "teal" },
  9: { icon: Home, tint: "emerald" },
  10: { icon: Car, tint: "amber" },
  13: { icon: Zap, tint: "orange" },
  14: { icon: SprayCan, tint: "cyan" },
};

const COMMUNITY_FALLBACK: PopularLucideDef = {
  icon: Shirt,
  tint: "rose",
};

export function popularLucideForTopcIndex(index: number): PopularLucideDef {
  return POPULAR_LUCIDE_BY_TOPC_INDEX[index] ?? { icon: Shirt, tint: "teal" };
}

export function popularLucideForCommunity(): PopularLucideDef {
  return COMMUNITY_FALLBACK;
}