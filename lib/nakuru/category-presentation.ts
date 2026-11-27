import type { LucideIcon } from "lucide-react";
import {
  Baby,
  BedDouble,
  Bike,
  Briefcase,
  Building2,
  Car,
  CarTaxiFront,
  Dumbbell,
  Forklift,
  Handshake,
  Laptop,
  LayoutGrid,
  PawPrint,
  Shirt,
  Smartphone,
  Sofa,
  Sparkles,
  Wheat,
  Wrench,
  FileText,
} from "lucide-react";
import type { CategoryTint } from "@/components/app/category/browse/categories";
import { imageForCategorySlug } from "@/lib/nakuru/category-root-images";

export type CategoryPresentation = {
  icon: LucideIcon;
  tint: CategoryTint;
  image: string | null;
};

const BY_SLUG: Record<string, { icon: LucideIcon; tint: CategoryTint }> = {
  vehicles: { icon: Car, tint: "amber" },
  taxi: { icon: CarTaxiFront, tint: "orange" },
  rider: { icon: Bike, tint: "lime" },
  "real-estate": { icon: Building2, tint: "teal" },
  stays: { icon: BedDouble, tint: "sky" },
  "mobile-phones-tablets": { icon: Smartphone, tint: "violet" },
  electronics: { icon: Laptop, tint: "indigo" },
  "home-garden": { icon: Sofa, tint: "stone" },
  "fashion-and-beauty": { icon: Shirt, tint: "rose" },
  "health-and-beauty": { icon: Sparkles, tint: "fuchsia" },
  "babies-and-kids": { icon: Baby, tint: "cyan" },
  "animals-and-pets": { icon: PawPrint, tint: "orange" },
  "agriculture-and-foodstuff": { icon: Wheat, tint: "lime" },
  "hobbies-art-sport": { icon: Dumbbell, tint: "sky" },
  "office-and-commercial-equipment-tools": { icon: Forklift, tint: "amber" },
  "business-and-industry": { icon: Briefcase, tint: "emerald" },
  services: { icon: Handshake, tint: "emerald" },
  "repair-and-construction": { icon: Wrench, tint: "stone" },
  jobs: { icon: Briefcase, tint: "indigo" },
  "seeking-work-cvs": { icon: FileText, tint: "violet" },
};

const FALLBACK: { icon: LucideIcon; tint: CategoryTint } = {
  icon: LayoutGrid,
  tint: "stone",
};

export function presentationForSlug(slug: string): CategoryPresentation {
  const row = BY_SLUG[slug] ?? FALLBACK;
  return {
    icon: row.icon,
    tint: row.tint,
    image: imageForCategorySlug(slug),
  };
}

export const CATEGORY_PRESENTATION_SLUGS = Object.keys(BY_SLUG);
