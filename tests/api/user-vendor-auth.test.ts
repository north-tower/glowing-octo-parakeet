import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { GET as getVendorOrders } from "@/app/api/vendor/orders/route";
import { adminVendorAction } from "@/lib/server/vendors";
import { accessToken } from "@/lib/server/tokens";
import { createTestServer } from "./test-server";

const hasDbEnv =
  !!process.env.DATABASE_URL &&
  !!process.env.JWT_ACCESS_SECRET &&
  !!process.env.OTP_HMAC_SECRET &&
  !!process.env.TOTP_ENC_KEY;

describe("user vs vendor identity", () => {
  let server: ReturnType<typeof createTestServer>;
  let dbReachable = false;
  const tag = `vitest-uv-auth-${Date.now()}`;

  beforeAll(async () => {
    if (hasDbEnv) {
      try {
        const { db } = await import("@/lib/server/db");
        await db.q("select 1");
        await db.q(
          "update users set role = 'customer' where role = 'vendor'",
        );
        dbReachable = true;
      } catch {
        dbReachable = false;
      }
    }

    server = createTestServer({
      "/api/vendor/orders": { GET: getVendorOrders },
    });
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", () => resolve()),
    );
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  it.skipIf(!hasDbEnv)(
    "keeps users.role as customer after vendor approve",
    async ({ skip }) => {
      if (!dbReachable) skip();
      const { db } = await import("@/lib/server/db");

      const staff = (
        await db.q<{ id: string }>(
          `insert into users(email, role) values($1, 'admin') returning id`,
          [`${tag}-staff@example.com`],
        )
      ).rows[0];
      const owner = (
        await db.q<{ id: string }>(
          `insert into users(email, role) values($1, 'customer') returning id`,
          [`${tag}@example.com`],
        )
      ).rows[0];
      const vendor = (
        await db.q<{ id: string }>(
          `insert into vendors(owner_id, name, status, categories)
           values($1, $2, 'pending', '{shop}')
           returning id`,
          [owner.id, `${tag} Shop`],
        )
      ).rows[0];

      await adminVendorAction(vendor.id, "approve", staff.id, null);

      const role = (
        await db.q<{ role: string }>(
          "select role from users where id = $1",
          [owner.id],
        )
      ).rows[0].role;
      expect(role).toBe("customer");

      const status = (
        await db.q<{ status: string }>(
          "select status from vendors where id = $1",
          [vendor.id],
        )
      ).rows[0].status;
      expect(status).toBe("approved");

      const access = accessToken({ id: owner.id, role: "customer" });
      await request(server)
        .get("/api/vendor/orders")
        .set("Authorization", `Bearer ${access}`)
        .expect(200);
    },
  );
});
