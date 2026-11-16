import { NextResponse } from "next/server";
import { getPublicListingById } from "@/lib/server/catalog";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    const row = await getPublicListingById(id);
    if (!row) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json(row, {
      headers: { "Cache-Control": "public, max-age=60" },
    });
  } catch (err) {
    console.error("[GET /api/listings/:id]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}