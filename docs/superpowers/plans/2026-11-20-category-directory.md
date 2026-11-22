# Category Directory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hardcoded marketplace categories with one Postgres directory so staff and vendors can add names, and apply, browse, search, listings, and checkout all use the same visible list.

**Architecture:** Seed a `categories` table (official rows + community upserts). Server helpers in `lib/server/categories.ts` back public and staff APIs. Listings and orders join `listing_mode` instead of comparing slugs to `'shop'` / `'services'`. The client loads `GET /api/categories` (seed fallback) for chips, header tabs, and Featured; cart/CTAs use `listingMode` on each listing.

**Tech Stack:** Next.js 16 App Router, PostgreSQL (Supabase migrations), `pg`, Zod, Vitest (`lib/**/*.test.ts` unit + `tests/api/**/*.test.ts` API).

## Global Constraints

- Spec: [2026-11-20-category-directory-design.md](../specs/2026-11-20-category-directory-design.md)
- Work only in `C:\Users\mhki\hub`
- Community names go live immediately (`visible=true`, `open_for_apply=true`, `listing_mode=shop`)
- Official waitlist stays closed until staff set `open_for_apply`
- Vendor profile still 1–4 slugs; new names on apply and after approval
- No merge/rewrite of existing listing slugs; hide is enough
- Home `TOPC` strip stays curated; Category rail stays official; community names appear as header tabs + Featured tiles
- `all` is never a directory row
- Read `node_modules/next/dist/docs/` before new App Router routes
- Never commit `.env.local`
- Apply SQL migrations on Supabase before API tests that need the new table; tests that cannot reach DB must skip like existing `tests/api/*.test.ts`

## File map

| Path | Responsibility |
|------|----------------|
| `lib/nakuru/category-slug.ts` | Shared `slugifyCategoryLabel` |
| `lib/nakuru/data/category-directory.ts` | Seed/fallback official rows for UI |
| `lib/nakuru/types.ts` | `ListingMode`, listing `c: string`, `listingMode` |
| `supabase/migrations/008_category_directory.sql` | Table, seed, drop product check, FK |
| `lib/server/categories.ts` | List, upsert community, staff add/patch, apply-allowed check |
| `app/api/categories/route.ts` | `GET` public, `POST` auth |
| `app/api/vendors/mine/categories/route.ts` | Append slug to approved vendor |
| `app/api/admin/categories/route.ts` | Staff list + create official |
| `app/api/admin/categories/[slug]/route.ts` | Staff patch |
| `lib/nakuru/use-categories.ts` | Client fetch + fallback |
| `components/staff/StaffCategoryPanel.tsx` | Staff hide / mode / open / add |
| `docs/db/README-supabase.md` | Document `008` |

## Task index

| Task | Deliverable |
|------|-------------|
| 1 | Slugify + shared types (unit tests) |
| 2 | Migration `008` |
| 3 | Server directory + `GET`/`POST /api/categories` |
| 4 | Vendor apply validates directory |
| 5 | Public listings filter + `listingMode` on rows |
| 6 | Orders + inquiries use `listing_mode` |
| 7 | Product create/update uses directory slug + mode |
| 8 | Approved vendor append category |
| 9 | Staff category APIs |
| 10 | `useCategories` + sell form Add chips |
| 11 | Browse tabs, Featured, search, cart CTA |
| 12 | Vendor product form uses directory modes |
| 13 | Staff category panel |

---

### Task 1: Slugify and shared category types

**Files:**
- Create: `lib/nakuru/category-slug.ts`
- Create: `lib/nakuru/category-slug.test.ts`
- Create: `lib/nakuru/data/category-directory.ts`
- Modify: `lib/nakuru/types.ts`

**Interfaces:**
- Produces: `slugifyCategoryLabel(label: string): string`
- Produces: `CATEGORY_SLUG_RE`, `RESERVED_CATEGORY_SLUGS`
- Produces: `ListingMode = "shop" \| "services" \| "property" \| "cars"`
- Produces: `DirectoryCategory` type and `OFFICIAL_DIRECTORY_FALLBACK`

- [ ] **Step 1: Write the failing unit test**

Create `lib/nakuru/category-slug.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { slugifyCategoryLabel } from "@/lib/nakuru/category-slug";

describe("slugifyCategoryLabel", () => {
  it("lowercases and hyphenates", () => {
    expect(slugifyCategoryLabel("Fashion")).toBe("fashion");
    expect(slugifyCategoryLabel("  Home  Decor ")).toBe("home-decor");
  });

  it("treats slash as a separator and strips other punctuation", () => {
    expect(slugifyCategoryLabel("Kids/Baby")).toBe("kids-baby");
    expect(slugifyCategoryLabel("A & B!!!")).toBe("a-b");
  });

  it("collapses dashes and returns empty for junk", () => {
    expect(slugifyCategoryLabel("foo---bar")).toBe("foo-bar");
    expect(slugifyCategoryLabel("!!!")).toBe("");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run lib/nakuru/category-slug.test.ts`

Expected: FAIL — cannot find module `@/lib/nakuru/category-slug`

- [ ] **Step 3: Write minimal implementation**

`lib/nakuru/category-slug.ts`:

```ts
export const CATEGORY_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const RESERVED_CATEGORY_SLUGS = new Set(["all"]);

export function slugifyCategoryLabel(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[/]+/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
```

`lib/nakuru/data/category-directory.ts`:

```ts
import type { ListingMode } from "@/lib/nakuru/types";

export type DirectoryKind = "official" | "community";

export type DirectoryCategory = {
  slug: string;
  label: string;
  kind: DirectoryKind;
  listingMode: ListingMode;
  visible: boolean;
  openForApply: boolean;
  sortOrder: number;
};

export const OFFICIAL_DIRECTORY_FALLBACK: DirectoryCategory[] = [
  { slug: "shop", label: "Shop", kind: "official", listingMode: "shop", visible: true, openForApply: true, sortOrder: 10 },
  { slug: "services", label: "Services", kind: "official", listingMode: "services", visible: true, openForApply: true, sortOrder: 20 },
  { slug: "property", label: "Property", kind: "official", listingMode: "property", visible: true, openForApply: false, sortOrder: 30 },
  { slug: "cars", label: "Cars", kind: "official", listingMode: "cars", visible: true, openForApply: false, sortOrder: 40 },
  { slug: "stays", label: "Stays", kind: "official", listingMode: "shop", visible: true, openForApply: false, sortOrder: 50 },
  { slug: "taxi", label: "Taxi", kind: "official", listingMode: "services", visible: true, openForApply: false, sortOrder: 60 },
];
```

In `lib/nakuru/types.ts` add and adjust:

```ts
export type ListingMode = "shop" | "services" | "property" | "cars";

export type Listing = {
  id: number | string;
  c: string;
  listingMode?: ListingMode;
  categoryLabel?: string;
  e: string;
  img?: string;
  t: string;
  s: string;
  desc?: string;
  p: number;
  v: number;
  vn?: string;
  imgs?: string[];
  attrs?: Record<string, string>;
};

export type NakuruState = {
  tab: TabId;
  cat: string;
  // ...unchanged fields...
};
```

Keep `CategoryId` for demo `CATS` / `ITEMS`. Change `NakuruAction` `SET_CAT` to `{ type: "SET_CAT"; cat: string }` in Task 11 if the compiler complains in this task — do it here if `types.ts` change forces it:

Modify `lib/nakuru/reducer.ts` `SET_CAT` action `cat: string` (type-only; no behavior change).

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run lib/nakuru/category-slug.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/nakuru/category-slug.ts lib/nakuru/category-slug.test.ts lib/nakuru/data/category-directory.ts lib/nakuru/types.ts lib/nakuru/reducer.ts
git commit -m "feat: add category slug helper and directory types"
```

---

### Task 2: Postgres category directory migration

**Files:**
- Create: `supabase/migrations/008_category_directory.sql`
- Modify: `docs/db/README-supabase.md` (add `008` to the run-order table)

**Interfaces:**
- Produces: table `categories` with PK `slug`; FK `products.category → categories.slug`
- Consumes: existing `products.category` values which are only `shop|property|cars|services`

- [ ] **Step 1: Write the migration SQL**

`supabase/migrations/008_category_directory.sql`:

```sql
create table categories (
  slug text primary key
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and slug <> 'all'),
  label text not null check (char_length(trim(label)) between 2 and 40),
  kind text not null check (kind in ('official', 'community')),
  listing_mode text not null
    check (listing_mode in ('shop', 'services', 'property', 'cars')),
  visible boolean not null default true,
  open_for_apply boolean not null default false,
  sort_order int not null default 100,
  created_by uuid references users (id),
  created_at timestamptz not null default now()
);

insert into categories (slug, label, kind, listing_mode, visible, open_for_apply, sort_order)
values
  ('shop', 'Shop', 'official', 'shop', true, true, 10),
  ('services', 'Services', 'official', 'services', true, true, 20),
  ('property', 'Property', 'official', 'property', true, false, 30),
  ('cars', 'Cars', 'official', 'cars', true, false, 40),
  ('stays', 'Stays', 'official', 'shop', true, false, 50),
  ('taxi', 'Taxi', 'official', 'services', true, false, 60);

alter table products drop constraint if exists products_category_check;

alter table products
  add constraint products_category_fk
  foreign key (category) references categories (slug);
```

Add a row to `docs/db/README-supabase.md` migration table:

`| supabase/migrations/008_category_directory.sql | Category directory + product FK |`

- [ ] **Step 2: Apply on the database used by `DATABASE_URL`**

PowerShell:

```powershell
psql $env:DATABASE_URL -f supabase/migrations/008_category_directory.sql
```

Expected: `CREATE TABLE`, `INSERT 0 6`, `ALTER TABLE` success.

If `products_category_check` has a generated name, find it with:

```sql
select conname from pg_constraint
where conrelid = 'products'::regclass and contype = 'c';
```

Drop the check that lists `shop/property/cars/services`, then add the FK.

- [ ] **Step 3: Smoke-check seed**

```sql
select slug, open_for_apply from categories order by sort_order;
```

Expected: six official rows; shop and services `open_for_apply = t`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/008_category_directory.sql docs/db/README-supabase.md
git commit -m "feat: add categories directory migration"
```

---

### Task 3: Server directory + public category APIs

**Files:**
- Create: `lib/server/categories.ts`
- Create: `app/api/categories/route.ts`
- Create: `tests/api/categories.test.ts`

**Interfaces:**
- Consumes: `slugifyCategoryLabel`, `RESERVED_CATEGORY_SLUGS`, `CATEGORY_SLUG_RE`
- Produces:

```ts
export class CategoryError extends Error {
  status: number;
  code: string;
}
export type CategoryPublicRow = {
  slug: string;
  label: string;
  kind: "official" | "community";
  listingMode: "shop" | "services" | "property" | "cars";
  openForApply: boolean;
  sortOrder: number;
};
export type CategoryAdminRow = CategoryPublicRow & {
  visible: boolean;
  createdAt: Date;
  createdBy: string | null;
};
export function mapCategoryRow(r: DbCategoryRow): CategoryPublicRow
export async function listVisibleCategories(): Promise<CategoryPublicRow[]>
export async function listAllCategories(): Promise<CategoryAdminRow[]>
export async function getCategoryBySlug(slug: string): Promise<DbCategoryRow | null>
export async function upsertCommunityCategory(userId: string, label: string): Promise<CategoryPublicRow>
export async function slugsAllowedForApply(slugs: string[]): Promise<boolean>
export async function staffCreateOfficial(input: { label: string; listingMode: ListingMode; openForApply: boolean }): Promise<CategoryPublicRow>
export async function staffPatchCategory(slug: string, patch: { visible?: boolean; listingMode?: ListingMode; openForApply?: boolean; label?: string }): Promise<CategoryPublicRow>
```

JSON from APIs uses **camelCase** matching `CategoryPublicRow`.

- [ ] **Step 1: Write the failing API test**

`tests/api/categories.test.ts` — follow `tests/api/vendors-launch-categories.test.ts` (`hasDbEnv`, `createTestServer`, skip if DB down).

Cases:

1. `GET /api/categories` includes `shop` with `openForApply: true` and `property` with `openForApply: false`; no hidden rows.
2. `POST /api/categories` without auth → 401.
3. `POST` `{ label: "Fashion" }` as customer → 201 `{ slug: "fashion", kind: "community", listingMode: "shop", openForApply: true }`.
4. Second `POST` `{ label: "fashion" }` → 200 same slug (reuse).
5. `POST` `{ label: "!!" }` → 400 `{ error: "bad_request" }`.

Cleanup in `afterAll`: `delete from categories where slug like 'fashion' and kind = 'community'` (and any unique test slug from `tag`).

Use a unique label like `Vitest ${tag}` so slug is `vitest-<tag>` not colliding with real fashion.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run tests/api/categories.test.ts`

Expected: FAIL (route missing) or skip-all if no DB — if skipped, still add the route; do not treat skip as pass of implementation.

- [ ] **Step 3: Implement `lib/server/categories.ts`**

Map DB snake_case:

```ts
type DbCategoryRow = {
  slug: string;
  label: string;
  kind: "official" | "community";
  listing_mode: ListingMode;
  visible: boolean;
  open_for_apply: boolean;
  sort_order: number;
  created_by: string | null;
  created_at: Date;
};
```

`upsertCommunityCategory`:

1. Trim label; if length not in 2–40 → `CategoryError(400, "bad_request")`.
2. `slug = slugifyCategoryLabel(label)`; if empty or reserved → 400.
3. Select existing by slug.
4. If exists and `!visible` → `CategoryError(409, "category_hidden")`.
5. If exists and visible → return mapped public row (no rate-limit increment).
6. Count `select count(*)::int n from categories where created_by=$1 and kind='community' and created_at > now() - interval '1 day'`. If `n >= 20` → `CategoryError(429, "too_many_requests")`.
7. `insert ... kind='community', listing_mode='shop', visible=true, open_for_apply=true, sort_order=(select coalesce(max(sort_order),60)+10 from categories), created_by=$user`. On unique violation, re-select (race) and reuse.

`slugsAllowedForApply(slugs)`: if length 0 or >4 return false. Query:

```sql
select slug from categories
where slug = any($1::text[])
  and visible
  and open_for_apply
```

Return true iff every requested slug is in the result set.

`staffCreateOfficial`: slugify label; reject collision; insert `kind='official'`.

`staffPatchCategory`: update only provided fields; 404 if missing.

- [ ] **Step 4: Implement `app/api/categories/route.ts`**

`GET`: `listVisibleCategories()` → 200 JSON array. Catch DB errors → 500 `{ error: "server_error" }`. Cache-Control `public, max-age=15`.

`POST`: `bearerUser` + `requireRole(..., "customer", "vendor")`. Body `z.object({ label: z.string() }).strict()`. Call `upsertCommunityCategory`. Map `CategoryError` to `{ error: code }` + status. 201 on insert, 200 on reuse — implement by having upsert return `{ row, created: boolean }` or check existence first.

- [ ] **Step 5: Run tests**

Run: `pnpm exec vitest run tests/api/categories.test.ts`

Expected: PASS when DB has `008` applied.

- [ ] **Step 6: Commit**

```bash
git add lib/server/categories.ts app/api/categories/route.ts tests/api/categories.test.ts
git commit -m "feat: add public category directory API"
```

---

### Task 4: Vendor apply uses the directory

**Files:**
- Modify: `lib/server/schemas.ts` (`vendorNew` categories)
- Modify: `lib/server/vendors.ts` (`categoriesAllowedAtLaunch` → directory check)
- Modify: `tests/api/vendors-launch-categories.test.ts`

**Interfaces:**
- Consumes: `slugsAllowedForApply`
- `vendorNew.categories`: `z.array(z.string().regex(CATEGORY_SLUG_RE)).min(1).max(4)`
- Remove `.refine` against `config.launchCategories`

- [ ] **Step 1: Extend the vendor apply test**

Keep waitlisted official still 400.

Add:

```ts
it("accepts a visible community slug with shop", async ({ skip }) => {
  if (!dbReachable) skip();
  const { db } = await import("@/lib/server/db");
  await db.q(
    `insert into categories (slug, label, kind, listing_mode, visible, open_for_apply, sort_order)
     values ($1, 'Vitest Cat', 'community', 'shop', true, true, 500)
     on conflict (slug) do nothing`,
    [communitySlug],
  );
  await request(server)
    .post("/api/vendors")
    .set("Authorization", `Bearer ${applicantAccess}`)
    .send({ name: "Community Vendor", categories: ["shop", communitySlug] })
    .expect(201);
});
```

Use `communitySlug = \`vitest-cat-${tag}\``. Cleanup delete that category if no products reference it.

- [ ] **Step 2: Run to see new case fail (or still pass if launch set accidentally includes it — it should fail 400 today)**

Run: `pnpm exec vitest run tests/api/vendors-launch-categories.test.ts`

Expected: new test FAIL 400 `bad_request`.

- [ ] **Step 3: Implementation**

`lib/server/schemas.ts`:

```ts
import { CATEGORY_SLUG_RE } from "@/lib/nakuru/category-slug";

const vendorApplySlug = z.string().regex(CATEGORY_SLUG_RE);

export const vendorNew = z
  .object({
    name: z.string().trim().min(2).max(60),
    categories: z.array(vendorApplySlug).min(1).max(4),
    imageDataUrl: imageDataUrl.optional(),
  })
  .strict();
```

Remove `vendorApplyCategory` enum and `launchCategorySet` refine.

`lib/server/vendors.ts` `applyVendor`: replace `categoriesAllowedAtLaunch` with:

```ts
if (!(await slugsAllowedForApply(categories))) {
  throw new VendorError(400, "bad_request");
}
```

Keep `categoriesAllowedAtLaunch` unused or delete it and its `config.launchCategories` usage here. Do not remove `config.launchCategories` in this task unless nothing else imports it.

- [ ] **Step 4: Run tests**

Run: `pnpm exec vitest run tests/api/vendors-launch-categories.test.ts tests/api/categories.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/server/schemas.ts lib/server/vendors.ts tests/api/vendors-launch-categories.test.ts
git commit -m "feat: validate vendor apply categories against directory"
```

---

### Task 5: Public listings filter any visible slug

**Files:**
- Modify: `lib/server/catalog.ts`
- Modify: `lib/nakuru/listings-map.ts`
- Create: `tests/api/listings-category.test.ts`

**Interfaces:**
- `PublicListingRow` adds `listingMode: ListingMode` and `categoryLabel: string`
- `listPublicListings(category)`:
  - null / `""` / `"all"` → no category filter
  - else lookup `categories` where `slug=$1 and visible`; if missing return `[]`
  - else `p.category = $1`
- `toProductCardItem` sets `c`, `listingMode`, `categoryLabel`

- [ ] **Step 1: Write failing test**

Insert official-approved vendor + community category + product with that slug. `GET /api/listings?category=<slug>` returns that id. `GET /api/listings?category=shop` does not include it. Hide the category (`update categories set visible=false`) then GET that slug returns `[]`. Unknown slug `no-such-cat` returns `[]` with 200.

Cleanup products, vendor, user, community category.

- [ ] **Step 2: Run — expect FAIL or empty because catalog still ignores unknown slugs as “all”**

Today unknown category becomes `null` and returns **all** listings. The test must assert empty array so this FAIL is real.

- [ ] **Step 3: Implement catalog SQL**

```sql
select p.id, p.category, c.label as "categoryLabel", c.listing_mode as "listingMode",
       p.title, p.description, p.emoji, p.image_url as "imageUrl",
       coalesce(p.gallery_urls, '{}') as "galleryUrls",
       coalesce(p.attributes, '{}')::jsonb as attributes,
       p.price_kes::int price, v.name vendor, v.id as "vendorId", v.verified
from products p
join vendors v on v.id = p.vendor_id
join categories c on c.slug = p.category
where p.active
  and v.status = 'approved'
  and c.visible
  and (p.stock is null or p.stock > 0)
  and ($1::text is null or p.category = $1)
```

For the filter param:

```ts
async function visibleSlugOrNone(category: string | null | undefined): Promise<string | null | undefined> {
  if (!category || category === "all") return null; // null means no extra filter
  const row = await q<{ slug: string }>(
    "select slug from categories where slug=$1 and visible",
    [category],
  );
  if (!row.rows[0]) return "__none__"; // sentinel
}
```

If sentinel, return `[]` without querying products.

Remove `PUBLIC_CATEGORIES` allowlist.

Update `getPublicListingById` to join `categories` and require `c.visible` so hidden-category listings drop off public detail too.

`listings-map.ts`:

```ts
export type ApiListing = {
  id: string;
  category: string;
  categoryLabel?: string;
  listingMode?: ListingMode;
  // ...existing
};

export function toProductCardItem(api: ApiListing): Listing {
  const mode = api.listingMode ?? (api.category === "services" ? "services" : api.category === "property" || api.category === "cars" ? api.category : "shop");
  // subtitle unchanged except services description
  return {
    ...
    c: api.category,
    listingMode: mode,
    categoryLabel: api.categoryLabel,
  };
}
```

- [ ] **Step 4: Run test**

Run: `pnpm exec vitest run tests/api/listings-category.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/server/catalog.ts lib/nakuru/listings-map.ts tests/api/listings-category.test.ts
git commit -m "feat: filter public listings by directory slug"
```

---

### Task 6: Checkout and inquiries use listing_mode

**Files:**
- Modify: `lib/server/orders.ts` (product select ~line 174)
- Modify: `lib/server/inquiries.ts` (`createServiceInquiry`)
- Modify: `tests/api/inquiries.test.ts` (shop product still not inquirable; add community services-mode case only if easy — at minimum keep existing shop vs services)

**Interfaces:**
- Orders: join `categories c on c.slug = p.category and c.listing_mode = 'shop'` instead of `p.category = 'shop'`
- Inquiries: join categories; reject unless `listing_mode = 'services'` (replace `product.category !== "services"`)

- [ ] **Step 1: Write failing test in `tests/api/listings-category.test.ts` or new `tests/api/orders-listing-mode.test.ts`**

Create community slug `listing_mode=shop`, approved vendor with that category, product, customer `POST /orders` with that `productId` should not 409 `unavailable` for category reasons.

If wiring `POST /orders` is heavy, unit-test by calling `createOrder` from `lib/server/orders.ts` the same way other tests call routes.

Also: product with `listing_mode=services` must still fail order create (`unavailable` or existing error).

Copy auth/body patterns from any existing orders test; if none exist, use `createTestServer` with `POST` from `app/api/orders/route.ts` (glob if path differs: `app/api/orders/route.ts`).

- [ ] **Step 2: Run — community shop-mode order FAIL while SQL still requires `p.category = 'shop'`**

- [ ] **Step 3: Change SQL**

Orders:

```sql
select p.id, p.title, p.price_kes, p.stock, p.vendor_id, v.verified, v.owner_id
from products p
join vendors v on v.id = p.vendor_id
join categories c on c.slug = p.category
where p.id = any($1::uuid[])
  and p.active
  and c.listing_mode = 'shop'
  and v.status = 'approved'
```

Inquiries product fetch: add `c.listing_mode`, check `listing_mode !== "services"` → `not_a_service`.

- [ ] **Step 4: Run** `pnpm exec vitest run tests/api/inquiries.test.ts tests/api/orders-listing-mode.test.ts tests/api/listings-category.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/server/orders.ts lib/server/inquiries.ts tests/api/inquiries.test.ts tests/api/orders-listing-mode.test.ts
git commit -m "feat: gate cart and quotes on listing_mode"
```

---

### Task 7: Product APIs accept directory slugs

**Files:**
- Modify: `lib/server/schemas.ts` (`cat` → slug regex for `productNew` / `productUpd`)
- Modify: `lib/server/products.ts` (stock when `listing_mode === 'shop'`; services price 0 behavior when mode is services)

**Interfaces:**
- `productNew.category`: `z.string().regex(CATEGORY_SLUG_RE)`
- `createProduct` / `updateProduct`: load `getCategoryBySlug`; 400 if missing; stock applied iff `listing_mode === 'shop'`; if `listing_mode === 'services'` keep current services stock-null behavior

- [ ] **Step 1: Add API test `tests/api/vendor-products-category.test.ts`**

Approved vendor with `categories = {shop, fashionSlug}`. `POST /api/vendor/products` with `category: fashionSlug` → 201. Same vendor `category: 'services'` → 403 `category_not_approved`.

- [ ] **Step 2: Run — expect FAIL on schema enum 400**

- [ ] **Step 3: Implement schema + `createProduct` listing_mode lookup**

```ts
const cat = z.string().regex(CATEGORY_SLUG_RE);
```

In `createProduct` after vendor check:

```ts
const dir = await getCategoryBySlug(data.category);
if (!dir) throw new ProductError(400, "bad_request");
const stock =
  dir.listing_mode === "shop"
    ? data.stock === undefined ? null : data.stock
    : null;
```

On category change in update, same lookup; if new mode is `services`, set stock null as today.

- [ ] **Step 4: Run tests**

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/server/schemas.ts lib/server/products.ts tests/api/vendor-products-category.test.ts
git commit -m "feat: allow product categories from the directory"
```

---

### Task 8: Approved vendor can append a category

**Files:**
- Create: `app/api/vendors/mine/categories/route.ts`
- Modify: `lib/server/vendors.ts` — `appendVendorCategory(ownerId, labelOrSlug)`
- Modify: `tests/api/categories.test.ts` or new `tests/api/vendor-append-category.test.ts`

**Interfaces:**

```ts
export async function appendVendorCategory(
  ownerId: string,
  input: { label?: string; slug?: string },
): Promise<{ categories: string[]; category: CategoryPublicRow }>
```

Logic:

1. Load approved vendor for owner (same as products). 403 `no_approved_vendor` if none.
2. Resolve row: if `label`, `upsertCommunityCategory`; if `slug`, `getCategoryBySlug` (must be visible + open_for_apply) else 400.
3. If `vendor.categories.includes(row.slug)` return current list (200).
4. If `vendor.categories.length >= 4` → 400 `category_limit`.
5. `update vendors set categories = array_append(categories, $slug) where id=$id`.
6. Return `{ categories, category }`.

Route `POST`, body `z.object({ label: z.string().optional(), slug: z.string().regex(CATEGORY_SLUG_RE).optional() }).strict().refine(d => d.label || d.slug)`.

Auth: customer/vendor bearer.

- [ ] **Step 1: Failing test** — approved vendor POST label `More ${tag}` → categories length 2 including new slug.

- [ ] **Step 2: Implement**

- [ ] **Step 3: Test 5th append → 400 `category_limit`**

- [ ] **Step 4: Commit**

```bash
git add app/api/vendors/mine/categories/route.ts lib/server/vendors.ts tests/api/vendor-append-category.test.ts
git commit -m "feat: let approved vendors add directory categories"
```

---

### Task 9: Staff category APIs

**Files:**
- Create: `app/api/admin/categories/route.ts` (`GET`, `POST`)
- Create: `app/api/admin/categories/[slug]/route.ts` (`PATCH`)
- Modify: `lib/nakuru/staff-api.ts` — `StaffCategoryRow` type (optional; UI task can import)
- Create: `tests/api/admin-categories.test.ts`

**Interfaces:**
- GET all rows including hidden (admin/support)
- POST `{ label, listingMode, openForApply }` → `staffCreateOfficial`
- PATCH body `{ visible?, listingMode?, openForApply?, label? }`

Because `createTestServer` has no dynamic `[slug]`, PATCH tests call `staffPatchCategory` directly.

- [ ] **Step 1: Failing tests** — admin GET includes `visible`; hide community slug via `staffPatchCategory`; `listVisibleCategories` omits it.

Unauth GET `/api/admin/categories` → 401.

- [ ] **Step 2: Implement routes** mirroring `app/api/admin/vendors/route.ts` auth.

Zod:

```ts
export const staffCategoryNew = z.object({
  label: z.string().trim().min(2).max(40),
  listingMode: z.enum(["shop", "services", "property", "cars"]),
  openForApply: z.boolean(),
}).strict();

export const staffCategoryPatch = z.object({
  visible: z.boolean().optional(),
  listingMode: z.enum(["shop", "services", "property", "cars"]).optional(),
  openForApply: z.boolean().optional(),
  label: z.string().trim().min(2).max(40).optional(),
}).strict();
```

- [ ] **Step 3: Run tests** — PASS

- [ ] **Step 4: Commit**

```bash
git add app/api/admin/categories lib/server/schemas.ts tests/api/admin-categories.test.ts
git commit -m "feat: add staff category directory APIs"
```

---

### Task 10: Sell form loads directory and Add field

**Files:**
- Create: `lib/nakuru/use-categories.ts`
- Modify: `components/app/vendor/VendorApplyForm.tsx`
- Modify: `lib/nakuru/api.ts` only if needed (reuse `apiFetch`)

**Interfaces:**
- `useCategories()` → `{ rows: DirectoryCategory[]; loading: boolean }`
  - fetch `GET /api/categories` (`skipAuthRetry: true` ok for GET)
  - on failure, `OFFICIAL_DIRECTORY_FALLBACK`
  - map API camelCase into `DirectoryCategory` (`visible: true` implied)

Apply form:

- Replace `CATS` + `LAUNCH_CATEGORIES` env filter with `rows`.
- Chips: `openForApply` tappable; official && !openForApply disabled with `(soon)` / keep waitlist wording for `stays`/`taxi` using existing `SOON` map when slug is in `SOON`.
- Selected state: `string[]` default `["shop"]` if shop still open else first open slug.
- Under chips:

```tsx
<label htmlFor="vendor-apply-cat">Add a category</label>
<div className="row">
  <input id="vendor-apply-cat" maxLength={40} value={catDraft} onChange=... placeholder="e.g. Fashion" />
  <button type="button" className="btn s" onClick={onAddCustom}>Add</button>
</div>
{catError ? <div className="err">{catError}</div> : null}
```

`onAddCustom`: POST `/api/categories` `{ label: catDraft }`. On 201/200, toggle slug into `categories` (max 4, min 1 same as `toggleCategory`). On 409 `category_hidden`: `That category is closed. Pick another.` On 401: `Sign in with your email code first.` On 400: `Use 2–40 letters or numbers.`

Submit still `POST /api/vendors` with selected slugs.

- [ ] **Step 1: Implement hook + form** (no component test harness in repo; verify with `pnpm exec tsc --noEmit` or `pnpm lint` plus `pnpm test`)

- [ ] **Step 2: Manual check in browser** — Account → Sell: chips from API; add “Fashion”; submit still requires name.

- [ ] **Step 3: Commit**

```bash
git add lib/nakuru/use-categories.ts components/app/vendor/VendorApplyForm.tsx
git commit -m "feat: load sell-form categories from the directory"
```

---

### Task 11: Browse, search, and cart use directory

**Files:**
- Modify: `components/app/AppHeader.tsx` (tabs from `useCategories`)
- Modify: `components/app/category/CategoryPanel.tsx` (Featured community tiles)
- Modify: `lib/nakuru/use-catalog-listings.ts` (search includes `c`, `categoryLabel`)
- Modify: `components/app/ProductCard.tsx` (`listingMode === "shop"` not `c === "shop"`)
- Modify: `components/app/ProductDetailView.tsx` (same)
- Modify: `lib/nakuru/reducer.ts` `ITEM_ACT` (demo items: `item.c === "shop"` still fine; live items may use `listingMode`)
- Modify: `lib/nakuru/listing-detail.ts` if shop subtitle uses `c === "shop"`
- Add helper `lib/nakuru/listing-mode.ts`:

```ts
import type { Listing, ListingMode } from "@/lib/nakuru/types";

export function listingModeOf(item: Listing): ListingMode {
  if (item.listingMode) return item.listingMode;
  if (item.c === "services" || item.c === "property" || item.c === "cars") {
    return item.c;
  }
  return "shop";
}
```

Use `listingModeOf` everywhere the UI currently branches on `item.c === "shop"` / `"services"` for **actions** (cart, quote). Do not change image aspect unless needed (`listing-image.ts` can use `listingModeOf`).

**Header tab order:** button All (`cat=all`) → official `openForApply` → official !open (disabled, `soon` class) → community (`kind==="community"`). Labels: official via `homeCategoryLabel(slug as CategoryId, lang)` when slug is a `CategoryId`; else `row.label`.

**Featured:** after `FEAT` / `TOPC` grid, map community rows to `CategoryTile` icon `"shopping-bag"` (or existing `CategoryIconKey` closest: `shirt` if shopping-bag not in keys — use `CategoryTile`’s allowed icons; if only keys from `category-icons.tsx`, pick `"shirt"` or `"grid"`), tint `"teal"`, `onActivate` → `dispatch({ type: "SET_CAT", cat: row.slug })` and `SET_TAB` home or cat listings as current `SET_CAT` does.

**Search filter** in `use-catalog-listings.ts`:

```ts
return items.filter((i) =>
  (i.t + i.s + i.c + (i.categoryLabel ?? "")).toLowerCase().includes(q),
);
```

Apply the same in `fetchListings` helper.

**`use-catalog-listings` category type:** `string | "all" | null`.

- [ ] **Step 1: Add `lib/nakuru/listing-mode.test.ts`**

```ts
it("defaults community slug to shop", () => {
  expect(listingModeOf({ c: "fashion" } as Listing)).toBe("shop");
});
it("honors listingMode", () => {
  expect(listingModeOf({ c: "fashion", listingMode: "services" } as Listing)).toBe("services");
});
```

- [ ] **Step 2: Implement helper + replace CTA checks**

- [ ] **Step 3: Tabs + Featured + search**

- [ ] **Step 4: `pnpm exec vitest run lib/nakuru/listing-mode.test.ts` and `pnpm lint`**

- [ ] **Step 5: Browser** — add community listing (or seed), tab appears, tap filters, search “fashion” from All, Add to cart works.

- [ ] **Step 6: Commit**

```bash
git add lib/nakuru/listing-mode.ts lib/nakuru/listing-mode.test.ts components/app/AppHeader.tsx components/app/category/CategoryPanel.tsx lib/nakuru/use-catalog-listings.ts components/app/ProductCard.tsx components/app/ProductDetailView.tsx lib/nakuru/reducer.ts lib/nakuru/listing-detail.ts lib/nakuru/listing-image.ts
git commit -m "feat: browse and cart follow the category directory"
```

---

### Task 12: Vendor product form follows listing_mode

**Files:**
- Modify: `components/app/vendor/VendorProductForm.tsx`
- Modify: `components/app/views/VendorView.tsx` (approved categories as `string[]`)

**Interfaces:**
- `approvedCategories: string[]`
- Load `useCategories()` to resolve `listingMode` and labels
- Publish picker: all approved slugs whose directory `listingMode` is `shop` or `services` (property/cars still not in this form)
- Stock field when selected mode is shop
- Add field: `POST /api/vendors/mine/categories` `{ label }`, then refresh parent `onApplied`/reload mine — pass `onCategoriesChange?: () => void` from `LiveVendorPanel` (`loadMine`)
- If 400 `category_limit`: toast `You already have 4 categories. Remove one before adding.`
- `TOOLS[c]` dashboard cards: only show for official slugs present in `TOOLS`; community slugs get a simple card with directory label

- [ ] **Step 1: Replace `PUBLISH_CATEGORIES` filter** with approved slugs mapped through directory rows; fallback listingMode shop if row missing

- [ ] **Step 2: Add category field + reload**

- [ ] **Step 3: Typecheck / lint**

- [ ] **Step 4: Browser** — approved vendor adds “Fashion”, publishes a priced item, it appears under Fashion tab

- [ ] **Step 5: Commit**

```bash
git add components/app/vendor/VendorProductForm.tsx components/app/views/VendorView.tsx
git commit -m "feat: vendor listings use directory listing modes"
```

---

### Task 13: Staff category panel

**Files:**
- Create: `components/staff/StaffCategoryPanel.tsx`
- Modify: `app/staff/page.tsx` — render panel under `StaffVendorQueue`
- Modify: `lib/nakuru/staff-api.ts` — export `StaffCategoryRow`

**UI (match existing staff queue: `.card`, `.btn s`, `.warn`):**

- Load `GET /api/admin/categories`
- Table: label, slug, kind, listing mode `<select>`, open checkbox, visible checkbox
- PATCH on change
- Form: label, listing mode, open-for-apply, button “Add official”

- [ ] **Step 1: Implement panel using `staffFetch`**

- [ ] **Step 2: Hide a community category in staff UI; confirm public GET omits it and header tab gone after refresh**

- [ ] **Step 3: Commit**

```bash
git add components/staff/StaffCategoryPanel.tsx app/staff/page.tsx lib/nakuru/staff-api.ts
git commit -m "feat: staff can hide and open category directory rows"
```

---

## Spec coverage (self-review)

| Spec item | Task |
|-----------|------|
| `categories` table + seed | 2 |
| Slug rules / reuse / reserved `all` | 1, 3 |
| `GET/POST /api/categories` | 3 |
| Apply chips + Add | 10 |
| Apply 1–4, waitlist official blocked, community allowed | 4 |
| Append after approval cap 4 | 8, 12 |
| Listings filter + hidden empty | 5 |
| Search by label | 11 |
| Header tabs + Featured tiles, not rail/TOPC strip | 11 |
| Fetch fallback | 10 |
| `listing_mode` cart/quotes | 6, 11 |
| Product slug + stock | 7, 12 |
| Staff list/hide/mode/open/add official | 9, 13 |
| Rate limit 20/day | 3 |
| Hidden name 409 copy | 3, 10 |
| No merge tool / no Home strip injection | out of scope |

## Placeholder scan

No TBD. PATCH `[slug]` HTTP is tested via `staffPatchCategory` because `createTestServer` has no dynamic routes.

## Type consistency

- API JSON: `listingMode`, `openForApply`, `sortOrder`
- DB: `listing_mode`, `open_for_apply`, `sort_order`
- UI `DirectoryCategory` matches public JSON plus `visible` on admin rows
