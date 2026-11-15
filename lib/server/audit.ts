import { db } from "./db";

/** Append-only security log. Never log OTP codes, passwords or tokens. */
export function audit(
  event: string,
  userId: string | null,
  ip: string | null,
  meta: Record<string, unknown> = {},
): void {
  void db
    .q(
      "insert into audit_log(event, user_id, ip, meta) values($1, $2, $3, $4)",
      [event, userId, ip, meta],
    )
    .catch((e: Error) => {
      console.error("audit failed:", e.message);
    });
}