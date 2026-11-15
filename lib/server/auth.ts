import crypto from "node:crypto";
import argon2 from "argon2";
import { verify as verifyTotp } from "otplib";
import { config } from "./config";
import { db } from "./db";
import { dec as decryptTotpSecret } from "./secrets";
import { accessToken, newRefresh, type SessionUser } from "./tokens";

export const REFRESH_COOKIE = "rt";

export const refreshCookieOptions = {
  httpOnly: true,
  secure: config.env === "production",
  sameSite: "strict" as const,
  path: "/api/auth",
  maxAge: config.refreshDays * 86_400,
};

let dummyHash: string | undefined;
void argon2
  .hash(crypto.randomBytes(16).toString("hex"), { type: argon2.argon2id })
  .then((h) => {
    dummyHash = h;
  });

export function clientIp(req: Request): string | null {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() || null;
  return req.headers.get("x-real-ip");
}

export async function startSession(user: SessionUser): Promise<{
  access: string;
  refresh: string;
}> {
  return {
    access: accessToken(user),
    refresh: await newRefresh(user.id),
  };
}

export type AuthUserRow = {
  id: string;
  role: string;
  disabled: boolean;
};

/** Upsert customer/vendor login row by normalized email. */
export async function upsertUserByEmail(email: string): Promise<AuthUserRow> {
  const inserted = (
    await db.q<AuthUserRow>(
      `insert into users(email) values($1)
       on conflict do nothing
       returning id, role, disabled`,
      [email],
    )
  ).rows[0];
  if (inserted) return inserted;
  const existing = (
    await db.q<AuthUserRow>(
      "select id, role, disabled from users where lower(email) = lower($1)",
      [email],
    )
  ).rows[0];
  if (!existing) {
    throw new Error("user_upsert_failed");
  }
  return existing;
}

export type StaffRow = {
  id: string;
  role: string;
  password_hash: string | null;
  totp_secret: string | null;
  totp_step: string | number | null;
  locked_until: Date | null;
  disabled: boolean;
};

export async function staffLogin(
  email: string,
  password: string,
  totpCode: string,
): Promise<StaffRow | null> {
  const u = (
    await db.q<StaffRow>(
      `select id, role, password_hash, totp_secret, totp_step, locked_until, disabled
       from users
       where lower(email) = lower($1) and role in ('admin', 'support')`,
      [email],
    )
  ).rows[0];

  const locked = !!(
    u?.locked_until && new Date(u.locked_until) > new Date()
  );
  const okPw = await argon2
    .verify(u?.password_hash ?? dummyHash ?? "", password)
    .catch(() => false);

  const step = Math.floor(Date.now() / 30_000);
  let okTotp = false;
  const totpEnforced = config.staffTotpRequired;
  if (!totpEnforced) {
    okTotp = true;
  } else if (!u?.totp_secret) {
    okTotp = false;
  } else if (u.totp_secret) {
    try {
      const secret = decryptTotpSecret(u.totp_secret);
      const totpOk = await verifyTotp({ token: totpCode, secret });
      okTotp = totpOk.valid === true && step > Number(u.totp_step ?? 0);
    } catch {
      okTotp = false;
    }
  }

  let ok = !!(u && !u.disabled && !locked && okPw && okTotp);
  if (ok && u) {
    if (totpEnforced) {
      const burn = await db.q(
        "update users set totp_step = $2, failed_logins = 0, locked_until = null where id = $1 and coalesce(totp_step, 0) < $2 returning id",
        [u.id, step],
      );
      ok = (burn.rowCount ?? 0) === 1;
    } else {
      await db.q(
        "update users set failed_logins = 0, locked_until = null where id = $1",
        [u.id],
      );
    }
  }

  if (!ok) {
    if (u) {
      await db.q(
        `update users set failed_logins = failed_logins + 1,
         locked_until = case when failed_logins + 1 >= 5 then now() + interval '15 minutes' else locked_until end
         where id = $1`,
        [u.id],
      );
    }
    return null;
  }
  return u;
}
