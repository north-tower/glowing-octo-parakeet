# Jiji-style category tree — design spec

**Status:** Approved (user sign-off 2026-11-23)  
**Date:** 2026-11-23  
**Repo:** `C:\Users\mhki\hub`  
**Related:** [Category directory](./2026-11-20-category-directory-design.md), [Category page redesign](./2026-11-22-category-page-redesign-design.md)

---

## 1. Summary

Expand NakuruHub’s flat category directory to a **hierarchical tree** comparable in breadth to [Jiji.co.ke](https://jiji.co.ke/): many top-level verticals and subcategories for browse and listing placement. Existing official slugs (`shop`, `property`, `cars`, …) are **remapped** to new canonical slugs with **aliases** so old URLs, vendor arrays, and bookmarks keep working.

Checkout and inquiries still follow **`listing_mode`** on each row (inherited from the vertical root unless overridden).

---

## 2. Goals and success criteria

### Goals

1. Shoppers browse top-level verticals then drill into children (Jiji-style).
2. Listings are filed under **leaf** categories; browsing a parent shows **all descendant** listings.
3. Seed officials from Jiji Kenya’s public category nav (17 roots + first-level children), plus Nakuru-specific roots where needed.
4. One-time migration remaps `products.category` and `vendors.categories` from legacy flat slugs.
5. Staff can hide nodes; tree import can grow in phase 2 (jobs/CVs depth).

### Success criteria

| Criterion | Measure |
|-----------|---------|
| Tree in API | `GET /api/categories?format=tree` returns nested visible officials |
| Subtree filter | `/api/listings?category=vehicles` includes `cars`, `buses`, etc. |
| Leaf-only publish | `POST /api/products` rejects non-leaf slugs |
| Legacy slugs | `?category=shop` and vendor `shop` resolve via alias + remap |
| Apply unchanged cap | Vendors still select **1–4 roots** on apply; sell form picks **leaves** under those roots |
| Checkout | `listing_mode` still drives cart vs quote (inherited from root) |

### Non-goals (this spec)

- Jiji-style **per-category filters** (make, bedrooms, job salary band) — separate spec.
- Auto-sync/scrape Jiji on a schedule.
- Bulk delete of official nodes (hide only).
- i18n of every new label (English label in DB; Swahili maps added incrementally).
- Replacing the Home **TOPC** strip with the full tree (strip stays curated shortcuts pointing at real slugs).

---

## 3. Decisions (locked)

| Topic | Decision |
|-------|----------|
| Tree shape | Adjacency list: `parent_slug` self-FK on `categories` |
| Max depth | Official: **3** (root → child → grandchild). Community: **leaf only**, depth **2** (under a chosen parent) |
| Listing attachment | **Leaves only** for `products.category` |
| Browse filter | Parent slug = **subtree** (recursive descendants), not exact match |
| Legacy slugs | `category_aliases` table + one-time SQL remap |
| Nakuru-only roots | **Stays**, **Taxi**, **Rider** remain **top-level** officials (not nested under Jiji groups) |
| `shop` | Deprecated as a listing slug; alias → browse root mapping; existing shop listings → default leaf `general-merchandise` under `business-and-industry` unless attributes suggest a finer leaf |
| `property` | Alias to `real-estate`; listings remapped by attributes when possible, else `houses-apartments-for-sale` |
| `cars` | Stays slug `cars` as **child** of `vehicles` |
| Vendor apply | Profile `vendors.categories` holds **root** slugs only (verticals vendor may sell in) |
| Vendor sell | Product `category` must be a **visible leaf** whose **ancestor root** is in the vendor profile |
| Community create | Must set `parent_slug` to a visible official **root or depth-1** node; defaults to `business-and-industry` if omitted |
| Label length | Increase to **2–60** characters (Jiji names) |

---

## 4. Amendments to prior specs

| Prior decision | Change |
|----------------|--------|
| Category directory: flat table | Tree via `parent_slug` / `depth` |
| Listings filter exact slug | Subtree filter |
| Category rail: fixed six/seven officials | Rail shows **roots** (`depth = 0`); may scroll; Featured/Browse drill into children |
| Category page redesign: six browse types | Superseded for browse UX by drill-down; Stays/Taxi/Rider roots kept |
| Vendor profile slugs | Roots only after migration (aliases rewrite old flat slugs to roots) |

---

## 5. Data model

### 5.1 `categories` (alter)

New columns:

| Column | Type | Notes |
|--------|------|--------|
| `parent_slug` | `text` null | FK → `categories(slug)`. `null` = root |
| `depth` | `smallint` not null default `0` | 0 = root; check `depth <= 3` |

Checks (migration):

- `parent_slug` not equal to `slug`
- Root rows: `parent_slug is null and depth = 0`
- Child rows: `depth = parent.depth + 1`

`listing_mode` on children: default **same as root ancestor** at insert time; staff may override on a row.

**Leaf rule:** application enforces at product insert/update:

```sql
not exists (
  select 1 from categories c2
  where c2.parent_slug = categories.slug and c2.visible
)
```

Hidden children do not block listing on parent if parent is promoted to leaf (edge case: staff hides all children — parent becomes listable).

### 5.2 `category_aliases`

| Column | Type | Notes |
|--------|------|--------|
| `alias_slug` | `text` PK | Old or alternate slug |
| `canonical_slug` | `text` not null | FK → `categories.slug` |
| `note` | `text` null | e.g. `legacy flat shop` |

Resolves:

- Public `GET /api/listings?category=` and SEO paths
- Optional rewrite when reading `vendors.categories` (canonical = **root** for profile)

Seed aliases (minimum):

| alias_slug | canonical_slug | Use |
|------------|----------------|-----|
| shop | business-and-industry | Browse + vendor root remap |
| property | real-estate | Browse + vendor root remap |
| services | services | Same slug; ensure root row exists |

(`cars` remains canonical child `cars` under `vehicles` — no alias row unless we add `cars-root`.)

### 5.3 Helper: category subtree

Postgres function or inlined CTE used by catalog and tests:

```sql
with recursive subtree as (
  select slug from categories where slug = $1
  union all
  select c.slug from categories c
  join subtree s on c.parent_slug = s.slug
  where c.visible
)
select slug from subtree;
```

---

## 6. Jiji Kenya seed (phase 1)

Source: Jiji homepage nav + first child links per vertical (2026-11-23 scrape). Slugs match Jiji URL segments where possible.

### 6.1 Roots (`depth = 0`)

| slug | label | listing_mode | sort_order | open_for_apply |
|------|-------|--------------|------------|----------------|
| vehicles | Vehicles | cars | 10 | false |
| real-estate | Real Estate | property | 20 | false |
| mobile-phones-tablets | Mobile Phones & Tablets | shop | 30 | true |
| electronics | Electronics | shop | 40 | true |
| home-garden | Home, Furniture & Appliances | shop | 50 | true |
| fashion-and-beauty | Fashion & Beauty | shop | 60 | true |
| health-and-beauty | Health & Beauty | shop | 70 | true |
| babies-and-kids | Babies & Kids | shop | 80 | true |
| animals-and-pets | Animals & Pets | shop | 90 | true |
| agriculture-and-foodstuff | Agriculture & Food | shop | 100 | true |
| hobbies-art-sport | Hobbies, Sports & Outdoors | shop | 110 | true |
| office-and-commercial-equipment-tools | Commercial Equipment | shop | 120 | true |
| repair-and-construction | Repair & Construction | services | 130 | true |
| business-and-industry | Business & Industry | shop | 140 | true |
| jobs | Jobs | services | 150 | false |
| seeking-work-cvs | Seeking Work & CVs | services | 160 | false |
| services | Services | services | 170 | true |
| stays | Stays | shop | 180 | true |
| taxi | Taxi | services | 190 | true |
| rider | Rider | services | 195 | true |

Legacy flat rows (`shop`, `property`, etc.) are **removed or hidden** after remap; aliases preserve inbound links.

### 6.2 Children (`depth = 1`, parent = root slug)

| parent | child slugs |
|--------|-------------|
| vehicles | buses, car-parts-and-accessories, cars, motorcycles-and-scooters |
| real-estate | houses-apartments-for-rent, houses-apartments-for-sale, new-builds, temporary-and-vacation-rentals |
| mobile-phones-tablets | cell-phones-tablets-accessories, mobile-phones, smart-watches, tablets |
| electronics | audio-and-music-equipment, computers-and-laptops, tv-dvd-equipment, video-games-and-consoles |
| home-garden | decor-accessories, furniture, lighting, storage-organization |
| fashion-and-beauty | baby-kids-fashion, mens-fashion, womens-fashion |
| health-and-beauty | bath-body, hair-beauty, oral-care, skin-care |
| babies-and-kids | childrens-clothing, childrens-furniture, childrens-shoes, toys |
| animals-and-pets | cats-and-kittens, dogs-and-puppies, fish, pets-accessories |
| agriculture-and-foodstuff | farm-machinery-equipment, feeds-supplements-seeds, livestock-and-poultry, meals-and-drinks |
| hobbies-art-sport | massagers, musical-instruments, personal-mobility, sports-bicycles-and-fitness |
| office-and-commercial-equipment-tools | manufacturing-equipments, manufacturing-materials-and-tools, medical-equipment, safety-equipment |
| repair-and-construction | building-materials, plumbing-and-water-supply, power-equipments, power-tools |
| business-and-industry | business-for-sale-and-investment, business-services, import-export-and-logistics, wholesale-and-bulk, **general-merchandise** |
| jobs | accounting-and-finance-jobs, advertising-and-marketing-jobs, arts-and-entertainment-jobs, childcare-and-babysitting-jobs |
| seeking-work-cvs | accounting-and-finance-cvs, advertising-and-marketing-cvs, arts-and-entertainment-cvs, childcare-and-babysitting-cvs |
| services | automotive-services, building-and-trades-services, computer-and-it-services, repair-services |
| stays | bnb-apartments, hotels, short-stays, all-stays |
| taxi | airport-rides, town-rides, boda, all-taxi |
| rider | delivery-rider, courier, boda-rider, all-riders |

`general-merchandise` is a **hub-only** leaf for unmigrated shop inventory. Stays/taxi/rider children mirror today’s TOPC shortcuts (slug names normalized to directory rules).

### 6.3 Phase 2 seed file

Add `data/jiji-ke-categories.json` (curated) for remaining job/CV children and any depth-2 nodes (e.g. car makes). Imported via migration or staff script; not blocking phase 1.

---

## 7. Legacy remap (one-time migration)

### 7.1 `products.category`

| From | To | Rule |
|------|-----|------|
| shop | general-merchandise | Default |
| shop | mobile-phones / mens-fashion / … | If `attributes.type` or `attributes.slug` matches a TOPC filter slug → map to nearest leaf (implementation table in migration) |
| property | houses-apartments-for-rent | `attributes` contains rent intent |
| property | houses-apartments-for-sale | else default |
| property | new-builds | attribute `new-build` |
| cars | cars | unchanged slug under vehicles |
| services | repair-services | default |
| stays | bnb-apartments / hotels / short-stays | match TOPC keys |
| taxi | airport-rides / town-rides / boda | match TOPC keys |
| rider | delivery-rider / courier / boda-rider | match TOPC keys |

### 7.2 `vendors.categories`

Rewrite each slug through **alias → root**:

| Legacy | After |
|--------|--------|
| shop | business-and-industry |
| property | real-estate |
| cars | vehicles |
| services | services |
| stays | stays |
| taxi | taxi |
| rider | rider |

Deduplicate array; if more than 4 roots, keep first 4 by prior order and log for staff review (should not happen in production).

### 7.3 Post-remap cleanup

- Set legacy flat rows `shop`, `property` to `visible = false` if not removed (prefer delete after FK updates).
- Verify no `products.category` or `vendors.categories` reference hidden/removed slugs.

---

## 8. APIs

### 8.1 `GET /api/categories`

Query params:

| Param | Behavior |
|-------|----------|
| (none) | Flat visible list (backward compatible); each row adds `parentSlug`, `depth` |
| `format=tree` | Nested `{ slug, label, children: [...] }` for roots only (full tree) |
| `parent=<slug>` | Direct children of `parent`, visible, ordered by `sort_order` |

Response fields (add): `parentSlug`, `depth`, `hasChildren` (computed).

### 8.2 `GET /api/listings?category=`

1. Resolve `category` through `category_aliases` if present.
2. If slug not found or hidden → empty list (`NO_MATCH` behavior unchanged).
3. If slug is **leaf** → filter `p.category = slug`.
4. If slug has children → filter `p.category in (subtree slugs excluding non-leaves OR only leaves in subtree)` — **listings only on leaves**, so subtree = all descendant **leaves**.

### 8.3 `POST /api/products` / PATCH

- Category must be visible **leaf**.
- Vendor must have the **root ancestor** of that leaf in `vendors.categories`.

### 8.4 `POST /api/vendors` (apply)

- `categories` array: **roots only** (`depth = 0`), visible, `open_for_apply` rules unchanged.

### 8.5 `POST /api/categories` (community)

- Body: `{ label, parentSlug?: string }`.
- `parentSlug` required to be official visible node with `depth < 2` (community leaf at depth 2).
- Upsert community leaf; `listing_mode` copy from parent root.

### 8.6 Staff

- `PATCH /api/admin/categories/:slug` may set `parent_slug` with cycle/depth validation.
- `POST /api/admin/categories` may create official node with `parentSlug`.

---

## 9. UI

### 9.1 Category tab

- **Rail:** all visible roots (`depth = 0`), sorted; Stays/Taxi/Rider at end; scroll on small screens.
- **Panel:** selecting a root shows **child tiles** (depth 1); tapping a child with grandchildren shows next level; tapping a leaf sets listing filter and shows listings grid.
- **Breadcrumb:** root › child › leaf above listings.

### 9.2 Home

- Header tabs: **roots** (All + officials + community roots).
- TOPC: update slug references to real leaves (`mobile-phones`, `cars`, etc.).

### 9.3 Vendor apply

- Chips: **roots** with `open_for_apply`.
- Copy: “Choose up to 4 marketplace sections.”

### 9.4 Vendor product form

- Two-step or grouped picker: roots from profile → leaves under selected root.

### 9.5 Staff panel

- Tree table: label, slug, parent, depth, visible, listing_mode, open_for_apply; expand rows.

---

## 10. Implementation phases

| Phase | Deliverable |
|-------|-------------|
| **1** | Migration `013_category_tree.sql`: columns, aliases, seed, remap, leaf checks; server subtree + APIs; catalog filter; UI drill-down; update fallbacks in `category-directory.ts` / constants |
| **2** | `data/jiji-ke-categories.json` + `014_jiji_category_phase2.sql`; SEO subtree + alias redirects on `/nakuru/*` (done 2026-11-23) |
| **3** | Staff tree editor; optional alias admin |

---

## 11. Testing

- Unit: slug resolve, alias resolve, `ancestorRoot(slug)`, leaf detection.
- API: subtree listings count (parent > sum of children leaves); product reject non-leaf; vendor apply rejects depth > 0; community requires parent.
- Migration idempotency on empty vs seeded DB (follow patterns in `tests/api/categories.test.ts`).

---

## 12. Risks

| Risk | Mitigation |
|------|------------|
| Jobs tree incomplete in phase 1 | Seed 4 children each; phase 2 JSON |
| Shop listings all in one bucket | TOPC attribute map + staff recategorize later |
| Rail overcrowding (20 roots) | Horizontal scroll; “More” sheet if needed in phase 1.1 |
| Vendor confusion roots vs leaves | Sell form only shows leaves; apply only roots |

---

## 13. Approval

User approved this design in chat on **2026-11-23**. Implementation proceeds via `writing-plans` after spec review.