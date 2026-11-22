import type { MetadataRoute } from "next";
import { SEO_AREAS } from "@/lib/seo/areas";
import { filterListings, getDirectoryData } from "@/lib/seo/directory";
import { absoluteUrl } from "@/lib/seo/site";

type Entry = MetadataRoute.Sitemap[number];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const { categories, listings } = await getDirectoryData();

  const page = (
    path: string,
    priority: number,
    changeFrequency: Entry["changeFrequency"] = "daily",
  ): Entry => ({ url: absoluteUrl(path), lastModified: now, changeFrequency, priority });

  const hasListings = (opts: Parameters<typeof filterListings>[1]) =>
    filterListings(listings, opts).length > 0;

  const categoryPages = categories
    .filter((category) => hasListings({ category }))
    .map((c) => page(`/nakuru/${c.slug}`, 0.8));

  const areaPages = SEO_AREAS.filter((area) => hasListings({ area })).map((a) =>
    page(`/nakuru/${a.slug}`, 0.8),
  );

  const comboPages = SEO_AREAS.flatMap((area) =>
    categories
      .filter((category) => hasListings({ area, category }))
      .map((c) => page(`/nakuru/${area.slug}/${c.slug}`, 0.7)),
  );

  const vendorIds = [
    ...new Set(listings.map((l) => l.vendorId).filter((v): v is string => !!v)),
  ];

  return [
    page("/", 1, "weekly"),
    page("/nakuru", 0.9),
    page("/app", 0.8),
    ...categoryPages,
    ...areaPages,
    ...comboPages,
    ...vendorIds.map((id) => page(`/v/${id}`, 0.6, "weekly")),
    ...listings.map((l) =>
      page(`/app/p/${encodeURIComponent(l.id)}`, 0.6, "weekly"),
    ),
  ];
}
