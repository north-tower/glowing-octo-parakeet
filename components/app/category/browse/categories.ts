import type { LucideIcon } from "lucide-react";

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
