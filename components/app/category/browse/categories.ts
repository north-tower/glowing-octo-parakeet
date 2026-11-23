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
  PawPrint,
  Shirt,
  Smartphone,
  Sofa,
  Sparkles,
  Wheat,
  Wrench,
} from "lucide-react";

export type CategoryTint =
  | "amber"
  | "teal"
  | "sky"
  | "violet"
  | "rose"
  | "lime"
  | "orange"
  | "cyan"
  | "indigo"
  | "emerald"
  | "fuchsia"
  | "stone";

export type BrowseCategoryItem = {
  slug: string;
  label: string;
  icon: LucideIcon;
  tint: CategoryTint;
  count?: string;
};

export type BrowseCategoryGroup = {
  id: string;
  title: string;
  items: BrowseCategoryItem[];
};

export const BROWSE_CATEGORY_GROUPS: BrowseCategoryGroup[] = [
  {
    id: "vehicles-transport",
    title: "Vehicles & transport",
    items: [
      { slug: "vehicles", label: "Vehicles", icon: Car, tint: "amber", count: "1.2k ads" },
      { slug: "taxi", label: "Taxi", icon: CarTaxiFront, tint: "orange" },
      { slug: "rider", label: "Rider", icon: Bike, tint: "lime" },
    ],
  },
  {
    id: "property-stays",
    title: "Property & stays",
    items: [
      { slug: "real-estate", label: "Real Estate", icon: Building2, tint: "teal" },
      { slug: "stays", label: "Stays", icon: BedDouble, tint: "sky" },
    ],
  },
  {
    id: "shopping",
    title: "Shopping",
    items: [
      { slug: "mobile-phones-tablets", label: "Phones & Tablets", icon: Smartphone, tint: "violet" },
      { slug: "electronics", label: "Electronics", icon: Laptop, tint: "indigo" },
      { slug: "home-garden", label: "Home & Furniture", icon: Sofa, tint: "stone" },
      { slug: "fashion-and-beauty", label: "Fashion", icon: Shirt, tint: "rose" },
      { slug: "health-and-beauty", label: "Health & Beauty", icon: Sparkles, tint: "fuchsia" },
      { slug: "babies-and-kids", label: "Babies & Kids", icon: Baby, tint: "cyan" },
      { slug: "animals-and-pets", label: "Animals & Pets", icon: PawPrint, tint: "orange" },
      { slug: "agriculture-and-foodstuff", label: "Agriculture & Food", icon: Wheat, tint: "lime" },
      { slug: "hobbies-art-sport", label: "Hobbies & Sports", icon: Dumbbell, tint: "sky" },
      {
        slug: "office-and-commercial-equipment-tools",
        label: "Commercial Equipment",
        icon: Forklift,
        tint: "amber",
      },
      {
        slug: "business-and-industry",
        label: "Business & Industry",
        icon: Briefcase,
        tint: "emerald",
      },
    ],
  },
  {
    id: "services",
    title: "Services",
    items: [
      { slug: "services", label: "Services", icon: Handshake, tint: "emerald" },
      { slug: "repair-and-construction", label: "Repair & Construction", icon: Wrench, tint: "stone" },
    ],
  },
];

export const BROWSE_CATEGORY_SLUGS = new Set(
  BROWSE_CATEGORY_GROUPS.flatMap((g) => g.items.map((i) => i.slug)),
);

/** BEM modifier for `browse-tile__icon--{modifier}` (styles in app/nakuru/styles.css). */
export const CATEGORY_TINT_CLASSES: Record<CategoryTint, string> = {
  amber: "amber",
  teal: "teal",
  sky: "sky",
  violet: "violet",
  rose: "rose",
  lime: "lime",
  orange: "orange",
  cyan: "cyan",
  indigo: "indigo",
  emerald: "emerald",
  fuchsia: "fuchsia",
  stone: "stone",
};