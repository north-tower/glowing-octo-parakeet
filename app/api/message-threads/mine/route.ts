import { NextResponse } from "next/server";
import {
  listMessageThreads,
  MessageError,
} from "@/lib/server/listing-messages";
import { bearerUser } from "@/lib/server/middleware";

export async function GET(req: Request) {
  const user = bearerUser(req);
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const threads = await listMessageThreads(user.id);
    return NextResponse.json({ threads });
  } catch (err) {
    if (err instanceof MessageError) {
      return NextResponse.json({ error: err.code }, { status: err.status });
    }
    console.error("[GET /api/message-threads/mine]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}