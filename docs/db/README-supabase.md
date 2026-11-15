# Supabase database (NakuruHub hub)

All schema changes live in `supabase/migrations/`. Apply them to your **Supabase** project Postgres (not the Next.js app host).

## Prerequisites (one-time, Dashboard)

1. **Database → Extensions:** enable `postgis` and `pgcrypto` (or let `003` create them if allowed).
2. **Storage:** bucket `vendor-documents`, **private**, no public policies.
3. **Local env:** copy `.env.example` → `.env.local` and set `DATABASE_URL` (pooler or direct session URI), `SUPABASE_*`, JWT secrets, Mailgun.

## Migration run order

| File | Purpose |
|------|---------|
| `supabase/migrations/003_supabase_launch.sql` | Core schema (users, auth, vendors, catalog, orders, …) |
| `supabase/migrations/004_email_otp_and_launch_tables.sql` | `vendor_documents`, `service_inquiries` |

Run **003** first, then **004**, on an **empty** `public` schema (new project or fresh database).

## Option A — SQL Editor (recommended)

1. Supabase Dashboard → **SQL** → **New query**.
2. Paste the full contents of `003_supabase_launch.sql` → **Run** (expect success, no errors).
3. New query → paste `004_email_otp_and_launch_tables.sql` → **Run**.

If `003` fails on extensions, enable `postgis` / `pgcrypto` under **Database → Extensions**, then re-run `003`.

## Option B — `psql` (local CLI)

Use the same connection string as `DATABASE_URL` in `.env.local` (URI from **Project Settings → Database**).

```bash
# From repo root (hub)
psql "$DATABASE_URL" -f supabase/migrations/003_supabase_launch.sql
psql "$DATABASE_URL" -f supabase/migrations/004_email_otp_and_launch_tables.sql
```

PowerShell (load env from `.env.local` manually or set `$env:DATABASE_URL`):

```powershell
psql $env:DATABASE_URL -f supabase/migrations/003_supabase_launch.sql
psql $env:DATABASE_URL -f supabase/migrations/004_email_otp_and_launch_tables.sql
```

For Supabase, keep `DB_SSL=verify` in `.env.local`; the app enables TLS when talking to remote Postgres.

## Verify schema (SQL Editor)

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'users', 'vendors', 'products', 'vendor_documents', 'service_inquiries', 'otp_codes'
  )
order by 1;

select column_name
from information_schema.columns
where table_name = 'users' and column_name in ('email', 'phone');
```

Expect six tables and both columns on `users`.

## Verify app connectivity

1. `pnpm dev` (port 3000).
2. `GET /api/health` — expect `{ "ok": true, "db": "ok" }` when migrations and `DATABASE_URL` are correct.

```bash
curl -s http://127.0.0.1:3000/api/health
```

## Troubleshooting

| Symptom | Likely fix |
|---------|------------|
| `extension "postgis" is not available` | Enable PostGIS in Dashboard → Extensions. |
| `relation "users" already exists` | DB not empty; use a fresh project or drop `public` objects (destructive). |
| Health returns `db: "error"` | Check `DATABASE_URL`, password, IP allowlist, `DB_SSL`; confirm migrations ran. |
| Config throws on startup | Set `JWT_ACCESS_SECRET`, `OTP_HMAC_SECRET` (≥ 32 chars), `TOTP_ENC_KEY` (base64url, 32 bytes decoded). |