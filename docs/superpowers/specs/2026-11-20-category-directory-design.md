# Category directory — design spec

**Status:** Approved  
**Implementation plan:** [category-directory plan](../plans/2026-11-20-category-directory.md)  
**Date:** 2026-11-20  
**Repo:** `C:\Users\mhki\hub`  
**Related:** [Vendor onboarding launch spec](./2026-11-15-vendor-onboarding-launch-design.md)

---

## 1. Summary

NakuruHub categories today are a **hardcoded** list (`shop`, `services`, `property`, `cars`, `stays`, `taxi`) in UI constants, Zod enums, and a `products.category` check constraint. Staff cannot add names; vendors cannot type a new one; browse and search cannot filter by anything else.

This spec replaces that with **one category directory** in Postgres. Staff and vendors write into the same table. The sell form, Home header tabs, Category Featured tiles, search, listings API, and checkout **all read the same rows**.

Vendor-created names go **live immediately**. Staff can hide or change listing mode later. Custom names **stand alone** in browse (they are not nested under Shop). New community names default to **shop-style** selling (cart + COD) so checkout keeps working.

---

## 2. Goals and success criteria

### Goals

1. Staff can add official categories; vendors can add community names on the sell form.
2. The app pulls the same visible list for apply chips, header tabs, Featured, and listing filters.
3. Shoppers can tap or search a community name and see only those listings.
4. Selling behavior (cart vs quote vs viewing) follows `listing_mode`, not a hardcoded slug.

### Success criteria

| Criterion | Measure |
|-----------|---------|
| Apply form not hardcoded | Chips come from `GET /api/categories`; adding “Fashion” selects slug `fashion` |
| Duplicate names | “fashion” and “Fashion” resolve to one slug |
| Live community browse | After apply + approve + publish, `/api/listings?category=fashion` returns that listing |
| Search | Query “fashion” matches category label as well as title/description |
| Cart | Community listing with `listing_mode=shop` can be ordered (COD) like Shop |
| Hide | Staff hide removes the name from apply, tabs, and public listings filter; vendor dashboard still shows existing rows |
| Fallback | If categories fetch fails, UI uses seeded official list |

### Non-goals (v1)

- Auto-merge that rewrites all existing listing slugs.
- Vendor tags nested under Shop/Services (standalone by product decision).
- Community names in the Home curated strip (phones, TVs, … stay curated).
- New bottom-nav or Category **rail** items per community name.
- i18n of community labels (store one label; official names keep existing en/sw maps).
- Promoting community → official as a special workflow beyond editing `kind` in staff UI.

---

## 3. Decisions (locked)

| Topic | Decision |
|-------|----------|
| Model | One `categories` directory table |
| Who writes | Staff (official) and vendors (community) |
| Vendor names | Standalone browse chips, not nested |
| Go-live | Immediate (`visible=true`); staff hide/moderate later |
| Default selling | Community `listing_mode=shop` |
| Apply cap | Still 1–4 categories on the vendor profile |
| When vendors create names | On apply **and** after approval (Add on the listing form), still capped at 4 slugs on the profile |
| Header tabs | All + official open + visible community |
| Category rail | Official only (Featured, Shop, Property, …) |
| Featured | Extra tiles for visible community names |
| Home strip (`TOPC`) | Unchanged curated shortcuts |
| Merge v1 | Hide duplicate; keep canonical slug; no bulk rewrite |
| Launch official | Shop and Services remain the only **open** official apply targets until staff open others; community names are open as they are created |

---

## 4. Current system vs gaps

| Surface | Today | Gap |
|---------|--------|-----|
| `lib/nakuru/data/constants.ts` `CATS` | Source of truth | Must become fallback / official seed labels only |
| `CategoryId` union | Closed set | Browse/apply must accept directory slugs (string + known official) |
| `vendorNew` schema | `z.enum` + `LAUNCH_CATEGORIES` | Official waitlist still blocked; community slugs allowed if visible |
| `products.category` check | `shop\|property\|cars\|services` | Drop check; FK or exists-in-directory |
| `listPublicListings` | Only filters those four | Filter any visible slug |
| Checkout | `p.category = 'shop'` | Join directory: `listing_mode = 'shop'` |
| Staff | Vendor queue only | Category list + hide/unhide + listing_mode + add official |

---

## 5. Data model

### 5.1 `categories`

| Column | Type | Notes |
|--------|------|--------|
| `slug` | `text` PK | URL-safe, lowercase, `[a-z0-9]+(?:-[a-z0-9]+)*` |
| `label` | `text` | Display name, 2–40 chars after trim |
| `kind` | `text` | `official` \| `community` |
| `listing_mode` | `text` | `shop` \| `services` \| `property` \| `cars` |
| `visible` | `boolean` | Default `true` |
| `open_for_apply` | `boolean` | Official waitlist: `false` until staff open; community: `true` |
| `sort_order` | `int` | Official seeded order; community after official |
| `created_by` | `uuid` null | `users.id` for community |
| `created_at` | `timestamptz` | |

**Seed (official):**

| slug | label | listing_mode | open_for_apply | visible |
|------|-------|--------------|----------------|---------|
| shop | Shop | shop | true | true |
| services | Services | services | true | true |
| property | Property | property | false | true |
| cars | Cars | cars | false | true |
| stays | Stays | shop | false | true |
| taxi | Taxi | services | false | true |

`all` is **not** a directory row; it remains a UI filter meaning “no category param”.

### 5.2 Products and vendors

- Drop `products.category` check constraint. Add FK `products.category → categories.slug`.
- `vendors.categories` stays `text[]` of slugs. Application validation: every slug exists, is `visible`, and is `open_for_apply` (community rows are open; waitlisted official are not).
- Existing shop/services products and vendor arrays keep working after seed.

### 5.3 Slug rules

- From label: trim, lowercase, replace spaces/`/` with `-`, strip other punctuation, collapse dashes.
- Collision: reuse existing row (select that slug). Do not create a second “Fashion”.
- Reject empty slug, reserved `all`, or labels outside 2–40 characters.

---

## 6. APIs

### Public

`GET /api/categories`

Returns visible rows: `{ slug, label, kind, listing_mode, open_for_apply, sort_order }`.

`GET /api/listings?category=`

- Missing/`all`: unchanged “all public listings”.
- Any **visible** directory slug: filter `p.category = slug`.
- Hidden or unknown slug: empty list (not 400), so a stale tab does not error.

### Authenticated vendor

`POST /api/vendors` — `categories` is `string[]` (1–4). Each must pass directory rules above. Creating a **new** community row may happen in the same request or via:

`POST /api/categories` (signed-in user)

Body: `{ label: string }`. Upsert by slug: if exists and visible, return it; if exists and hidden, `409` with `category_hidden`; if new, insert community / shop / visible / open. Rate-limit: max **20** community creates per user per day.

Vendor apply then sends slugs only (created first from the form).

`POST /api/vendors/mine/categories` (approved vendor) — `{ slug }` or `{ label }` (creates/reuses then appends). Rejects if profile already has 4 slugs or slug is not visible/open.

`POST /api/products` — category must be in the vendor’s approved `categories` array **and** exist. Selling UI uses `listing_mode` from the directory. Stock field only when `listing_mode === 'shop'`.

### Staff (existing admin auth)

`GET /api/admin/categories` — all rows including hidden.

`POST /api/admin/categories` — `{ label, listing_mode, open_for_apply, kind: "official" }`.

`PATCH /api/admin/categories/:slug` — `{ visible?, listing_mode?, open_for_apply?, label? }`. Cannot delete seeded official slugs. Hide is enough.

---

## 7. UI

### 7.1 Sell form (`VendorApplyForm`)

- Load chips from `GET /api/categories`.
- Tappable: `open_for_apply`.
- Disabled: official not open (soon/waitlist copy as today).
- Community visible + open: tappable chips so people reuse names.
- Field + Add: create/reuse via `POST /api/categories`, then toggle selected (max 4, min 1).
- Errors next to the field (empty, too long, hidden name, not signed in).

Demo/offline vendor panel can keep hardcoded chips; live API path is the source of truth.

### 7.2 Header tabs

Order: All → official `open_for_apply` → other official visible (disabled) → community visible. Cap display if needed by horizontal scroll (already exists).

Category state is a **string slug** (plus `all`), not a closed TypeScript union for live catalog. Official union may remain for demo `ITEMS` only.

### 7.3 Category tab

- Rail (`SIDE`) stays official.
- Featured: existing `TOPC` tiles **plus** community visible names as extra tiles that set the listings filter to that slug.

### 7.4 Search

Client (and later server if added) matches title, subtitle/description, **and** category label/slug.

### 7.5 Staff

New block on staff home under or beside vendor queue: table of categories with hide, listing mode, open-for-apply, add official.

### 7.6 Vendor product form

Category picker = slugs on the vendor profile, labels from the directory. Fields follow `listing_mode` of the selected slug (shop vs services).

Approved vendors may use the same Add field. `POST /api/categories` then appends the slug to `vendors.categories` if length stays ≤ 4; otherwise toast to remove one before adding. They can publish immediately in that slug (no extra staff approve for the new name). Staff can still hide the name from public browse.

---

## 8. Checkout and inquiries

- Cart / `POST /orders`: products whose directory `listing_mode = 'shop'` (join `categories`), vendor approved, same rules as today.
- Inquiries: `listing_mode = 'services'`.
- Property/cars modes unchanged and still not launch-open unless staff set `open_for_apply`.

---

## 9. Error handling

| Case | Behavior |
|------|----------|
| Categories GET fail | Fallback seed official list; toast optional, browse still works |
| Add duplicate visible | Reuse slug, select chip |
| Add hidden slug | Error: “That category is closed. Pick another.” |
| Apply with waitlisted official | 400 (unchanged) |
| Apply with unknown slug | 400 |
| Listing unknown category | Empty array |
| Product category not on vendor | 403 `category_not_approved` |
| Rate limit community create | 429 |

---

## 10. Testing

- Migration: seed six official rows; insert product with `category=shop` still valid; insert `fashion` after creating directory row.
- `POST /api/categories` creates community; second “Fashion” returns same slug.
- `POST /api/vendors` accepts `[shop, fashion]` when fashion exists; rejects `[property]` while not open.
- `GET /api/listings?category=fashion` returns only that slug; hidden fashion returns `[]`.
- Orders: fashion + `listing_mode=shop` can checkout; services cannot.
- Apply form: add + chip reuse + max 4 (component/API tests as elsewhere in repo).

---

## 11. Out of scope follow-ups

- Merge tool that remaps `products.category` and `vendors.categories`.
- Curated Home strip driven by directory.
- Per-category icons for community names (use a default bag/tag icon).
- Swahili labels for community names.

---

## 12. Architecture sketch

```
Vendor apply / POST /api/categories
        ↓
  categories (directory)
        ↓
  GET /api/categories  →  chips, tabs, Featured
        ↓
  vendors.categories[] + products.category (FK)
        ↓
  GET /api/listings?category=slug
  POST /orders  ⋈  listing_mode = shop
```

Units:

- `lib/server/categories.ts` — list, upsert community, staff patch, slugify
- `app/api/categories/route.ts` — GET public, POST auth
- `app/api/admin/categories/` — staff
- UI consumers read a small `useCategories()` hook with seed fallback
