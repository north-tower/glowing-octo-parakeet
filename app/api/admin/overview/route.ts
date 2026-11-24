import { NextResponse } from "next/server";
import { getAdminOverview } from "@/lib/server/admin-overview";
import { bearerUser, requireRole } from "@/lib/server/middleware";

export async function GET(req: Request) {
  const user = bearerUser(req);
  if (!user || !requireRole(user, "admin", "support")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!requireRole(user, "admin")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    const overview = await getAdminOverview();
    return NextResponse.json(overview);
  } catch (err) {
    console.error("[GET /api/admin/overview]", err);
    return NextResponse.json({ error: "request_failed" }, { status: 500 });
  }
}