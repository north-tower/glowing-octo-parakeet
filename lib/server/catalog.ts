import { q } from "./db";

const PUBLIC_CATEGORIES = ["shop", "property", "cars", "services"] as const;

export type PublicListingRow = {
  id: string;
  category: string;
  title: string;
  description: string | null;
  emoji: string;
  price: number;
  vendor: string;
  verified: boolean;
};

export async function listPublicListings(
  category: string | null | undefined,
): Promise<PublicListingRow[]> {
  const cat =
    category &&
    (PUBLIC_CATEGORIES as readonly string[]).includes(category)
      ? category
      : null;

  const r = await q<PublicListingRow>(
    `select p.id, p.category, p.title, p.description, p.emoji, p.price_kes::int price,
            v.name vendor, v.verified
     from products p
     join vendors v on v.id = p.vendor_id
     where p.active
       and v.status = 'approved'
       and (p.stock is null or p.stock > 0)
       and ($1::text is null or p.category = $1)
     order by p.created_at desc
     limit 200`,
    [cat],
  );
  return r.rows;
}