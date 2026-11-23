import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { POST as startThread } from "@/app/api/listings/[id]/message-thread/route";
import { GET as getThread } from "@/app/api/message-threads/[id]/route";
import { GET as listMine } from "@/app/api/message-threads/mine/route";
import { POST as sendMessage } from "@/app/api/message-threads/[id]/messages/route";
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

describe("listing messages API", () => {
  let dbReachable = false;
  let ownerId = "";
  let customerId = "";
  let otherId = "";
  let staffId = "";
  let vendorId = "";
  let productId = "";
  let inactiveId = "";
  let customerAccess = "";
  let ownerAccess = "";
  let otherAccess = "";
  let staffAccess = "";
  let threadId = "";
  const tag = `vitest-msg-${Date.now()}`;
  const categorySlug = `${tag}-cat`;

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

    await db.q(
      `insert into categories (slug, label, kind, listing_mode, visible, open_for_apply, sort_order)
       values ($1, 'Vitest shop', 'community', 'shop', true, true, 500)`,
      [categorySlug],
    );

    const product = (
      await db.q<{ id: string }>(
        `insert into products(vendor_id, category, title, price_kes, active)
         values($1, $2, $3, 1200, true)
         returning id`,
        [vendorId, categorySlug, `${tag} Product`],
      )
    ).rows[0];
    const inactive = (
      await db.q<{ id: string }>(
        `insert into products(vendor_id, category, title, price_kes, active)
         values($1, $2, $3, 900, false)
         returning id`,
        [vendorId, categorySlug, `${tag} Inactive`],
      )
    ).rows[0];

    productId = product.id;
    inactiveId = inactive.id;
    customerAccess = accessToken({ id: customerId, role: "customer" });
    ownerAccess = accessToken({ id: ownerId, role: "customer" });
    otherAccess = accessToken({ id: otherId, role: "customer" });
    staffAccess = accessToken({ id: staffId, role: "admin" });
  });

  afterAll(async () => {
    if (!dbReachable) return;
    const { db } = await import("@/lib/server/db");
    await db.q("delete from listing_messages where thread_id in (select id from listing_message_threads where product_id = any($1::uuid[]))", [
      [productId, inactiveId].filter(Boolean),
    ]);
    await db.q("delete from listing_message_threads where product_id = any($1::uuid[])", [
      [productId, inactiveId].filter(Boolean),
    ]);
    await db.q("delete from products where id = any($1::uuid[])", [
      [productId, inactiveId].filter(Boolean),
    ]);
    await db.q("delete from vendors where id = $1", [vendorId]);
    await db.q("delete from categories where slug = $1", [categorySlug]);
    await db.q("delete from users where id = any($1::uuid[])", [
      [ownerId, customerId, otherId, staffId],
    ]);
  });

  it.skipIf(!hasDbEnv)("guest cannot start thread", async ({ skip }) => {
    if (!dbReachable) skip();
    const res = await startThread(
      new Request(`http://test/api/listings/${productId}/message-thread`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body: "Hello" }),
      }),
      ctx(productId),
    );
    expect(res.status).toBe(401);
  });

  it.skipIf(!hasDbEnv)("creates thread and lists for buyer and vendor", async ({ skip }) => {
    if (!dbReachable) skip();

    const started = await readJson(
      await startThread(
        new Request(`http://test/api/listings/${productId}/message-thread`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${customerAccess}`,
          },
          body: JSON.stringify({ body: "Is this still available?" }),
        }),
        ctx(productId),
      ),
    );
    expect(started.status).toBe(201);
    expect(started.body).toMatchObject({
      threadId: expect.stringMatching(UUID),
    });
    threadId = (started.body as { threadId: string }).threadId;

    const buyerList = await readJson(
      await listMine(
        new Request("http://test/api/message-threads/mine", {
          headers: { authorization: `Bearer ${customerAccess}` },
        }),
      ),
    );
    expect(buyerList.status).toBe(200);
    expect((buyerList.body as { threads: unknown[] }).threads.length).toBeGreaterThan(0);

    const vendorList = await readJson(
      await listMine(
        new Request("http://test/api/message-threads/mine", {
          headers: { authorization: `Bearer ${ownerAccess}` },
        }),
      ),
    );
    expect(vendorList.status).toBe(200);

    const detail = await readJson(
      await getThread(
        new Request(`http://test/api/message-threads/${threadId}`, {
          headers: { authorization: `Bearer ${customerAccess}` },
        }),
        ctx(threadId),
      ),
    );
    expect(detail.status).toBe(200);
    expect((detail.body as { messages: unknown[] }).messages).toHaveLength(1);

    const vendorReply = await readJson(
      await sendMessage(
        new Request(`http://test/api/message-threads/${threadId}/messages`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${ownerAccess}`,
          },
          body: JSON.stringify({ body: "Yes, still available." }),
        }),
        ctx(threadId),
      ),
    );
    expect(vendorReply.status).toBe(201);
  });

  it.skipIf(!hasDbEnv)("rejects stranger, staff start, and own listing", async ({ skip }) => {
    if (!dbReachable || !threadId) skip();

    const stranger = await readJson(
      await getThread(
        new Request(`http://test/api/message-threads/${threadId}`, {
          headers: { authorization: `Bearer ${otherAccess}` },
        }),
        ctx(threadId),
      ),
    );
    expect(stranger.status).toBe(403);

    const staffStart = await readJson(
      await startThread(
        new Request(`http://test/api/listings/${productId}/message-thread`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${staffAccess}`,
          },
          body: JSON.stringify({ body: "Staff" }),
        }),
        ctx(productId),
      ),
    );
    expect(staffStart.status).toBe(403);

    const own = await readJson(
      await startThread(
        new Request(`http://test/api/listings/${productId}/message-thread`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${ownerAccess}`,
          },
          body: JSON.stringify({ body: "Own" }),
        }),
        ctx(productId),
      ),
    );
    expect(own.status).toBe(400);

    const inactive = await readJson(
      await startThread(
        new Request(`http://test/api/listings/${inactiveId}/message-thread`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${customerAccess}`,
          },
          body: JSON.stringify({ body: "Hi" }),
        }),
        ctx(inactiveId),
      ),
    );
    expect(inactive.status).toBe(404);
  });
});