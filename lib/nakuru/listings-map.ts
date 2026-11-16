import type { CategoryId, Listing } from "@/lib/nakuru/types";

/** Raw row from `GET /api/listings` (mirrors reference Express `catalog.js`). */
export type ApiListing = {
  id: string;
  category: string;
  title: string;
  description?: string | null;
  emoji: string;
  imageUrl?: string | null;
  price: number;
  vendor: string;
  verified: boolean;
};

export function toProductCardItem(api: ApiListing): Listing {
  const subtitle =
    api.category === "services" && api.description
      ? api.description
      : api.vendor;
  return {
    id: api.id,
    c: api.category as CategoryId,
    e: api.emoji || "📦",
    img: api.imageUrl || undefined,
    t: api.title,
    s: subtitle,
    p: api.price,
    v: api.verified ? 1 : 0,
  };
}