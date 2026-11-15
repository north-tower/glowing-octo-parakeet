import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { POST as createInquiry } from "@/app/api/service-inquiries/route";
import { GET as myInquiries } from "@/app/api/service-inquiries/mine/route";
import { GET as vendorInquiries } from "@/app/api/vendor/inquiries/route";
import { accessToken } from "@/lib/server/tokens";
import { createTestServer } from "./test-server";

const hasDbEnv =
  !!process.env.DATABASE_URL &&
  !!process.env.JWT_ACCESS_SECRET &&
  !!process.env.OTP_HMAC_SECRET &&
  !!process.env.TOTP_ENC_KEY;

describe("service inquiries API", () => {
  let server: ReturnType<typeof createTestServer>;
  let dbReachable = false;

  let ownerId = "";
  let customerId = "";
  let vendorId = "";
  let serviceProductId = "";
  let shopProductId = "";
  let customerAccess = "";
  let ownerAccess = "";

  const tag = `vitest-inq-${Date.now()}`;

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
      "/api/service-inquiries": { POST: createInquiry },
      "/api/service-inquiries/mine": { GET: myInquiries },
      "/api/vendor/inquiries": { GET: vendorInquiries },
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
        `insert into users(email, role) values($1, 'customer') returning id`,
        [`${tag}-customer@example.com`],
      )
    ).rows[0];

    ownerId = owner.id;
    customerId = customer.id;

    const vendor = (
      await db.q<{ id: string }>(
        `insert into vendors(owner_id, name, status, categories)
         values($1, $2, 'approved', '{services,shop}')
         returning id`,
        [ownerId, `${tag} Vendor`],
      )
    ).rows[0];
    vendorId = vendor.id;

    const service = (
      await db.q<{ id: string }>(
        `insert into products(vendor_id, category, title, price_kes, active)
         values($1, 'services', $2, 0, true)
         returning id`,
        [vendorId, `${tag} Service`],
      )
    ).rows[0];
    const shop = (
      await db.q<{ id: string }>(
        `insert into products(vendor_id, category, title, price_kes, active)
         values($1, 'shop', $2, 500, true)
         returning id`,
        [vendorId, `${tag} Shop item`],
      )
    ).rows[0];

    serviceProductId = service.id;
    shopProductId = shop.id;
    customerAccess = accessToken({ id: customerId, role: "customer" });
    ownerAccess = accessToken({ id: ownerId, role: "customer" });
  });

  afterAll(async () => {
    if (dbReachable && vendorId) {
      const { db } = await import("@/lib/server/db");
      await db.q("delete from service_inquiries where product_id = any($1::uuid[])", [
        [serviceProductId, shopProductId],
      ]);
      await db.q("delete from products where vendor_id = $1", [vendorId]);
      await db.q("delete from vendors where id = $1", [vendorId]);
      await db.q("delete from users where id = any($1::uuid[])", [
        [ownerId, customerId],
      ]);
    }
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  it.skipIf(!hasDbEnv)(
    "rejects inquiries for non-service products",
    async ({ skip }) => {
      if (!dbReachable) skip();

      await request(server)
        .post("/api/service-inquiries")
        .set("Authorization", `Bearer ${customerAccess}`)
        .send({ productId: shopProductId, message: "Need a quote?" })
        .expect(400)
        .expect({ error: "not_a_service" });
    },
  );

  it.skipIf(!hasDbEnv)("creates inquiry and lists for customer and vendor", async ({ skip }) => {
    if (!dbReachable) skip();

    const createRes = await request(server)
      .post("/api/service-inquiries")
      .set("Authorization", `Bearer ${customerAccess}`)
      .send({ productId: serviceProductId, message: "When can you start?" })
      .expect(201);

    expect(createRes.body.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );

    const mine = await request(server)
      .get("/api/service-inquiries/mine")
      .set("Authorization", `Bearer ${customerAccess}`)
      .expect(200);

    expect(mine.body.inquiries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: createRes.body.id,
          productId: serviceProductId,
          message: "When can you start?",
          status: "open",
        }),
      ]),
    );

    const vendor = await request(server)
      .get("/api/vendor/inquiries")
      .set("Authorization", `Bearer ${ownerAccess}`)
      .expect(200);

    expect(vendor.body.inquiries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: createRes.body.id,
          productId: serviceProductId,
          customerEmail: `${tag}-customer@example.com`,
        }),
      ]),
    );
  });
});