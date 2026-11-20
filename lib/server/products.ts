import { audit } from "./audit";
import { db } from "./db";
import {
  parseImageDataUrl,
  StorageError,
  uploadProductImage,
} from "./storage";

export class ProductError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string) {
    super(code);
    this.status = status;
    this.code = code;
  }
}

type ApprovedVendor = { id: string; categories: string[] };

async function approvedVendorForOwner(
  ownerId: string,
  vendorId?: string,
): Promise<ApprovedVendor | null> {
  const r = await db.q<ApprovedVendor>(
    `select id, categories
     from vendors
     where owner_id = $1
       and status = 'approved'
       and ($2::uuid is null or id = $2::uuid)
     order by created_at
     limit 1`,
    [ownerId, vendorId ?? null],
  );
  return r.rows[0] ?? null;
}

export type ProductCreateInput = {
  vendorId?: string;
  category: string;
  title: string;
  description: string;
  emoji: string;
  imageDataUrl?: string;
  price: number;
  stock?: number | null;
};

export async function createProduct(
  ownerId: string,
  data: ProductCreateInput,
  ip: string | null,
): Promise<{ id: string }> {
  const v = await approvedVendorForOwner(ownerId, data.vendorId);
  if (!v) {
    throw new ProductError(403, "no_approved_vendor");
  }
  if (!v.categories.includes(data.category)) {
    throw new ProductError(403, "category_not_approved");
  }

  const n = (
    await db.q<{ n: number }>(
      "select count(*)::int n from products where vendor_id = $1",
      [v.id],
    )
  ).rows[0].n;
  if (n >= 200) {
    throw new ProductError(429, "too_many_products");
  }

  const stock =
    data.category === "shop"
      ? data.stock === undefined
        ? null
        : data.stock
      : null;

  const p = (
    await db.q<{ id: string }>(
      `insert into products(vendor_id, category, title, description, emoji, price_kes, stock)
       values ($1, $2, $3, $4, $5, $6, $7)
       returning id`,
      [
        v.id,
        data.category,
        data.title,
        data.description,
        data.emoji,
        data.price,
        stock,
      ],
    )
  ).rows[0];

  if (data.imageDataUrl) {
    const parsed = parseImageDataUrl(data.imageDataUrl);
    if (!parsed) {
      throw new ProductError(400, "invalid_image");
    }
    try {
      const imageUrl = await uploadProductImage(
        v.id,
        p.id,
        parsed.bytes,
        parsed.contentType,
      );
      await db.q(
        "update products set image_url = $2 where id = $1",
        [p.id, imageUrl],
      );
    } catch (err) {
      if (err instanceof StorageError) {
        throw new ProductError(503, "image_upload_failed");
      }
      throw err;
    }
  }

  await audit("product_add", ownerId, ip, { product: p.id });
  return p;
}

export type VendorProductRow = {
  id: string;
  category: string;
  title: string;
  emoji: string;
  price: number;
  stock: number | null;
  active: boolean;
};

export async function listVendorProducts(
  ownerId: string,
): Promise<VendorProductRow[]> {
  const r = await db.q<VendorProductRow>(
    `select p.id, p.category, p.title, p.emoji, p.price_kes::int price, p.stock, p.active
     from products p
     join vendors v on v.id = p.vendor_id
     where v.owner_id = $1
     order by p.created_at desc
     limit 200`,
    [ownerId],
  );
  return r.rows;
}

export type ProductUpdateInput = {
  title?: string;
  category?: string;
  price?: number;
  stock?: number | null;
  active?: boolean;
};

export async function updateProduct(
  ownerId: string,
  productId: string,
  data: ProductUpdateInput,
  ip: string | null,
): Promise<void> {
  const cur = await db.q<{ category: string; vendor_id: string }>(
    `select p.category, p.vendor_id
     from products p
     join vendors v on v.id = p.vendor_id
     where p.id = $1 and v.owner_id = $2`,
    [productId, ownerId],
  );
  const row = cur.rows[0];
  if (!row) {
    throw new ProductError(404, "not_found");
  }

  const set: string[] = [];
  const vals: unknown[] = [productId, ownerId];

  const add = (col: string, val: unknown) => {
    vals.push(val);
    set.push(`${col} = $${vals.length}`);
  };

  if (data.category !== undefined && data.category !== row.category) {
    const v = await db.q<{ categories: string[] }>(
      "select categories from vendors where id = $1 and status = 'approved'",
      [row.vendor_id],
    );
    const vendor = v.rows[0];
    if (!vendor?.categories.includes(data.category)) {
      throw new ProductError(403, "category_not_approved");
    }
    add("category", data.category);
    if (data.category === "services") {
      add("stock", null);
    }
  }

  if (data.title !== undefined) add("title", data.title);
  if (data.price !== undefined) add("price_kes", data.price);
  if (data.stock !== undefined) {
    const effectiveCat =
      data.category !== undefined ? data.category : row.category;
    if (effectiveCat === "shop") {
      add("stock", data.stock);
    }
  }
  if (data.active !== undefined) add("active", data.active);

  if (!set.length) {
    throw new ProductError(400, "bad_request");
  }

  const r = await db.q<{ id: string }>(
    `update products p
     set ${set.join(", ")}
     from vendors v
     where p.id = $1
       and v.id = p.vendor_id
       and v.owner_id = $2
     returning p.id`,
    vals,
  );

  if (!r.rowCount) {
    throw new ProductError(404, "not_found");
  }

  await audit("product_update", ownerId, ip, { product: productId });
}