import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { GET } from "@/app/api/home/promotions/route";
import { GET as adminGet, POST as adminPost } from "@/app/api/admin/home-placements/route";
import { accessToken } from "@/lib/server/tokens";
import { createTestServer } from "./test-server";

const hasDbEnv =
  !!process.env.DATABASE_URL &&
  !!process.env.JWT_ACCESS_SECRET &&
  !!process.env.OTP_HMAC_SECRET &&
  !!process.env.TOTP_ENC_KEY;

describe("home hero placements", () => {
  let server: ReturnType<typeof createTestServer>;
  let dbReachable = false;

  let adminId = "";
  let adminAccess = "";
  let productId = "";
  let placementId = "";
  const tag = `hero-${Date.now()}`;

  beforeAll(async () => {
    if (hasDbEnv) {
      try {
        const { db } = await import("@/lib/server/db");
        await db.q("select 1");
        await db.q(
          `create table if not exists homepage_placements (
            id uuid primary key default gen_random_uuid(),
            product_id uuid not null references products (id) on delete cascade,
            placement text not null default 'hero' check (placement in ('hero')),
            sort_order integer not null default 50,
            headline text,
            subtitle text,
            image_url text,
            active boolean not null default true,
            starts_at timestamptz,
            ends_at timestamptz,
            created_by uuid references users (id) on delete set null,
            created_at timestamptz not null default now(),
            updated_at timestamptz not null default now()
          )`,
        );
        dbReachable = true;
      } catch {
        dbReachable = false;
      }
    }

    server = createTestServer({
      "/api/home/promotions": { GET },
      "/api/admin/home-placements": { GET: adminGet, POST: adminPost },
    });
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", () => resolve()),
    );

    if (!dbReachable) return;

    const { db } = await import("@/lib/server/db");

    adminId = (
      await db.q<{ id: string }>(
        `insert into users(email, role) values($1, 'admin') returning id`,
        [`${tag}-admin@example.com`],
      )
    ).rows[0].id;
    adminAccess = accessToken({ id: adminId, role: "admin" });

    const ownerId = (
      await db.q<{ id: string }>(
        `insert into users(email, role) values($1, 'customer') returning id`,
        [`${tag}-owner@example.com`],
      )
    ).rows[0].id;

    const vendorId = (
      await db.q<{ id: string }>(
        `insert into vendors(owner_id, name, status, categories)
         values($1, $2, 'approved', '{shop}')
         returning id`,
        [ownerId, `${tag} Vendor`],
      )
    ).rows[0].id;

    productId = (
      await db.q<{ id: string }>(
        `insert into products(vendor_id, category, title, price_kes, active)
         values($1, 'general-merchandise', $2, 2500, true)
         returning id`,
        [vendorId, `${tag} Repair services`],
      )
    ).rows[0].id;
  });

  afterAll(async () => {
    if (dbReachable && placementId) {
      const { db } = await import("@/lib/server/db");
      await db.q(`delete from homepage_placements where id = $1::uuid`, [
        placementId,
      ]);
    }
    if (dbReachable && productId) {
      const { db } = await import("@/lib/server/db");
      await db.q(`delete from products where id = $1::uuid`, [productId]);
    }
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it.skipIf(!hasDbEnv)("returns empty promotions before staff create", async ({
    skip,
  }) => {
    if (!dbReachable) skip();
    const res = await request(server).get("/api/home/promotions");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it.skipIf(!hasDbEnv)("admin can create and public API exposes hero promo", async ({
    skip,
  }) => {
    if (!dbReachable) skip();

    const created = await request(server)
      .post("/api/admin/home-placements")
      .set("Authorization", `Bearer ${adminAccess}`)
      .send({
        productId,
        sortOrder: 5,
        headline: "Phone repair in Nakuru",
        active: true,
      });
    expect(created.status).toBe(201);
    placementId = created.body.id;

    const pub = await request(server).get("/api/home/promotions");
    expect(pub.status).toBe(200);
    const hit = pub.body.find((r: { productId: string }) => r.productId === productId);
    expect(hit?.title).toBe("Phone repair in Nakuru");
    expect(hit?.productId).toBe(productId);
    expect(typeof hit?.vendorId).toBe("string");
  });
});