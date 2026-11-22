import {
  commentPublicHandle,
  type ListingCommentRow,
} from "@/lib/nakuru/comment-display";
import { getPublicListingById } from "@/lib/server/catalog";
import { audit } from "./audit";
import { db } from "./db";
import type { SessionUser } from "./tokens";

export class CommentError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string) {
    super(code);
    this.status = status;
    this.code = code;
  }
}

const COMMENTS_PER_HOUR = 10;

export type { ListingCommentRow };

type CommentSqlRow = {
  id: string;
  body: string;
  author_id: string;
  email: string | null;
  created_at: Date;
};

function shapeComment(r: CommentSqlRow): ListingCommentRow {
  return {
    id: r.id,
    body: r.body,
    authorHandle: commentPublicHandle(r.email),
    authorId: r.author_id,
    createdAt: r.created_at.toISOString(),
  };
}

function isStaff(role: string): boolean {
  return role === "admin" || role === "support";
}

export async function listPublicComments(
  productId: string,
): Promise<ListingCommentRow[]> {
  const listing = await getPublicListingById(productId);
  if (!listing) {
    throw new CommentError(404, "not_found");
  }

  const rows = (
    await db.q<CommentSqlRow>(
      `select c.id, c.body, c.author_id, u.email, c.created_at
       from listing_comments c
       join users u on u.id = c.author_id
       where c.product_id = $1
         and c.deleted_at is null
       order by c.created_at asc
       limit 200`,
      [productId],
    )
  ).rows;
  return rows.map(shapeComment);
}

async function recentCommentCount(authorId: string): Promise<number> {
  const row = (
    await db.q<{ n: string }>(
      `select count(*)::text as n from listing_comments
       where author_id = $1 and created_at > now() - interval '1 hour'`,
      [authorId],
    )
  ).rows[0];
  return Number(row?.n ?? 0);
}

export async function createListingComment(
  user: SessionUser,
  productId: string,
  body: string,
  ip: string | null,
): Promise<ListingCommentRow> {
  if (isStaff(user.role)) {
    throw new CommentError(403, "forbidden");
  }

  const listing = await getPublicListingById(productId);
  if (!listing) {
    throw new CommentError(404, "not_found");
  }

  if ((await recentCommentCount(user.id)) >= COMMENTS_PER_HOUR) {
    throw new CommentError(429, "rate_limited");
  }

  const inserted = (
    await db.q<CommentSqlRow>(
      `insert into listing_comments (product_id, author_id, body)
       values ($1, $2, $3)
       returning id, body, author_id, created_at,
                 (select email from users where id = $2) as email`,
      [productId, user.id, body],
    )
  ).rows[0];

  audit("comment_create", user.id, ip, {
    comment: inserted.id,
    product: productId,
  });

  return shapeComment(inserted);
}

export async function softDeleteListingComment(
  user: SessionUser,
  commentId: string,
  ip: string | null,
): Promise<void> {
  const row = (
    await db.q<{ id: string; author_id: string }>(
      `select id, author_id from listing_comments
       where id = $1 and deleted_at is null`,
      [commentId],
    )
  ).rows[0];

  if (!row) {
    throw new CommentError(404, "not_found");
  }

  const allowed = row.author_id === user.id || isStaff(user.role);
  if (!allowed) {
    throw new CommentError(403, "forbidden");
  }

  await db.q(
    `update listing_comments
     set deleted_at = now(), deleted_by = $2
     where id = $1 and deleted_at is null`,
    [commentId, user.id],
  );

  audit("comment_delete", user.id, ip, { comment: commentId });
}
