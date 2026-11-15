import { NextResponse } from "next/server";
import { bearerUser } from "@/lib/server/middleware";

export async function GET(req: Request) {
  const user = bearerUser(req);
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ id: user.id, role: user.role });
}