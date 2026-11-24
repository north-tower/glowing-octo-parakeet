import { NextResponse } from "next/server";
import { audit } from "@/lib/server/audit";
import {
  clientIp,
  REFRESH_COOKIE,
  refreshCookieOptions,
  staffLogin,
  startSession,
} from "@/lib/server/auth";
import { config } from "@/lib/server/config";
import { staff } from "@/lib/server/schemas";

export async function POST(req: Request) {
  const ip = clientIp(req);
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const b = staff.safeParse(body);
  if (!b.success) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  if (config.staffTotpRequired && !b.data.totp) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const u = await staffLogin(
    b.data.email,
    b.data.password,
    b.data.totp ?? "",
  );
  if (!u) {
    await audit("staff_login_fail", null, ip);
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  await audit("staff_login", u.id, ip);
  const session = await startSession({ id: u.id, role: u.role });
  const res = NextResponse.json({ access: session.access, role: u.role });
  res.cookies.set(REFRESH_COOKIE, session.refresh, refreshCookieOptions(true));
  return res;
}