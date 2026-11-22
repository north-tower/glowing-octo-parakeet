import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { DELETE as deleteComment } from "@/app/api/comments/[id]/route";
import {
  GET as listComments,
  POST as postComment,
} from "@/app/api/listings/[id]/comments/route";
import { commentPublicHandle } from "@/lib/nakuru/comment-display";
import { accessToken } from "@/lib/server/tokens";

const hasDbEnv =
  !!process.env.DATABASE_URL &&
  !!process.env.JWT_ACCESS_SECRET &&
  !!process.env.OTP_HMAC_SECRET &&
  !!process.env.TOTP_ENC_KEY;

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Ctx = { params: Promise<{ id: string }> };

function ctx(id: string): Ctx {
  return { params: Promise.resolve({ id }) };
}

async function readJson(res: Response): Promise<{ status: number; body: unknown }> {
  return { status: res.status, body: await res.json() };
}

describe("listing comments API", () => {
  let dbReachable = false;
  let ownerId = "";
  let customerId = "";
  let otherId = "";
  let staffId = "";
  let vendorId = "";
  let productId = "";
  let inactiveId = "";
  let customerAccess = "";
  let otherAccess = "";
  let staffAccess = "";
  const tag = `vitest-cmt-${Date.now()}`;

  beforeAll(async () => {
    if (!hasDbEnv) return;
    try {
      const { db } = await import("@/lib/server/db");
      await db.q("select 1");
      dbReachable = true;
    } catch {
      dbReachable = false;
    }
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
    const other = (
      await db.q<{ id: string }>(
        `insert into users(email, role) values($1, 'customer') returning id`,
        [`${tag}-other@example.com`],
      )
    ).rows[0];
    const staff = (
      await db.q<{ id: string }>(
        `insert into users(email, role) values($1, 'admin') returning id`,
        [`${tag}-staff@example.com`],
      )
    ).rows[0];

    ownerId = owner.id;
    customerId = customer.id;
    otherId = other.id;
    staffId = staff.id;

    const vendor = (
      await db.q<{ id: string }>(
        `insert into vendors(owner_id, name, status, categories)
         values($1, $2, 'approved', '{shop}')
         returning id`,
        [ownerId, `${tag} Vendor`],
      )
    ).rows[0];
    vendorId = vendor.id;

    const product = (
      await db.q<{ id: string }>(
        `insert into products(vendor_id, category, title, price_kes, active)
         values($1, 'shop', $2, 1200, true)
         returning id`,
        [vendorId, `${tag} Product`],
      )
    ).rows[0];
    const inactive = (
      await db.q<{ id: string }>(
        `insert into products(vendor_id, category, title, price_kes, active)
         values($1, 'shop', $2, 900, false)
         returning id`,
        [vendorId, `${tag} Inactive`],
      )
    ).rows[0];

    productId = product.id;
    inactiveId = inactive.id;
    customerAccess = accessToken({ id: customerId, role: "customer" });
    otherAccess = accessToken({ id: otherId, role: "customer" });
    staffAccess = accessToken({ id: staffId, role: "admin" });
  });

  afterAll(async () => {
    if (!dbReachable) return;
    const { db } = await import("@/lib/server/db");
    if (vendorId) {
      await db.q("delete from products where vendor_id = $1", [vendorId]);
      await db.q("delete from vendors where id = $1", [vendorId]);
    }
    await db.q("delete from users where id = any($1::uuid[])", [
      [ownerId, customerId, otherId, staffId].filter(Boolean),
    ]);
  });

  it.skipIf(!hasDbEnv)("guest GET starts empty then sees a post without full email", async ({ skip }) => {
    if (!dbReachable) skip();

    const empty = await readJson(
      await listComments(
        new Request(`http://127.0.0.1/api/listings/${productId}/comments`),
        ctx(productId),
      ),
    );
    expect(empty.status).toBe(200);
    expect(empty.body).toEqual([]);

    const created = await readJson(
      await postComment(
        new Request(`http://127.0.0.1/api/listings/${productId}/comments`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${customerAccess}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ body: "Is this still available?" }),
        }),
        ctx(productId),
      ),
    );
    expect(created.status).toBe(201);
    const row = created.body as {
      id: string;
      body: string;
      authorHandle: string;
      authorId: string;
    };
    expect(row.id).toMatch(UUID);
    expect(row.body).toBe("Is this still available?");
    expect(row.authorHandle).toBe(
      commentPublicHandle(`${tag}-customer@example.com`),
    );
    expect(row.authorHandle.includes("@")).toBe(false);
    expect(row.authorId).toBe(customerId);

    const listed = await readJson(
      await listComments(
        new Request(`http://127.0.0.1/api/listings/${productId}/comments`),
        ctx(productId),
      ),
    );
    expect(listed.status).toBe(200);
    expect(listed.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: row.id,
          body: "Is this still available?",
          authorHandle: commentPublicHandle(`${tag}-customer@example.com`),
        }),
      ]),
    );
    const json = JSON.stringify(listed.body);
    expect(json).not.toContain("@example.com");
  });

  it.skipIf(!hasDbEnv)("guest POST is unauthorized; staff POST is forbidden", async ({ skip }) => {
    if (!dbReachable) skip();

    const guest = await readJson(
      await postComment(
        new Request(`http://127.0.0.1/api/listings/${productId}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: "hello" }),
        }),
        ctx(productId),
      ),
    );
    expect(guest).toEqual({ status: 401, body: { error: "unauthorized" } });

    const staff = await readJson(
      await postComment(
        new Request(`http://127.0.0.1/api/listings/${productId}/comments`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${staffAccess}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ body: "staff should not post" }),
        }),
        ctx(productId),
      ),
    );
    expect(staff).toEqual({ status: 403, body: { error: "forbidden" } });
  });

  it.skipIf(!hasDbEnv)("author and staff can delete; another customer cannot", async ({ skip }) => {
    if (!dbReachable) skip();

    const mine = await readJson(
      await postComment(
        new Request(`http://127.0.0.1/api/listings/${productId}/comments`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${customerAccess}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ body: "please hide me" }),
        }),
        ctx(productId),
      ),
    );
    const mineId = (mine.body as { id: string }).id;

    const otherDel = await readJson(
      await deleteComment(
        new Request(`http://127.0.0.1/api/comments/${mineId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${otherAccess}` },
        }),
        ctx(mineId),
      ),
    );
    expect(otherDel).toEqual({ status: 403, body: { error: "forbidden" } });

    const authorDel = await readJson(
      await deleteComment(
        new Request(`http://127.0.0.1/api/comments/${mineId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${customerAccess}` },
        }),
        ctx(mineId),
      ),
    );
    expect(authorDel).toEqual({ status: 200, body: { ok: true } });

    const afterAuthor = await readJson(
      await listComments(
        new Request(`http://127.0.0.1/api/listings/${productId}/comments`),
        ctx(productId),
      ),
    );
    const ids = (afterAuthor.body as { id: string }[]).map((c) => c.id);
    expect(ids).not.toContain(mineId);

    const staffTarget = await readJson(
      await postComment(
        new Request(`http://127.0.0.1/api/listings/${productId}/comments`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${otherAccess}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ body: "staff will remove this" }),
        }),
        ctx(productId),
      ),
    );
    const staffTargetId = (staffTarget.body as { id: string }).id;

    const staffDel = await readJson(
      await deleteComment(
        new Request(`http://127.0.0.1/api/comments/${staffTargetId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${staffAccess}` },
        }),
        ctx(staffTargetId),
      ),
    );
    expect(staffDel).toEqual({ status: 200, body: { ok: true } });
  });

  it.skipIf(!hasDbEnv)("inactive listing is not_found", async ({ skip }) => {
    if (!dbReachable) skip();

    const listed = await readJson(
      await listComments(
        new Request(`http://127.0.0.1/api/listings/${inactiveId}/comments`),
        ctx(inactiveId),
      ),
    );
    expect(listed).toEqual({ status: 404, body: { error: "not_found" } });

    const posted = await readJson(
      await postComment(
        new Request(`http://127.0.0.1/api/listings/${inactiveId}/comments`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${customerAccess}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ body: "should fail" }),
        }),
        ctx(inactiveId),
      ),
    );
    expect(posted).toEqual({ status: 404, body: { error: "not_found" } });
  });
});
