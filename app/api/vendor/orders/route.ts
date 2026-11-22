import { NextResponse } from "next/server";
import { clientIp } from "@/lib/server/auth";
import { bearerUser, requireRole } from "@/lib/server/middleware";
import { OrderError } from "@/lib/server/orders";
import { vendorOrderAction } from "@/lib/server/schemas";
import {
  listVendorOrders,
  updateVendorOrderStatus,
} from "@/lib/server/vendor-orders";

export async function GET(req: Request) {
  const user = bearerUser(req);
  if (!user || !requireRole(user, "customer", "vendor")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const orders = await listVendorOrders(user.id);
  return NextResponse.json({ orders });
}

export async function POST(req: Request) {
  const user = bearerUser(req);
  if (!user || !requireRole(user, "customer", "vendor")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const parsed = vendorOrderAction.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    await updateVendorOrderStatus(
      user.id,
      parsed.data.orderId,
      parsed.data.status,
      clientIp(req),
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof OrderError) {
      return NextResponse.json({ error: err.code }, { status: err.status });
    }
    throw err;
  }
}
