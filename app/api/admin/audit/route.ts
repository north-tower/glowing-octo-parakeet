import { NextResponse } from "next/server";
import { auditRowToJson, listAuditLog } from "@/lib/server/admin-audit";
import { bearerUser, requireRole } from "@/lib/server/middleware";

function parseLimit(raw: string | null): number {
  const n = raw ? Number.parseInt(raw, 10) : 50;
  if (!Number.isFinite(n) || n < 1) return 50;
  return Math.min(n, 100);
}

function parseCursor(raw: string | null): number | undefined {
  if (!raw) return undefined;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

function parseIso(raw: string | null): Date | undefined {
  if (!raw) return undefined;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? undefined : d;
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
  const eventRaw = url.searchParams.get("event")?.trim() || "";
  const eventPrefix =
    eventRaw && /^[a-z0-9_]+$/i.test(eventRaw) ? eventRaw : undefined;
  if (eventRaw && !eventPrefix) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const since = parseIso(url.searchParams.get("since"));
  const until = parseIso(url.searchParams.get("until"));

  try {
    const rows = await listAuditLog({
      limit,
      cursor,
      eventPrefix,
      since,
      until,
    });
    const payload = rows.map(auditRowToJson);
    const last = rows[rows.length - 1];
    const nextCursor =
      rows.length === limit && last ? String(last.id) : null;

    return NextResponse.json({ rows: payload, nextCursor });
  } catch (err) {
    console.error("[GET /api/admin/audit]", err);
    return NextResponse.json({ error: "request_failed" }, { status: 500 });
  }
}