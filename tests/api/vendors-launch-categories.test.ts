import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { POST as createVendor } from "@/app/api/vendors/route";
import { accessToken } from "@/lib/server/tokens";
import { createTestServer } from "./test-server";

const hasDbEnv =
  !!process.env.DATABASE_URL &&
  !!process.env.JWT_ACCESS_SECRET &&
  !!process.env.OTP_HMAC_SECRET &&
  !!process.env.TOTP_ENC_KEY;

const closedOfficialSlug = `vitest-closed-${Date.now()}`;

describe("POST /api/vendors launch category guard", () => {
  let server: ReturnType<typeof createTestServer>;
  let dbReachable = false;

  let applicantId = "";
  let applicantAccess = "";
  const tag = `vitest-vendor-cat-${Date.now()}`;
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
      "/api/vendors": { POST: createVendor },
    });
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", () => resolve()),
    );

    if (!dbReachable) return;

    const { db } = await import("@/lib/server/db");
    const applicant = (
      await db.q<{ id: string }>(
        `insert into users(email, role) values($1, 'customer') returning id`,
        [`${tag}@example.com`],
      )
    ).rows[0];
    applicantId = applicant.id;
    applicantAccess = accessToken({ id: applicantId, role: "customer" });
  });

  afterAll(async () => {
    if (dbReachable) {
      const { db } = await import("@/lib/server/db");
      const refs = (
        await db.q<{ n: number }>(
          "select count(*)::int n from products where category = $1",
          [communitySlug],
        )
      ).rows[0].n;
      await db.q("delete from categories where slug = any($1::text[])", [
        [communitySlug, closedOfficialSlug],
      ]);
      if (applicantId) {
        await db.q("delete from vendors where owner_id = $1", [applicantId]);
        await db.q("delete from users where id = $1", [applicantId]);
      }
    }
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  it.skipIf(!hasDbEnv)(
    "rejects official category that is not open for apply",
    async ({ skip }) => {
      if (!dbReachable) skip();
      const { db } = await import("@/lib/server/db");
      await db.q(
        `insert into categories (slug, label, kind, listing_mode, visible, open_for_apply, sort_order)
         values ($1, 'Closed', 'official', 'shop', true, false, 900)
         on conflict (slug) do update set open_for_apply = false`,
        [closedOfficialSlug],
      );

      await request(server)
        .post("/api/vendors")
        .set("Authorization", `Bearer ${applicantAccess}`)
        .send({ name: "Test Vendor", categories: [closedOfficialSlug] })
        .expect(400)
        .expect({ error: "bad_request" });
    },
  );

  it.skipIf(!hasDbEnv)(
    "accepts launch categories shop and services",
    async ({ skip }) => {
      if (!dbReachable) skip();

      const res = await request(server)
        .post("/api/vendors")
        .set("Authorization", `Bearer ${applicantAccess}`)
        .send({ name: "Launch Vendor", categories: ["shop", "services"] })
        .expect(201);

      expect(res.body).toEqual(
        expect.objectContaining({ status: "approved", id: expect.any(String) }),
      );
    },
  );

  it("accepts a visible community slug with shop", async ({ skip }) => {
    if (!dbReachable) skip();
    const { db } = await import("@/lib/server/db");
    await db.q(
      `insert into categories (slug, label, kind, listing_mode, visible, open_for_apply, sort_order)
       values ($1, 'Vitest Cat', 'community', 'shop', true, true, 500)
       on conflict (slug) do nothing`,
      [communitySlug],
    );
    await request(server)
      .post("/api/vendors")
      .set("Authorization", `Bearer ${applicantAccess}`)
      .send({ name: "Community Vendor", categories: ["shop", communitySlug] })
      .expect(201);
  });
});