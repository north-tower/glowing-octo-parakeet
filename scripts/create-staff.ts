import argon2 from "argon2";
import { generateSecret, generateURI } from "otplib";
import { db } from "../lib/server/db";
import { email as emailSchema } from "../lib/server/schemas";
import { enc } from "../lib/server/secrets";

const [, , rawEmail, role] = process.argv;
const pw = process.env.STAFF_PASSWORD || "";

const parsed = emailSchema.safeParse(rawEmail);
if (
  !parsed.success ||
  !role ||
  !["admin", "support"].includes(role) ||
  pw.length < 12
) {
  console.error(
    "Usage: STAFF_PASSWORD=<12+ chars> pnpm exec tsx scripts/create-staff.ts <email> <admin|support>",
  );
  process.exit(1);
}

const staffEmail = parsed.data;

async function main() {
  const hash = await argon2.hash(pw, { type: argon2.argon2id });
  const secret = generateSecret();
  const encSecret = enc(secret);

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

  console.log(`Staff account ready for ${staffEmail} (${role}). Add to your authenticator app:`);
  console.log(generateURI({ issuer: "NakuruHub", label: staffEmail, secret }));
  await db.pool.end();
}

main().catch((e: Error) => {
  console.error(e.message);
  process.exit(1);
});