import { NextResponse } from "next/server";
import { clientIp } from "@/lib/server/auth";
import { CommentError, softDeleteListingComment } from "@/lib/server/comments";
import { bearerUser } from "@/lib/server/middleware";

type RouteContext = { params: Promise<{ id: string }> };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function DELETE(req: Request, context: RouteContext) {
  const user = bearerUser(req);
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    await softDeleteListingComment(user, id, clientIp(req));
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof CommentError) {
      return NextResponse.json({ error: err.code }, { status: err.status });
    }
    console.error("[DELETE /api/comments/:id]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
