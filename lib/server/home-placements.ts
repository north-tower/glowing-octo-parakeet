import { audit } from "./audit";
import { db } from "./db";

export type HomeHeroPromotionRow = {
  id: string;
  productId: string;
  title: string;
  subtitle: string;
  imageUrl: string | null;
  priceKes: number;
  vendorName: string;
  verified: boolean;
};

export type StaffHomePlacementRow = {
  id: string;
  productId: string;
  productTitle: string;
  vendorName: string;
  onPublicCatalog: boolean;
  placement: string;
  sortOrder: number;
  headline: string | null;
  subtitle: string | null;
  imageUrl: string | null;
  active: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type PlacementProductRow = {
  placement_id: string;
  product_id: string;
  product_title: string;
  product_image: string | null;
  gallery_urls: string[] | null;
  price_kes: number;
  vendor_name: string;
  vendor_verified: boolean;
  headline: string | null;
  subtitle: string | null;
  image_url: string | null;
};

const LIVE_PLACEMENT_SQL = `
  select hp.id as placement_id,
         p.id as product_id,
         p.title as product_title,
         p.image_url as product_image,
         coalesce(p.gallery_urls, '{}') as gallery_urls,
         p.price_kes,
         v.name as vendor_name,
         v.verified as vendor_verified,
         hp.headline,
         hp.subtitle,
         hp.image_url
  from homepage_placements hp
  join products p on p.id = hp.product_id
  join vendors v on v.id = p.vendor_id
  join categories c on c.slug = p.category
  where hp.placement = 'hero'
    and hp.active
    and p.active
    and v.status = 'approved'
    and c.visible
    and (p.stock is null or p.stock > 0)
    and (hp.starts_at is null or hp.starts_at <= now())
    and (hp.ends_at is null or hp.ends_at > now())
  order by hp.sort_order asc, hp.created_at asc
  limit 12`;

function resolveHeroImage(row: PlacementProductRow): string | null {
  if (row.image_url?.trim()) return row.image_url.trim();
  if (row.product_image?.trim()) return row.product_image.trim();
  const gallery = row.gallery_urls ?? [];
  const first = gallery.find((u) => u?.trim());
  return first?.trim() ?? null;
}

function defaultSubtitle(row: PlacementProductRow): string {
  return `${row.vendor_name} · KES ${row.price_kes.toLocaleString("en-KE")}`;
}

export function heroPromotionToJson(row: HomeHeroPromotionRow) {
  return {
    id: row.id,
    productId: row.productId,
    title: row.title,
    subtitle: row.subtitle,
    imageUrl: row.imageUrl,
    priceKes: row.priceKes,
    vendorName: row.vendorName,
    verified: row.verified,
  };
}

export async function listLiveHeroPromotions(): Promise<HomeHeroPromotionRow[]> {
  const r = await db.q<PlacementProductRow>(LIVE_PLACEMENT_SQL);
  return r.rows.map((row) => {
    const title = row.headline?.trim() || row.product_title;
    const subtitle = row.subtitle?.trim() || defaultSubtitle(row);
    return {
      id: row.placement_id,
      productId: row.product_id,
      title,
      subtitle,
      imageUrl: resolveHeroImage(row),
      priceKes: row.price_kes,
      vendorName: row.vendor_name,
      verified: row.vendor_verified,
    };
  });
}

export function staffPlacementToJson(row: StaffHomePlacementRow) {
  return {
    id: row.id,
    productId: row.productId,
    productTitle: row.productTitle,
    vendorName: row.vendorName,
    onPublicCatalog: row.onPublicCatalog,
    placement: row.placement,
    sortOrder: row.sortOrder,
    headline: row.headline,
    subtitle: row.subtitle,
    imageUrl: row.imageUrl,
    active: row.active,
    startsAt: row.startsAt?.toISOString() ?? null,
    endsAt: row.endsAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listStaffHomePlacements(opts?: {
  productId?: string;
}): Promise<StaffHomePlacementRow[]> {
  const clauses = ["hp.placement = 'hero'"];
  const params: unknown[] = [];
  let n = 1;

  if (opts?.productId) {
    clauses.push(`hp.product_id = $${n++}::uuid`);
    params.push(opts.productId);
  }

  const r = await db.q<{
    id: string;
    product_id: string;
    product_title: string;
    vendor_name: string;
    on_public: boolean;
    placement: string;
    sort_order: number;
    headline: string | null;
    subtitle: string | null;
    image_url: string | null;
    active: boolean;
    starts_at: Date | null;
    ends_at: Date | null;
    created_at: Date;
    updated_at: Date;
  }>(
    `select hp.id, hp.product_id, p.title as product_title, v.name as vendor_name,
            (
              p.active
              and v.status = 'approved'
              and c.visible
              and (p.stock is null or p.stock > 0)
            ) as on_public,
            hp.placement, hp.sort_order, hp.headline, hp.subtitle, hp.image_url,
            hp.active, hp.starts_at, hp.ends_at, hp.created_at, hp.updated_at
     from homepage_placements hp
     join products p on p.id = hp.product_id
     join vendors v on v.id = p.vendor_id
     join categories c on c.slug = p.category
     where ${clauses.join(" and ")}
     order by hp.sort_order asc, hp.created_at desc`,
    params,
  );

  return r.rows.map((row) => ({
    id: row.id,
    productId: row.product_id,
    productTitle: row.product_title,
    vendorName: row.vendor_name,
    onPublicCatalog: row.on_public,
    placement: row.placement,
    sortOrder: row.sort_order,
    headline: row.headline,
    subtitle: row.subtitle,
    imageUrl: row.image_url,
    active: row.active,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export class HomePlacementError extends Error {
  constructor(
    public code: "not_found" | "bad_product" | "duplicate",
    public status: number,
  ) {
    super(code);
    this.name = "HomePlacementError";
  }
}

export type CreateHomePlacementInput = {
  productId: string;
  sortOrder: number;
  headline?: string;
  subtitle?: string;
  imageUrl?: string;
  active: boolean;
  startsAt?: Date | null;
  endsAt?: Date | null;
  createdBy: string;
};

export async function staffCreateHomePlacement(
  input: CreateHomePlacementInput,
  ip: string | null,
): Promise<StaffHomePlacementRow> {
  const product = await db.q<{ id: string }>(
    `select id from products where id = $1::uuid limit 1`,
    [input.productId],
  );
  if (!product.rows[0]) {
    throw new HomePlacementError("bad_product", 400);
  }

  const dup = await db.q<{ id: string }>(
    `select id from homepage_placements
     where product_id = $1::uuid and placement = 'hero' limit 1`,
    [input.productId],
  );
  if (dup.rows[0]) {
    throw new HomePlacementError("duplicate", 409);
  }

  const inserted = await db.q<{ id: string }>(
    `insert into homepage_placements (
       product_id, placement, sort_order, headline, subtitle, image_url,
       active, starts_at, ends_at, created_by
     ) values ($1::uuid, 'hero', $2, $3, $4, $5, $6, $7, $8, $9::uuid)
     returning id`,
    [
      input.productId,
      input.sortOrder,
      input.headline ?? null,
      input.subtitle ?? null,
      input.imageUrl ?? null,
      input.active,
      input.startsAt ?? null,
      input.endsAt ?? null,
      input.createdBy,
    ],
  );
  const id = inserted.rows[0]!.id;
  await audit("home_placement_create", input.createdBy, ip, {
    placement: id,
    product: input.productId,
  });

  const rows = await listStaffHomePlacements();
  const row = rows.find((r) => r.id === id);
  if (!row) throw new HomePlacementError("not_found", 500);
  return row;
}

export type PatchHomePlacementInput = {
  sortOrder?: number;
  headline?: string | null;
  subtitle?: string | null;
  imageUrl?: string | null;
  active?: boolean;
  startsAt?: Date | null;
  endsAt?: Date | null;
};

export async function staffPatchHomePlacement(
  id: string,
  patch: PatchHomePlacementInput,
  staffId: string,
  ip: string | null,
): Promise<StaffHomePlacementRow> {
  const fields: string[] = ["updated_at = now()"];
  const params: unknown[] = [];
  let n = 1;

  if (patch.sortOrder !== undefined) {
    fields.push(`sort_order = $${n++}`);
    params.push(patch.sortOrder);
  }
  if (patch.headline !== undefined) {
    fields.push(`headline = $${n++}`);
    params.push(patch.headline);
  }
  if (patch.subtitle !== undefined) {
    fields.push(`subtitle = $${n++}`);
    params.push(patch.subtitle);
  }
  if (patch.imageUrl !== undefined) {
    fields.push(`image_url = $${n++}`);
    params.push(patch.imageUrl);
  }
  if (patch.active !== undefined) {
    fields.push(`active = $${n++}`);
    params.push(patch.active);
  }
  if (patch.startsAt !== undefined) {
    fields.push(`starts_at = $${n++}`);
    params.push(patch.startsAt);
  }
  if (patch.endsAt !== undefined) {
    fields.push(`ends_at = $${n++}`);
    params.push(patch.endsAt);
  }

  if (fields.length === 1) {
    throw new HomePlacementError("not_found", 400);
  }

  params.push(id);
  const r = await db.q<{ id: string }>(
    `update homepage_placements set ${fields.join(", ")}
     where id = $${n}::uuid
     returning id`,
    params,
  );
  if (!r.rows[0]) {
    throw new HomePlacementError("not_found", 404);
  }

  await audit("home_placement_update", staffId, ip, { placement: id });

  const rows = await listStaffHomePlacements();
  const row = rows.find((x) => x.id === id);
  if (!row) throw new HomePlacementError("not_found", 404);
  return row;
}

export async function staffDeleteHomePlacement(
  id: string,
  staffId: string,
  ip: string | null,
): Promise<void> {
  const r = await db.q<{ id: string }>(
    `delete from homepage_placements where id = $1::uuid returning id`,
    [id],
  );
  if (!r.rows[0]) {
    throw new HomePlacementError("not_found", 404);
  }
  await audit("home_placement_delete", staffId, ip, { placement: id });
}