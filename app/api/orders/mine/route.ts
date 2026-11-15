import { NextResponse } from "next/server";
import { listCustomerOrders, OrderError } from "@/lib/server/orders";
import { bearerUser, requireRole } from "@/lib/server/middleware";

function staffBlocked(role: string): boolean {
  return role === "admin" || role === "support";
}

export async function GET(req: Request) {
  const user = bearerUser(req);
  if (
    !user ||
    staffBlocked(user.role) ||
    !requireRole(user, "customer", "vendor")
  ) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const orders = await listCustomerOrders(user.id);
    return NextResponse.json(orders);
  } catch (err) {
    if (err instanceof OrderError) {
      return NextResponse.json({ error: err.code }, { status: err.status });
    }
    throw err;
  }
}