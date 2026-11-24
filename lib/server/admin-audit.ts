import { db } from "./db";

const SENSITIVE_META_KEYS = new Set([
  "code",
  "password",
  "token",
  "otp",
  "refresh",
  "access",
  "secret",
]);

export type AuditRow = {
  id: number;
  at: Date;
  event: string;
  user_id: string | null;
  actor_email: string | null;
  ip: string | null;
  meta: Record<string, unknown>;
};

function sanitizeMeta(meta: unknown): Record<string, unknown> {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return {};
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(meta as Record<string, unknown>)) {
    if (SENSITIVE_META_KEYS.has(k.toLowerCase())) continue;
    out[k] = v;
  }
  return out;
}

export type ListAuditInput = {
  limit: number;
  cursor?: number;
  eventPrefix?: string;
  since?: Date;
  until?: Date;
};

export async function listAuditLog(input: ListAuditInput): Promise<AuditRow[]> {
  const clauses = ["1=1"];
  const params: unknown[] = [];
  let n = 1;

  if (input.cursor != null) {
    clauses.push(`a.id < $${n++}`);
    params.push(input.cursor);
  }
  if (input.eventPrefix) {
    clauses.push(`a.event ilike $${n++}`);
    params.push(`${input.eventPrefix}%`);
  }
  if (input.since) {
    clauses.push(`a.at >= $${n++}`);
    params.push(input.since);
  }
  if (input.until) {
    clauses.push(`a.at <= $${n++}`);
    params.push(input.until);
  }

  params.push(input.limit);

  const r = await db.q<{
    id: number;
    at: Date;
    event: string;
    user_id: string | null;
    actor_email: string | null;
    ip: string | null;
    meta: Record<string, unknown> | null;
  }>(
    `select a.id, a.at, a.event, a.user_id, u.email as actor_email, a.ip::text as ip, a.meta
     from audit_log a
     left join users u on u.id = a.user_id
     where ${clauses.join(" and ")}
     order by a.id desc
     limit $${n}`,
    params,
  );

  return r.rows.map((row) => ({
    id: Number(row.id),
    at: row.at,
    event: row.event,
    user_id: row.user_id,
    actor_email: row.actor_email,
    ip: row.ip,
    meta: sanitizeMeta(row.meta),
  }));
}

export function auditRowToJson(row: AuditRow) {
  return {
    id: Number(row.id),
    at: row.at.toISOString(),
    event: row.event,
    userId: row.user_id,
    actorEmail: row.actor_email,
    ip: row.ip,
    meta: row.meta,
  };
}