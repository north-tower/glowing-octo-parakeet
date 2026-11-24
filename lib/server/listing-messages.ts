import { commentPublicHandle } from "@/lib/nakuru/comment-display";
import type {
  ListingMessageRow,
  MessageThreadDetail,
  MessageThreadSummary,
} from "@/lib/nakuru/listing-messages";
import { getPublicListingById } from "@/lib/server/catalog";
import { audit } from "./audit";
import { db } from "./db";
import type { SessionUser } from "./tokens";

export class MessageError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string) {
    super(code);
    this.status = status;
    this.code = code;
  }
}

const MESSAGES_PER_HOUR = 30;

type ThreadProduct = {
  id: string;
  title: string;
  vendor_name: string;
  owner_id: string;
};

type ThreadRow = {
  id: string;
  product_id: string;
  product_title: string;
  vendor_name: string;
  customer_id: string;
  vendor_owner_id: string;
  customer_email: string | null;
  last_body: string | null;
  last_at: Date | null;
  updated_at: Date;
};

type MessageSqlRow = {
  id: string;
  body: string;
  sender_id: string;
  email: string | null;
  created_at: Date;
};

async function productForMessaging(
  productId: string,
): Promise<ThreadProduct | null> {
  const listing = await getPublicListingById(productId);
  if (!listing) return null;

  const row = (
    await db.q<ThreadProduct>(
      `select p.id, p.title, v.name as vendor_name, v.owner_id
       from products p
       join vendors v on v.id = p.vendor_id
       where p.id = $1`,
      [productId],
    )
  ).rows[0];
  return row ?? null;
}

function isStaff(role: string): boolean {
  return role === "admin" || role === "support";
}

async function recentMessageCount(senderId: string): Promise<number> {
  const row = (
    await db.q<{ n: string }>(
      `select count(*)::text as n from listing_messages
       where sender_id = $1 and created_at > now() - interval '1 hour'`,
      [senderId],
    )
  ).rows[0];
  return Number(row?.n ?? 0);
}

function shapeMessage(
  r: MessageSqlRow,
  viewerId: string,
): ListingMessageRow {
  return {
    id: r.id,
    body: r.body,
    senderId: r.sender_id,
    senderHandle: commentPublicHandle(r.email),
    mine: r.sender_id === viewerId,
    createdAt: r.created_at.toISOString(),
  };
}

function shapeSummary(r: ThreadRow, viewerId: string): MessageThreadSummary {
  const asCustomer = r.customer_id === viewerId;
  const peerLabel = asCustomer
    ? r.vendor_name
    : commentPublicHandle(r.customer_email);
  return {
    id: r.id,
    productId: r.product_id,
    productTitle: r.product_title,
    vendorName: r.vendor_name,
    peerLabel,
    lastMessage: r.last_body ?? "",
    lastMessageAt: (r.last_at ?? r.updated_at).toISOString(),
    asCustomer,
  };
}

async function assertThreadParticipant(
  threadId: string,
  userId: string,
): Promise<ThreadRow> {
  const row = (
    await db.q<ThreadRow>(
      `select t.id, t.product_id, p.title as product_title, v.name as vendor_name,
              t.customer_id, t.vendor_owner_id, cu.email as customer_email,
              lm.body as last_body, lm.created_at as last_at, t.updated_at
       from listing_message_threads t
       join products p on p.id = t.product_id
       join vendors v on v.id = p.vendor_id
       join users cu on cu.id = t.customer_id
       left join lateral (
         select body, created_at
         from listing_messages
         where thread_id = t.id
         order by created_at desc
         limit 1
       ) lm on true
       where t.id = $1`,
      [threadId],
    )
  ).rows[0];

  if (!row) {
    throw new MessageError(404, "not_found");
  }
  if (row.customer_id !== userId && row.vendor_owner_id !== userId) {
    throw new MessageError(403, "forbidden");
  }
  return row;
}

export async function listMessageThreads(
  userId: string,
): Promise<MessageThreadSummary[]> {
  const rows = (
    await db.q<ThreadRow>(
      `select t.id, t.product_id, p.title as product_title, v.name as vendor_name,
              t.customer_id, t.vendor_owner_id, cu.email as customer_email,
              lm.body as last_body, lm.created_at as last_at, t.updated_at
       from listing_message_threads t
       join products p on p.id = t.product_id
       join vendors v on v.id = p.vendor_id
       join users cu on cu.id = t.customer_id
       left join lateral (
         select body, created_at
         from listing_messages
         where thread_id = t.id
         order by created_at desc
         limit 1
       ) lm on true
       where t.customer_id = $1 or t.vendor_owner_id = $1
       order by coalesce(lm.created_at, t.updated_at) desc
       limit 100`,
      [userId],
    )
  ).rows;
  return rows.map((r) => shapeSummary(r, userId));
}

export async function getMessageThreadDetail(
  user: SessionUser,
  threadId: string,
): Promise<MessageThreadDetail> {
  const thread = await assertThreadParticipant(threadId, user.id);

  const messages = (
    await db.q<MessageSqlRow>(
      `select m.id, m.body, m.sender_id, u.email, m.created_at
       from listing_messages m
       join users u on u.id = m.sender_id
       where m.thread_id = $1
       order by m.created_at asc
       limit 500`,
      [threadId],
    )
  ).rows;

  return {
    id: thread.id,
    productId: thread.product_id,
    productTitle: thread.product_title,
    vendorName: thread.vendor_name,
    messages: messages.map((m) => shapeMessage(m, user.id)),
  };
}

export async function sendListingMessage(
  user: SessionUser,
  threadId: string,
  body: string,
  ip: string | null,
): Promise<ListingMessageRow> {
  if (isStaff(user.role)) {
    throw new MessageError(403, "forbidden");
  }

  await assertThreadParticipant(threadId, user.id);

  if ((await recentMessageCount(user.id)) >= MESSAGES_PER_HOUR) {
    throw new MessageError(429, "rate_limited");
  }

  const inserted = (
    await db.q<MessageSqlRow>(
      `insert into listing_messages (thread_id, sender_id, body)
       values ($1, $2, $3)
       returning id, body, sender_id,
         (select email from users where id = $2) as email,
         created_at`,
      [threadId, user.id, body],
    )
  ).rows[0];

  await db.q(
    `update listing_message_threads set updated_at = now() where id = $1`,
    [threadId],
  );

  audit("message_send", user.id, ip, { thread: threadId, message: inserted.id });

  return shapeMessage(inserted, user.id);
}

export async function startListingMessageThread(
  user: SessionUser,
  productId: string,
  body: string,
  ip: string | null,
): Promise<{ threadId: string; message: ListingMessageRow }> {
  if (isStaff(user.role)) {
    throw new MessageError(403, "forbidden");
  }

  const product = await productForMessaging(productId);
  if (!product) {
    throw new MessageError(404, "not_found");
  }
  if (product.owner_id === user.id) {
    throw new MessageError(400, "own_product");
  }

  if ((await recentMessageCount(user.id)) >= MESSAGES_PER_HOUR) {
    throw new MessageError(429, "rate_limited");
  }

  const thread = (
    await db.q<{ id: string }>(
      `insert into listing_message_threads (product_id, customer_id, vendor_owner_id)
       values ($1, $2, $3)
       on conflict (product_id, customer_id) do update
         set updated_at = listing_message_threads.updated_at
       returning id`,
      [productId, user.id, product.owner_id],
    )
  ).rows[0];

  const inserted = (
    await db.q<MessageSqlRow>(
      `insert into listing_messages (thread_id, sender_id, body)
       values ($1, $2, $3)
       returning id, body, sender_id,
         (select email from users where id = $2) as email,
         created_at`,
      [thread.id, user.id, body],
    )
  ).rows[0];

  await db.q(
    `update listing_message_threads set updated_at = now() where id = $1`,
    [thread.id],
  );

  audit("message_thread_start", user.id, ip, {
    thread: thread.id,
    product: productId,
    message: inserted.id,
  });

  return {
    threadId: thread.id,
    message: shapeMessage(inserted, user.id),
  };
}