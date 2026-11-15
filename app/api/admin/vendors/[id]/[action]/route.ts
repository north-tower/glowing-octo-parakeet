import { NextResponse } from "next/server";
import { clientIp } from "@/lib/server/auth";
import { bearerUser, requireRole } from "@/lib/server/middleware";
import { uuid } from "@/lib/server/schemas";
import {
  adminVendorAction,
  type AdminVendorAction,
  VendorError,
} from "@/lib/server/vendors";

const actions = new Set<AdminVendorAction>(["approve", "reject", "verify"]);

type RouteContext = { params: Promise<{ id: string; action: string }> };

export async function POST(req: Request, ctx: RouteContext) {
  const user = bearerUser(req);
  if (!user || !requireRole(user, "admin", "support")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id, action: rawAction } = await ctx.params;
  if (!uuid.safeParse(id).success) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  if (!actions.has(rawAction as AdminVendorAction)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const action = rawAction as AdminVendorAction;

  try {
    await adminVendorAction(id, action, user.id, clientIp(req));
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof VendorError) {
      return NextResponse.json({ error: err.code }, { status: err.status });
    }
    throw err;
  }
}