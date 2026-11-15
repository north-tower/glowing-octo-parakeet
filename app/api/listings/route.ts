import { NextResponse } from "next/server";
import { listPublicListings } from "@/lib/server/catalog";

export async function GET(req: Request) {
  const category = new URL(req.url).searchParams.get("category");
  try {
    const rows = await listPublicListings(category);
    return NextResponse.json(rows, {
      headers: { "Cache-Control": "public, max-age=30" },
    });
  } catch (err) {
    console.error("[GET /api/listings]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}