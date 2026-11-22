import type { MetadataRoute } from "next";
import { isLiveCatalogEnabled } from "@/lib/nakuru/catalog-live";
import { demoItems } from "@/lib/nakuru/data/items";
import { listPublicListings } from "@/lib/server/catalog";
import { absoluteUrl } from "@/lib/seo/site";

async function listingIds(): Promise<string[]> {
  if (!isLiveCatalogEnabled()) {
    return demoItems().map((i) => String(i.id));
  }
  try {
    return (await listPublicListings(null)).map((r) => r.id);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const ids = await listingIds();

  return [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/app"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    ...ids.map((id) => ({
      url: absoluteUrl(`/app/p/${encodeURIComponent(id)}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
