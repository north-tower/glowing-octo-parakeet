import pg from "pg";
import { readFileSync } from "fs";
import { resolve } from "path";

const envPath = resolve(".env.local");
for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, "");
}

const ssl =
  process.env.DB_SSL === "verify" ? { rejectUnauthorized: false } : false;
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl });

const expected = [
  "users",
  "vendors",
  "products",
  "vendor_documents",
  "service_inquiries",
  "otp_codes",
];

try {
  const { rows } = await pool.query(
    `select table_name from information_schema.tables
     where table_schema = 'public' and table_name = any($1::text[])
     order by 1`,
    [expected],
  );
  const found = rows.map((r) => r.table_name);
  const missing = expected.filter((t) => !found.includes(t));
  if (missing.length) {
    console.error("MISSING tables:", missing.join(", "));
    process.exit(1);
  }
  console.log("OK tables:", found.join(", "));

  const cols = await pool.query(
    `select column_name, is_nullable from information_schema.columns
     where table_name = 'users' and column_name in ('email', 'phone')`,
  );
  console.log("users columns:", cols.rows);

  const otp = await pool.query(
    `select column_name from information_schema.columns
     where table_name in ('otp_codes', 'otp_daily') and column_name in ('email', 'phone')`,
  );
  console.log("otp key columns:", otp.rows);
} finally {
  await pool.end();
}