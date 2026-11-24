import { NextResponse } from "next/server";
import {
  getMessageThreadDetail,
  MessageError,
} from "@/lib/server/listing-messages";
import { bearerUser } from "@/lib/server/middleware";

type RouteContext = { params: Promise<{ id: string }> };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: Request, context: RouteContext) {
  const user = bearerUser(req);
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    const thread = await getMessageThreadDetail(user, id);
    return NextResponse.json(thread);
  } catch (err) {
    if (err instanceof MessageError) {
      return NextResponse.json({ error: err.code }, { status: err.status });
    }
    console.error("[GET /api/message-threads/:id]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}