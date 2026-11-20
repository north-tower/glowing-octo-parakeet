import { NextResponse } from "next/server";
import {
  REFRESH_COOKIE,
  refreshCookieOptions,
} from "@/lib/server/auth";
import { revokeRefresh } from "@/lib/server/tokens";

export async function POST(req: Request) {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = new RegExp(
    `(?:^|;\\s*)${REFRESH_COOKIE}=([^;]+)`,
  ).exec(cookieHeader);
  const tok = match ? decodeURIComponent(match[1]) : "";
  if (tok && tok.length <= 100) {
    await revokeRefresh(tok);
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(REFRESH_COOKIE, "", {
    ...refreshCookieOptions(true),
    maxAge: 0,
  });
  return res;
}