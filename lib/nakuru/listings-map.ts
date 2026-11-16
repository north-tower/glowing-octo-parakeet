import type { CategoryId, Listing } from "@/lib/nakuru/types";

/** Raw row from `GET /api/listings` (mirrors reference Express `catalog.js`). */
export type ApiListing = {
  id: string;
  category: string;
  title: string;
  description?: string | null;
  emoji: string;
  imageUrl?: string | null;
  galleryUrls?: string[];
  attributes?: Record<string, string>;
  price: number;
  vendor: string;
  vendorId?: string;
  verified: boolean;
};

export function toProductCardItem(api: ApiListing): Listing {
  const subtitle =
    api.category === "services" && api.description
      ? api.description
      : api.vendor;
  const gallery = (api.galleryUrls ?? []).filter(Boolean);
  const img = api.imageUrl || gallery[0] || undefined;
  return {
    id: api.id,
    c: api.category as CategoryId,
    e: api.emoji || "📦",
    img,
    imgs: gallery.length ? gallery : img ? [img] : undefined,
    t: api.title,
    s: subtitle,
    desc: api.description ?? undefined,
    p: api.price,
    v: api.verified ? 1 : 0,
    vn: api.vendor,
    attrs: api.attributes,
  };
}