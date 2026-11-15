import { NextResponse } from "next/server";
import { bearerUser, requireRole } from "@/lib/server/middleware";
import { listVendorsForOwner } from "@/lib/server/vendors";

export async function GET(req: Request) {
  const user = bearerUser(req);
  if (!user || !requireRole(user, "customer", "vendor")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const rows = await listVendorsForOwner(user.id);
  return NextResponse.json(rows);
}