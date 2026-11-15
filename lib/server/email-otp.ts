import crypto from "node:crypto";
import { config } from "./config";
import { db } from "./db";
import { sendMail } from "./mailgun";

const DAILY_CAP = 5;

function hmac(email: string, code: string): Buffer {
  return crypto
    .createHmac("sha256", config.otpSecret)
    .update(`${email}:${code}`)
    .digest();
}

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export type OtpIssueResult = { devCode?: string };

/** @returns devCode in local dev when Mailgun is off or OTP_DEV_ON_SCREEN=true. */
export async function issue(rawEmail: string): Promise<OtpIssueResult> {
  const email = normalizeEmail(rawEmail);

  const last = await db.q<{ last_sent: Date }>(
    "select last_sent from otp_codes where email = $1",
    [email],
  );
  if (
    last.rows[0] &&
    Date.now() - new Date(last.rows[0].last_sent).getTime() < 60_000
  ) {
    return {};
  }

  const daily = await db.q<{ n: number }>(
    `insert into otp_daily (email, day, n)
     values ($1, current_date, 1)
     on conflict (email, day) do update set n = otp_daily.n + 1
     returning n`,
    [email],
  );
  if (daily.rows[0].n > DAILY_CAP) return {};

  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
  const hash = hmac(email, code);

  await db.q(
    `insert into otp_codes (email, code_hash, expires_at, attempts, last_sent)
     values ($1, $2, now() + interval '5 minutes', 0, now())
     on conflict (email) do update set
       code_hash = $2,
       expires_at = now() + interval '5 minutes',
       attempts = 0,
       last_sent = now()`,
    [email, hash],
  );

  await sendMail({
    to: email,
    subject: "Your NakuruHub sign-in code",
    text: `Your code is ${code}. Valid for 5 minutes. Never share it.`,
  });

  return config.otpDevOnScreen ? { devCode: code } : {};
}

export async function check(rawEmail: string, code: string): Promise<boolean> {
  const email = normalizeEmail(rawEmail);

  const r = await db.q<{ code_hash: Buffer }>(
    `update otp_codes
     set attempts = attempts + 1
     where email = $1 and expires_at > now() and attempts < 5
     returning code_hash`,
    [email],
  );
  if (!r.rows[0]) return false;

  const expected = hmac(email, code);
  const stored = r.rows[0].code_hash;
  if (stored.length !== expected.length) return false;

  const ok = crypto.timingSafeEqual(stored, expected);
  if (ok) {
    await db.q("delete from otp_codes where email = $1", [email]);
  }
  return ok;
}

export function parseOtpRequestBody(body: unknown): string | null {
  if (!body || typeof body !== "object" || !("email" in body)) return null;
  const raw = (body as { email: unknown }).email;
  if (typeof raw !== "string") return null;
  const email = normalizeEmail(raw);
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return null;
  }
  return email;
}

export function parseOtpVerifyBody(
  body: unknown,
): { email: string; code: string } | null {
  if (!body || typeof body !== "object") return null;
  const { email: e, code: c } = body as { email?: unknown; code?: unknown };
  if (typeof e !== "string" || typeof c !== "string") return null;
  const email = normalizeEmail(e);
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return null;
  }
  if (!/^\d{6}$/.test(c)) return null;
  return { email, code: c };
}