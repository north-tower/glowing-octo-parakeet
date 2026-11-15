# Vendor Onboarding & Marketplace Launch — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a public launch where vendors apply after **email OTP** verification, pass **admin review** (no in-app document upload at launch), publish shop products and service listings on a live catalog, with customers checking out shop orders (COD) and requesting service quotes—backed by Supabase Postgres and Mailgun email OTP.

**Architecture:** Implement **everything in the Next.js repo** `C:\Users\mhki\hub` only. **Do not** edit or deploy `C:\Users\mhki\nakuruhub\nakuruhub` — use its `server/` tree as a **read-only reference** when porting handlers. Backend lives in `lib/server/` (TypeScript) + **App Router Route Handlers** under `app/api/`* (same origin as the UI). Data: **Supabase PostgreSQL** (launch). **Supabase Storage / vendor documents (Phase P1) — skipped for launch** — see § Phase P1. Auth: **Mailgun** email OTP + httpOnly refresh cookies on `/api/auth/`*.

**Tech stack:** Next.js 16 (App Router), React 19, TypeScript, `pg`, Zod, `@supabase/supabase-js`, Mailgun HTTP API, Vitest, Playwright e2e, pnpm.

## Implementation repository (mandatory)


| Rule                    | Detail                                                                                  |
| ----------------------- | --------------------------------------------------------------------------------------- |
| **Work here**           | `C:\Users\mhki\hub` — all migrations, API routes, UI, scripts, tests                    |
| **Do not implement in** | `nakuruhub` prototype (no commits, no new files)                                        |
| **Reference only**      | Port logic from `nakuruhub/server/src/*.js` → `lib/server/*.ts` + `app/api/**/route.ts` |
| **API URL (client)**    | Prefer **relative** `/api/...` (no second process, no CORS in production)               |
| **Env files**           | `.env.local` (gitignored), `.env.example` (committed template)                          |


## Global Constraints

- **Spec:** [2026-11-15-vendor-onboarding-launch-design.md](../specs/2026-11-15-vendor-onboarding-launch-design.md) — launch categories `shop` and `services` only; nothing public until admin `approve`; Verified is separate for M-Pesa later.
- **Auth:** Customer/vendor sign-in = **email OTP only** (Mailgun). Staff = email + password + TOTP — never email OTP alone.
- **Secrets:** Never commit `.env.local`. Supabase service role + Mailgun only in server code (Route Handlers + `lib/server`).
- **Phone:** Optional on `users.phone` for delivery; Kenyan format when present (`+2547…`). Checkout may override per order.
- **Vendor identity (launch):** **Email OTP only** — no self-serve ID/category upload or Storage integration until post-launch. Keep `OTP_ENFORCE_VENDOR_DOCS=false`; staff judge applications from business name, categories, and optional notes (offline KYC for anchors if needed).
- **Documents (deferred — Phase P1):** When enabled later: private bucket; max 5 MB; MIME allowlist `jpeg`, `png`, `webp`, `pdf`. `vendor_documents` table may exist from migrations but unused at launch.
- **Open questions (locked):** Reject = generic “rejected, contact support”; services may use `price_kes = 0`; new inquiry notifies vendor via **email** (Mailgun), not SMS; **P1 document storage skipped for launch** (2026-11-15).
- **Same-origin API:** Route Handlers set cookies on the app domain; no separate `APP_ORIGIN` CORS setup unless you add an external API later.
- **Read** `node_modules/next/dist/docs/` before changing routing, Route Handlers, or cookies.

## File map (new / major — repo root `hub`)


| Path                                                      | Responsibility                                                    |
| --------------------------------------------------------- | ----------------------------------------------------------------- |
| `supabase/migrations/003_supabase_launch.sql`             | PostGIS + core schema (port from reference `nakuruhub/server/db`) |
| `supabase/migrations/004_email_otp_and_launch_tables.sql` | Email auth, `vendor_documents`, `service_inquiries`               |
| `docs/db/README-supabase.md`                              | How to apply migrations on Supabase                               |
| `lib/server/config.ts`                                    | Env validation (Mailgun, Supabase, JWT secrets)                   |
| `lib/server/db.ts`                                        | `pg` Pool + `tx()`                                                |
| `lib/server/mailgun.ts`                                   | Transactional email                                               |
| `lib/server/email-otp.ts`                                 | HMAC OTP issue/check                                              |
| `lib/server/storage.ts`                                   | Supabase Storage upload + signed download                         |
| `lib/server/schemas.ts`                                   | Zod (port from reference `schemas.js`)                            |
| `lib/server/auth.ts`                                      | Sessions, JWT access, refresh cookie helpers                      |
| `lib/server/*.ts`                                         | Domain logic (vendors, catalog, orders, inquiries, documents)     |
| `app/api/auth/otp/request/route.ts`                       | `POST` — send OTP email                                           |
| `app/api/auth/otp/verify/route.ts`                        | `POST` — set refresh cookie + return access                       |
| `app/api/auth/refresh/route.ts`                           | `POST` — rotate refresh                                           |
| `app/api/**/route.ts`                                     | Other endpoints mirroring reference API paths                     |
| `lib/nakuru/api.ts`                                       | Browser `fetch('/api/...')` + refresh retry                       |
| `components/app/auth/EmailOtpForm.tsx`                    | OTP UI                                                            |
| `app/staff/page.tsx`                                      | Staff vendor queue                                                |
| `scripts/create-staff.ts`                                 | Bootstrap admin (run with `pnpm exec tsx`)                        |
| `tests/api/*.test.ts`                                     | Vitest API tests                                                  |


## Task index (parent → sub-tasks)

Long-running work is split into **sub-tasks** `N.M` so each subagent session can finish in one reviewable unit (~30–90 min). Short tasks stay single blocks with steps only.


| Parent                      | Sub-tasks            | When to split further |
| --------------------------- | -------------------- | --------------------- |
| **0** Hub API skeleton      | 0.1–0.3              | Do first              |
| **1** Supabase + env        | 1.1–1.4              | —                     |
| **2** DB migrations         | 2.1–2.6              | Largest SQL task      |
| **3** Mailgun               | steps only           | —                     |
| **4** Email OTP             | steps only           | —                     |
| **5** Auth email            | 5.1–5.5              | —                     |
| **6** API tests             | steps only           | —                     |
| **7** Storage helper        | **SKIP (launch)**    | Phase P1 deferred     |
| **8** Document routes       | **SKIP (launch)**    | Phase P1 deferred     |
| **9–10** Inquiries + guards | steps only           | —                     |
| **11** API client           | 11.1–11.5            | Same-origin `/api`    |
| **12** Email OTP UI         | 12.1–12.4            | —                     |
| **13** Vendor apply UI      | 13.1–13.3            | No uploads at launch  |
| **14** Staff queue          | 14.1–14.5            | —                     |
| **15** Live catalog         | 15.1–15.5            | Many views            |
| **16** Vendor products      | 16.1–16.3            | —                     |
| **17** Checkout API         | 17.1–17.6            | Cart ID migration     |
| **18** Inquiry UI           | 18.1–18.3            | —                     |
| **19–20** Launch            | 19.1–19.3, 20.1–20.4 | —                     |


**Subagent brief:** Work only in `C:\Users\mhki\hub`. Use `nakuruhub/server` as read-only reference when porting.

---

## Phase P0 — Supabase + API foundation

### Task 0: Hub API skeleton (prerequisite)

**Files:**

- Create: `app/api/health/route.ts`
- Create: `lib/server/config.ts`, `lib/server/db.ts` (minimal stubs)
- Create: `docs/db/api-route-map.md`

- [ ] **0.1** Create folders: `lib/server/`, `app/api/`, `supabase/migrations/`, `tests/api/`.
- [x] **0.2** `GET /api/health` → `{ ok: true }`; extend with DB ping in Task 2.6.
- [ ] **0.3** In `docs/db/api-route-map.md`, map reference Express paths → `app/api/**/route.ts` (auth, listings, vendors, admin, orders, products, inquiries).

---

## Phase P0 (continued) — Supabase + API foundation

### Task 1: Supabase project and env wiring

**Files:**

- Modify: `.env.example`
- Modify: `lib/server/config.ts`
- Create: `docs/db/README-supabase.md`

**Interfaces:**

- Produces: `config.supabase`, `config.mailgun`, relaxed production checks (no Africa's Talking).

#### Sub-task 1.1: Supabase cloud setup (ops)

- [x] Create Supabase project (note **project ref** and region).
- [x] Database → Extensions → enable **postgis** and **pgcrypto** (if not already).
- [x] Storage → create bucket `**vendor-documents**`, **private**, no public policies.
- [x] Settings → Database → copy **Session pooler** URI for `DATABASE_URL`.
- [x] Settings → API → copy `SUPABASE_URL` and **service role** key (server only).

#### Sub-task 1.2: Local `.env` (developer)

- [x] Copy `.env.example` → `.env.local` (never commit).
- [x] Set `DATABASE_URL`, `SUPABASE_*`, Mailgun, JWT secrets in `.env.local`.
- [x] Run one terminal only: `pnpm dev` (port 3000).

#### Sub-task 1.3: Commit `.env.example` + `lib/server/config.ts`

- [x] **Step 4:** Extend `.env.example`:

```env
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
DB_SSL=verify
SUPABASE_URL=https://[ref].supabase.co
SUPABASE_SERVICE_ROLE_KEY=
MAILGUN_API_KEY=
MAILGUN_DOMAIN=mg.yourdomain.co.ke
MAILGUN_FROM=NakuruHub <auth@mg.yourdomain.co.ke>
OTP_ENFORCE_VENDOR_DOCS=false
LAUNCH_CATEGORIES=shop,services
```

- [x] **Step 5:** Implement `lib/server/config.ts` — require Mailgun in production (no Africa's Talking):

```javascript
const prod = (process.env.NODE_ENV || 'development') === 'production';
const mg = {
  key: process.env.MAILGUN_API_KEY || '',
  domain: process.env.MAILGUN_DOMAIN || '',
  from: process.env.MAILGUN_FROM || '',
};
if (prod && (!mg.key || !mg.domain || !mg.from)) {
  throw new Error('Production needs MAILGUN_API_KEY, MAILGUN_DOMAIN, MAILGUN_FROM');
}
module.exports = {
  // ...existing fields...
  mailgun: mg,
  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  otpEnforceVendorDocs: process.env.OTP_ENFORCE_VENDOR_DOCS === 'true',
  launchCategories: (process.env.LAUNCH_CATEGORIES || 'shop,services').split(','),
};
```

- [x] **Step 6:** Migrations in `supabase/migrations/` — run **003** then **004** in Supabase SQL Editor (README deferred).

#### Sub-task 1.4: Docs + smoke

- [x] **Step 6:** Document in `README-supabase.md` how to run SQL migrations in SQL Editor vs `psql`.
- [x] **Step 7:** Run `pnpm dev`; hit `GET /api/health` (`{ ok, db }`); see `docs/db/README-supabase.md` if `db: "error"`.

---

### Task 2: Database migrations on Supabase

**Files:**

- Create: `supabase/migrations/003_supabase_launch.sql`
- Create: `supabase/migrations/004_email_otp_and_launch_tables.sql`

**Interfaces:**

- Produces: tables from `schema.sql` + launch additions; `users.email` as login identity.

#### Sub-task 2.1: Scaffold migration files in repo

- [x] Create `supabase/migrations/003_supabase_launch.sql` (empty header + comment: run on empty DB).
- [x] Create `supabase/migrations/004_email_otp_and_launch_tables.sql`.
- [x] In `README-supabase.md`, document run order: **003 then 004**.

#### Sub-task 2.2: Port core schema into `003` (~45 min)

- [x] Paste from reference `nakuruhub/server/db/schema.sql` into `003` (extensions, `users`, OTP, `vendors`, `orders`, `products`, etc.).
- [x] Append reference `nakuruhub/server/db/migrations/002_orders_products_payments.sql` if not already reflected in schema.
- [x] Remove or comment `create role nakuruhub_app` — Supabase uses `postgres` / pooler user for dev.
- [x] Run `003` in Supabase SQL Editor; fix PostGIS or syntax errors until green.

#### Sub-task 2.3: Fix OTP table primary keys for email (pre-004)

- [x] Confirm `otp_codes` PK is `phone` today — plan rename in 004. *(Fresh DB: email PK in `003`.)*
- [x] If fresh DB: optionally define `otp_codes(email text primary key)` in 003 instead of phone to skip rename (keep one source of truth).

#### Sub-task 2.4: Email + launch tables in `004`

- [x] **Step 2:** Add `004_email_otp_and_launch_tables.sql`:

```sql
-- Email as primary login; phone optional for delivery
alter table users alter column phone drop not null;
alter table users add column if not exists email text;
create unique index if not exists users_email_lower on users (lower(email));

-- OTP tables keyed by email
alter table otp_codes rename column phone to email;
alter table otp_daily rename column phone to email;

-- Launch tables (spec §7)
create table if not exists vendor_documents (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references vendors(id) on delete cascade,
  kind text not null check (kind in ('national_id_front','national_id_back','category_doc','logo')),
  storage_key text not null,
  mime text not null,
  size_bytes int not null check (size_bytes > 0 and size_bytes <= 5242880),
  created_at timestamptz not null default now()
);
create index if not exists vendor_documents_vendor_id on vendor_documents(vendor_id);

create table if not exists service_inquiries (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id),
  customer_id uuid not null references users(id),
  message text not null default '',
  status text not null default 'open' check (status in ('open','closed')),
  created_at timestamptz not null default now()
);
create index if not exists service_inquiries_product on service_inquiries(product_id);
create index if not exists service_inquiries_customer on service_inquiries(customer_id);
```

- [x] Add `unique` on `users(email)` where not null (in addition to `users_email_lower` index).
- [x] Migrate `otp_daily` PK from `phone` to `email` if 003 created phone columns. *(N/A — email in `003`.)*

#### Sub-task 2.5: Apply `004` on Supabase

- [x] Run `004` in SQL Editor; resolve conflicts if 003 already used email columns.
- [x] Re-run `pnpm dev` + `GET /api/health`; DB ping should succeed.

#### Sub-task 2.6: Verification queries

- [x] **Step 4:** In SQL Editor: confirm tables `users`, `vendors`, `products`, `vendor_documents`, `service_inquiries`, `otp_codes`.
- [x] `select column_name from information_schema.columns where table_name='users' and column_name='email';`
- [ ] Optional: insert test user row with email only (no phone).

---

### Task 3: Mailgun sender

**Files:**

- Create: `lib/server/mailgun.ts`
- Create: `app/api/auth/otp/request/route.ts` (wires mailgun + email-otp in later tasks)
- Modify: `package.json` (no new deps — use `fetch`)

**Interfaces:**

- Produces: `sendMail({ to, subject, text, html })`

- [x] **Step 1:** Implement `lib/server/mailgun.ts` — `sendMail({ to, subject, text, html })`.
- [x] **Step 2:** Smoke test in dev (Mailgun sandbox or log mode) — `lib/server/mailgun.test.ts` + `pnpm test`.

---

### Task 4: Email OTP module

**Files:**

- Create: `lib/server/email-otp.ts`
- Delete port of reference `otp.js` after email module lands (no parallel phone OTP in hub)

**Interfaces:**

- Produces: `issue(email)`, `check(email, code)` — same contract as old `otp.js` but email-keyed.

- [x] **Step 1:** Implement `lib/server/email-otp.ts` (port reference `otp.js`; email key; call `mailgun.sendMail`):

```javascript
const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
await sendMail({
  to: email,
  subject: 'Your NakuruHub sign-in code',
  text: `Your code is ${code}. Valid for 5 minutes. Never share it.`,
});
```

- [x] **Step 2:** Wire `email-otp` from `app/api/auth/otp/request/route.ts` and `verify/route.ts`.

- [x] **Step 3:** Do not port `sms.js` — hub uses Mailgun only.

---

### Task 5: Zod schemas + auth routes (email)

**Files:**

- Modify: `lib/server/schemas.ts`
- Modify: `lib/server/auth.ts` + `app/api/auth/**/route.ts`
- Create: `scripts/create-staff.ts`
- Modify: `lib/server/orders.ts` (if reads default phone from user — allow null)

**Interfaces:**

- Produces: `email`, `otpReq`/`otpVerify` on email; `users` upsert on `email`.

#### Sub-task 5.1: Schemas only

- [x] **Step 1:** Add to `lib/server/schemas.ts`:

```javascript
const email = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .email();
module.exports = {
  email,
  otpReq: z.object({ email }).strict(),
  otpVerify: z.object({ email, code: z.string().regex(/^\d{6}$/) }).strict(),
  staff: z.object({ email, password: z.string().min(12).max(128), totp: z.string().regex(/^\d{6}$/) }).strict(),
  // vendorNew unchanged
};
```

- [x] Grep `schemas.ts` for `phone` exports still needed for `orderNew.phone` and rider scripts.
- [x] Run `pnpm exec tsc --noEmit` — schemas compile.

#### Sub-task 5.2: Customer OTP routes

- [x] **Step 2:** Port reference `auth.js` OTP handlers into `app/api/auth/otp/*/route.ts` + `lib/server/auth.ts`; user insert:

```javascript
const u = (
  await db.q(
    `insert into users(email) values($1)
     on conflict (lower(email)) do update set email = excluded.email
     returning id, role, disabled`,
    [b.data.email],
  )
).rows[0];
```

Note: requires unique constraint on `lower(email)` — use expression unique index and conflict target via application-level lookup if Postgres conflict on expression is awkward:

```javascript
const u = (
  await db.q(
    `insert into users(email) values($1)
     on conflict do nothing
     returning id, role, disabled`,
    [b.data.email],
  )
).rows[0] ||
 (await db.q('select id, role, disabled from users where lower(email)=lower($1)', [b.data.email])).rows[0];
```

- [x] Update audit events: `otp_fail` / `login` still fire with user id.
- [x] `GET /me` returns `{ id, role }` — optionally add `email` later (not required v1).

#### Sub-task 5.3: Staff auth

- [x] **Step 3:** Staff login: query `where lower(email)=$1 and role in ('admin','support')`.
- [x] **Step 4:** `scripts/create-staff.ts` inserts `email`; usage: `STAFF_PASSWORD=... pnpm exec tsx scripts/create-staff.ts admin@example.com admin`.
- [x] Migrate existing staff rows manually in SQL if any phone-only staff exist. *(N/A — email auth on fresh DB.)*

#### Sub-task 5.4: Downstream phone references

- [x] `lib/server/orders.ts`: when `d.phone` missing, use `users.phone` or require checkout phone field (no crash on null email-era users).
- [x] `payments` / M-Pesa paths: unchanged for launch.

#### Sub-task 5.5: Manual auth smoke

- [ ] **Step 5:** `curl -X POST http://127.0.0.1:3000/api/auth/otp/request -H 'Content-Type: application/json' -d '{"email":"you@example.com"}'`
- [ ] Read code from Mailgun logs or dev console.
- [ ] Verify → receive `access`; `GET /me` with Bearer token.

---

### Task 6: API test harness

**Files:**

- Create: `tests/api/auth-email.test.ts`
- Modify: `package.json` — ensure `"test": "vitest run"` covers `tests/api`

**Interfaces:**

- Consumes: running API or test app instance.

- [x] **Step 1:** Add `supertest` as devDependency.
- [x] **Step 2:** Write test that mocks Mailgun (set `MAILGUN_API_KEY` empty, read code from dev hook or test-only `OTP_TEST_EMAIL` env).
- [x] **Step 3:** Run `pnpm test` — document expected PASS.

---

## **Phase P1 — Documents (Supabase Storage)** — **SKIPPED for launch**

> **Decision (2026-11-15):** Vendor onboarding is **verified with email OTP only** for launch. Admin approve/reject uses application metadata (name, categories, contact email)—no in-app document upload, signed URLs, or Storage writes. Re-enable this phase when product requires ID/category files in-app (set `OTP_ENFORCE_VENDOR_DOCS=true` and implement Tasks 7–8).

### Task 7: Storage helper *(deferred)*

**Files:**

- Create: `lib/server/storage.ts`

**Interfaces:**

- Produces: `createUploadPath(vendorId, docId)`, `signUpload(storageKey, mime)`, `signDownload(storageKey, expiresSec)`

- [ ] **Step 1:** Use Supabase Storage REST or `@supabase/supabase-js` (add dependency):

```bash
pnpm add @supabase/supabase-js pg zod argon2 jsonwebtoken otplib
pnpm add -D @types/pg
```

- [ ] **Step 2:** Implement service-role client; upload via `storage.from('vendor-documents').upload(path, buffer, { contentType, upsert: false })`.

- [ ] **Step 3:** Signed download: `createSignedUrl(path, ttlSeconds)` (default 900).

---

### Task 8: Document routes *(deferred)*

**Files:**

- Create: `lib/server/documents.ts`
- Create: `app/api/vendors/me/documents/route.ts` (and nested `[id]/url/route.ts` as needed)
- Modify: `lib/server/vendors.ts` + `app/api/vendors/route.ts` — optional doc gate on `POST /vendors`
- Modify: `package.json` — `multer` or `busboy` for multipart

**Interfaces:**

- Produces: routes per spec §8.1; `POST /vendors` checks `national_id_front` when `otpEnforceVendorDocs`.

#### Sub-task 8.1: Upload route + validation

- [ ] Add multipart middleware (max 5MB).
- [ ] `POST /vendors/me/documents` — fields: `kind`, file body; MIME allowlist.
- [ ] Resolve vendor: latest `pending` or `approved` row for `owner_id` (create stub vendor row rules if apply-after-upload).

#### Sub-task 8.2: Storage write + DB row

- [ ] Storage path: `vendors/{vendorId}/{documentId}/{filename}`.
- [ ] Insert `vendor_documents` row after successful upload.
- [ ] On storage failure, do not insert row (or delete orphan).

#### Sub-task 8.3: Vendor read APIs

- [ ] `GET /vendors/me/documents` — metadata only.
- [ ] `GET /vendors/me/documents/:id/url` — `{ url, expiresIn }` signed URL.

#### Sub-task 8.4: Admin read APIs

- [ ] `GET /admin/vendors/:vendorId/documents` — admin role.
- [ ] `GET /admin/vendors/:vendorId/documents/:id/url` — audit `document_view` event.

#### Sub-task 8.5: Apply gate on `POST /vendors`

- [ ] If `otpEnforceVendorDocs`: require `national_id_front` exists for owner before insert.
- [ ] If `services` in categories: require ≥1 `category_doc`.

#### Sub-task 8.6: Tests + authz

- [ ] Integration test: customer A cannot fetch vendor B document URL.
- [ ] Integration test: non-admin cannot call admin document list.

---

## Phase P2 — Service inquiries + launch guards

### Task 9: Service inquiries API

**Files:**

- Create: `lib/server/inquiries.ts`
- Create: `app/api/service-inquiries/route.ts`, `app/api/vendor/inquiries/route.ts`
- Modify: `lib/server/schemas.ts` — `inquiryNew`

**Interfaces:**

- Produces: `POST /service-inquiries`, `GET /vendor/inquiries`, `GET /service-inquiries/mine`

- [x] **Step 1:** Implement handlers per spec; on create, load vendor owner email and `mailgun.sendMail` “New quote request”.
- [x] **Step 2:** Rate limit: 20/hour per customer.
- [x] **Step 3:** Test: non-service product returns 400.

---

### Task 10: Launch category guard

**Files:**

- Modify: `lib/server/vendors.ts`
- Modify: `lib/server/schemas.ts` — `vendorNew.categories` refine against `config.launchCategories`

- [x] **Step 1:** Reject `property`, `cars`, `stays`, `taxi` at validation.
- [x] **Step 2:** Test POST with invalid category → 400.

---

## Phase P3 — Next.js API client + email OTP UI

### Task 11: API client and auth context

**Files:**

- Create: `lib/nakuru/api.ts`
- Create: `lib/nakuru/auth.ts`
- Create: `components/app/AppAuthProvider.tsx`
- Modify: `components/app/AppProvider.tsx` — nest auth provider
- Create: `.env.local.example`

**Interfaces:**

- Produces: `apiFetch(path, opts)`, `useAuth()` with `accessToken`, `login()`, `logout()`, auto-refresh on 401.

#### Sub-task 11.1: Environment

- [x] `.env.local`: optional `NEXT_PUBLIC_API_BASE=` empty (use relative `/api`).
- [x] Single terminal: `pnpm dev` on 3000 only.
- [x] No CORS spike required for same-origin (Sub-task 11.5 becomes cookie `httpOnly` + `secure` check only).

#### Sub-task 11.2: `apiFetch` core

- [x] Create `lib/nakuru/api.ts` with base URL, JSON parse, error type `{ error: string }`.
- [x] Headers: `Content-Type`, `X-Requested-With: nakuruhub`, optional `Authorization`.

#### Sub-task 11.3: Token refresh

- [x] On 401 once: `POST /auth/refresh` with `credentials: 'include'`.
- [x] Update in-memory access token; retry original request.
- [x] On refresh fail: clear session, return unauthenticated.

#### Sub-task 11.4: `AppAuthProvider`

- [x] `useAuth()`: `user`, `accessToken`, `setSessionFromOtp`, `logout()`.
- [x] `logout` → `POST /auth/logout` + clear state.
- [x] Wrap marketplace in `app/app/page.tsx` or `AppProvider`.

#### Sub-task 11.5: CORS spike (checkpoint)

- [ ] Browser: complete OTP from `/app`; Network tab shows refresh cookie on API host.
- [ ] Fix `SameSite` / proxy only if spike fails before Task 12.

---

### Task 12: Email OTP form + account entry

**Files:**

- Create: `components/app/auth/EmailOtpForm.tsx`
- Modify: `components/app/views/AccountView.tsx`
- Modify: `components/app/views/VendorView.tsx`
- Modify: `components/app/SignInBar.tsx` if present

#### Sub-task 12.1: Email step UI

- [x] Input type email, validation, submit → `POST /auth/otp/request`.
- [x] Loading + error toasts (reuse `Toast` pattern).

#### Sub-task 12.2: Code step UI

- [x] Six-digit input, verify → `POST /auth/otp/verify` → `setSessionFromOtp`.
- [x] Resend cooldown aligned with server 60s rule.

#### Sub-task 12.3: Account shell

- [x] `AccountView`: guest shows `EmailOtpForm`; signed-in shows email + sign out.
- [x] Remove copy “Phone (OTP verified)” from vendor registration (vendor apply is separate).

#### Sub-task 12.4: Vendor deep link

- [x] After OTP, if `?start=vendor`, set tab `acc` + vendor (keep reducer or URL state).
- [x] Do not dispatch demo `REG_VENDOR` when `NEXT_PUBLIC_API_URL` set.

---

### Task 13: Vendor apply UI (OTP-gated; no documents at launch)

**Files:**

- Create: `components/app/vendor/VendorApplyForm.tsx`
- Modify: `components/app/views/VendorView.tsx`

#### Sub-task 13.1: Application form

- [ ] Require signed-in session (email OTP completed) before apply.
- [ ] Name + category chips (`shop`, `services` only; hide waitlist cats or show disabled).
- [ ] `POST /vendors` on submit; handle `429 too_many_pending`.
- [ ] Copy: identity attested by verified email; staff may request documents offline if needed.

#### Sub-task 13.2: Status dashboard

- [ ] Poll or load `GET /vendors/mine` for `status`, `verified`, `categories`.
- [x] Approved → show `VendorProductForm` (Task 16).

#### Sub-task 13.3: Remove demo vendor state

- [ ] When API mode on, ignore reducer `me` / `REG_VENDOR` for persistence; optional feature flag `useLiveApi`.

---

### Task 14: Staff vendor queue

**Files:**

- Create: `app/staff/page.tsx`
- Create: `components/staff/StaffLoginForm.tsx`
- Create: `components/staff/StaffVendorQueue.tsx`
- Modify: `components/app/views/AccountView.tsx` — hide demo admin row

#### Sub-task 14.1: Staff route shell

- [ ] `app/staff/page.tsx` client component; no link from public landing (bookmark only).

#### Sub-task 14.2: Staff login (separate session)

- [ ] `StaffLoginForm`: email, password, TOTP → `POST /auth/staff/login`.
- [ ] Store staff access token in `sessionStorage` key `nakuruhub-staff-access` (not customer context).

#### Sub-task 14.3: Pending queue table

- [ ] Fetch `GET /admin/vendors?status=pending`.
- [ ] Rows: name, categories, created_at, actions.

#### Sub-task 14.4: Approve / reject / verify

- [ ] Wire `POST /admin/vendors/:id/approve|reject|verify`.
- [ ] Queue row shows owner **email** (from user join) — no document viewer until Phase P1.

#### Sub-task 14.5: Retire demo admin

- [ ] Remove `acc:admin` demo path from customer app or gate behind `NODE_ENV=development` without staff token.

---

## Phase P4 — Catalog, listings, checkout

### Task 15: Live catalog

**Files:**

- Create: `lib/nakuru/listings.ts`
- Modify: `components/app/views/HomeView.tsx`
- Modify: `components/app/views/CategoryView.tsx`
- Modify: `components/app/ProductCard.tsx`
- Modify: `lib/nakuru/types.ts`
- Modify: `lib/nakuru/data/items.ts` — fallback when `NEXT_PUBLIC_USE_LIVE_CATALOG !== 'true'`

#### Sub-task 15.1: Types + fetch layer

- [x] Define `ApiListing` type matching `GET /listings` JSON.
- [x] `fetchListings({ category?, query? })` with 30s client cache or SWR-less simple state.

#### Sub-task 15.2: Adapter to UI model

- [x] `toProductCardItem(api)` maps `id`, `title`, `price`, `emoji`, `vendor`, `verified`, `category`.
- [x] UUID `id` replaces numeric demo ids when live catalog on.

#### Sub-task 15.3: HomeView integration

- [x] Load listings on mount when `USE_LIVE_CATALOG`.
- [x] Loading skeleton + empty state copy.

#### Sub-task 15.4: CategoryView + search

- [x] Pass `category` query param to API.
- [x] Client filter search on title if API has no search v1.

#### Sub-task 15.5: ProductCard CTA split

- [x] `shop` → add to cart dispatch with UUID id.
- [x] `services` → open inquiry modal (Task 18) or disabled until 18 lands.

---

### Task 16: Vendor product forms

**Files:**

- Create: `components/app/vendor/VendorProductForm.tsx`
- Create: `lib/server/products.ts`
- Create: `app/api/products/route.ts`, `app/api/vendor/products/route.ts`, `app/api/products/[id]/update/route.ts`
- Modify: `components/app/views/VendorView.tsx`

#### Sub-task 16.1: Create form

- [x] Mode toggle shop vs service (from approved categories only).
- [x] POST `/products` body per `productNew`.

#### Sub-task 16.2: My listings list

- [x] GET `/vendor/products`; table with title, price, active, category.

#### Sub-task 16.3: Edit / deactivate

- [x] POST `/products/:id/update` for price, stock, `active: false`.

---

### Task 17: Shop checkout against API

**Files:**

- Modify: `components/app/views/CartView.tsx`
- Modify: `lib/nakuru/reducer.ts` — cart keys as string UUIDs
- Create: `lib/nakuru/orders.ts`

#### Sub-task 17.1: Cart identity migration

- [x] Cart state: `Record<string, number>` works for UUID strings; audit `itemById` usage.
- [x] When live catalog off, keep demo ids; when on, only API ids in cart.

#### Sub-task 17.2: Checkout payload

- [x] Build `orderNew`: items `{ productId, qty }`, zone, address, `payment: 'cod'`.
- [x] Map reducer `pay` mpesa → only if API supports and cart verified.

#### Sub-task 17.3: Delivery phone field

- [x] Checkout input `07xx` → `orderNew.phone` optional schema.
- [x] Copy explains SMS/rider contact (not OTP).

#### Sub-task 17.4: Place order + errors

- [x] Handle `409 out_of_stock`, `400 mpesa_needs_verified_vendor`.
- [x] Clear cart on success; toast order id.

#### Sub-task 17.5: Order history (customer)

- [x] Optional v1: `GET /orders/mine` if exists — else stub “orders in email”.
- [x] Or keep demo order list until server customer list wired — document gap.

#### Sub-task 17.6: Regression demo mode

- [x] With `USE_LIVE_CATALOG=false`, cart still uses demo place order path.

---

### Task 18: Service inquiry UI

**Files:**

- Create: `components/app/ServiceInquiryModal.tsx`
- Create: `components/app/vendor/VendorInquiriesList.tsx`
- Modify: `components/app/ProductCard.tsx` or detail sheet

#### Sub-task 18.1: Customer modal

- [ ] Require login; optional message textarea.
- [ ] `POST /service-inquiries` with `productId`.

#### Sub-task 18.2: Vendor inquiries list

- [ ] Approved vendor sees open inquiries on vendor tab.
- [ ] `GET /vendor/inquiries`; mark closed when API supports.

#### Sub-task 18.3: ProductCard hook-up

- [ ] Services category only shows “Request quote” opening modal.

---

## Phase P5 — Anchor seeding + launch gate

### Task 19: Anchor vendor seed script

**Files:**

- Create: `scripts/seed-anchor-vendor.ts`
- Create: `docs/runbooks/anchor-vendors.md`

#### Sub-task 19.1: Seed script

- [ ] CLI: email, vendor name, categories array, path to products JSON.
- [ ] Uses DB directly; does not bypass audit — log to stdout for manual audit entry.

#### Sub-task 19.2: Runbook

- [ ] Offline consent + doc collection steps.
- [ ] Staff approve on `/staff`; vendor adds products via UI or script.

#### Sub-task 19.3: Launch inventory gate

- [ ] Checklist: ≥10 vendors, ≥1 listing each, `curl GET /listings` non-empty.

---

### Task 20: E2E and production env

**Files:**

- Modify: `e2e/app-smoke.spec.mjs`
- Modify: `README.md`, `.env.example`

#### Sub-task 20.1: Playwright staging profile

- [ ] Env flag to hit staging API or skip OTP tests with `@requires-mailgun` tag.

#### Sub-task 20.2: Mailgun production domain

- [ ] SPF, DKIM, DMARC for sending domain.
- [ ] Suppression / bounce handling link in runbook.

#### Sub-task 20.3: Supabase production

- [ ] PITR or daily backups on; restrict service role to API IPs if possible.

#### Sub-task 20.4: Secret rotation doc

- [ ] Procedure for `JWT_ACCESS_SECRET`, `OTP_HMAC_SECRET`, `TOTP_ENC_KEY`.

---

## Verification matrix


| Check         | Command / action                              |
| ------------- | --------------------------------------------- |
| API health    | `curl -s http://127.0.0.1:3000/api/me` → 401  |
| Email OTP     | Request + verify flow in dev                  |
| Listings gate | Pending vendor product not in `GET /listings` |
| Documents     | N/A at launch (P1 deferred)                   |
| Next catalog  | `NEXT_PUBLIC_USE_LIVE_CATALOG=true pnpm dev`  |
| Staff queue   | `/staff` approve pending vendor               |
| Shop E2E      | OTP → browse → cart → COD order               |
| Service E2E   | Inquiry email received in Mailgun logs        |


---

## Spec coverage self-review


| Spec section        | Task(s)                 |
| ------------------- | ----------------------- |
| §2 success criteria | Tasks 5, 9, 13–18, 19   |
| §3 decisions        | Task 10, 14             |
| §6.2 documents      | **Deferred** (P1 skip)  |
| §6.3 inquiries      | Task 9, 18              |
| §7 data model       | Task 2                  |
| §8 API              | Tasks 5, 9–10           |
| §9 frontend         | Tasks 11–18             |
| §11 anchors         | Task 19                 |
| Email OTP (infra)   | Tasks 3–5, 12           |
| Supabase            | Tasks 1–2 (Storage: P1) |


---

## Suggested commit sequence

1. `chore(api): supabase config and migrations`
2. `feat(api): mailgun email otp auth`
3. `feat(api): service inquiries` (documents later if P1 reopens)
4. `feat(web): api client and email sign-in`
5. `feat(web): vendor apply and staff queue`
6. `feat(web): live catalog and checkout`
7. `docs: anchor vendor runbook`

---

**Dispatch hint:** For subagent-driven work, assign **one sub-task** (e.g. `11.3`) per session, not whole Task 11. Short tasks (3, 4, 6, 9, 10) keep step-only checklists. **Do not assign Tasks 7–8** until P1 is reopened.

**Execution options:**

1. **Subagent-driven** — one sub-task per session, review between sub-tasks
2. **Inline** — run sub-tasks in order in this chat (start with **1.1** or **2.1**)

