import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { POST as appendCategory } from "@/app/api/vendors/mine/categories/route";
import { slugifyCategoryLabel } from "@/lib/nakuru/category-slug";
import { accessToken } from "@/lib/server/tokens";
import { createTestServer } from "./test-server";

const hasDbEnv =
  !!process.env.DATABASE_URL &&
  !!process.env.JWT_ACCESS_SECRET &&
  !!process.env.OTP_HMAC_SECRET &&
  !!process.env.TOTP_ENC_KEY;

describe("POST /api/vendors/mine/categories", () => {
  let server: ReturnType<typeof createTestServer>;
  let dbReachable = false;

  let ownerId = "";
  let vendorId = "";
  let ownerAccess = "";
  const tag = `vitest-append-cat-${Date.now()}`;
  const moreLabel = `More ${tag}`;
  const moreSlug = slugifyCategoryLabel(moreLabel);

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
      "/api/vendors/mine/categories": { POST: appendCategory },
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

    const vendor = (
      await db.q<{ id: string }>(
        `insert into vendors(owner_id, name, status, categories)
         values($1, $2, 'approved', $3::text[])
         returning id`,
        [ownerId, `${tag} Vendor`, ["shop"]],
      )
    ).rows[0];
    vendorId = vendor.id;
  });

  afterAll(async () => {
    if (dbReachable) {
      const { db } = await import("@/lib/server/db");
      if (vendorId) {
        await db.q("delete from vendors where id = $1", [vendorId]);
      }
      await db.q("delete from categories where slug = $1", [moreSlug]);
      if (ownerId) {
        await db.q("delete from users where id = $1", [ownerId]);
      }
    }
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  it.skipIf(!hasDbEnv)(
    "appends a new community category from label",
    async ({ skip }) => {
      if (!dbReachable) skip();

      const res = await request(server)
        .post("/api/vendors/mine/categories")
        .set("Authorization", `Bearer ${ownerAccess}`)
        .send({ label: moreLabel })
        .expect(200);

      expect(res.body.categories).toHaveLength(2);
      expect(res.body.categories).toContain("shop");
      expect(res.body.categories).toContain(moreSlug);
      expect(res.body.category).toEqual(
        expect.objectContaining({ slug: moreSlug, label: moreLabel }),
      );
    },
  );

  it.skipIf(!hasDbEnv)(
    "rejects a fifth category with category_limit",
    async ({ skip }) => {
      if (!dbReachable) skip();

      const { db } = await import("@/lib/server/db");
      await db.q(
        `update vendors set categories = $2::text[] where id = $1`,
        [vendorId, ["shop", "services", moreSlug, "events"]],
      );

      const extraSlug = `extra-${tag}`;
      await db.q(
        `insert into categories (slug, label, kind, listing_mode, visible, open_for_apply, sort_order)
         values ($1, 'Extra', 'community', 'shop', true, true, 900)`,
        [extraSlug],
      );

      await request(server)
        .post("/api/vendors/mine/categories")
        .set("Authorization", `Bearer ${ownerAccess}`)
        .send({ slug: extraSlug })
        .expect(400)
        .expect({ error: "category_limit" });

      await db.q("delete from categories where slug = $1", [extraSlug]);
    },
  );
});