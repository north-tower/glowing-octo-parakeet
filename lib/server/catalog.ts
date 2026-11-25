import type { ListingMode } from "@/lib/nakuru/types";
import { listingAttributesWithShopArea } from "@/lib/nakuru/vendor-area";
import { listLeafSlugsInSubtree, resolveCategorySlug } from "./category-tree";
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
  vendorLogoUrl: string | null;
  createdAt: string | null;
  vendorCreatedAt: string | null;
};

async function visibleLeafSlugsOrNone(
  category: string | null | undefined,
): Promise<string[] | null | typeof NO_MATCH> {
  if (!category || category === "all") return null;
  const canonical = await resolveCategorySlug(category);
  const leaves = await listLeafSlugsInSubtree(canonical);
  if (leaves === null) return NO_MATCH;
  if (leaves.length === 0) return NO_MATCH;
  return leaves;
}

type ListingRow = Omit<
  PublicListingRow,
  "vendorLogoUrl" | "createdAt" | "vendorCreatedAt"
> & {
  vendorArea: string | null;
  vendorWhatsapp: string | null;
  vendorLogoUrl: string | null;
  createdAt: Date | string | null;
  vendorCreatedAt: Date | string | null;
};

function isoOrNull(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? value : new Date(parsed).toISOString();
}

function shapeListing(row: ListingRow): PublicListingRow {
  const { vendorArea, vendorWhatsapp, createdAt, vendorCreatedAt, ...rest } =
    row;
  return {
    ...rest,
    createdAt: isoOrNull(createdAt),
    vendorCreatedAt: isoOrNull(vendorCreatedAt),
    attributes: listingAttributesWithShopArea(
      rest.attributes,
      vendorArea,
      vendorWhatsapp,
    ),
  };
}

const LISTINGS_SQL = `select p.id, p.category, c.label as "categoryLabel", c.listing_mode as "listingMode",
       p.title, p.description, p.emoji, p.image_url as "imageUrl",
       coalesce(p.gallery_urls, '{}') as "galleryUrls",
       coalesce(p.attributes, '{}')::jsonb as attributes,
       p.price_kes::int price, v.name vendor, v.id as "vendorId", v.verified,
       v.logo_url as "vendorLogoUrl",
       p.created_at as "createdAt", v.created_at as "vendorCreatedAt",
       v.area as "vendorArea", v.whatsapp as "vendorWhatsapp"
from products p
join vendors v on v.id = p.vendor_id
join categories c on c.slug = p.category
where p.active
  and v.status = 'approved'
  and c.visible
  and (p.stock is null or p.stock > 0)
  and ($1::text[] is null or p.category = any($1::text[]))
order by p.created_at desc
limit 200`;

export async function listPublicListings(
  category: string | null | undefined,
): Promise<PublicListingRow[]> {
  const leaves = await visibleLeafSlugsOrNone(category);
  if (leaves === NO_MATCH) return [];

  const r = await q<ListingRow>(LISTINGS_SQL, [leaves]);
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
            v.logo_url as "vendorLogoUrl",
            p.created_at as "createdAt", v.created_at as "vendorCreatedAt",
            v.area as "vendorArea", v.whatsapp as "vendorWhatsapp"
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