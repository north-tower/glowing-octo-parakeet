import { NextResponse } from "next/server";
import { clientIp } from "@/lib/server/auth";
import {
  CommentError,
  createListingComment,
  listPublicComments,
} from "@/lib/server/comments";
import { bearerUser } from "@/lib/server/middleware";

type RouteContext = { params: Promise<{ id: string }> };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function parseProductId(id: string): string | null {
  return UUID_RE.test(id) ? id : null;
}

function parseCommentBody(raw: unknown): string | null {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return null;
  }
  const keys = Object.keys(raw);
  if (keys.length !== 1 || keys[0] !== "body") return null;
  const value = (raw as { body: unknown }).body;
  if (typeof value !== "string") return null;
  const body = value.trim();
  if (body.length < 1 || body.length > 500) return null;
  return body;
}

export async function GET(_req: Request, context: RouteContext) {
  const { id } = await context.params;
  const productId = parseProductId(id);
  if (!productId) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    const rows = await listPublicComments(productId);
    return NextResponse.json(rows);
  } catch (err) {
    if (err instanceof CommentError) {
      return NextResponse.json({ error: err.code }, { status: err.status });
    }
    console.error("[GET /api/listings/:id/comments]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export async function POST(req: Request, context: RouteContext) {
  const user = bearerUser(req);
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const productId = parseProductId(id);
  if (!productId) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const text = parseCommentBody(body);
  if (!text) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    const row = await createListingComment(
      user,
      productId,
      text,
      clientIp(req),
    );
    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    if (err instanceof CommentError) {
      return NextResponse.json({ error: err.code }, { status: err.status });
    }
    console.error("[POST /api/listings/:id/comments]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
