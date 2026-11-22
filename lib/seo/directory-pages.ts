import type { Metadata } from "next";
import { areaBySlug, SEO_AREAS, type SeoArea } from "./areas";
import { filterListings, type DirectoryData } from "./directory";
import { categoryHeading, type SeoCategory } from "./directory-copy";

export type Segment =
  | { kind: "area"; area: SeoArea }
  | { kind: "category"; category: SeoCategory };

/** Area slugs win over category slugs so area URLs stay stable. */
export function resolveSegment(data: DirectoryData, slug: string): Segment | null {
  const area = areaBySlug(slug);
  if (area) return { kind: "area", area };
  const category = data.categories.find((c) => c.slug === slug);
  return category ? { kind: "category", category } : null;
}

export function categoryBySlug(
  data: DirectoryData,
  slug: string,
): SeoCategory | undefined {
  return data.categories.find((c) => c.slug === slug);
}

type Link = { href: string; label: string; count: number };

function nonEmpty(links: Link[]): Link[] {
  return links.filter((l) => l.count > 0);
}

export function areaLinks(
  data: DirectoryData,
  opts: { category?: SeoCategory; exclude?: string } = {},
): Link[] {
  return nonEmpty(
    SEO_AREAS.filter((a) => a.slug !== opts.exclude).map((area) => ({
      href: opts.category
        ? `/nakuru/${area.slug}/${opts.category.slug}`
        : `/nakuru/${area.slug}`,
      label: opts.category
        ? categoryHeading(opts.category, area.name)
        : area.name,
      count: filterListings(data.listings, { area, category: opts.category }).length,
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
        count: filterListings(data.listings, { area: opts.area, category }).length,
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
      siteName: "NakuruHub",
      locale: "en_KE",
    },
  };
}