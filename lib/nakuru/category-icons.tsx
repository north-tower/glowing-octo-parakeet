import type { ReactNode } from "react";
import {
  IconBolt,
  IconCar,
  IconCookingPot,
  IconGrid,
  IconHome,
  IconLandPlot,
  IconShirt,
  IconShoe,
  IconSmartphone,
  IconSprayBottle,
  IconTv,
  IconWatch,
  IconWrench,
  IconSalad,
  IconBed,
  IconTaxi,
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
  | "land-plot"
  | "car"
  | "bolt"
  | "spray-bottle"
  | "wrench"
  | "grid"
  | "bed"
  | "taxi";

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
  "land-plot": IconLandPlot,
  car: IconCar,
  bolt: IconBolt,
  "spray-bottle": IconSprayBottle,
  wrench: IconWrench,
  grid: IconGrid,
  bed: IconBed,
  taxi: IconTaxi,
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