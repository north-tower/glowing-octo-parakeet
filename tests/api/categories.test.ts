import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { GET, POST } from "@/app/api/categories/route";
import { accessToken } from "@/lib/server/tokens";
import { slugifyCategoryLabel } from "@/lib/nakuru/category-slug";
import { createTestServer } from "./test-server";

const hasDbEnv =
  !!process.env.DATABASE_URL &&
  !!process.env.JWT_ACCESS_SECRET &&
  !!process.env.OTP_HMAC_SECRET &&
  !!process.env.TOTP_ENC_KEY;

describe("/api/categories", () => {
  let server: ReturnType<typeof createTestServer>;
  let dbReachable = false;

  let customerId = "";
  let customerAccess = "";
  const tag = `vitest-cat-${Date.now()}`;
  const uniqueSlug = slugifyCategoryLabel(`Vitest ${tag}`);

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
      "/api/categories": { GET, POST },
    });
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", () => resolve()),
    );

    if (!dbReachable) return;

    const { db } = await import("@/lib/server/db");
    const customer = (
      await db.q<{ id: string }>(
        `insert into users(email, role) values($1, 'customer') returning id`,
        [`${tag}@example.com`],
      )
    ).rows[0];
    customerId = customer.id;
    customerAccess = accessToken({ id: customerId, role: "customer" });
  });

  afterAll(async () => {
    if (dbReachable) {
      const { db } = await import("@/lib/server/db");
      await db.q(
        `delete from categories where slug = $1 and kind = 'community'`,
        [uniqueSlug],
      );
      await db.q(
        `delete from categories where slug = 'fashion' and kind = 'community'`,
      );
      if (customerId) {
        await db.q("delete from users where id = $1", [customerId]);
      }
    }
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  it.skipIf(!hasDbEnv)("GET returns visible categories", async ({ skip }) => {
    if (!dbReachable) skip();

    const res = await request(server).get("/api/categories").expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.find((c: { slug: string }) => c.slug === "shop")).toBe(
      undefined,
    );
    expect(res.body.find((c: { slug: string }) => c.slug === "property")).toBe(
      undefined,
    );

    const phones = res.body.find(
      (c: { slug: string }) => c.slug === "mobile-phones-tablets",
    );
    expect(phones).toEqual(
      expect.objectContaining({
        openForApply: true,
        kind: "official",
        depth: 0,
        parentSlug: null,
      }),
    );

    const cars = res.body.find((c: { slug: string }) => c.slug === "cars");
    expect(cars).toEqual(
      expect.objectContaining({
        kind: "official",
        depth: 1,
        parentSlug: "vehicles",
      }),
    );

    const rider = res.body.find((c: { slug: string }) => c.slug === "rider");
    if (rider) {
      expect(rider).toEqual(
        expect.objectContaining({ kind: "official", listingMode: "services" }),
      );
    }

    for (const row of res.body) {
      expect(row).toEqual(
        expect.objectContaining({
          slug: expect.any(String),
          label: expect.any(String),
          kind: expect.stringMatching(/^(official|community)$/),
          listingMode: expect.stringMatching(/^(shop|services|property|cars)$/),
          openForApply: expect.any(Boolean),
          sortOrder: expect.any(Number),
          depth: expect.any(Number),
          hasChildren: expect.any(Boolean),
        }),
      );
      expect(row).not.toHaveProperty("visible");
    }
  });

  it.skipIf(!hasDbEnv)("GET format=tree returns roots", async ({ skip }) => {
    if (!dbReachable) skip();

    const res = await request(server)
      .get("/api/categories?format=tree")
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(
      res.body.some((n: { slug: string }) => n.slug === "vehicles"),
    ).toBe(true);
    const vehicles = res.body.find(
      (n: { slug: string }) => n.slug === "vehicles",
    );
    expect(vehicles.children?.some((c: { slug: string }) => c.slug === "cars"))
      .toBe(true);
  });

  it("POST without auth returns 401", async () => {
    await request(server)
      .post("/api/categories")
      .send({ label: "Fashion" })
      .expect(401)
      .expect({ error: "unauthorized" });
  });

  it.skipIf(!hasDbEnv)(
    "POST creates community category",
    async ({ skip }) => {
      if (!dbReachable) skip();

      const res = await request(server)
        .post("/api/categories")
        .set("Authorization", `Bearer ${customerAccess}`)
        .send({ label: "Fashion" })
        .expect(201);

      expect(res.body).toEqual(
        expect.objectContaining({
          slug: "fashion",
          kind: "community",
          listingMode: "shop",
          openForApply: true,
          depth: 1,
          parentSlug: "business-and-industry",
        }),
      );
    },
  );

  it.skipIf(!hasDbEnv)(
    "POST reuses existing community slug",
    async ({ skip }) => {
      if (!dbReachable) skip();

      const res = await request(server)
        .post("/api/categories")
        .set("Authorization", `Bearer ${customerAccess}`)
        .send({ label: "fashion" })
        .expect(200);

      expect(res.body.slug).toBe("fashion");
    },
  );

  it.skipIf(!hasDbEnv)("POST rejects invalid label", async ({ skip }) => {
    if (!dbReachable) skip();

    await request(server)
      .post("/api/categories")
      .set("Authorization", `Bearer ${customerAccess}`)
      .send({ label: "!!" })
      .expect(400)
      .expect({ error: "bad_request" });
  });
});