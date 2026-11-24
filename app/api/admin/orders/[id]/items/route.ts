import { NextResponse } from "next/server";
import { getAdminOrderItems } from "@/lib/server/admin-orders";
import { bearerUser, requireRole } from "@/lib/server/middleware";

type RouteContext = { params: Promise<{ id: string }> };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(req: Request, ctx: RouteContext) {
  const user = bearerUser(req);
  if (!user || !requireRole(user, "admin", "support")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!requireRole(user, "admin")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    const items = await getAdminOrderItems(id);
    return NextResponse.json({ items });
  } catch (err) {
    console.error("[GET /api/admin/orders/:id/items]", err);
    return NextResponse.json({ error: "request_failed" }, { status: 500 });
  }
}