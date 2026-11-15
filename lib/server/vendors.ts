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