import type { ListingMode } from "@/lib/nakuru/types";
import { OFFICIAL_CATEGORY_SEED } from "@/lib/nakuru/data/official-category-seed";

export type DirectoryKind = "official" | "community";

export type DirectoryCategory = {
  slug: string;
  label: string;
  kind: DirectoryKind;
  listingMode: ListingMode;
  visible: boolean;
  openForApply: boolean;
  sortOrder: number;
  parentSlug: string | null;
  depth: number;
  hasChildren: boolean;
};

export const LEGACY_CATEGORY_ALIASES: Record<string, string> = {
  shop: "business-and-industry",
  property: "real-estate",
};

export function resolveCategoryAlias(slug: string): string {
  return LEGACY_CATEGORY_ALIASES[slug] ?? slug;
}

export const OFFICIAL_DIRECTORY_FALLBACK: DirectoryCategory[] =
  OFFICIAL_CATEGORY_SEED;

export function officialRootSlugs(): string[] {
  return OFFICIAL_DIRECTORY_FALLBACK.filter(
    (r) => r.visible && r.depth === 0,
  ).map((r) => r.slug);
}
