import { NextResponse } from "next/server";
import { issue } from "@/lib/server/email-otp";
import { otpReq } from "@/lib/server/schemas";

/** Customers/vendors: email OTP. Always 202 when parsed so addresses are not enumerable. */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: true }, { status: 202 });
  }

  const b = otpReq.safeParse(body);
  if (b.success) await issue(b.data.email);

  return NextResponse.json({ ok: true }, { status: 202 });
}