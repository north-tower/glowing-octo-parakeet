import { NextResponse } from "next/server";
import { listCustomerInquiries } from "@/lib/server/inquiries";
import { bearerUser } from "@/lib/server/middleware";

function staffBlocked(role: string): boolean {
  return role === "admin" || role === "support";
}

export async function GET(req: Request) {
  const user = bearerUser(req);
  if (!user || staffBlocked(user.role)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const inquiries = await listCustomerInquiries(user.id);
  return NextResponse.json({ inquiries });
}