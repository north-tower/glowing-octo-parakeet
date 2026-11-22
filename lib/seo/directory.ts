import { cacheLife } from "next/cache";
import { isLiveCatalogEnabled } from "@/lib/nakuru/catalog-live";
import { OFFICIAL_DIRECTORY_FALLBACK } from "@/lib/nakuru/data/category-directory";
import { categoryName } from "@/lib/nakuru/data/constants";
import { demoItems } from "@/lib/nakuru/data/items";
import { listingModeOf } from "@/lib/nakuru/listing-mode";
import type { ListingMode } from "@/lib/nakuru/types";
import { listPublicListings } from "@/lib/server/catalog";
import { listVisibleCategories } from "@/lib/server/categories";
import { areaForLocation, type SeoArea } from "./areas";
import type { SeoCategory } from "./directory-copy";

export type DirListing = {
  id: string;
  title: string;
  price: number;
  categorySlug: string;
  categoryLabel: string;
  mode: ListingMode;
  location: string | null;
  areaSlug: string | null;
  image: string | null;
  vendor: string | null;
  vendorId: string | null;
  verified: boolean;
  rent: boolean;
};

export type DirectoryData = {
  categories: SeoCategory[];
  listings: DirListing[];
};

function fallbackCategories(): SeoCategory[] {
  return OFFICIAL_DIRECTORY_FALLBACK.map(({ slug, label, listingMode }) => ({
    slug,
    label,
    listingMode,
  }));
}

function demoListings(): DirListing[] {
  return demoItems().map((d) => {
    const location = d.attrs?.location ?? null;
    return {
      id: String(d.id),
      title: d.t,
      price: d.p,
      categorySlug: d.c,
      categoryLabel: d.categoryLabel ?? categoryName(d.c),
      mode: listingModeOf(d),
      location,
      areaSlug: areaForLocation(location)?.slug ?? null,
      image: d.img ?? null,
      vendor: d.vn ?? null,
      vendorId: null,
      verified: !!d.v,
      rent: d.attrs?.tenure === "rent",
    };
  });
}

async function liveListings(): Promise<DirListing[]> {
  const rows = await listPublicListings(null);
  return rows.map((r) => {
    const location = r.attributes.location ?? null;
    return {
      id: r.id,
      title: r.title,
      price: r.price,
      categorySlug: r.category,
      categoryLabel: r.categoryLabel,
      mode: r.listingMode,
      location,
      areaSlug: areaForLocation(location)?.slug ?? null,
      image: r.imageUrl,
      vendor: r.vendor,
      vendorId: r.vendorId,
      verified: r.verified,
      rent: r.attributes.tenure === "rent",
    };
  });
}

export async function getDirectoryData(): Promise<DirectoryData> {
  "use cache";
  cacheLife("minutes");

  if (!isLiveCatalogEnabled()) {
    return { categories: fallbackCategories(), listings: demoListings() };
  }
  try {
    const [categories, listings] = await Promise.all([
      listVisibleCategories(),
      liveListings(),
    ]);
    return {
      categories: categories.map(({ slug, label, listingMode }) => ({
        slug,
        label,
        listingMode,
      })),
      listings,
    };
  } catch {
    return { categories: fallbackCategories(), listings: [] };
  }
}

export function filterListings(
  listings: DirListing[],
  opts: { category?: SeoCategory; area?: SeoArea; vendorId?: string },
): DirListing[] {
  return listings.filter(
    (l) =>
      (!opts.category || l.categorySlug === opts.category.slug) &&
      (!opts.area || l.areaSlug === opts.area.slug) &&
      (!opts.vendorId || l.vendorId === opts.vendorId),
  );
}
