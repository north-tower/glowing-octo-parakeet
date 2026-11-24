import { NextResponse } from "next/server";
import { CATEGORY_SLUG_RE } from "@/lib/nakuru/category-slug";
import { CategoryError, staffPatchCategory } from "@/lib/server/categories";
import { bearerUser, requireRole } from "@/lib/server/middleware";
import { staffCategoryPatch } from "@/lib/server/schemas";

type RouteContext = { params: Promise<{ slug: string }> };

export async function PATCH(req: Request, ctx: RouteContext) {
  const user = bearerUser(req);
  if (!user || !requireRole(user, "admin", "support")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!requireRole(user, "admin")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { slug } = await ctx.params;
  if (!CATEGORY_SLUG_RE.test(slug)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const parsed = staffCategoryPatch.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    const row = await staffPatchCategory(slug, parsed.data);
    return NextResponse.json({
      ...row,
      createdAt: row.createdAt.toISOString(),
    });
  } catch (err) {
    if (err instanceof CategoryError) {
      return NextResponse.json({ error: err.code }, { status: err.status });
    }
    throw err;
  }
}