import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { GET } from "@/app/api/admin/inquiries/route";
import { accessToken } from "@/lib/server/tokens";
import { createTestServer } from "./test-server";

const hasDbEnv =
  !!process.env.DATABASE_URL &&
  !!process.env.JWT_ACCESS_SECRET &&
  !!process.env.OTP_HMAC_SECRET &&
  !!process.env.TOTP_ENC_KEY;

describe("/api/admin/inquiries", () => {
  let server: ReturnType<typeof createTestServer>;
  let dbReachable = false;

  let adminId = "";
  let supportId = "";
  let adminAccess = "";
  let supportAccess = "";
  const tag = `inq-${Date.now()}`;

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
      "/api/admin/inquiries": { GET },
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
    supportId = (
      await db.q<{ id: string }>(
        `insert into users(email, role) values($1, 'support') returning id`,
        [`${tag}-support@example.com`],
      )
    ).rows[0].id;

    adminAccess = accessToken({ id: adminId, role: "admin" });
    supportAccess = accessToken({ id: supportId, role: "support" });
  });

  afterAll(async () => {
    if (dbReachable) {
      const { db } = await import("@/lib/server/db");
      if (adminId) await db.q("delete from users where id = $1", [adminId]);
      if (supportId) await db.q("delete from users where id = $1", [supportId]);
    }
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  it("GET without auth returns 401", async () => {
    await request(server)
      .get("/api/admin/inquiries")
      .expect(401)
      .expect({ error: "unauthorized" });
  });

  it.skipIf(!hasDbEnv)(
    "GET allows admin and support",
    async ({ skip }) => {
      if (!dbReachable) skip();

      const asSupport = await request(server)
        .get("/api/admin/inquiries?status=open&limit=5")
        .set("Authorization", `Bearer ${supportAccess}`)
        .expect(200);

      expect(asSupport.body).toEqual(
        expect.objectContaining({ rows: expect.any(Array) }),
      );

      const asAdmin = await request(server)
        .get("/api/admin/inquiries?limit=5")
        .set("Authorization", `Bearer ${adminAccess}`)
        .expect(200);

      expect(asAdmin.body).toEqual(
        expect.objectContaining({
          rows: expect.any(Array),
          nextCursor:
            asAdmin.body.rows.length === 5 ? expect.any(String) : null,
        }),
      );
    },
  );
});