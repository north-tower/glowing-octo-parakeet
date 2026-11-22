import type { ListingMode } from "@/lib/nakuru/types";
import { listingAttributesWithShopArea } from "@/lib/nakuru/vendor-area";
import { q } from "./db";

const NO_MATCH = "__none__";

export type PublicListingRow = {
  id: string;
  category: string;
  categoryLabel: string;
  listingMode: ListingMode;
  title: string;
  description: string | null;
  emoji: string;
  imageUrl: string | null;
  galleryUrls: string[];
  attributes: Record<string, string>;
  price: number;
  vendor: string;
  vendorId: string;
  verified: boolean;
};

async function visibleSlugOrNone(
  category: string | null | undefined,
): Promise<string | null | typeof NO_MATCH> {
  if (!category || category === "all") return null;
  const row = await q<{ slug: string }>(
    "select slug from categories where slug=$1 and visible",
    [category],
  );
  if (!row.rows[0]) return NO_MATCH;
  return row.rows[0].slug;
}

type ListingRow = PublicListingRow & { vendorArea: string | null };

function shapeListing(row: ListingRow): PublicListingRow {
  const { vendorArea, ...rest } = row;
  return {
    ...rest,
    attributes: listingAttributesWithShopArea(rest.attributes, vendorArea),
  };
}

const LISTINGS_SQL = `select p.id, p.category, c.label as "categoryLabel", c.listing_mode as "listingMode",
       p.title, p.description, p.emoji, p.image_url as "imageUrl",
       coalesce(p.gallery_urls, '{}') as "galleryUrls",
       coalesce(p.attributes, '{}')::jsonb as attributes,
       p.price_kes::int price, v.name vendor, v.id as "vendorId", v.verified,
       v.area as "vendorArea"
from products p
join vendors v on v.id = p.vendor_id
join categories c on c.slug = p.category
where p.active
  and v.status = 'approved'
  and c.visible
  and (p.stock is null or p.stock > 0)
  and ($1::text is null or p.category = $1)
order by p.created_at desc
limit 200`;

export async function listPublicListings(
  category: string | null | undefined,
): Promise<PublicListingRow[]> {
  const cat = await visibleSlugOrNone(category);
  if (cat === NO_MATCH) return [];

  const r = await q<ListingRow>(LISTINGS_SQL, [cat]);
  return r.rows.map(shapeListing);
}

export async function getPublicListingById(
  id: string,
): Promise<PublicListingRow | null> {
  const r = await q<ListingRow>(
    `select p.id, p.category, c.label as "categoryLabel", c.listing_mode as "listingMode",
            p.title, p.description, p.emoji, p.image_url as "imageUrl",
            coalesce(p.gallery_urls, '{}') as "galleryUrls",
            coalesce(p.attributes, '{}')::jsonb as attributes,
            p.price_kes::int price, v.name vendor, v.id as "vendorId", v.verified,
            v.area as "vendorArea"
     from products p
     join vendors v on v.id = p.vendor_id
     join categories c on c.slug = p.category
     where p.id = $1::uuid
       and p.active
       and v.status = 'approved'
       and c.visible
       and (p.stock is null or p.stock > 0)
     limit 1`,
    [id],
  );
  const row = r.rows[0];
  return row ? shapeListing(row) : null;
}