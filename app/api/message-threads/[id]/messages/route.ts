import { NextResponse } from "next/server";
import { clientIp } from "@/lib/server/auth";
import {
  MessageError,
  sendListingMessage,
} from "@/lib/server/listing-messages";
import { bearerUser } from "@/lib/server/middleware";
import { listingMessageNew } from "@/lib/server/schemas";

type RouteContext = { params: Promise<{ id: string }> };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: Request, context: RouteContext) {
  const user = bearerUser(req);
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const parsed = listingMessageNew.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    const message = await sendListingMessage(
      user,
      id,
      parsed.data.body,
      clientIp(req),
    );
    return NextResponse.json(message, { status: 201 });
  } catch (err) {
    if (err instanceof MessageError) {
      return NextResponse.json({ error: err.code }, { status: err.status });
    }
    console.error("[POST /api/message-threads/:id/messages]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}