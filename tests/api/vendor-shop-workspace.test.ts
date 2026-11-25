import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { POST as createProduct } from "@/app/api/products/route";
import {
  GET as getMine,
  PATCH as patchMine,
} from "@/app/api/vendors/mine/route";
import { GET as getEarnings } from "@/app/api/vendor/earnings/route";
import {
  GET as getVendorOrders,
  POST as postVendorOrder,
} from "@/app/api/vendor/orders/route";
import { accessToken } from "@/lib/server/tokens";
import { createTestServer } from "./test-server";

const hasDbEnv =
  !!process.env.DATABASE_URL &&
  !!process.env.JWT_ACCESS_SECRET &&
  !!process.env.OTP_HMAC_SECRET &&
  !!process.env.TOTP_ENC_KEY;

describe("vendor shop workspace APIs", () => {
  let server: ReturnType<typeof createTestServer>;
  let dbReachable = false;
  let ownerId = "";
  let vendorId = "";
  let orderId = "";
  let productId = "";
  let customerId = "";
  let ownerAccess = "";
  const tag = `vitest-shop-ws-${Date.now()}`;

  beforeAll(async () => {
    if (hasDbEnv) {
      try {
        const { db } = await import("@/lib/server/db");
        await db.q("select 1");
        await db.q("alter table vendors add column if not exists area text");
        await db.q(
          "alter table vendors add column if not exists banner_url text",
        );
        await db.q(
          "alter table vendors add column if not exists whatsapp text",
        );
        dbReachable = true;
      } catch {
        dbReachable = false;
      }
    }

    server = createTestServer({
      "/api/vendors/mine": { GET: getMine, PATCH: patchMine },
      "/api/products": { POST: createProduct },
      "/api/vendor/orders": { GET: getVendorOrders, POST: postVendorOrder },
      "/api/vendor/earnings": { GET: getEarnings },
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
    const customer = (
      await db.q<{ id: string }>(
        `insert into users(email, role) values($1, 'customer') returning id`,
        [`${tag}-buyer@example.com`],
      )
    ).rows[0];
    customerId = customer.id;
    ownerId = owner.id;
    ownerAccess = accessToken({ id: ownerId, role: "customer" });

    const vendor = (
      await db.q<{ id: string }>(
        `insert into vendors(owner_id, name, status, categories)
         values($1, $2, 'approved', $3::text[])
         returning id`,
        [ownerId, `${tag} Shop`, ["shop"]],
      )
    ).rows[0];
    vendorId = vendor.id;
  });

  afterAll(async () => {
    if (dbReachable) {
      const { db } = await import("@/lib/server/db");
      if (orderId) {
        await db.q("delete from order_items where order_id = $1", [orderId]);
        await db.q("delete from orders where id = $1", [orderId]);
      }
      if (productId) {
        await db.q("delete from products where id = $1", [productId]);
      }
      if (vendorId) {
        await db.q("delete from vendors where id = $1", [vendorId]);
      }
      if (ownerId) {
        await db.q("delete from users where id = $1", [ownerId]);
      }
      if (customerId) {
        await db.q("delete from users where id = $1", [customerId]);
      }
    }
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  it.skipIf(!hasDbEnv)("rejects listing publish until shop area is set", async ({ skip }) => {
    if (!dbReachable) skip();

    await request(server)
      .post("/api/products")
      .set("Authorization", `Bearer ${ownerAccess}`)
      .send({
        category: "shop",
        title: `${tag} item`,
        price: 500,
      })
      .expect(400)
      .expect({ error: "area_required" });
  });

  it.skipIf(!hasDbEnv)("saves a Nakuru shop area", async ({ skip }) => {
    if (!dbReachable) skip();

    await request(server)
      .patch("/api/vendors/mine")
      .set("Authorization", `Bearer ${ownerAccess}`)
      .send({ area: "Milimani" })
      .expect(200)
      .expect({ area: "Milimani" });

    const mine = await request(server)
      .get("/api/vendors/mine")
      .set("Authorization", `Bearer ${ownerAccess}`)
      .expect(200);

    expect(mine.body[0]).toEqual(
      expect.objectContaining({ id: vendorId, area: "Milimani" }),
    );
  });

  it.skipIf(!hasDbEnv)("saves a Kenyan WhatsApp number on the shop", async ({ skip }) => {
    if (!dbReachable) skip();

    await request(server)
      .patch("/api/vendors/mine")
      .set("Authorization", `Bearer ${ownerAccess}`)
      .send({ whatsapp: "0712 345 678" })
      .expect(200)
      .expect({ whatsapp: "+254712345678" });

    const mine = await request(server)
      .get("/api/vendors/mine")
      .set("Authorization", `Bearer ${ownerAccess}`)
      .expect(200);

    expect(mine.body[0]).toEqual(
      expect.objectContaining({
        id: vendorId,
        whatsapp: "+254712345678",
      }),
    );
  });

  it.skipIf(!hasDbEnv)("rejects a non-Kenyan WhatsApp number", async ({ skip }) => {
    if (!dbReachable) skip();

    await request(server)
      .patch("/api/vendors/mine")
      .set("Authorization", `Bearer ${ownerAccess}`)
      .send({ whatsapp: "123" })
      .expect(400)
      .expect({ error: "bad_request" });
  });

  it.skipIf(!hasDbEnv)("lists vendor orders and accepts a new one", async ({ skip }) => {
    if (!dbReachable) skip();
    const { db } = await import("@/lib/server/db");

    const product = (
      await db.q<{ id: string }>(
        `insert into products(vendor_id, category, title, price_kes, stock)
         values ($1, 'shop', $2, 900, 4)
         returning id`,
        [vendorId, `${tag} bag`],
      )
    ).rows[0];
    productId = product.id;

    const order = (
      await db.q<{ id: string }>(
        `insert into orders(customer_id, vendor_id, total_kes, payment, zone, delivery_fee_kes, address)
         values ($1, $2, 1000, 'cod', 'Town/CBD', 100, 'Near the roundabout')
         returning id`,
        [customerId, vendorId],
      )
    ).rows[0];
    orderId = order.id;

    await db.q(
      `insert into order_items(order_id, product_id, title, unit_kes, qty)
       values ($1, $2, $3, 900, 1)`,
      [orderId, productId, `${tag} bag`],
    );

    const listed = await request(server)
      .get("/api/vendor/orders")
      .set("Authorization", `Bearer ${ownerAccess}`)
      .expect(200);

    expect(listed.body.orders[0]).toEqual(
      expect.objectContaining({ id: orderId, status: "placed" }),
    );

    await request(server)
      .post("/api/vendor/orders")
      .set("Authorization", `Bearer ${ownerAccess}`)
      .send({ orderId, status: "accepted" })
      .expect(200);

    const earnings = await request(server)
      .get("/api/vendor/earnings")
      .set("Authorization", `Bearer ${ownerAccess}`)
      .expect(200);

    expect(earnings.body).toEqual(
      expect.objectContaining({
        deliveredCount: 0,
        goodsTotal: 0,
      }),
    );

  });
});
