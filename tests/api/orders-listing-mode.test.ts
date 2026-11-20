import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { POST as createOrder } from "@/app/api/orders/route";
import { accessToken } from "@/lib/server/tokens";
import { createTestServer } from "./test-server";

const hasDbEnv =
  !!process.env.DATABASE_URL &&
  !!process.env.JWT_ACCESS_SECRET &&
  !!process.env.OTP_HMAC_SECRET &&
  !!process.env.TOTP_ENC_KEY;

describe("POST /api/orders listing_mode gate", () => {
  let server: ReturnType<typeof createTestServer>;
  let dbReachable = false;

  let ownerId = "";
  let customerId = "";
  let vendorId = "";
  let communityProductId = "";
  let servicesProductId = "";
  let customerAccess = "";
  const tag = `vitest-ord-lm-${Date.now()}`;
  const communitySlug = `vitest-shop-${tag}`;

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
      "/api/orders": { POST: createOrder },
    });
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", () => resolve()),
    );
    vi.spyOn(console, "log").mockImplementation(() => {});

    if (!dbReachable) return;

    const { db } = await import("@/lib/server/db");

    const owner = (
      await db.q<{ id: string }>(
        `insert into users(email, role) values($1, 'customer') returning id`,
        [`${tag}-owner@example.com`],
      )
    ).rows[0];
    const customer = (
      await db.q<{ id: string }>(
        `insert into users(email, role, phone) values($1, 'customer', '+254712345678') returning id`,
        [`${tag}-customer@example.com`],
      )
    ).rows[0];

    ownerId = owner.id;
    customerId = customer.id;

    await db.q(
      `insert into categories (slug, label, kind, listing_mode, visible, open_for_apply, sort_order)
       values ($1, 'Vitest Shop Community', 'community', 'shop', true, true, 500)`,
      [communitySlug],
    );

    const vendor = (
      await db.q<{ id: string }>(
        `insert into vendors(owner_id, name, status, categories)
         values($1, $2, 'approved', $3::text[])
         returning id`,
        [ownerId, `${tag} Vendor`, [communitySlug, "services"]],
      )
    ).rows[0];
    vendorId = vendor.id;

    const community = (
      await db.q<{ id: string }>(
        `insert into products(vendor_id, category, title, price_kes, active, stock)
         values($1, $2, $3, 800, true, 5)
         returning id`,
        [vendorId, communitySlug, `${tag} Community item`],
      )
    ).rows[0];

    const services = (
      await db.q<{ id: string }>(
        `insert into products(vendor_id, category, title, price_kes, active)
         values($1, 'services', $2, 0, true)
         returning id`,
        [vendorId, `${tag} Service`],
      )
    ).rows[0];

    communityProductId = community.id;
    servicesProductId = services.id;
    customerAccess = accessToken({ id: customerId, role: "customer" });
  });

  afterAll(async () => {
    if (dbReachable && vendorId) {
      const { db } = await import("@/lib/server/db");
      await db.q(
        `delete from order_items where order_id in (
           select id from orders where customer_id = $1
         )`,
        [customerId],
      );
      await db.q("delete from orders where customer_id = $1", [customerId]);
      await db.q("delete from products where vendor_id = $1", [vendorId]);
      await db.q("delete from vendors where id = $1", [vendorId]);
      await db.q("delete from categories where slug = $1", [communitySlug]);
      await db.q("delete from users where id = any($1::uuid[])", [
        [ownerId, customerId],
      ]);
    }
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  it.skipIf(!hasDbEnv)(
    "allows checkout for community category with listing_mode shop",
    async ({ skip }) => {
      if (!dbReachable) skip();

      const res = await request(server)
        .post("/api/orders")
        .set("Authorization", `Bearer ${customerAccess}`)
        .send({
          items: [{ productId: communityProductId, qty: 1 }],
          zone: "Town/CBD",
          payment: "cod",
          address: "12 Test Street, Nakuru",
        })
        .expect(201);

      expect(res.body.orders).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            items: expect.arrayContaining([
              expect.objectContaining({ productId: communityProductId }),
            ]),
          }),
        ]),
      );
    },
  );

  it.skipIf(!hasDbEnv)(
    "rejects checkout for services listing_mode",
    async ({ skip }) => {
      if (!dbReachable) skip();

      await request(server)
        .post("/api/orders")
        .set("Authorization", `Bearer ${customerAccess}`)
        .send({
          items: [{ productId: servicesProductId, qty: 1 }],
          zone: "Town/CBD",
          payment: "cod",
          address: "12 Test Street, Nakuru",
        })
        .expect(409)
        .expect({ error: "unavailable" });
    },
  );
});