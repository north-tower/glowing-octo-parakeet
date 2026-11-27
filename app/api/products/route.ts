import { NextResponse } from "next/server";
import { clientIp } from "@/lib/server/auth";
import {
  listingCreateDebug,
  listingCreateError,
  summarizeCreateBody,
} from "@/lib/server/listing-create-debug";
import { bearerUser, requireRole } from "@/lib/server/middleware";
import {
  createProduct,
  ProductError,
} from "@/lib/server/products";
import { productNew } from "@/lib/server/schemas";

export async function POST(req: Request) {
  const user = bearerUser(req);
  listingCreateDebug("auth", {
    hasUser: Boolean(user),
    userId: user?.id ?? null,
    role: user?.role ?? null,
  });
  if (!user || !requireRole(user, "customer", "vendor")) {
    listingCreateDebug("reject", { reason: "unauthorized" });
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    listingCreateDebug("reject", { reason: "invalid_json" });
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  listingCreateDebug("body", summarizeCreateBody(body));

  const parsed = productNew.safeParse(body);
  if (!parsed.success) {
    listingCreateDebug("reject", {
      reason: "schema",
      issues: parsed.error.issues.map((i) => ({
        path: i.path.join("."),
        code: i.code,
        message: i.message,
      })),
    });
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const d = parsed.data;
  try {
    const row = await createProduct(
      user.id,
      {
        vendorId: d.vendorId,
        category: d.category,
        title: d.title,
        description: d.description,
        emoji: d.emoji,
        imageDataUrl: d.imageDataUrl,
        price: d.price,
        stock: d.stock,
      },
      clientIp(req),
    );
    listingCreateDebug("ok", { productId: row.id });
    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    if (err instanceof ProductError) {
      listingCreateDebug("reject", {
        reason: err.code,
        status: err.status,
      });
      return NextResponse.json({ error: err.code }, { status: err.status });
    }
    listingCreateError("unexpected", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}