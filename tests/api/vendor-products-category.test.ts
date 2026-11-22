import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { POST as createProduct } from "@/app/api/products/route";
import { accessToken } from "@/lib/server/tokens";
import { createTestServer } from "./test-server";

const hasDbEnv =
  !!process.env.DATABASE_URL &&
  !!process.env.JWT_ACCESS_SECRET &&
  !!process.env.OTP_HMAC_SECRET &&
  !!process.env.TOTP_ENC_KEY;

describe("POST /api/products category directory", () => {
  let server: ReturnType<typeof createTestServer>;
  let dbReachable = false;

  let ownerId = "";
  let vendorId = "";
  let ownerAccess = "";
  const tag = `vitest-prod-cat-${Date.now()}`;
  const fashionSlug = `fashion-${tag}`;
  const createdProductIds: string[] = [];

  beforeAll(async () => {
    if (hasDbEnv) {
      try {
        const { db } = await import("@/lib/server/db");
        await db.q("select 1");
        await db.q("alter table vendors add column if not exists area text");
        dbReachable = true;
      } catch {
        dbReachable = false;
      }
    }

    server = createTestServer({
      "/api/products": { POST: createProduct },
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
    ownerAccess = accessToken({ id: ownerId, role: "customer" });

    await db.q(
      `insert into categories (slug, label, kind, listing_mode, visible, open_for_apply, sort_order)
       values ($1, 'Fashion', 'community', 'shop', true, true, 500)`,
      [fashionSlug],
    );

    const vendor = (
      await db.q<{ id: string }>(
        `insert into vendors(owner_id, name, status, categories, area)
         values($1, $2, 'approved', $3::text[], $4)
         returning id`,
        [ownerId, `${tag} Vendor`, ["shop"], "Milimani"],
      )
    ).rows[0];
    vendorId = vendor.id;
  });

  afterAll(async () => {
    if (dbReachable) {
      const { db } = await import("@/lib/server/db");
      for (const id of createdProductIds) {
        await db.q("delete from products where id = $1", [id]);
      }
      if (vendorId) {
        await db.q("delete from vendors where id = $1", [vendorId]);
      }
      await db.q("delete from categories where slug = $1", [fashionSlug]);
      if (ownerId) {
        await db.q("delete from users where id = $1", [ownerId]);
      }
    }
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  it.skipIf(!hasDbEnv)(
    "accepts an approved directory slug",
    async ({ skip }) => {
      if (!dbReachable) skip();

      const res = await request(server)
        .post("/api/products")
        .set("Authorization", `Bearer ${ownerAccess}`)
        .send({
          category: fashionSlug,
          title: `${tag} dress`,
          price: 2500,
          stock: 12,
        })
        .expect(201);

      expect(res.body).toEqual(
        expect.objectContaining({ id: expect.any(String) }),
      );
      createdProductIds.push(res.body.id);
    },
  );

  it.skipIf(!hasDbEnv)(
    "accepts a visible category that is not on the vendor profile",
    async ({ skip }) => {
      if (!dbReachable) skip();

      const res = await request(server)
        .post("/api/products")
        .set("Authorization", `Bearer ${ownerAccess}`)
        .send({
          category: "services",
          title: `${tag} service`,
          price: 0,
        })
        .expect(201);

      expect(res.body).toEqual(
        expect.objectContaining({ id: expect.any(String) }),
      );
      createdProductIds.push(res.body.id);
    },
  );
});