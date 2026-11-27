import { audit } from "./audit";
import { getCategoryBySlug } from "./categories";
import {
  assertCategoryIsListableLeaf,
  CategoryTreeError,
  vendorMayUseProductCategory,
} from "./category-tree";
import { db } from "./db";
import { listingCreateDebug } from "./listing-create-debug";
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

type ApprovedVendor = {
  id: string;
  area: string | null;
  categories: string[];
};

async function approvedVendorForOwner(
  ownerId: string,
  vendorId?: string,
): Promise<ApprovedVendor | null> {
  const r = await db.q<ApprovedVendor>(
    `select id, area, categories
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
  listingCreateDebug("vendor", {
    found: Boolean(v),
    vendorId: v?.id ?? null,
    area: v?.area ?? null,
    vendorCategories: v?.categories ?? null,
  });
  if (!v) {
    throw new ProductError(403, "no_approved_vendor");
  }
  if (!v.area) {
    throw new ProductError(400, "area_required");
  }

  const dir = await getCategoryBySlug(data.category);
  listingCreateDebug("category", {
    slug: data.category,
    found: Boolean(dir),
    visible: dir?.visible ?? null,
    listingMode: dir?.listing_mode ?? null,
  });
  if (!dir || !dir.visible) {
    throw new ProductError(400, "bad_request");
  }

  try {
    await assertCategoryIsListableLeaf(data.category);
  } catch (err) {
    if (err instanceof CategoryTreeError) {
      listingCreateDebug("leaf-check", { code: err.code });
      throw new ProductError(err.status, err.code);
    }
    throw err;
  }

  listingCreateDebug("vendor-may-use-category", {
    skipped: true,
    reason: "approved vendors may file any listable leaf",
  });

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
    dir.listing_mode === "shop"
      ? data.stock === undefined
        ? null
        : data.stock
      : null;

  listingCreateDebug("insert", {
    vendorId: v.id,
    category: data.category,
    stock,
    listingMode: dir.listing_mode,
    hasImage: Boolean(data.imageDataUrl),
  });

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
      listingCreateDebug("image-upload", {
        failed: true,
        storage: err instanceof StorageError,
      });
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

  let effectiveListingMode: string | null = null;

  if (data.category !== undefined && data.category !== row.category) {
    const dir = await getCategoryBySlug(data.category);
    if (!dir || !dir.visible) {
      throw new ProductError(400, "bad_request");
    }
    try {
      await assertCategoryIsListableLeaf(data.category);
    } catch (err) {
      if (err instanceof CategoryTreeError) {
        throw new ProductError(err.status, err.code);
      }
      throw err;
    }
    const vendor = await approvedVendorForOwner(ownerId);
    if (
      !vendor ||
      !(await vendorMayUseProductCategory(vendor.categories, data.category))
    ) {
      throw new ProductError(400, "bad_request");
    }
    effectiveListingMode = dir.listing_mode;
    add("category", data.category);
    if (dir.listing_mode !== "shop") {
      add("stock", null);
    }
  }

  if (data.title !== undefined) add("title", data.title);
  if (data.price !== undefined) add("price_kes", data.price);
  if (data.stock !== undefined) {
    let mode = effectiveListingMode;
    if (mode === null) {
      const effectiveCat =
        data.category !== undefined ? data.category : row.category;
      const dir = await getCategoryBySlug(effectiveCat);
      if (!dir) {
        throw new ProductError(400, "bad_request");
      }
      mode = dir.listing_mode;
    }
    if (mode === "shop") {
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