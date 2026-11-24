import { NextResponse } from "next/server";
import { clientIp } from "@/lib/server/auth";
import { bearerUser, requireRole } from "@/lib/server/middleware";
import { vendorNew } from "@/lib/server/schemas";
import { applyVendor, VendorError } from "@/lib/server/vendors";

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

  const parsed = vendorNew.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    const row = await applyVendor(
      user.id,
      parsed.data.name,
      parsed.data.categories,
      clientIp(req),
      parsed.data.imageDataUrl,
      parsed.data.area,
    );
    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    if (err instanceof VendorError) {
      return NextResponse.json({ error: err.code }, { status: err.status });
    }
    throw err;
  }
}