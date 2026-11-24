import { NextResponse } from "next/server";
import {
  adminInquiryToJson,
  listAdminInquiries,
} from "@/lib/server/admin-inquiries";
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
  const statusRaw = url.searchParams.get("status");
  const status =
    statusRaw === "open" || statusRaw === "closed" ? statusRaw : undefined;
  if (statusRaw && !status) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    const rows = await listAdminInquiries({
      limit,
      cursorAt: cursor?.at,
      cursorId: cursor?.id,
      status,
    });
    const payload = rows.map(adminInquiryToJson);
    const last = rows[rows.length - 1];
    const nextCursor =
      rows.length === limit && last
        ? `${last.createdAt.toISOString()},${last.id}`
        : null;

    return NextResponse.json({ rows: payload, nextCursor });
  } catch (err) {
    console.error("[GET /api/admin/inquiries]", err);
    return NextResponse.json({ error: "request_failed" }, { status: 500 });
  }
}