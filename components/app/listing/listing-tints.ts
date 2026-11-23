import type { CategoryTint } from "@/components/app/category/browse/categories";

export const LISTING_TINT_TILE: Record<CategoryTint, string> = {
  amber: "bg-amber-50 text-amber-600",
  teal: "bg-teal-50 text-teal-600",
  sky: "bg-sky-50 text-sky-600",
  violet: "bg-violet-50 text-violet-600",
  rose: "bg-rose-50 text-rose-600",
  lime: "bg-lime-50 text-lime-600",
  orange: "bg-orange-50 text-orange-600",
  cyan: "bg-cyan-50 text-cyan-600",
  indigo: "bg-indigo-50 text-indigo-600",
  emerald: "bg-emerald-50 text-emerald-600",
  fuchsia: "bg-fuchsia-50 text-fuchsia-600",
  stone: "bg-stone-100 text-stone-600",
};

export const LISTING_TINT_ICON: Record<CategoryTint, string> = {
  amber: "text-amber-700",
  teal: "text-teal-700",
  sky: "text-sky-700",
  violet: "text-violet-700",
  rose: "text-rose-700",
  lime: "text-lime-700",
  orange: "text-orange-700",
  cyan: "text-cyan-700",
  indigo: "text-indigo-700",
  emerald: "text-emerald-700",
  fuchsia: "text-fuchsia-700",
  stone: "text-stone-700",
};

const BADGE_PRIORITY: readonly ListingCardBadgeOrder[] = [
  "featured",
  "verified",
  "hot",
  "new",
];

type ListingCardBadgeOrder = "verified" | "featured" | "hot" | "new";

export function pickListingBadges(
  badges: ListingCardBadgeOrder[],
  max = 2,
): ListingCardBadgeOrder[] {
  const sorted = BADGE_PRIORITY.filter((b) => badges.includes(b));
  return sorted.slice(0, max);
}

export const BADGE_LABEL: Record<ListingCardBadgeOrder, string> = {
  featured: "Featured",
  verified: "Verified",
  hot: "Hot",
  new: "New",
};

export const BADGE_CLASS: Record<ListingCardBadgeOrder, string> = {
  featured: "bg-amber-100 text-amber-900",
  verified: "bg-emerald-100 text-emerald-900",
  hot: "bg-rose-100 text-rose-900",
  new: "bg-sky-100 text-sky-900",
};