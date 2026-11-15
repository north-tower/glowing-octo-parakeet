import { NextResponse } from "next/server";

/** POST /api/auth/otp/request — email OTP wired in Task 4 */
export async function POST() {
  return NextResponse.json({ error: "not_implemented" }, { status: 501 });
}