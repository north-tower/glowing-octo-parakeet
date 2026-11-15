import { NextResponse } from "next/server";
import { bearerUser, requireRole } from "@/lib/server/middleware";
import { listVendorsForAdmin } from "@/lib/server/vendors";

export async function GET(req: Request) {
  const user = bearerUser(req);
  if (!user || !requireRole(user, "admin", "support")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const status = url.searchParams.get("status") ?? "pending";

  const rows = await listVendorsForAdmin(status);
  return NextResponse.json(
    rows.map((r) => ({
      ...r,
      created_at: r.created_at.toISOString(),
    })),
  );
}