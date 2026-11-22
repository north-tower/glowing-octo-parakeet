import { NextResponse } from "next/server";
import { z } from "zod";
import { CATEGORY_SLUG_RE } from "@/lib/nakuru/category-slug";
import { CategoryError } from "@/lib/server/categories";
import { bearerUser, requireRole } from "@/lib/server/middleware";
import {
  appendVendorCategory,
  VendorError,
} from "@/lib/server/vendors";

const appendBody = z
  .object({
    label: z.string().optional(),
    slug: z.string().regex(CATEGORY_SLUG_RE).optional(),
  })
  .strict()
  .refine((d) => d.label || d.slug);

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

  const parsed = appendBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    const result = await appendVendorCategory(user.id, parsed.data);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    if (err instanceof VendorError) {
      return NextResponse.json({ error: err.code }, { status: err.status });
    }
    if (err instanceof CategoryError) {
      return NextResponse.json({ error: err.code }, { status: err.status });
    }
    throw err;
  }
}