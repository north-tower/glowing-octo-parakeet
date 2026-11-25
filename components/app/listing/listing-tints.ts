import type { CategoryTint } from "@/components/app/category/browse/categories";
import type { ListingCardBadge } from "@/components/app/listing/listing-card-types";

export const LISTING_TINT_TILE: Record<CategoryTint, string> = {
  amber: "lc-ph--amber",
  teal: "lc-ph--teal",
  sky: "lc-ph--sky",
  violet: "lc-ph--violet",
  rose: "lc-ph--rose",
  lime: "lc-ph--lime",
  orange: "lc-ph--orange",
  cyan: "lc-ph--cyan",
  indigo: "lc-ph--indigo",
  emerald: "lc-ph--emerald",
  fuchsia: "lc-ph--fuchsia",
  stone: "lc-ph--stone",
};

const BADGE_PRIORITY: readonly ListingCardBadge[] = [
  "featured",
  "verified",
  "hot",
  "new",
];

export function pickListingBadges(
  badges: ListingCardBadge[],
  max = 1,
): ListingCardBadge[] {
  const sorted = BADGE_PRIORITY.filter((b) => badges.includes(b));
  return sorted.slice(0, max);
}

export const BADGE_LABEL: Record<ListingCardBadge, string> = {
  featured: "Featured",
  verified: "Verified",
  hot: "Hot",
  new: "New",
};

export const BADGE_CLASS: Record<ListingCardBadge, string> = {
  featured: "lc-badge--featured",
  verified: "lc-badge--verified",
  hot: "lc-badge--hot",
  new: "lc-badge--new",
};
