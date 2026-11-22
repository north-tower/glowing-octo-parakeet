import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { GET } from "@/app/api/listings/route";
import { createTestServer } from "./test-server";

const hasDbEnv =
  !!process.env.DATABASE_URL &&
  !!process.env.JWT_ACCESS_SECRET &&
  !!process.env.OTP_HMAC_SECRET &&
  !!process.env.TOTP_ENC_KEY;

describe("GET /api/listings category filter", () => {
  let server: ReturnType<typeof createTestServer>;
  let dbReachable = false;

  let ownerId = "";
  let vendorId = "";
  let productId = "";
  const tag = `vitest-list-${Date.now()}`;
  const communitySlug = `vitest-cat-${tag}`;

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
      "/api/listings": { GET },
    });
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", () => resolve()),
    );

    if (!dbReachable) return;

    const { db } = await import("@/lib/server/db");

    const owner = (
      await db.q<{ id: string }>(
        `insert into users(email, role) values($1, 'customer') returning id`,
        [`${tag}@example.com`],
      )
    ).rows[0];
    ownerId = owner.id;

    const vendor = (
      await db.q<{ id: string }>(
        `insert into vendors(owner_id, name, status, categories)
         values($1, $2, 'approved', '{shop}')
         returning id`,
        [ownerId, `${tag} Vendor`],
      )
    ).rows[0];
    vendorId = vendor.id;

    await db.q(
      `insert into categories (slug, label, kind, listing_mode, visible, open_for_apply, sort_order)
       values ($1, 'Vitest Community', 'community', 'shop', true, true, 500)`,
      [communitySlug],
    );

    const product = (
      await db.q<{ id: string }>(
        `insert into products(vendor_id, category, title, price_kes, active)
         values($1, $2, $3, 1200, true)
         returning id`,
        [vendorId, communitySlug, `${tag} Product`],
      )
    ).rows[0];
    productId = product.id;
  });

  afterAll(async () => {
    if (dbReachable) {
      const { db } = await import("@/lib/server/db");
      if (productId) {
        await db.q("delete from products where id = $1", [productId]);
      }
      if (vendorId) {
        await db.q("delete from vendors where id = $1", [vendorId]);
      }
      await db.q("delete from categories where slug = $1", [communitySlug]);
      if (ownerId) {
        await db.q("delete from users where id = $1", [ownerId]);
      }
    }
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  it.skipIf(!hasDbEnv)(
    "filters by visible community slug",
    async ({ skip }) => {
      if (!dbReachable) skip();

      const filtered = await request(server)
        .get(`/api/listings?category=${communitySlug}`)
        .expect(200);

      expect(filtered.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: productId,
            category: communitySlug,
            categoryLabel: "Vitest Community",
            listingMode: "shop",
          }),
        ]),
      );

      const shop = await request(server)
        .get("/api/listings?category=shop")
        .expect(200);

      const ids = shop.body.map((r: { id: string }) => r.id);
      expect(ids).not.toContain(productId);
    },
  );

  it.skipIf(!hasDbEnv)(
    "returns empty for hidden category slug",
    async ({ skip }) => {
      if (!dbReachable) skip();

      const { db } = await import("@/lib/server/db");
      await db.q("update categories set visible = false where slug = $1", [
        communitySlug,
      ]);

      const res = await request(server)
        .get(`/api/listings?category=${communitySlug}`)
        .expect(200);

      expect(res.body).toEqual([]);

      await db.q("update categories set visible = true where slug = $1", [
        communitySlug,
      ]);
    },
  );

  it.skipIf(!hasDbEnv)("unknown slug returns empty array", async ({ skip }) => {
    if (!dbReachable) skip();

    const res = await request(server)
      .get("/api/listings?category=no-such-cat")
      .expect(200);

    expect(res.body).toEqual([]);
  });
});