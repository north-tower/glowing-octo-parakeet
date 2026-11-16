import { NextResponse } from "next/server";
import {
  REFRESH_COOKIE,
  refreshCookieOptions,
} from "@/lib/server/auth";
import { accessToken, rotateRefresh } from "@/lib/server/tokens";

export async function POST(req: Request) {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = new RegExp(
    `(?:^|;\\s*)${REFRESH_COOKIE}=([^;]+)`,
  ).exec(cookieHeader);
  const tok = match ? decodeURIComponent(match[1]) : "";
  if (!tok || tok.length > 100) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const r = await rotateRefresh(tok);
  if (!r.ok) {
    const res = NextResponse.json({ error: "unauthorized" }, { status: 401 });
    if (r.clearCookie) {
      res.cookies.set(REFRESH_COOKIE, "", { ...refreshCookieOptions, maxAge: 0 });
    }
    return res;
  }

  const res = NextResponse.json({ access: accessToken(r.user) });
  res.cookies.set(REFRESH_COOKIE, r.refresh, refreshCookieOptions);
  return res;
}