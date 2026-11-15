import { NextResponse } from "next/server";
import { clientIp } from "@/lib/server/auth";
import {
  createServiceInquiry,
  InquiryError,
} from "@/lib/server/inquiries";
import { bearerUser } from "@/lib/server/middleware";
import { inquiryNew } from "@/lib/server/schemas";

function staffBlocked(role: string): boolean {
  return role === "admin" || role === "support";
}

export async function POST(req: Request) {
  const user = bearerUser(req);
  if (!user || staffBlocked(user.role)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const parsed = inquiryNew.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const ip = clientIp(req);
  try {
    const row = await createServiceInquiry(
      user.id,
      parsed.data.productId,
      parsed.data.message,
      ip,
    );
    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    if (err instanceof InquiryError) {
      return NextResponse.json({ error: err.code }, { status: err.status });
    }
    throw err;
  }
}