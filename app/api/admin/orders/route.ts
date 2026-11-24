import { NextResponse } from "next/server";
import {
  adminOrderToJson,
  listAdminOrders,
} from "@/lib/server/admin-orders";
import { bearerUser, requireRole } from "@/lib/server/middleware";

const ORDER_STATUSES = new Set([
  "placed",
  "accepted",
  "ready",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "refused",
]);

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
  if (!requireRole(user, "admin")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const limit = parseLimit(url.searchParams.get("limit"));
  const cursor = parseCursor(url.searchParams.get("cursor"));
  const openOnly = url.searchParams.get("filter") === "open";
  const statusRaw = url.searchParams.get("status")?.trim() ?? "";
  const status =
    statusRaw && ORDER_STATUSES.has(statusRaw) ? statusRaw : undefined;
  if (statusRaw && !status) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    const rows = await listAdminOrders({
      limit,
      cursorAt: cursor?.at,
      cursorId: cursor?.id,
      status: openOnly ? undefined : status,
      openOnly,
    });
    const payload = rows.map(adminOrderToJson);
    const last = rows[rows.length - 1];
    const nextCursor =
      rows.length === limit && last
        ? `${last.createdAt.toISOString()},${last.id}`
        : null;

    return NextResponse.json({ rows: payload, nextCursor });
  } catch (err) {
    console.error("[GET /api/admin/orders]", err);
    return NextResponse.json({ error: "request_failed" }, { status: 500 });
  }
}