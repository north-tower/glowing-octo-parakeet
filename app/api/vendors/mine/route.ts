import { NextResponse } from "next/server";
import { clientIp } from "@/lib/server/auth";
import { bearerUser, requireRole } from "@/lib/server/middleware";
import { vendorAreaPatch } from "@/lib/server/schemas";
import {
  listVendorsForOwner,
  setVendorArea,
  VendorError,
} from "@/lib/server/vendors";

export async function GET(req: Request) {
  const user = bearerUser(req);
  if (!user || !requireRole(user, "customer", "vendor")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const rows = await listVendorsForOwner(user.id);
  return NextResponse.json(rows);
}

export async function PATCH(req: Request) {
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

  const parsed = vendorAreaPatch.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    const row = await setVendorArea(user.id, parsed.data.area, clientIp(req));
    return NextResponse.json(row);
  } catch (err) {
    if (err instanceof VendorError) {
      return NextResponse.json({ error: err.code }, { status: err.status });
    }
    throw err;
  }
}