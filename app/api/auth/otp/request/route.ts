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
  let devCode: string | undefined;
  if (b.success) {
    const issued = await issue(b.data.email);
    devCode = issued.devCode;
  }

  return NextResponse.json(
    devCode ? { ok: true, devCode } : { ok: true },
    { status: 202 },
  );
}