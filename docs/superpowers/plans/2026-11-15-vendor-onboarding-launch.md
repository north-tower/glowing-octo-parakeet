# Vendor Onboarding & Marketplace Launch — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a public launch where vendors apply with documents, pass admin review, publish shop products and service listings on a live catalog, with customers checking out shop orders (COD) and requesting service quotes—backed by Supabase Postgres/Storage and Mailgun email OTP.

**Architecture:** Keep the existing Express API (`nakuruhub/server`) as the security boundary; connect it to **Supabase PostgreSQL** via `DATABASE_URL` and **Supabase Storage** for ID documents using the **service role** server-side only. Replace SMS OTP with **Mailgun** transactional email. The Next.js app (`hub`) becomes a client of the API with `credentials: 'include'` for refresh cookies and Bearer access tokens.

**Tech stack:** Node 20+, Express 4, `pg`, Zod, Supabase (Postgres + Storage), Mailgun HTTP API, Next.js 16 (App Router), Playwright e2e.

## Global Constraints

- **Spec:** [2026-11-15-vendor-onboarding-launch-design.md](../specs/2026-11-15-vendor-onboarding-launch-design.md) — launch categories `shop` and `services` only; nothing public until admin `approve`; Verified is separate for M-Pesa later.
- **Repos:** API changes in `C:\Users\mhki\nakuruhub\nakuruhub\server`; UI in `C:\Users\mhki\hub`.
- **Auth:** Customer/vendor sign-in = **email OTP only** (Mailgun). Staff = email + password + TOTP — never email OTP alone.
- **Secrets:** Never commit `.env`. Supabase service role key and Mailgun API key only on API server.
- **Phone:** Optional on `users.phone` for delivery; Kenyan format when present (`+2547…`). Checkout may override per order.
- **Documents:** Private bucket only; max 5 MB; MIME allowlist `jpeg`, `png`, `webp`, `pdf`.
- **Open questions (locked):** Reject = generic “rejected, contact support”; services may use `price_kes = 0`; new inquiry notifies vendor via **email** (Mailgun), not SMS.
- **CORS:** `APP_ORIGIN` must match the Next.js origin (e.g. `http://localhost:3000` in dev).
- **Read** `node_modules/next/dist/docs/` before changing Next routing/auth patterns.

## File map (new / major)

| Path | Responsibility |
|------|----------------|
| `server/db/migrations/003_supabase_launch.sql` | PostGIS + core schema (idempotent where possible) |
| `server/db/migrations/004_email_otp_and_launch_tables.sql` | Email auth, `vendor_documents`, `service_inquiries` |
| `server/src/mailgun.js` | Send OTP and transactional mail |
| `server/src/email-otp.js` | HMAC codes, daily cap (replaces phone keying) |
| `server/src/storage.js` | Supabase Storage signed upload/download |
| `server/src/documents.js` | Vendor document routes |
| `server/src/inquiries.js` | Service inquiry routes |
| `server/test/` | `node:test` + `supertest` integration tests |
| `hub/lib/nakuru/api.ts` | `fetch` wrapper, CSRF header, refresh |
| `hub/components/app/auth/EmailOtpForm.tsx` | OTP UI |
| `hub/app/staff/page.tsx` | Staff vendor queue (protected) |

## Task index (parent → sub-tasks)

Long-running work is split into **sub-tasks** `N.M` so each subagent session can finish in one reviewable unit (~30–90 min). Short tasks stay single blocks with steps only.

| Parent | Sub-tasks | When to split further |
|--------|-----------|------------------------|
| **1** Supabase + env | 1.1–1.4 | — |
| **2** DB migrations | 2.1–2.6 | Largest SQL task |
| **3** Mailgun | steps only | — |
| **4** Email OTP | steps only | — |
| **5** Auth email | 5.1–5.5 | — |
| **6** API tests | steps only | — |
| **7** Storage helper | steps only | — |
| **8** Document routes | 8.1–8.6 | Multipart + admin |
| **9–10** Inquiries + guards | steps only | — |
| **11** API client | 11.1–11.5 | CORS/cookies |
| **12** Email OTP UI | 12.1–12.4 | — |
| **13** Vendor apply UI | 13.1–13.5 | — |
| **14** Staff queue | 14.1–14.5 | — |
| **15** Live catalog | 15.1–15.5 | Many views |
| **16** Vendor products | 16.1–16.3 | — |
| **17** Checkout API | 17.1–17.6 | Cart ID migration |
| **18** Inquiry UI | 18.1–18.3 | — |
| **19–20** Launch | 19.1–19.3, 20.1–20.4 | — |

---

## Phase P0 — Supabase + API foundation

### Task 1: Supabase project and env wiring

**Files:**
- Modify: `server/.env.example`
- Modify: `server/src/config.js`
- Create: `server/db/README-supabase.md`

**Interfaces:**
- Produces: `config.supabase`, `config.mailgun`, relaxed production checks (no Africa's Talking).

#### Sub-task 1.1: Supabase cloud setup (ops)

- [ ] Create Supabase project (note **project ref** and region).
- [ ] Database → Extensions → enable **postgis** and **pgcrypto** (if not already).
- [ ] Storage → create bucket **`vendor-documents`**, **private**, no public policies.
- [ ] Settings → Database → copy **Session pooler** URI for `DATABASE_URL`.
- [ ] Settings → API → copy `SUPABASE_URL` and **service role** key (server only).

#### Sub-task 1.2: Local `.env` (developer)

- [ ] Copy `server/.env.example` → `server/.env` (never commit).
- [ ] Set `DATABASE_URL`, `SUPABASE_*`, Mailgun placeholders; `APP_ORIGIN=http://localhost:3000`.
- [ ] Set `PORT=3001` on API so Next can use 3000.

#### Sub-task 1.3: Commit `.env.example` + `config.js`

- [ ] **Step 4:** Extend `.env.example`:

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

- [ ] **Step 5:** Update `config.js` — remove production hard-fail on `AT_USERNAME`; require Mailgun in production:

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

- [ ] **Step 6:** Document in `README-supabase.md` how to run SQL migrations in SQL Editor vs `psql`.

#### Sub-task 1.4: Docs + smoke

- [ ] **Step 6:** Document in `README-supabase.md` how to run SQL migrations in SQL Editor vs `psql`.
- [ ] **Step 7:** Run `npm start` locally with Supabase `DATABASE_URL`; expect fail until migrations (Task 2).

---

### Task 2: Database migrations on Supabase

**Files:**
- Create: `server/db/migrations/003_supabase_launch.sql`
- Create: `server/db/migrations/004_email_otp_and_launch_tables.sql`

**Interfaces:**
- Produces: tables from `schema.sql` + launch additions; `users.email` as login identity.

#### Sub-task 2.1: Scaffold migration files in repo

- [ ] Create `server/db/migrations/003_supabase_launch.sql` (empty header + comment: run on empty DB).
- [ ] Create `server/db/migrations/004_email_otp_and_launch_tables.sql`.
- [ ] In `README-supabase.md`, document run order: **003 then 004**.

#### Sub-task 2.2: Port core schema into `003` (~45 min)

- [ ] Paste `server/db/schema.sql` into `003` (extensions, `users`, OTP, `vendors`, `orders`, `products`, etc.).
- [ ] Append `server/db/migrations/002_orders_products_payments.sql` if not already reflected in schema.
- [ ] Remove or comment `create role nakuruhub_app` — Supabase uses `postgres` / pooler user for dev.
- [ ] Run `003` in Supabase SQL Editor; fix PostGIS or syntax errors until green.

#### Sub-task 2.3: Fix OTP table primary keys for email (pre-004)

- [ ] Confirm `otp_codes` PK is `phone` today — plan rename in 004.
- [ ] If fresh DB: optionally define `otp_codes(email text primary key)` in 003 instead of phone to skip rename (keep one source of truth).

#### Sub-task 2.4: Email + launch tables in `004`

- [ ] **Step 2:** Add `004_email_otp_and_launch_tables.sql`:

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

- [ ] Add `unique` on `users(email)` where not null (in addition to `users_email_lower` index).
- [ ] Migrate `otp_daily` PK from `phone` to `email` if 003 created phone columns.

#### Sub-task 2.5: Apply `004` on Supabase

- [ ] Run `004` in SQL Editor; resolve conflicts if 003 already used email columns.
- [ ] Re-run API `npm start`; should connect without relation errors.

#### Sub-task 2.6: Verification queries

- [ ] **Step 4:** In SQL Editor: confirm tables `users`, `vendors`, `products`, `vendor_documents`, `service_inquiries`, `otp_codes`.
- [ ] `select column_name from information_schema.columns where table_name='users' and column_name='email';`
- [ ] Optional: insert test user row with email only (no phone).

---

### Task 3: Mailgun sender

**Files:**
- Create: `server/src/mailgun.js`
- Modify: `server/package.json` (no new deps — use `fetch`)

**Interfaces:**
- Produces: `sendMail({ to, subject, text, html })`

- [ ] **Step 1:** Implement:

```javascript
'use strict';
const c = require('./config');

async function sendMail({ to, subject, text, html }) {
  const { key, domain, from } = c.mailgun;
  if (!key || !domain) {
    if (c.env === 'production') throw new Error('Mailgun not configured');
    console.log('[dev mail]', to, subject, text);
    return;
  }
  const body = new URLSearchParams({ from, to, subject, text, ...(html ? { html } : {}) });
  const r = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`api:${key}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });
  if (!r.ok) throw new Error('Mailgun error ' + r.status);
}

module.exports = { sendMail };
```

- [ ] **Step 2:** Smoke test in dev (Mailgun sandbox or log mode).

---

### Task 4: Email OTP module

**Files:**
- Create: `server/src/email-otp.js`
- Modify: `server/src/otp.js` → re-export or delete and update imports to `email-otp.js`

**Interfaces:**
- Produces: `issue(email)`, `check(email, code)` — same contract as old `otp.js` but email-keyed.

- [ ] **Step 1:** Implement `email-otp.js` (copy `otp.js`, replace `phone` with normalized lowercased email, call `mailgun.sendMail`):

```javascript
const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
await sendMail({
  to: email,
  subject: 'Your NakuruHub sign-in code',
  text: `Your code is ${code}. Valid for 5 minutes. Never share it.`,
});
```

- [ ] **Step 2:** Update `auth.js` imports from `./otp` to `./email-otp`.

- [ ] **Step 3:** Deprecate `sms.js` usage in auth path (keep file for optional future alerts).

---

### Task 5: Zod schemas + auth routes (email)

**Files:**
- Modify: `server/src/schemas.js`
- Modify: `server/src/auth.js`
- Modify: `server/scripts/create-staff.js`
- Modify: `server/src/orders.js` (if reads default phone from user — allow null)

**Interfaces:**
- Produces: `email`, `otpReq`/`otpVerify` on email; `users` upsert on `email`.

#### Sub-task 5.1: Schemas only

- [ ] **Step 1:** Add to `schemas.js`:

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

- [ ] Grep `schemas.js` for `phone` exports still needed for `orderNew.phone` and rider scripts.
- [ ] Run `node -e "require('./src/schemas')"` from `server/` — no throw.

#### Sub-task 5.2: Customer OTP routes

- [ ] **Step 2:** `auth.js` — replace `phone` in OTP routes with `email`; user insert:

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

- [ ] Update audit events: `otp_fail` / `login` still fire with user id.
- [ ] `GET /me` returns `{ id, role }` — optionally add `email` later (not required v1).

#### Sub-task 5.3: Staff auth

- [ ] **Step 3:** Staff login: query `where lower(email)=$1 and role in ('admin','support')`.
- [ ] **Step 4:** Update `create-staff.js` to insert `email` column; usage: `STAFF_PASSWORD=... node scripts/create-staff.js admin@example.com admin`.
- [ ] Migrate existing staff rows manually in SQL if any phone-only staff exist.

#### Sub-task 5.4: Downstream phone references

- [ ] `orders.js`: when `d.phone` missing, use `users.phone` or require checkout phone field (no crash on null email-era users).
- [ ] `payments` / M-Pesa paths: unchanged for launch.

#### Sub-task 5.5: Manual auth smoke

- [ ] **Step 5:** `curl -X POST http://127.0.0.1:3001/auth/otp/request -H 'Content-Type: application/json' -d '{"email":"you@example.com"}'`
- [ ] Read code from Mailgun logs or dev console.
- [ ] Verify → receive `access`; `GET /me` with Bearer token.

---

### Task 6: API test harness

**Files:**
- Create: `server/test/auth-email.test.js`
- Modify: `server/package.json` — `"test": "node --test test/**/*.test.js"`

**Interfaces:**
- Consumes: running API or test app instance.

- [ ] **Step 1:** Add `supertest` as devDependency.

- [ ] **Step 2:** Write test that mocks Mailgun (set `MAILGUN_API_KEY` empty, read code from dev hook or test-only `OTP_TEST_EMAIL` env).

- [ ] **Step 3:** Run `npm test` — document expected PASS.

---

## Phase P1 — Documents (Supabase Storage)

### Task 7: Storage helper

**Files:**
- Create: `server/src/storage.js`

**Interfaces:**
- Produces: `createUploadPath(vendorId, docId)`, `signUpload(storageKey, mime)`, `signDownload(storageKey, expiresSec)`

- [ ] **Step 1:** Use Supabase Storage REST or `@supabase/supabase-js` (add dependency):

```bash
cd server && npm install @supabase/supabase-js
```

- [ ] **Step 2:** Implement service-role client; upload via `storage.from('vendor-documents').upload(path, buffer, { contentType, upsert: false })`.

- [ ] **Step 3:** Signed download: `createSignedUrl(path, ttlSeconds)` (default 900).

---

### Task 8: Document routes

**Files:**
- Create: `server/src/documents.js`
- Modify: `server/src/app.js` — mount router
- Modify: `server/src/vendors.js` — optional doc gate on `POST /vendors`
- Modify: `server/package.json` — `multer` or `busboy` for multipart

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
- Create: `server/src/inquiries.js`
- Modify: `server/src/schemas.js` — `inquiryNew`
- Modify: `server/src/app.js`

**Interfaces:**
- Produces: `POST /service-inquiries`, `GET /vendor/inquiries`, `GET /service-inquiries/mine`

- [ ] **Step 1:** Implement handlers per spec; on create, load vendor owner email and `mailgun.sendMail` “New quote request”.

- [ ] **Step 2:** Rate limit: 20/hour per customer.

- [ ] **Step 3:** Test: non-service product returns 400.

---

### Task 10: Launch category guard

**Files:**
- Modify: `server/src/vendors.js`
- Modify: `server/src/schemas.js` — `vendorNew.categories` refine against `config.launchCategories`

- [ ] **Step 1:** Reject `property`, `cars`, `stays`, `taxi` at validation.

- [ ] **Step 2:** Test POST with invalid category → 400.

---

## Phase P3 — Next.js API client + email OTP UI

### Task 11: API client and auth context

**Files:**
- Create: `hub/lib/nakuru/api.ts`
- Create: `hub/lib/nakuru/auth.ts`
- Create: `hub/components/app/AppAuthProvider.tsx`
- Modify: `hub/components/app/AppProvider.tsx` — nest auth provider
- Create: `hub/.env.local.example`

**Interfaces:**
- Produces: `apiFetch(path, opts)`, `useAuth()` with `accessToken`, `login()`, `logout()`, auto-refresh on 401.

#### Sub-task 11.1: Environment

- [ ] `hub/.env.local`: `NEXT_PUBLIC_API_URL=http://127.0.0.1:3001`
- [ ] Document dual-terminal dev: `server` on 3001, `pnpm dev` on 3000.
- [ ] Confirm `server` `APP_ORIGIN=http://localhost:3000`.

#### Sub-task 11.2: `apiFetch` core

- [ ] Create `lib/nakuru/api.ts` with base URL, JSON parse, error type `{ error: string }`.
- [ ] Headers: `Content-Type`, `X-Requested-With: nakuruhub`, optional `Authorization`.

#### Sub-task 11.3: Token refresh

- [ ] On 401 once: `POST /auth/refresh` with `credentials: 'include'`.
- [ ] Update in-memory access token; retry original request.
- [ ] On refresh fail: clear session, return unauthenticated.

#### Sub-task 11.4: `AppAuthProvider`

- [ ] `useAuth()`: `user`, `accessToken`, `setSessionFromOtp`, `logout()`.
- [ ] `logout` → `POST /auth/logout` + clear state.
- [ ] Wrap marketplace in `app/app/page.tsx` or `AppProvider`.

#### Sub-task 11.5: CORS spike (checkpoint)

- [ ] Browser: complete OTP from `/app`; Network tab shows refresh cookie on API host.
- [ ] Fix `SameSite` / proxy only if spike fails before Task 12.

---

### Task 12: Email OTP form + account entry

**Files:**
- Create: `hub/components/app/auth/EmailOtpForm.tsx`
- Modify: `hub/components/app/views/AccountView.tsx`
- Modify: `hub/components/app/views/VendorView.tsx`
- Modify: `hub/components/app/SignInBar.tsx` if present

#### Sub-task 12.1: Email step UI

- [ ] Input type email, validation, submit → `POST /auth/otp/request`.
- [ ] Loading + error toasts (reuse `Toast` pattern).

#### Sub-task 12.2: Code step UI

- [ ] Six-digit input, verify → `POST /auth/otp/verify` → `setSessionFromOtp`.
- [ ] Resend cooldown aligned with server 60s rule.

#### Sub-task 12.3: Account shell

- [ ] `AccountView`: guest shows `EmailOtpForm`; signed-in shows email + sign out.
- [ ] Remove copy “Phone (OTP verified)” from vendor registration (vendor apply is separate).

#### Sub-task 12.4: Vendor deep link

- [ ] After OTP, if `?start=vendor`, set tab `acc` + vendor (keep reducer or URL state).
- [ ] Do not dispatch demo `REG_VENDOR` when `NEXT_PUBLIC_API_URL` set.

---

### Task 13: Vendor apply + document upload UI

**Files:**
- Create: `hub/components/app/vendor/VendorApplyForm.tsx`
- Create: `hub/components/app/vendor/DocumentUpload.tsx`
- Modify: `hub/components/app/views/VendorView.tsx`

#### Sub-task 13.1: Application form

- [ ] Name + category chips (`shop`, `services` only; hide waitlist cats or show disabled).
- [ ] `POST /vendors` on submit; handle `429 too_many_pending`.

#### Sub-task 13.2: Document upload component

- [ ] Reuse `ProfilePhotoUpload` patterns for ID front/back.
- [ ] `FormData` POST to `/vendors/me/documents` per file.
- [ ] Progress + 5MB client-side check.

#### Sub-task 13.3: Apply flow order

- [ ] Decide UX: documents before or after `POST /vendors` (recommend: create pending vendor first, then uploads tied to vendor id from `GET /vendors/mine`).
- [ ] Enforce UI validation: cannot submit application without ID front.

#### Sub-task 13.4: Status dashboard

- [ ] Poll or load `GET /vendors/mine` for `status`, `verified`, `categories`.
- [ ] Approved → show `VendorProductForm` placeholder area (Task 16).

#### Sub-task 13.5: Remove demo vendor state

- [ ] When API mode on, ignore reducer `me` / `REG_VENDOR` for persistence; optional feature flag `useLiveApi`.

---

### Task 14: Staff vendor queue

**Files:**
- Create: `hub/app/staff/page.tsx`
- Create: `hub/components/staff/StaffLoginForm.tsx`
- Create: `hub/components/staff/StaffVendorQueue.tsx`
- Modify: `hub/components/app/views/AccountView.tsx` — hide demo admin row

#### Sub-task 14.1: Staff route shell

- [ ] `app/staff/page.tsx` client component; no link from public landing (bookmark only).

#### Sub-task 14.2: Staff login (separate session)

- [ ] `StaffLoginForm`: email, password, TOTP → `POST /auth/staff/login`.
- [ ] Store staff access token in `sessionStorage` key `nakuruhub-staff-access` (not customer context).

#### Sub-task 14.3: Pending queue table

- [ ] Fetch `GET /admin/vendors?status=pending`.
- [ ] Rows: name, categories, created_at, actions.

#### Sub-task 14.4: Approve / reject / verify + docs

- [ ] Wire `POST /admin/vendors/:id/approve|reject|verify`.
- [ ] “View documents” → admin doc list → open signed URL in new tab.

#### Sub-task 14.5: Retire demo admin

- [ ] Remove `acc:admin` demo path from customer app or gate behind `NODE_ENV=development` without staff token.

---

## Phase P4 — Catalog, listings, checkout

### Task 15: Live catalog

**Files:**
- Create: `hub/lib/nakuru/listings.ts`
- Modify: `hub/components/app/views/HomeView.tsx`
- Modify: `hub/components/app/views/CategoryView.tsx`
- Modify: `hub/components/app/ProductCard.tsx`
- Modify: `hub/lib/nakuru/types.ts`
- Modify: `hub/lib/nakuru/data/items.ts` — fallback when `NEXT_PUBLIC_USE_LIVE_CATALOG !== 'true'`

#### Sub-task 15.1: Types + fetch layer

- [ ] Define `ApiListing` type matching `GET /listings` JSON.
- [ ] `fetchListings({ category?, query? })` with 30s client cache or SWR-less simple state.

#### Sub-task 15.2: Adapter to UI model

- [ ] `toProductCardItem(api)` maps `id`, `title`, `price`, `emoji`, `vendor`, `verified`, `category`.
- [ ] UUID `id` replaces numeric demo ids when live catalog on.

#### Sub-task 15.3: HomeView integration

- [ ] Load listings on mount when `USE_LIVE_CATALOG`.
- [ ] Loading skeleton + empty state copy.

#### Sub-task 15.4: CategoryView + search

- [ ] Pass `category` query param to API.
- [ ] Client filter search on title if API has no search v1.

#### Sub-task 15.5: ProductCard CTA split

- [ ] `shop` → add to cart dispatch with UUID id.
- [ ] `services` → open inquiry modal (Task 18) or disabled until 18 lands.

---

### Task 16: Vendor product forms

**Files:**
- Create: `hub/components/app/vendor/VendorProductForm.tsx`
- Modify: `hub/components/app/views/VendorView.tsx`

#### Sub-task 16.1: Create form

- [ ] Mode toggle shop vs service (from approved categories only).
- [ ] POST `/products` body per `productNew`.

#### Sub-task 16.2: My listings list

- [ ] GET `/vendor/products`; table with title, price, active, category.

#### Sub-task 16.3: Edit / deactivate

- [ ] POST `/products/:id/update` for price, stock, `active: false`.

---

### Task 17: Shop checkout against API

**Files:**
- Modify: `hub/components/app/views/CartView.tsx`
- Modify: `hub/lib/nakuru/reducer.ts` — cart keys as string UUIDs
- Create: `hub/lib/nakuru/orders.ts`

#### Sub-task 17.1: Cart identity migration

- [ ] Cart state: `Record<string, number>` works for UUID strings; audit `itemById` usage.
- [ ] When live catalog off, keep demo ids; when on, only API ids in cart.

#### Sub-task 17.2: Checkout payload

- [ ] Build `orderNew`: items `{ productId, qty }`, zone, address, `payment: 'cod'`.
- [ ] Map reducer `pay` mpesa → only if API supports and cart verified.

#### Sub-task 17.3: Delivery phone field

- [ ] Checkout input `07xx` → `orderNew.phone` optional schema.
- [ ] Copy explains SMS/rider contact (not OTP).

#### Sub-task 17.4: Place order + errors

- [ ] Handle `409 out_of_stock`, `400 mpesa_needs_verified_vendor`.
- [ ] Clear cart on success; toast order id.

#### Sub-task 17.5: Order history (customer)

- [ ] Optional v1: `GET /orders/mine` if exists — else stub “orders in email”.
- [ ] Or keep demo order list until server customer list wired — document gap.

#### Sub-task 17.6: Regression demo mode

- [ ] With `USE_LIVE_CATALOG=false`, cart still uses demo place order path.

---

### Task 18: Service inquiry UI

**Files:**
- Create: `hub/components/app/ServiceInquiryModal.tsx`
- Create: `hub/components/app/vendor/VendorInquiriesList.tsx`
- Modify: `hub/components/app/ProductCard.tsx` or detail sheet

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
- Create: `server/scripts/seed-anchor-vendor.js`
- Create: `hub/docs/runbooks/anchor-vendors.md`

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
- Modify: `hub/e2e/app-smoke.spec.mjs`
- Modify: `hub/README.md`, `server/.env.example`

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

| Check | Command / action |
|-------|------------------|
| API health | `curl -s http://127.0.0.1:3001/me` → 401 |
| Email OTP | Request + verify flow in dev |
| Listings gate | Pending vendor product not in `GET /listings` |
| Documents | 403 cross-user download |
| Next catalog | `NEXT_PUBLIC_USE_LIVE_CATALOG=true pnpm dev` |
| Staff queue | `/staff` approve pending vendor |
| Shop E2E | OTP → browse → cart → COD order |
| Service E2E | Inquiry email received in Mailgun logs |

---

## Spec coverage self-review

| Spec section | Task(s) |
|--------------|---------|
| §2 success criteria | Tasks 5, 8–9, 15–18, 19 |
| §3 decisions | Task 10, 14 |
| §6.2 documents | Tasks 7–8 |
| §6.3 inquiries | Task 9, 18 |
| §7 data model | Task 2 |
| §8 API | Tasks 5, 8–10 |
| §9 frontend | Tasks 11–18 |
| §11 anchors | Task 19 |
| Email OTP (infra) | Tasks 3–5, 12 |
| Supabase | Tasks 1–2, 7 |

---

## Suggested commit sequence

1. `chore(api): supabase config and migrations`
2. `feat(api): mailgun email otp auth`
3. `feat(api): vendor documents and inquiries`
4. `feat(web): api client and email sign-in`
5. `feat(web): vendor apply and staff queue`
6. `feat(web): live catalog and checkout`
7. `docs: anchor vendor runbook`

---

**Dispatch hint:** For subagent-driven work, assign **one sub-task** (e.g. `11.3`) per session, not whole Task 11. Short tasks (3, 4, 6, 7, 9, 10) keep step-only checklists.

**Execution options:**

1. **Subagent-driven** — one sub-task per session, review between sub-tasks  
2. **Inline** — run sub-tasks in order in this chat (start with **1.1** or **2.1**)