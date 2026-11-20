import { NextResponse } from "next/server";
import { z } from "zod";
import {
  CATEGORY_SLUG_RE,
  RESERVED_CATEGORY_SLUGS,
  slugifyCategoryLabel,
} from "@/lib/nakuru/category-slug";
import {
  CategoryError,
  getCategoryBySlug,
  listVisibleCategories,
  upsertCommunityCategory,
} from "@/lib/server/categories";
import { bearerUser, requireRole } from "@/lib/server/middleware";

const categoryNew = z.object({ label: z.string() }).strict();

export async function GET() {
  try {
    const rows = await listVisibleCategories();
    return NextResponse.json(rows, {
      headers: { "Cache-Control": "public, max-age=15" },
    });
  } catch (err) {
    console.error("[GET /api/categories]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = bearerUser(req);
  if (!user || !requireRole(user, "customer", "vendor")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const parsed = categoryNew.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const slug = slugifyCategoryLabel(parsed.data.label);
  let reuse = false;
  if (
    slug &&
    !RESERVED_CATEGORY_SLUGS.has(slug) &&
    CATEGORY_SLUG_RE.test(slug)
  ) {
    const existing = await getCategoryBySlug(slug);
    reuse = !!(existing && existing.visible);
  }

  try {
    const row = await upsertCommunityCategory(user.id, parsed.data.label);
    return NextResponse.json(row, { status: reuse ? 200 : 201 });
  } catch (err) {
    if (err instanceof CategoryError) {
      return NextResponse.json({ error: err.code }, { status: err.status });
    }
    throw err;
  }
}