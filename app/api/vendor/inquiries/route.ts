import { NextResponse } from "next/server";
import { listVendorInquiries } from "@/lib/server/inquiries";
import { bearerUser } from "@/lib/server/middleware";

export async function GET(req: Request) {
  const user = bearerUser(req);
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const inquiries = await listVendorInquiries(user.id);
  return NextResponse.json({ inquiries });
}