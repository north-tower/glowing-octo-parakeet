import { NextResponse } from "next/server";
import { bearerUser, requireRole } from "@/lib/server/middleware";
import { vendorEarnings } from "@/lib/server/vendor-orders";

export async function GET(req: Request) {
  const user = bearerUser(req);
  if (!user || !requireRole(user, "customer", "vendor")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const earnings = await vendorEarnings(user.id);
  return NextResponse.json(earnings);
}
