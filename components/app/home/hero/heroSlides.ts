import type { LucideIcon } from "lucide-react";
import { Home, ShieldCheck, Truck } from "lucide-react";
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
    gradient:
      "bg-gradient-to-br from-[#073b39] via-[#0a524e] to-[#0d6f69]",
    tone: "dark",
  },
  {
    id: "listing",
    titleKey: "slide1Title",
    subtitleKey: "slide1Sub",
    cta: {
      labelKey: "slide1Cta",
      href: "/app?start=vendor",
      action: "vendor",
    },
    icon: Home,
    iconColorClass: "text-amber-800",
    gradient:
      "bg-gradient-to-br from-rose-900 via-rose-800 to-orange-700",
    tone: "dark",
  },
  {
    id: "verified",
    titleKey: "slide2Title",
    subtitleKey: "slide2Sub",
    cta: {
      labelKey: "slide2Cta",
      href: "#verified",
      action: "help",
    },
    icon: ShieldCheck,
    iconColorClass: "text-[#c41e5a]",
    gradient:
      "bg-gradient-to-br from-[#073b39] via-[#0a4a47] to-[#0d5c56]",
    tone: "dark",
  },
];