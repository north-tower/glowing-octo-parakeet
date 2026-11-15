import { audit } from "./audit";
import { config } from "./config";
import { db } from "./db";

export class VendorError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string) {
    super(code);
    this.status = status;
    this.code = code;
  }
}

const launchCategorySet = new Set<string>(config.launchCategories);

/** Launch guard: only categories listed in `config.launchCategories` may be applied for. */
export function categoriesAllowedAtLaunch(categories: readonly string[]): boolean {
  return (
    categories.length > 0 && categories.every((c) => launchCategorySet.has(c))
  );
}

export async function applyVendor(
  ownerId: string,
  name: string,
  categories: string[],
  ip: string | null,
): Promise<{ id: string; status: string }> {
  if (!categoriesAllowedAtLaunch(categories)) {
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
      "insert into vendors(owner_id, name, categories) values($1, $2, $3) returning id, status",
      [ownerId, name, categories],
    )
  ).rows[0];

  await audit("vendor_apply", ownerId, ip, { vendor: v.id });
  return v;
}

export type VendorMineRow = {
  id: string;
  name: string;
  categories: string[];
  status: string;
  verified: boolean;
  created_at: Date;
};

export async function listVendorsForOwner(
  ownerId: string,
): Promise<VendorMineRow[]> {
  const r = await db.q<VendorMineRow>(
    `select id, name, categories, status, verified, created_at
     from vendors
     where owner_id = $1
     order by created_at desc
     limit 20`,
    [ownerId],
  );
  return r.rows;
}

export type AdminVendorRow = {
  id: string;
  name: string;
  categories: string[];
  status: string;
  verified: boolean;
  created_at: Date;
  owner_email: string | null;
};

const adminStatuses = new Set(["pending", "approved", "rejected"]);

export async function listVendorsForAdmin(
  status: string,
): Promise<AdminVendorRow[]> {
  const st = adminStatuses.has(status) ? status : "pending";
  const r = await db.q<AdminVendorRow>(
    `select v.id, v.name, v.categories, v.status, v.verified, v.created_at,
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

  if (action === "approve") {
    await db.q(
      "update users set role='vendor' where id=$1 and role='customer'",
      [ownerId],
    );
  }

  const event =
    action === "approve"
      ? "vendor_approved"
      : action === "reject"
        ? "vendor_rejected"
        : "vendor_verified";
  await audit(event, staffId, ip, { vendor: vendorId });

  return { owner_id: ownerId };
}