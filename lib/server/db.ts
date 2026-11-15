import { Pool, type PoolClient, type QueryResultRow } from "pg";
import { config } from "./config";

/** Remote Supabase needs TLS when `DB_SSL=verify` (default). */
function poolSsl(): false | { rejectUnauthorized: boolean } {
  if (config.dbSsl === "off") return false;
  // Supabase pooler TLS still encrypts traffic; strict CA verification fails on
  // some hosts (e.g. Vercel) with SELF_SIGNED_CERT_IN_CHAIN — same as verify-migrations.mjs.
  return { rejectUnauthorized: false };
}

const pool = new Pool({
  connectionString: config.dbUrl,
  max: 10,
  ssl: poolSsl(),
});

export async function q<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
) {
  return pool.query<T>(text, params);
}

export async function tx<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("begin");
    const result = await fn(client);
    await client.query("commit");
    return result;
  } catch (err) {
    await client.query("rollback").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

export const db = { q, pool, tx };