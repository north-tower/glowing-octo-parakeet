import { audit } from "./audit";
import {
  type CategoryPublicRow,
  getCategoryBySlug,
  mapCategoryRow,
  slugsAllowedForApply,
  upsertCommunityCategory,
} from "./categories";
import { db } from "./db";
import {
  parseImageDataUrl,
  StorageError,
  uploadVendorBanner,
  uploadVendorLogo,
} from "./storage";

export class VendorError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string) {
    super(code);
    this.status = status;
    this.code = code;
  }
}

export async function applyVendor(
  ownerId: string,
  name: string,
  categories: string[],
  ip: string | null,
  imageDataUrl?: string,
  area?: string,
): Promise<{ id: string; status: string; logo_url: string | null }> {
  if (!(await slugsAllowedForApply(categories))) {
    throw new VendorError(400, "bad_request");
  }

  const pending = (
    await db.q<{ n: number }>(
      "select count(*)::int n from vendors where owner_id=$1 and status='pending'",
      [ownerId],
    )
  ).rows[0].n;
  if (pending >= 3) {
    throw new VendorError(429, "too_many_pending");
  }

  const v = (
    await db.q<{ id: string; status: string }>(
      `insert into vendors(owner_id, name, categories, area, status)
       values($1, $2, $3, $4, 'approved') returning id, status`,
      [ownerId, name, categories, area?.trim() || null],
    )
  ).rows[0];

  let logoUrl: string | null = null;
  if (imageDataUrl) {
    const parsed = parseImageDataUrl(imageDataUrl);
    if (!parsed) {
      throw new VendorError(400, "bad_request");
    }
    try {
      logoUrl = await uploadVendorLogo(v.id, parsed.bytes, parsed.contentType);
      await db.q("update vendors set logo_url = $2 where id = $1", [v.id, logoUrl]);
    } catch (err) {
      if (err instanceof StorageError) {
        throw new VendorError(503, "image_upload_failed");
      }
      throw err;
    }
  }

  await audit("vendor_apply", ownerId, ip, { vendor: v.id });
  return { ...v, logo_url: logoUrl };
}

export type VendorMineRow = {
  id: string;
  name: string;
  categories: string[];
  status: string;
  verified: boolean;
  logo_url: string | null;
  banner_url: string | null;
  area: string | null;
  whatsapp: string | null;
  created_at: Date;
};

export async function listVendorsForOwner(
  ownerId: string,
): Promise<VendorMineRow[]> {
  const r = await db.q<VendorMineRow>(
    `select id, name, categories, status, verified, logo_url, banner_url, area, whatsapp, created_at
     from vendors
     where owner_id = $1
     order by created_at desc
     limit 20`,
    [ownerId],
  );
  return r.rows;
}

export type PublicVendorRow = {
  id: string;
  name: string;
  verified: boolean;
  logo_url: string | null;
  banner_url: string | null;
  area: string | null;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getPublicVendor(
  id: string,
): Promise<PublicVendorRow | null> {
  if (!UUID_RE.test(id)) return null;
  const r = await db.q<PublicVendorRow>(
    `select id, name, verified, logo_url, banner_url, area
     from vendors
     where id = $1::uuid and status = 'approved'
     limit 1`,
    [id],
  );
  return r.rows[0] ?? null;
}

export async function setVendorArea(
  ownerId: string,
  area: string,
  ip: string | null,
): Promise<{ area: string }> {
  const r = await db.q<{ area: string }>(
    `update vendors
     set area = $2
     where id = (
       select id from vendors
       where owner_id = $1 and status = 'approved'
       order by created_at
       limit 1
     )
     returning area`,
    [ownerId, area],
  );
  if (!r.rowCount) {
    throw new VendorError(403, "no_approved_vendor");
  }
  await audit("vendor_area", ownerId, ip, { area });
  return { area: r.rows[0].area };
}

export async function setVendorWhatsApp(
  ownerId: string,
  whatsapp: string | null,
  ip: string | null,
): Promise<{ whatsapp: string | null }> {
  const r = await db.q<{ whatsapp: string | null }>(
    `update vendors
     set whatsapp = $2
     where id = (
       select id from vendors
       where owner_id = $1 and status = 'approved'
       order by created_at
       limit 1
     )
     returning whatsapp`,
    [ownerId, whatsapp],
  );
  if (!r.rowCount) {
    throw new VendorError(403, "no_approved_vendor");
  }
  await audit("vendor_whatsapp", ownerId, ip, { whatsapp: Boolean(whatsapp) });
  return { whatsapp: r.rows[0].whatsapp };
}

export async function setVendorBanner(
  ownerId: string,
  imageDataUrl: string,
  ip: string | null,
): Promise<{ banner_url: string }> {
  const parsed = parseImageDataUrl(imageDataUrl);
  if (!parsed) {
    throw new VendorError(400, "bad_request");
  }

  const vendor = (
    await db.q<{ id: string }>(
      `select id from vendors
       where owner_id = $1 and status = 'approved'
       order by created_at
       limit 1`,
      [ownerId],
    )
  ).rows[0];
  if (!vendor) {
    throw new VendorError(403, "no_approved_vendor");
  }

  let bannerUrl: string;
  try {
    bannerUrl = await uploadVendorBanner(
      vendor.id,
      parsed.bytes,
      parsed.contentType,
    );
  } catch (err) {
    if (err instanceof StorageError) {
      throw new VendorError(503, "image_upload_failed");
    }
    throw err;
  }

  await db.q("update vendors set banner_url = $2 where id = $1", [
    vendor.id,
    bannerUrl,
  ]);
  await audit("vendor_banner", ownerId, ip, { vendor: vendor.id });
  return { banner_url: bannerUrl };
}

export type AdminVendorRow = {
  id: string;
  name: string;
  categories: string[];
  status: string;
  verified: boolean;
  logo_url: string | null;
  created_at: Date;
  owner_email: string | null;
};

const adminStatuses = new Set(["pending", "approved", "rejected"]);

export async function listVendorsForAdmin(
  status: string,
): Promise<AdminVendorRow[]> {
  const st = adminStatuses.has(status) ? status : "pending";
  const r = await db.q<AdminVendorRow>(
    `select v.id, v.name, v.categories, v.status, v.verified, v.logo_url, v.created_at,
            u.email as owner_email
     from vendors v
     join users u on u.id = v.owner_id
     where v.status = $1
     order by v.created_at desc
     limit 100`,
    [st],
  );
  return r.rows;
}

export type AdminVendorAction = "approve" | "reject" | "verify";

export async function adminVendorAction(
  vendorId: string,
  action: AdminVendorAction,
  staffId: string,
  ip: string | null,
): Promise<{ owner_id: string }> {
  const sqlByAction: Record<AdminVendorAction, string> = {
    approve: "update vendors set status='approved' where id=$1 returning owner_id",
    reject: "update vendors set status='rejected' where id=$1 returning owner_id",
    verify:
      "update vendors set verified=true where id=$1 and status='approved' returning owner_id",
  };

  const r = await db.q<{ owner_id: string }>(sqlByAction[action], [vendorId]);
  if (!r.rowCount) {
    throw new VendorError(404, "not_found");
  }

  const ownerId = r.rows[0].owner_id;

  const event =
    action === "approve"
      ? "vendor_approved"
      : action === "reject"
        ? "vendor_rejected"
        : "vendor_verified";
  await audit(event, staffId, ip, { vendor: vendorId });

  return { owner_id: ownerId };
}

type ApprovedVendorRow = { id: string; categories: string[] };

async function approvedVendorForOwner(
  ownerId: string,
): Promise<ApprovedVendorRow | null> {
  const r = await db.q<ApprovedVendorRow>(
    `select id, categories
     from vendors
     where owner_id = $1
       and status = 'approved'
     order by created_at
     limit 1`,
    [ownerId],
  );
  return r.rows[0] ?? null;
}

export async function appendVendorCategory(
  ownerId: string,
  input: { label?: string; slug?: string; parentSlug?: string },
): Promise<{ categories: string[]; category: CategoryPublicRow }> {
  const vendor = await approvedVendorForOwner(ownerId);
  if (!vendor) {
    throw new VendorError(403, "no_approved_vendor");
  }

  let category: CategoryPublicRow;
  if (input.label !== undefined) {
    category = await upsertCommunityCategory(
      ownerId,
      input.label,
      input.parentSlug,
    );
    return { categories: vendor.categories, category };
  } else if (input.slug !== undefined) {
    const row = await getCategoryBySlug(input.slug);
    if (!row || !row.visible || !row.open_for_apply) {
      throw new VendorError(400, "bad_request");
    }
    if (row.depth !== 0) {
      throw new VendorError(400, "bad_request");
    }
    category = mapCategoryRow(row);
  } else {
    throw new VendorError(400, "bad_request");
  }

  if (vendor.categories.includes(category.slug)) {
    return { categories: vendor.categories, category };
  }

  if (vendor.categories.length >= 4) {
    throw new VendorError(400, "category_limit");
  }

  const updated = (
    await db.q<{ categories: string[] }>(
      `update vendors set categories = array_append(categories, $2::text)
       where id = $1
       returning categories`,
      [vendor.id, category.slug],
    )
  ).rows[0];

  return { categories: updated.categories, category };
}