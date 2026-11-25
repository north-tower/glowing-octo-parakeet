import type { LucideIcon } from "lucide-react";
import { ShieldCheck, Store, Truck } from "lucide-react";
import type { HomeCopyKey } from "@/lib/nakuru/home-i18n";

export type HeroSlideTone = "light" | "dark";

export type HeroSlideAction = "shop" | "vendor" | "help";

export type HeroSlideData = {
  id: string;
  titleKey: HomeCopyKey;
  subtitleKey: HomeCopyKey;
  cta: {
    labelKey: HomeCopyKey;
    href: string;
    action: HeroSlideAction;
  };
  icon: LucideIcon;
  iconColorClass: string;
  gradient: string;
  tone: HeroSlideTone;
  pattern: "dots" | "waves" | "grid";
};

export const HERO_AUTOPLAY_MS = 6000;

export const heroSlides: HeroSlideData[] = [
  {
    id: "delivery",
    titleKey: "slide0Title",
    subtitleKey: "slide0Sub",
    cta: {
      labelKey: "slide0Cta",
      href: "/app?tab=cat",
      action: "shop",
    },
    icon: Truck,
    iconColorClass: "text-teal-800",
    gradient: "sl--hero-delivery",
    tone: "dark",
    pattern: "dots",
  },
  {
    id: "verified",
    titleKey: "slide1Title",
    subtitleKey: "slide1Sub",
    cta: {
      labelKey: "slide1Cta",
      href: "#verified",
      action: "help",
    },
    icon: ShieldCheck,
    iconColorClass: "text-[#0d5c56]",
    gradient: "sl--hero-verified",
    tone: "dark",
    pattern: "waves",
  },
  {
    id: "sell",
    titleKey: "slide2Title",
    subtitleKey: "slide2Sub",
    cta: {
      labelKey: "slide2Cta",
      href: "/app?start=vendor",
      action: "vendor",
    },
    icon: Store,
    iconColorClass: "text-[#9f1239]",
    gradient: "sl--hero-sell",
    tone: "dark",
    pattern: "grid",
  },
];
