import { NextResponse } from "next/server";
import { audit } from "@/lib/server/audit";
import {
  clientIp,
  refreshCookieOptions,
  REFRESH_COOKIE,
  startSession,
  upsertUserByEmail,
} from "@/lib/server/auth";
import { check } from "@/lib/server/email-otp";
import { otpVerify } from "@/lib/server/schemas";

export async function POST(req: Request) {
  const ip = clientIp(req);
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    await audit("otp_fail", null, ip);
    return NextResponse.json({ error: "invalid_code" }, { status: 401 });
  }

  const b = otpVerify.safeParse(body);
  if (!b.success || !(await check(b.data.email, b.data.code))) {
    await audit("otp_fail", null, ip);
    return NextResponse.json({ error: "invalid_code" }, { status: 401 });
  }

  const u = await upsertUserByEmail(b.data.email);
  if (u.role === "admin" || u.role === "support") {
    await audit("otp_staff_blocked", u.id, ip);
    return NextResponse.json({ error: "use_staff_login" }, { status: 403 });
  }
  if (u.disabled) {
    return NextResponse.json({ error: "disabled" }, { status: 403 });
  }

  await audit("login", u.id, ip);
  const session = await startSession({ id: u.id, role: u.role });
  const res = NextResponse.json({ access: session.access });
  res.cookies.set(
    REFRESH_COOKIE,
    session.refresh,
    refreshCookieOptions(b.data.remember),
  );
  return res;
}