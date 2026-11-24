import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { GET } from "@/app/api/admin/listings/route";
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
  const tag = `lst-${Date.now()}`;

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
  });

  afterAll(async () => {
    if (dbReachable) {
      const { db } = await import("@/lib/server/db");
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
});