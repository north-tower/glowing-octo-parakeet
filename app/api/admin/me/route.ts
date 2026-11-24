import { NextResponse } from "next/server";
import { getStaffMe } from "@/lib/server/admin-staff";
import { bearerUser, requireRole } from "@/lib/server/middleware";

export async function GET(req: Request) {
  const user = bearerUser(req);
  if (!user || !requireRole(user, "admin", "support")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const me = await getStaffMe(user.id);
  if (!me) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  return NextResponse.json(me);
}