import argon2 from "argon2";
import { generateSecret } from "otplib";
import { config } from "@/lib/server/config";
import { db } from "@/lib/server/db";
import { enc } from "@/lib/server/secrets";

export type StaffRole = "admin" | "support";

export async function upsertStaffUser(
  staffEmail: string,
  role: StaffRole,
  password: string,
): Promise<{ totpSecret: string | null }> {
  const hash = await argon2.hash(password, { type: argon2.argon2id });
  const withTotp = config.staffTotpRequired;
  const secret = withTotp ? generateSecret() : null;
  const encSecret = secret ? enc(secret) : null;

  const updated = await db.q(
    `update users
     set role = $2, password_hash = $3, totp_secret = $4,
         totp_step = 0, failed_logins = 0, locked_until = null, disabled = false
     where lower(email) = lower($1)
     returning id`,
    [staffEmail, role, hash, encSecret],
  );

  if ((updated.rowCount ?? 0) === 0) {
    await db.q(
      `insert into users(email, role, password_hash, totp_secret)
       values($1, $2, $3, $4)`,
      [staffEmail, role, hash, encSecret],
    );
  }

  return { totpSecret: secret };
}