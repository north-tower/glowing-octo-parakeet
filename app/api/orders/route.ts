import { NextResponse } from "next/server";
import { clientIp } from "@/lib/server/auth";
import { createShopOrders, OrderError } from "@/lib/server/orders";
import { bearerUser, requireRole } from "@/lib/server/middleware";
import { orderNew } from "@/lib/server/schemas";

function staffBlocked(role: string): boolean {
  return role === "admin" || role === "support";
}

export async function POST(req: Request) {
  const user = bearerUser(req);
  if (
    !user ||
    staffBlocked(user.role) ||
    !requireRole(user, "customer", "vendor")
  ) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const parsed = orderNew.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const ip = clientIp(req);
  try {
    const orders = await createShopOrders(user.id, parsed.data, ip);
    return NextResponse.json({ orders }, { status: 201 });
  } catch (err) {
    if (err instanceof OrderError) {
      return NextResponse.json({ error: err.code }, { status: err.status });
    }
    throw err;
  }
}