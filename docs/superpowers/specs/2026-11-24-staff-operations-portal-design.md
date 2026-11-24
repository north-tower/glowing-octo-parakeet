# Staff operations portal — design spec

**Status:** Approved (phase 1 implemented)  
**Date:** 2026-11-24  
**Repo:** `C:\Users\mhki\hub`  
**Related:** [Vendor onboarding launch](./2026-11-15-vendor-onboarding-launch-design.md), [Category directory](./2026-11-20-category-directory-design.md)

**Implementation plan:** Phase 1 landed in repo (2026-11-24); follow-on modules per §14 remain planned.

---

## 1. Summary

Today **`/staff`** is a minimal console: password (+ optional TOTP) login and a **vendor approval queue** only. Backend admin APIs already exist for **categories** (`/api/admin/categories`), and the platform **writes** security events to **`audit_log`**, but staff have **no UI** to read activity or see site-wide operational health.

This spec expands **`/staff`** into a **phased operations portal** (product name in UI: **Operations**; optional subtitle **Masterclass**). **Phase 1** adds a persistent shell, **admin-only** overview and audit feed, and an **upgraded vendors** panel. **Admin** sees the full phase-1 surface; **support** keeps a **subset** (vendors only). Later phases add categories, orders, inquiries, comments, users, and message threads using the same shell and role matrix.

**Route:** Stay on **`/staff`** (no new top-level path; no redirect churn).

---

## 2. Goals and success criteria

### Goals

1. Admins can **see operational pulse** (counts + recent activity) without SQL or Supabase dashboard.
2. Admins can **browse and filter** the append-only **`audit_log`** for investigations.
3. Staff (admin + support) can **review vendors** in a clearer workspace than the single-page queue.
4. **Role boundaries** are enforced on the **server**; UI only reflects what the token may call.
5. Foundation for **additional ops modules** without rewriting auth or layout.

### Success criteria (phase 1)

| Criterion | Measure |
|-----------|---------|
| Admin overview | Signed-in `admin` sees KPI cards and last 10 audit rows on `/staff` (or dedicated overview route — see §6) |
| Support landing | Signed-in `support` lands on **Vendors**; no overview or audit in nav |
| Audit access | `GET /api/admin/audit` returns **403** for `support`, **401** without staff token, **200** for `admin` with paginated rows |
| Vendor actions unchanged | Approve / reject / verify still work; events still append to `audit_log` |
| Vendor UX | Status tabs + client-side search by name or owner email on loaded page (no new server search required for v1) |
| Session role | Client loads staff role via **`GET /api/admin/me`** after login (and on shell mount) |
| Deep links | `/staff/vendors`, `/staff/audit` work when authed; unauthed users see login |
| SEO / privacy | Staff routes stay `noindex` (existing pattern) |

### Non-goals (phase 1)

- Categories, orders, inquiries, comments, users, or message admin UIs (phase 2+).
- New audit events beyond what production already emits (unless a KPI is impossible without one cheap aggregate query).
- Export CSV, saved filters, or full-text search across `meta` JSON.
- Support read-only overview or audit (admin-only for phase 1).
- Replacing customer-app demo `AdminView` (remains unrelated; may add a one-line pointer to `/staff` later).
- Staff impersonation (“login as user”) or account editing.
- Mobile-native app; responsive web is enough.

---

## 3. Decisions (locked from design review)

| Topic | Decision |
|-------|----------|
| URL | **`/staff`** tree; rebrand UI to **Operations** |
| Phasing | **Shell + overview + audit + vendors** first; other modules later |
| Admin vs support | **Admin:** overview, audit, vendors. **Support:** vendors only |
| Architecture | **Multi-route** App Router under `app/staff/` (not one giant tab page) |
| Auth | Existing staff login (`POST /api/auth/staff/login`), bearer + refresh cookie, JWT `role` |
| Activity source | Existing **`audit_log`** table (`lib/server/audit.ts`) |
| Category APIs | Unchanged; **no** category UI in phase 1 |
| Token storage | Keep `sessionStorage` key `nakuruhub-staff-access` |

---

## 4. Current system vs gaps

| Surface | Today | Gap |
|---------|--------|-----|
| `app/staff/page.tsx` | Login or `StaffVendorQueue` | No layout, nav, or sub-routes |
| `GET /api/admin/vendors` | List by status | No detail endpoint; queue UI only |
| `audit_log` | Insert-only via `audit()` | No read API, no staff UI |
| Overview metrics | None | Admin has no at-a-glance counts |
| Staff role on client | JWT not exposed reliably | Need `/api/admin/me` |
| `AdminView` (shopper app) | Mock local state | Not wired to Postgres |
| `StaffCategoryPanel` | Planned in category spec | Not implemented (phase 2) |

### Existing audit events (reference)

Events already written in production code include: `staff_login`, `staff_login_fail`, `login`, `otp_fail`, `otp_staff_blocked`, `vendor_apply`, `vendor_approved`, `vendor_rejected`, `vendor_verified`, `vendor_area`, `vendor_banner`, `product_add`, `product_update`, `order_placed`, `vendor_order_status`, `inquiry_create`, `comment_create`, `comment_delete`, `message_thread_start`, `message_send`. New modules in later phases should continue using `audit()`; phase 1 does not require renaming or normalizing these strings.

---

## 5. Roles and authorization

### 5.1 Roles

| Role | Staff login | Phase-1 UI | Phase-1 APIs |
|------|-------------|------------|----------------|
| `admin` | Yes | Overview, Audit, Vendors | All phase-1 admin routes |
| `support` | Yes | Vendors only | Existing vendor admin routes + `/api/admin/me` |
| `customer` | No (OTP shopper) | — | — |

Staff accounts must not use customer OTP login (`otp_staff_blocked` already audited).

### 5.2 Server rules

- Reuse `bearerUser` + `requireRole` from `lib/server/middleware.ts`.
- **Vendor routes** (`/api/admin/vendors`, `/api/admin/vendors/:id/:action`): `admin` **or** `support` (unchanged).
- **New routes:**
  - `GET /api/admin/me` — `admin` **or** `support`.
  - `GET /api/admin/overview` — **`admin` only** → else **403**.
  - `GET /api/admin/audit` — **`admin` only** → else **403**.
- Never return overview/audit payloads to support even if the client hides nav (direct URL / forged requests must **403**).

### 5.3 Client rules

- Shell fetches `/api/admin/me` when a staff access token exists.
- Build nav from `role`:
  - `admin`: Overview (home), Audit, Vendors, Sign out.
  - `support`: Vendors, Sign out.
- If `support` hits `/staff/audit` or admin-only overview path, show a short **“Admin only”** message with link back to Vendors (no data fetch).
- Optional: after login, redirect `support` → `/staff/vendors`, `admin` → `/staff` (overview).

---

## 6. Information architecture (routes)

Proposed App Router structure:

| Route | Audience | Purpose |
|-------|----------|---------|
| `/staff` | All staff when logged out | Login form (existing behavior, may move to shared layout) |
| `/staff` | `admin` when logged in | **Overview** (KPIs + recent activity teaser) |
| `/staff/vendors` | `admin`, `support` | Vendor queue (upgraded) |
| `/staff/audit` | `admin` | Full audit log browser |

**Login:** Unauthenticated access to any `/staff/*` route shows login; after success, redirect per §5.3.

**Files (illustrative):**

- `app/staff/layout.tsx` — metadata, `StaffBody`, wraps children.
- `app/staff/(console)/layout.tsx` — authed shell: `StaffConsoleLayout` (nav + outlet); children only render when token present.
- `app/staff/(console)/page.tsx` — overview (admin) or redirect support → vendors.
- `app/staff/(console)/vendors/page.tsx`
- `app/staff/(console)/audit/page.tsx`
- `app/staff/page.tsx` — may become login-only group or merge into `(console)` with guards.

Exact route groups may adjust during implementation to minimize churn; behavior in this table is normative.

---

## 7. UI components

### 7.1 `StaffConsoleLayout`

- Header: `BrandLogoMark` + **“NakuruHub Operations”** (optional muted “Masterclass”).
- Role badge: `Admin` / `Support`.
- Vertical nav (desktop) or compact top nav (mobile) using existing staff/marketplace styles (`StaffBody`, `styles.css` cards/buttons).
- Sign out: clear `nakuruhub-staff-access`, optional `POST` logout if added later; today clearing token + reload is acceptable.

### 7.2 `StaffOverviewPanel` (admin)

**KPI cards** (from `GET /api/admin/overview`):

| Metric | Source (SQL intent) |
|--------|---------------------|
| Pending vendors | `count(*) from vendors where status = 'pending'` |
| Approved vendors (7d) | `status = 'approved' and created_at >= now() - interval '7 days'` |
| Open orders | Orders not in terminal states (`delivered`, `cancelled`, `refused`) |
| Orders today | `created_at::date = current_date` |
| Staff login failures (24h) | `audit_log` where `event = 'staff_login_fail' and at >= now() - interval '24 hours'` |

Display numbers only; no charts in v1.

**Recent activity:** Last **10** rows (same shape as audit list API, or embedded in overview response) with “View all” → `/staff/audit`.

### 7.3 `StaffAuditPanel` (admin)

- Table columns: **Time**, **Event**, **Actor** (email via `user_id` join, or “—” if null), **IP** (truncate IPv6 for display), **Meta** (collapsed JSON, expand on click).
- **Pagination:** cursor on `audit_log.id` (descending by `at`, tie-breaker `id`).
- **Query params (API):** `limit` (default 50, max 100), `cursor`, optional `event` (exact match or prefix — pick **prefix** `event ilike $1 || '%'` for ergonomics), optional `since` / `until` ISO timestamps.

### 7.4 `StaffVendorQueue` (upgrade)

- Move to `/staff/vendors`; keep status filter tabs (`pending` | `approved` | `rejected`).
- **Search:** client-side filter on `name` and `owner_email` over the fetched list (API still returns up to 100 per status).
- **Row detail:** expand row or drawer showing categories[], `verified`, `logo_url` thumbnail, `created_at`, owner email, vendor `id` (copy-friendly for tickets).
- Actions: approve / reject / verify (existing `POST` routes); loading/error handling unchanged.

Phase 1.5 (optional, only if cheap): `GET /api/admin/vendors/:id` read-only summary — **not required** if drawer uses list row fields only.

---

## 8. API specification (phase 1)

### 8.1 `GET /api/admin/me`

**Auth:** Bearer staff access token; roles `admin` | `support`.

**Response 200:**

```json
{
  "id": "uuid",
  "email": "staff@example.com",
  "role": "admin"
}
```

**Errors:** `401` if missing/invalid token; `403` if token is customer role (should not happen on staff login path).

**Implementation note:** Load email from `users` by `id`; do not trust JWT for email display beyond `sub` / `role`.

### 8.2 `GET /api/admin/overview`

**Auth:** `admin` only.

**Response 200:**

```json
{
  "pendingVendors": 3,
  "approvedVendors7d": 12,
  "openOrders": 45,
  "ordersToday": 8,
  "staffLoginFailures24h": 0,
  "recentAudit": [ /* AuditRow[], max 10 */ ]
}
```

**Errors:** `401`, `403` (support).

### 8.3 `GET /api/admin/audit`

**Auth:** `admin` only.

**Query:** `limit`, `cursor` (opaque: base64 or numeric `id` — prefer numeric last-seen `id` for simplicity), `event` (optional prefix), `since`, `until`.

**Response 200:**

```json
{
  "rows": [
    {
      "id": 12345,
      "at": "2026-11-24T12:00:00.000Z",
      "event": "vendor_approved",
      "userId": "uuid-or-null",
      "actorEmail": "staff@example.com",
      "ip": "203.0.113.1",
      "meta": { "vendor": "uuid" }
    }
  ],
  "nextCursor": "12344"
}
```

**Privacy:** Do not expose OTP codes, passwords, or refresh tokens in `meta` (already policy in `audit()` call sites). If legacy rows exist with sensitive keys, strip on read.

**Index recommendation:** Phase 1 uses `order by id desc limit n`; if slow at scale, add migration `create index audit_log_at_id_idx on audit_log (at desc, id desc)` — optional, measure first.

### 8.4 Staff login response (small extension)

**Optional but recommended:** `POST /api/auth/staff/login` includes `"role": "admin" | "support"` in JSON alongside `access` so the client can redirect before `/me` completes. `/api/admin/me` remains source of truth after refresh.

---

## 9. Server modules

| Module | Responsibility |
|--------|----------------|
| `lib/server/admin-overview.ts` | Aggregate KPI queries + recent audit slice |
| `lib/server/admin-audit.ts` | Paginated audit list, actor email join |
| `app/api/admin/me/route.ts` | Session identity |
| `app/api/admin/overview/route.ts` | Overview handler |
| `app/api/admin/audit/route.ts` | Audit handler |

Keep SQL parameterized; no raw string concatenation for filters.

---

## 10. Client modules

| Module | Responsibility |
|--------|----------------|
| `lib/nakuru/staff-api.ts` | Types + `staffFetch` for new endpoints |
| `components/staff/StaffConsoleLayout.tsx` | Nav, role, children |
| `components/staff/StaffOverviewPanel.tsx` | Overview UI |
| `components/staff/StaffAuditPanel.tsx` | Audit table + pagination |
| `components/staff/StaffVendorQueue.tsx` | Enhanced queue (relocate) |
| `components/staff/StaffLoginForm.tsx` | Unchanged behavior; wired through layout |

---

## 11. Data model

**No schema changes required for phase 1.**

Existing table:

```sql
-- audit_log (003_supabase_launch.sql)
id bigserial primary key,
at timestamptz not null default now(),
user_id uuid,
event text not null,
ip inet,
meta jsonb
```

---

## 12. Security and privacy

- Staff routes remain disallowed in `robots.ts` (`/staff`).
- Audit UI is **admin-only**; support must not infer customer PII from ops tools beyond vendor queue emails already shown.
- Rate-limit overview/audit endpoints in line with existing API patterns if a global limiter exists; otherwise rely on staff auth and low QPS.
- All new handlers must use `X-Requested-With: nakuruhub` pattern already expected by `staffFetch`.

---

## 13. Testing

| Area | Tests |
|------|-------|
| `GET /api/admin/me` | 401 unauth; 200 admin/support with fixture users |
| `GET /api/admin/overview` | 403 support; 200 admin; shapes include numbers |
| `GET /api/admin/audit` | 403 support; pagination returns stable order; `event` filter |
| Regression | Existing `tests/api/admin-categories.test.ts` and vendor admin tests still pass |

Use same DB test harness pattern as `tests/api/admin-categories.test.ts` (`skipIf(!hasDbEnv)`).

---

## 14. Later phases (outline only)

Each phase adds a nav item, `lib/server/admin-*.ts` helpers, `app/api/admin/...` routes, and a page under `app/staff/(console)/...`. Suggested order:

1. **Categories** — implement `StaffCategoryPanel` per [category directory spec](./2026-11-20-category-directory-design.md) (admin only).
2. **Orders** — list, status read, link to customer/vendor (admin; support optional later).
3. **Service inquiries** — queue for services quotes.
4. **Comments** — moderation queue (reuse `comments.ts` staff rules).
5. **Users** — search/disable (admin only).
6. **Listing messages** — read-only thread viewer for disputes.

Role matrix for each module to be specified in that phase’s spec addendum; default **admin-only** for destructive or PII-heavy tools.

---

## 15. Open questions (none blocking phase 1)

- Whether to show **“Masterclass”** prominently in header or only in internal docs — cosmetic, default **Operations** primary.
- Whether support eventually gets **read-only overview** — deferred; product said no for phase 1.

---

## 16. Spec self-review (2026-11-24)

- [x] No TBD placeholders for phase-1 scope.
- [x] Role matrix consistent between UI §5 and API §8.
- [x] Aligns with existing staff auth and vendor admin APIs.
- [x] Scope fits a single implementation plan (not decomposed further).
- [x] Non-goals exclude category UI despite existing APIs.