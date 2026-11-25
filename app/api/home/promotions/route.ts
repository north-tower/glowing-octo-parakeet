import { NextResponse } from "next/server";
import {
  heroPromotionToJson,
  listLiveHeroPromotions,
} from "@/lib/server/home-placements";

export async function GET() {
  try {
    const rows = await listLiveHeroPromotions();
    return NextResponse.json(rows.map(heroPromotionToJson), {
      headers: { "Cache-Control": "public, max-age=30" },
    });
  } catch (err) {
    console.error("[GET /api/home/promotions]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}