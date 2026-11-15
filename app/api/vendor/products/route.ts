import { NextResponse } from "next/server";
import { bearerUser, requireRole } from "@/lib/server/middleware";
import { listVendorProducts } from "@/lib/server/products";

export async function GET(req: Request) {
  const user = bearerUser(req);
  if (!user || !requireRole(user, "customer", "vendor")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const rows = await listVendorProducts(user.id);
    return NextResponse.json(rows);
  } catch (err) {
    console.error("[GET /api/vendor/products]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}