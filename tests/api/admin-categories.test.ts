import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { GET, POST } from "@/app/api/admin/categories/route";
import { accessToken } from "@/lib/server/tokens";
import { slugifyCategoryLabel } from "@/lib/nakuru/category-slug";
import {
  listVisibleCategories,
  staffPatchCategory,
  upsertCommunityCategory,
} from "@/lib/server/categories";
import { createTestServer } from "./test-server";

const hasDbEnv =
  !!process.env.DATABASE_URL &&
  !!process.env.JWT_ACCESS_SECRET &&
  !!process.env.OTP_HMAC_SECRET &&
  !!process.env.TOTP_ENC_KEY;

describe("/api/admin/categories", () => {
  let server: ReturnType<typeof createTestServer>;
  let dbReachable = false;

  let adminId = "";
  let adminAccess = "";
  let customerId = "";
  const tag = `adm-${Date.now()}`;
  const label = `V ${tag}`;
  const communitySlug = slugifyCategoryLabel(label);

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
      "/api/admin/categories": { GET, POST },
    });
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", () => resolve()),
    );

    if (!dbReachable) return;

    const { db } = await import("@/lib/server/db");
    const admin = (
      await db.q<{ id: string }>(
        `insert into users(email, role) values($1, 'admin') returning id`,
        [`${tag}-admin@example.com`],
      )
    ).rows[0];
    adminId = admin.id;
    adminAccess = accessToken({ id: adminId, role: "admin" });

    const customer = (
      await db.q<{ id: string }>(
        `insert into users(email, role) values($1, 'customer') returning id`,
        [`${tag}@example.com`],
      )
    ).rows[0];
    customerId = customer.id;

    await upsertCommunityCategory(customerId, label);
  });

  afterAll(async () => {
    if (dbReachable) {
      const { db } = await import("@/lib/server/db");
      await db.q(`delete from categories where slug = $1`, [communitySlug]);
      if (adminId) {
        await db.q("delete from users where id = $1", [adminId]);
      }
      if (customerId) {
        await db.q("delete from users where id = $1", [customerId]);
      }
    }
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  it("GET without auth returns 401", async () => {
    await request(server)
      .get("/api/admin/categories")
      .expect(401)
      .expect({ error: "unauthorized" });
  });

  it.skipIf(!hasDbEnv)(
    "GET as admin includes visible; hiding drops row from public list",
    async ({ skip }) => {
      if (!dbReachable) skip();

      const before = await request(server)
        .get("/api/admin/categories")
        .set("Authorization", `Bearer ${adminAccess}`)
        .expect(200);

      expect(Array.isArray(before.body)).toBe(true);
      const community = before.body.find(
        (c: { slug: string }) => c.slug === communitySlug,
      );
      expect(community).toEqual(
        expect.objectContaining({
          slug: communitySlug,
          visible: true,
          kind: "community",
        }),
      );

      await staffPatchCategory(communitySlug, { visible: false });

      const afterAdmin = await request(server)
        .get("/api/admin/categories")
        .set("Authorization", `Bearer ${adminAccess}`)
        .expect(200);

      const hidden = afterAdmin.body.find(
        (c: { slug: string }) => c.slug === communitySlug,
      );
      expect(hidden?.visible).toBe(false);

      const visible = await listVisibleCategories();
      expect(visible.some((c) => c.slug === communitySlug)).toBe(false);
    },
  );
});