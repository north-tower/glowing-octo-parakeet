import { NextResponse } from "next/server";
import {
  CategoryError,
  listAllCategories,
  staffCreateOfficial,
} from "@/lib/server/categories";
import { bearerUser, requireRole } from "@/lib/server/middleware";
import { staffCategoryNew } from "@/lib/server/schemas";

export async function GET(req: Request) {
  const user = bearerUser(req);
  if (!user || !requireRole(user, "admin", "support")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!requireRole(user, "admin")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    const rows = await listAllCategories();
    return NextResponse.json(
      rows.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
      })),
    );
  } catch (err) {
    console.error("[GET /api/admin/categories]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = bearerUser(req);
  if (!user || !requireRole(user, "admin", "support")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!requireRole(user, "admin")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const parsed = staffCategoryNew.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    const row = await staffCreateOfficial(parsed.data);
    return NextResponse.json(
      { ...row, createdAt: row.createdAt.toISOString() },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof CategoryError) {
      return NextResponse.json({ error: err.code }, { status: err.status });
    }
    throw err;
  }
}