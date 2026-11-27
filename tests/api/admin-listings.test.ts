import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { GET } from "@/app/api/admin/listings/route";
import { DELETE } from "@/app/api/admin/listings/[id]/route";
import { accessToken } from "@/lib/server/tokens";
import { createTestServer } from "./test-server";

const hasDbEnv =
  !!process.env.DATABASE_URL &&
  !!process.env.JWT_ACCESS_SECRET &&
  !!process.env.OTP_HMAC_SECRET &&
  !!process.env.TOTP_ENC_KEY;

describe("/api/admin/listings", () => {
  let server: ReturnType<typeof createTestServer>;
  let dbReachable = false;

  let adminId = "";
  let adminAccess = "";
  let supportId = "";
  let supportAccess = "";
  let ownerId = "";
  let vendorId = "";
  let productId = "";
  let leftoverProductId = "";
  const tag = `lst-${Date.now()}`;
  const categorySlug = `${tag}-cat`;

  function deleteReq(id: string, token?: string) {
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    return DELETE(new Request(`http://test/api/admin/listings/${id}`, {
      method: "DELETE",
      headers,
    }), { params: Promise.resolve({ id }) });
  }

  beforeAll(async () => {
    if (hasDbEnv) {
      try {
        const { db } = await import("@/lib/server/db");
        await db.q("select 1");
        dbReachable = true;
      } catch {
        dbReachable = false;
      }
    }

    server = createTestServer({
      "/api/admin/listings": { GET },
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

    supportId = (
      await db.q<{ id: string }>(
        `insert into users(email, role) values($1, 'support') returning id`,
        [`${tag}-support@example.com`],
      )
    ).rows[0].id;
    supportAccess = accessToken({ id: supportId, role: "support" });

    ownerId = (
      await db.q<{ id: string }>(
        `insert into users(email, role) values($1, 'customer') returning id`,
        [`${tag}-owner@example.com`],
      )
    ).rows[0].id;

    vendorId = (
      await db.q<{ id: string }>(
        `insert into vendors(owner_id, name, status, categories)
         values($1, $2, 'approved', '{shop}')
         returning id`,
        [ownerId, `${tag} Vendor`],
      )
    ).rows[0].id;

    await db.q(
      `insert into categories (slug, label, kind, listing_mode, visible, open_for_apply, sort_order)
       values ($1, 'Admin listings test', 'community', 'shop', true, true, 500)`,
      [categorySlug],
    );

    productId = (
      await db.q<{ id: string }>(
        `insert into products(vendor_id, category, title, price_kes, active)
         values($1, $2, $3, 900, true)
         returning id`,
        [vendorId, categorySlug, `${tag} Product`],
      )
    ).rows[0].id;
  });

  afterAll(async () => {
    if (dbReachable) {
      const { db } = await import("@/lib/server/db");
      const leftover = leftoverProductId || productId;
      if (leftover) await db.q("delete from products where id = $1", [leftover]);
      if (vendorId) await db.q("delete from vendors where id = $1", [vendorId]);
      await db.q("delete from categories where slug = $1", [categorySlug]);
      if (ownerId) await db.q("delete from users where id = $1", [ownerId]);
      if (supportId) await db.q("delete from users where id = $1", [supportId]);
      if (adminId) await db.q("delete from users where id = $1", [adminId]);
    }
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  it("GET without auth returns 401", async () => {
    await request(server)
      .get("/api/admin/listings")
      .expect(401)
      .expect({ error: "unauthorized" });
  });

  it.skipIf(!hasDbEnv)("GET returns listing rows", async ({ skip }) => {
    if (!dbReachable) skip();

    const res = await request(server)
      .get("/api/admin/listings?active=all&limit=5")
      .set("Authorization", `Bearer ${adminAccess}`)
      .expect(200);

    expect(res.body).toEqual(
      expect.objectContaining({
        rows: expect.any(Array),
        nextCursor:
          res.body.rows.length === 5 ? expect.any(String) : null,
      }),
    );

    if (res.body.rows.length > 0) {
      expect(res.body.rows[0]).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          title: expect.any(String),
          priceKes: expect.any(Number),
          onPublicCatalog: expect.any(Boolean),
        }),
      );
    }
  });

  it("DELETE without auth returns 401", async () => {
    const res = await deleteReq("00000000-0000-4000-8000-000000000001");
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "unauthorized" });
  });

  it.skipIf(!hasDbEnv)("DELETE is admin-only", async ({ skip }) => {
    if (!dbReachable) skip();
    const res = await deleteReq(productId, supportAccess);
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: "forbidden" });
  });

  it.skipIf(!hasDbEnv)("DELETE removes a listing", async ({ skip }) => {
    if (!dbReachable) skip();

    const res = await deleteReq(productId, adminAccess);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    leftoverProductId = "";
    productId = "";

    const missing = await deleteReq(
      "00000000-0000-4000-8000-000000000001",
      adminAccess,
    );
    expect(missing.status).toBe(404);
  });
});