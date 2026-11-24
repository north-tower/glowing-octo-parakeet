import { NextResponse } from "next/server";
import {
  adminListingToJson,
  listAdminListings,
  parseVendorStatusFilter,
} from "@/lib/server/admin-listings";
import { CATEGORY_SLUG_RE } from "@/lib/nakuru/category-slug";
import { bearerUser, requireRole } from "@/lib/server/middleware";

function parseLimit(raw: string | null): number {
  const n = raw ? Number.parseInt(raw, 10) : 50;
  if (!Number.isFinite(n) || n < 1) return 50;
  return Math.min(n, 100);
}

function parseCursor(
  raw: string | null,
): { at: Date; id: string } | undefined {
  if (!raw) return undefined;
  const sep = raw.indexOf(",");
  if (sep <= 0) return undefined;
  const at = new Date(raw.slice(0, sep));
  const id = raw.slice(sep + 1);
  if (Number.isNaN(at.getTime()) || !id) return undefined;
  return { at, id };
}

export async function GET(req: Request) {
  const user = bearerUser(req);
  if (!user || !requireRole(user, "admin", "support")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const limit = parseLimit(url.searchParams.get("limit"));
  const cursor = parseCursor(url.searchParams.get("cursor"));

  const activeRaw = url.searchParams.get("active");
  let activeOnly = false;
  let inactiveOnly = false;
  if (activeRaw === "true") activeOnly = true;
  else if (activeRaw === "false") inactiveOnly = true;
  else if (activeRaw === "all") {
    /* no filter */
  } else if (activeRaw != null && activeRaw !== "") {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const categoryRaw = url.searchParams.get("category")?.trim() ?? "";
  const category =
    categoryRaw && CATEGORY_SLUG_RE.test(categoryRaw) ? categoryRaw : undefined;
  if (categoryRaw && !category) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const vendorStatusRaw = url.searchParams.get("vendorStatus");
  const vendorStatus = parseVendorStatusFilter(vendorStatusRaw);
  if (vendorStatusRaw && !vendorStatus) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    const rows = await listAdminListings({
      limit,
      cursorAt: cursor?.at,
      cursorId: cursor?.id,
      activeOnly,
      inactiveOnly,
      category,
      vendorStatus,
    });
    const payload = rows.map(adminListingToJson);
    const last = rows[rows.length - 1];
    const nextCursor =
      rows.length === limit && last
        ? `${last.createdAt.toISOString()},${last.id}`
        : null;

    return NextResponse.json({ rows: payload, nextCursor });
  } catch (err) {
    console.error("[GET /api/admin/listings]", err);
    return NextResponse.json({ error: "request_failed" }, { status: 500 });
  }
}