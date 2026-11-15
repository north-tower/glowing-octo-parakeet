import { db } from "@/lib/server/db";

export async function GET() {
  try {
    await db.q("select 1 as n");
    return Response.json({ ok: true, db: "ok" });
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("[/api/health] db ping failed:", err);
    }
    return Response.json({ ok: false, db: "error" }, { status: 503 });
  }
}