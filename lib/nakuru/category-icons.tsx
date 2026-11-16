import type { ReactNode } from "react";
import {
  IconBolt,
  IconCar,
  IconCookingPot,
  IconGrid,
  IconHome,
  IconMountain,
  IconShirt,
  IconShoe,
  IconSmartphone,
  IconSparkle,
  IconTv,
  IconWatch,
  IconWrench,
  IconSalad,
} from "@/components/app/icons/LineIcons";

export type CategoryIconKey =
  | "smartphone"
  | "tv"
  | "cooking-pot"
  | "shirt"
  | "shoe"
  | "salad"
  | "watch"
  | "home"
  | "home-sale"
  | "mountain"
  | "car"
  | "bolt"
  | "sparkles"
  | "wrench"
  | "grid";

const ICONS: Record<
  CategoryIconKey,
  (props: { size?: number; className?: string }) => ReactNode
> = {
  smartphone: IconSmartphone,
  tv: IconTv,
  "cooking-pot": IconCookingPot,
  shirt: IconShirt,
  shoe: IconShoe,
  salad: IconSalad,
  watch: IconWatch,
  home: IconHome,
  "home-sale": IconHome,
  mountain: IconMountain,
  car: IconCar,
  bolt: IconBolt,
  sparkles: IconSparkle,
  wrench: IconWrench,
  grid: IconGrid,
};

export function CategoryIcon({
  icon,
  size = 24,
}: {
  icon: CategoryIconKey;
  size?: number;
}) {
  const Comp = ICONS[icon] ?? IconGrid;
  return <Comp size={size} />;
}

export function isCategoryIconKey(s: string): s is CategoryIconKey {
  return s in ICONS;
}