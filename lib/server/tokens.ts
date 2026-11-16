import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { config } from "./config";
import { db } from "./db";

export type SessionUser = { id: string; role: string };

const sha = (t: string) => crypto.createHash("sha256").update(t).digest("hex");

export function accessToken(user: SessionUser): string {
  return jwt.sign(
    { role: user.role },
    config.accessSecret,
    {
      algorithm: "HS256",
      subject: user.id,
      expiresIn: config.accessTtl,
      issuer: "nakuruhub",
    },
  );
}

/** Refresh tokens are random, stored only as SHA-256, rotated on every use. */
export async function newRefresh(
  userId: string,
  family?: string | null,
): Promise<string> {
  const t = crypto.randomBytes(32).toString("base64url");
  await db.q(
    `insert into refresh_tokens(user_id, family, token_hash, expires_at)
     values($1, coalesce($2::uuid, gen_random_uuid()), $3, now() + ($4::text || ' days')::interval)`,
    [userId, family ?? null, sha(t), String(config.refreshDays)],
  );
  return t;
}

export type RotateRefreshResult =
  | { ok: true; user: SessionUser; refresh: string }
  | { ok: false; clearCookie: boolean };

export async function rotateRefresh(tok: string): Promise<RotateRefreshResult> {
  const row = (
    await db.q<{
      id: string;
      user_id: string;
      family: string;
      revoked: boolean;
      expires_at: Date;
    }>("select * from refresh_tokens where token_hash = $1", [sha(tok)])
  ).rows[0];
  if (!row) return { ok: false, clearCookie: true };
  if (row.revoked || new Date(row.expires_at) < new Date()) {
    await db.q("update refresh_tokens set revoked = true where family = $1", [
      row.family,
    ]);
    return { ok: false, clearCookie: true };
  }
  const claim = await db.q(
    "update refresh_tokens set revoked = true where id = $1 and revoked = false returning id",
    [row.id],
  );
  if (claim.rowCount === 0) {
    // Concurrent refresh with the same token — do not revoke the whole family.
    return { ok: false, clearCookie: false };
  }
  const u = (
    await db.q<SessionUser & { disabled: boolean }>(
      "select id, role, disabled from users where id = $1",
      [row.user_id],
    )
  ).rows[0];
  if (!u || u.disabled) {
    await db.q("update refresh_tokens set revoked = true where family = $1", [
      row.family,
    ]);
    return { ok: false, clearCookie: true };
  }
  return {
    ok: true,
    user: { id: u.id, role: u.role },
    refresh: await newRefresh(u.id, row.family),
  };
}

export async function revokeRefresh(tok: string): Promise<void> {
  await db.q("update refresh_tokens set revoked = true where token_hash = $1", [
    sha(tok),
  ]);
}