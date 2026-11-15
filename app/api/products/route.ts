import { NextResponse } from "next/server";
import { clientIp } from "@/lib/server/auth";
import { bearerUser, requireRole } from "@/lib/server/middleware";
import {
  createProduct,
  ProductError,
} from "@/lib/server/products";
import { productNew } from "@/lib/server/schemas";

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

  const parsed = productNew.safeParse(body);
  if (!parsed.success) {
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
        price: d.price,
        stock: d.stock,
      },
      clientIp(req),
    );
    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    if (err instanceof ProductError) {
      return NextResponse.json({ error: err.code }, { status: err.status });
    }
    throw err;
  }
}