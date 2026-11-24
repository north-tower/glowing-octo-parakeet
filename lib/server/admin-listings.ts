import { db } from "./db";

export type AdminListingRow = {
  id: string;
  title: string;
  priceKes: number;
  active: boolean;
  stock: number | null;
  category: string;
  categoryLabel: string;
  listingMode: string;
  categoryVisible: boolean;
  vendorId: string;
  vendorName: string;
  vendorStatus: string;
  createdAt: Date;
  onPublicCatalog: boolean;
};

export type ListAdminListingsInput = {
  limit: number;
  cursorAt?: Date;
  cursorId?: string;
  activeOnly?: boolean;
  inactiveOnly?: boolean;
  category?: string;
  vendorStatus?: string;
};

export function adminListingToJson(row: AdminListingRow) {
  return {
    id: row.id,
    title: row.title,
    priceKes: row.priceKes,
    active: row.active,
    stock: row.stock,
    category: row.category,
    categoryLabel: row.categoryLabel,
    listingMode: row.listingMode,
    categoryVisible: row.categoryVisible,
    vendorId: row.vendorId,
    vendorName: row.vendorName,
    vendorStatus: row.vendorStatus,
    createdAt: row.createdAt.toISOString(),
    onPublicCatalog: row.onPublicCatalog,
  };
}

const VENDOR_STATUSES = new Set(["pending", "approved", "rejected"]);

export function parseVendorStatusFilter(
  raw: string | null,
): string | undefined {
  if (!raw) return undefined;
  return VENDOR_STATUSES.has(raw) ? raw : undefined;
}

export async function listAdminListings(
  input: ListAdminListingsInput,
): Promise<AdminListingRow[]> {
  const clauses = ["1=1"];
  const params: unknown[] = [];
  let n = 1;

  if (input.activeOnly) {
    clauses.push(`p.active = true`);
  } else if (input.inactiveOnly) {
    clauses.push(`p.active = false`);
  }

  if (input.category) {
    clauses.push(`p.category = $${n++}`);
    params.push(input.category);
  }

  if (input.vendorStatus) {
    clauses.push(`v.status = $${n++}`);
    params.push(input.vendorStatus);
  }

  if (input.cursorAt && input.cursorId) {
    clauses.push(
      `(p.created_at, p.id) < ($${n++}::timestamptz, $${n++}::uuid)`,
    );
    params.push(input.cursorAt, input.cursorId);
  }

  params.push(input.limit);

  const r = await db.q<{
    id: string;
    title: string;
    price_kes: number;
    active: boolean;
    stock: number | null;
    category: string;
    category_label: string;
    listing_mode: string;
    category_visible: boolean;
    vendor_id: string;
    vendor_name: string;
    vendor_status: string;
    created_at: Date;
    on_public: boolean;
  }>(
    `select p.id, p.title, p.price_kes, p.active, p.stock,
            p.category, c.label as category_label, c.listing_mode,
            c.visible as category_visible,
            v.id as vendor_id, v.name as vendor_name, v.status as vendor_status,
            p.created_at,
            (
              p.active
              and v.status = 'approved'
              and c.visible
              and (p.stock is null or p.stock > 0)
            ) as on_public
     from products p
     join vendors v on v.id = p.vendor_id
     join categories c on c.slug = p.category
     where ${clauses.join(" and ")}
     order by p.created_at desc, p.id desc
     limit $${n}`,
    params,
  );

  return r.rows.map((row) => ({
    id: row.id,
    title: row.title,
    priceKes: row.price_kes,
    active: row.active,
    stock: row.stock,
    category: row.category,
    categoryLabel: row.category_label,
    listingMode: row.listing_mode,
    categoryVisible: row.category_visible,
    vendorId: row.vendor_id,
    vendorName: row.vendor_name,
    vendorStatus: row.vendor_status,
    createdAt: row.created_at,
    onPublicCatalog: row.on_public,
  }));
}