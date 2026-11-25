import { NextResponse } from "next/server";
import { clientIp } from "@/lib/server/auth";
import {
  HomePlacementError,
  listStaffHomePlacements,
  staffCreateHomePlacement,
  staffPlacementToJson,
} from "@/lib/server/home-placements";
import { bearerUser, requireRole } from "@/lib/server/middleware";
import { staffHomePlacementNew } from "@/lib/server/schemas";

export async function GET(req: Request) {
  const user = bearerUser(req);
  if (!user || !requireRole(user, "admin", "support")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const productId = new URL(req.url).searchParams.get("productId")?.trim();
  const uuidRe =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const filter =
    productId && uuidRe.test(productId) ? { productId } : undefined;
  if (productId && !filter) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    const rows = await listStaffHomePlacements(filter);
    return NextResponse.json({ rows: rows.map(staffPlacementToJson) });
  } catch (err) {
    console.error("[GET /api/admin/home-placements]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = bearerUser(req);
  if (!user || !requireRole(user, "admin")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const parsed = staffHomePlacementNew.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const data = parsed.data;
  try {
    const row = await staffCreateHomePlacement(
      {
        productId: data.productId,
        sortOrder: data.sortOrder,
        headline: data.headline,
        subtitle: data.subtitle,
        imageUrl: data.imageUrl,
        active: data.active,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
        createdBy: user.id,
      },
      clientIp(req),
    );
    return NextResponse.json(staffPlacementToJson(row), { status: 201 });
  } catch (err) {
    if (err instanceof HomePlacementError) {
      return NextResponse.json({ error: err.code }, { status: err.status });
    }
    console.error("[POST /api/admin/home-placements]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}