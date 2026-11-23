import type { Metadata } from "next";
import { areaBySlug, SEO_AREAS, type SeoArea } from "./areas";
import {
  aliasMap,
  findCategory,
  resolveCategorySlug,
  type SeoCategoryNode,
} from "./category-tree";
import { filterListings, type DirectoryData } from "./directory";
import { categoryHeading } from "./directory-copy";
import { defaultShareImages, SITE_NAME } from "./site";

export type Segment =
  | { kind: "area"; area: SeoArea }
  | { kind: "category"; category: SeoCategoryNode };

function aliasesBySlug(data: DirectoryData): Map<string, string> {
  return aliasMap(data.aliases);
}

/** Area slugs win over category slugs so area URLs stay stable. */
export function resolveSegment(data: DirectoryData, slug: string): Segment | null {
  const area = areaBySlug(slug);
  if (area) return { kind: "area", area };
  const category = findCategory(data, slug, aliasesBySlug(data));
  return category ? { kind: "category", category } : null;
}

/** When `slug` is a category alias, returns the canonical slug for redirects. */
export function canonicalCategoryPathSlug(
  data: DirectoryData,
  slug: string,
): string | null {
  if (areaBySlug(slug)) return null;
  const aliases = aliasesBySlug(data);
  const canonical = resolveCategorySlug(slug, aliases);
  if (canonical === slug) return null;
  return findCategory(data, slug, aliases) ? canonical : null;
}

export function categoryBySlug(
  data: DirectoryData,
  slug: string,
): SeoCategoryNode | undefined {
  return findCategory(data, slug, aliasesBySlug(data));
}

type Link = { href: string; label: string; count: number };

function nonEmpty(links: Link[]): Link[] {
  return links.filter((l) => l.count > 0);
}

export function areaLinks(
  data: DirectoryData,
  opts: { category?: SeoCategoryNode; exclude?: string } = {},
): Link[] {
  return nonEmpty(
    SEO_AREAS.filter((a) => a.slug !== opts.exclude).map((area) => ({
      href: opts.category
        ? `/nakuru/${area.slug}/${opts.category.slug}`
        : `/nakuru/${area.slug}`,
      label: opts.category
        ? categoryHeading(opts.category, area.name)
        : area.name,
      count: filterListings(data.listings, {
        area,
        category: opts.category,
        categories: data.categories,
      }).length,
    })),
  );
}

export function categoryLinks(
  data: DirectoryData,
  opts: { area?: SeoArea; exclude?: string } = {},
): Link[] {
  return nonEmpty(
    data.categories
      .filter((c) => c.slug !== opts.exclude)
      .map((category) => ({
        href: opts.area
          ? `/nakuru/${opts.area.slug}/${category.slug}`
          : `/nakuru/${category.slug}`,
        label: opts.area
          ? categoryHeading(category, opts.area.name)
          : `${category.label} in Nakuru`,
        count: filterListings(data.listings, {
          area: opts.area,
          category,
          categories: data.categories,
        }).length,
      })),
  );
}

export function directoryMetadata(opts: {
  path: string;
  title: string;
  description: string;
  listingCount: number;
}): Metadata {
  const { path, title, description, listingCount } = opts;
  return {
    title,
    description,
    alternates: { canonical: path },
    robots: listingCount > 0 ? undefined : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url: path,
      type: "website",
      siteName: SITE_NAME,
      locale: "en_KE",
      images: defaultShareImages(),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: defaultShareImages().map((img) => img.url),
    },
  };
}