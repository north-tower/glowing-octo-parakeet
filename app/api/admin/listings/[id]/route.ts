import { NextResponse } from "next/server";
import { clientIp } from "@/lib/server/auth";
import {
  AdminListingError,
  staffDeleteListing,
} from "@/lib/server/admin-listings";
import { bearerUser, requireRole } from "@/lib/server/middleware";
import { uuid } from "@/lib/server/schemas";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(req: Request, ctx: RouteContext) {
  const user = bearerUser(req);
  if (!user || !requireRole(user, "admin", "support")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!requireRole(user, "admin")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id: rawId } = await ctx.params;
  if (!uuid.safeParse(rawId).success) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    await staffDeleteListing(rawId, user.id, clientIp(req));
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AdminListingError) {
      return NextResponse.json({ error: err.code }, { status: err.status });
    }
    console.error("[DELETE /api/admin/listings/:id]", err);
    return NextResponse.json({ error: "request_failed" }, { status: 500 });
  }
}
