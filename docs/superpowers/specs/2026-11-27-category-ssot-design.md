# Category single source of truth — design spec

**Status:** Approved (implementation in progress)  
**Date:** 2026-11-27  
**Repo:** `C:\Users\mhki\hub`  
**Related:** [Category directory](./2026-11-20-category-directory-design.md), [Jiji-style category tree](./2026-11-23-jiji-category-tree-design.md)

---

## 1. Summary

NakuruHub already stores the catalog in Postgres `categories`, but several UIs still ship **their own slug lists**. The sell form can look like two systems because the vendor **shop section is a root** and the listing **category is a leaf**.

This spec makes **`categories` + `GET /api/categories` the only catalog**. Every browse, apply, publish, header, landing, and SEO surface **filters that tree**. Hardcoded groups and fallback snippets are replaced by:

1. The **full official tree** already seeded in migrations (013, 014, 012, 019, plus legacy roots), mirrored in `OFFICIAL_DIRECTORY_FALLBACK` for offline/SEO.
2. **Community** rows from the live API (never duplicated in source).
3. A **presentation map** (icon, tint, image) keyed by slug — not a second category list.

The sell form shows one picker of allowed leaves and a breadcrumb `Root › Leaf`.

---

## 2. Goals and success criteria

### Goals

1. One tree for the whole app: official + community, roots + leaves.
2. Incorporate **every category we already have** (DB seed, browse tiles, fallback, landing, demo `CATS`, root images, aliases).
3. Sell form uses that tree only: breadcrumb + leaf picker.
4. Presentation (art/icons) stays out of listing rules.

### Success criteria

| Criterion | Measure |
|-----------|---------|
| No second catalog | `BROWSE_CATEGORY_GROUPS` is not a slug source; browse tiles come from `useCategories()` roots |
| Full official set | Fallback includes every official slug from migrations 013 + 014 + remaining roots (`services`, `stays`, `taxi`, `rider`) |
| Community | Visible community leaves appear in browse/search/picker after API load |
| Sell form | One picker; selected value shown as `parentLabel › leafLabel` |
| Legacy | `shop` / `property` remain aliases, not extra browse tiles |
| Filter/landing/demo | Those screens use directory roots (or aliases resolved to roots), not closed `CategoryId` unions |
| Tests | Completeness test: every presentation-map slug and every seeded official slug exists in fallback |

### Non-goals

- Changing checkout (`listing_mode` still on each row).
- Scraping Jiji or adding new official names beyond what we already seed.
- Putting Home TOPC shortcuts (phone, tv, toyota, …) into `categories` — they stay curated links.
- i18n of every official label in this pass (English from DB; existing Swahili maps for legacy ids can remain until a later i18n spec).
- Storing icons/tints in Postgres.

---

## 3. Decisions (locked)

| Topic | Decision |
|-------|----------|
| Catalog | Postgres `categories` is the only source of truth |
| Read path | `GET /api/categories`; client `useCategories()` |
| Offline/SEO | `OFFICIAL_DIRECTORY_FALLBACK` = **complete official tree** (copy of seeded officials, including jobs/CV children from 014) |
| Community | API only; fallback does not invent community names |
| Incorporate existing | Union of migration seeds + browse slugs + root-image slugs + landing labels that map to real slugs |
| Presentation | New `lib/nakuru/category-presentation.ts`: icon, tint, optional image path by slug; missing slug uses generic placeholder |
| Browse layout | Group **depth-0 official roots** with a small **layout** map (`vehicles-transport`, `property-stays`, `shopping`, `services`, `work`) keyed by root slug — layout keys are not categories |
| Sell form | Allowed **leaves** under vendor roots; breadcrumb from `parentSlug`; custom create still a community leaf under vendor root |
| Aliases | `category_aliases` (`shop` → `business-and-industry`, `property` → `real-estate`) remain; UI must resolve before display |
| Hidden | `shop` / `property` rows stay hidden; not shown in pickers |
| Apply | Still 1–4 **roots**; listing publish still **leaves only** |
| TOPC | Unchanged curated strip |

---

## 4. Inventory (must all be represented)

**Official tree (already in DB migrations)** — include all of these in fallback:

- Roots: `vehicles`, `real-estate`, `mobile-phones-tablets`, `electronics`, `home-garden`, `fashion-and-beauty`, `health-and-beauty`, `babies-and-kids`, `animals-and-pets`, `agriculture-and-foodstuff`, `hobbies-art-sport`, `office-and-commercial-equipment-tools`, `repair-and-construction`, `business-and-industry`, `jobs`, `seeking-work-cvs`, `services`, `stays`, `taxi`, `rider`
- All depth-1 children from `013_category_tree.sql` and `014_jiji_category_phase2.sql` (vehicles children, real-estate children, phones, electronics, home, fashion, health, babies, pets, agriculture, hobbies, commercial, repair, business leaves including `general-merchandise`, jobs/CV children, services/stays/taxi/rider leaves)
- Legacy nested: `cars` under `vehicles`

**Browse hardcoded today** (`BROWSE_CATEGORY_GROUPS`): same roots as above plus grouping chrome. After this spec, groups are derived from roots + layout map.

**Root images** (`CATEGORY_ROOT_IMAGE_SLUGS`): move into presentation map; every slug already has an official root.

**Legacy demo / landing / filter** (`CATS`, FilterSheet, landing `CategoriesSection`): map to canonical roots:

| Old | Canonical root |
|-----|----------------|
| shop | `business-and-industry` |
| property | `real-estate` |
| cars | `vehicles` |
| services | `services` |
| stays | `stays` |
| taxi | `taxi` |
| rider | `rider` |
| Jobs (landing) | `jobs` |
| Events (landing) | **out of catalog** — keep as a non-category link or drop; do not invent an `events` category in this spec |

**Labels:** `humanizeCategoryName` prefers API/directory `label`; keep a tiny alias map only for `shop`, `property`, `cars` when the directory is not loaded.

**Community:** whatever is `kind=community` and `visible` in the live table is part of the catalog after fetch.

---

## 5. Architecture

```
Postgres categories (+ aliases)
        │
        ▼
GET /api/categories  ──►  useCategories()  ──►  all app surfaces
        │                        │
        │                        ├─ browse tiles (depth 0)
        │                        ├─ header / mega menu
        │                        ├─ apply chips (open roots)
        │                        ├─ sell leaf picker + breadcrumb
        │                        └─ listing filters
        ▼
OFFICIAL_DIRECTORY_FALLBACK  (SEO + fetch failure only)
```

`category-presentation.ts` is consulted **after** a directory row is chosen (look up slug → icon/tint/image). It never decides which categories exist.

---

## 6. Sell form

Replace the competing copy (“shop sections: Business & Industry” vs dropdown “General Merchandise”) with:

- Context line: shop area only (e.g. “Buyers will see this listing in Milimani”).
- Category control: searchable list of **allowed leaves**, grouped by parent label.
- Selected display: `Business & Industry › General Merchandise`.
- Add category: same as today, community leaf under `parentSlugForCustomCategory`.
- Default leaf: first allowed leaf under the vendor’s first root (unchanged helper), but the breadcrumb makes the parent obvious.

Server rules (`assertCategoryIsListableLeaf`, `vendorMayUseProductCategory`) stay as they are.

---

## 7. Files to change (implementation, not this spec)

- Expand `lib/nakuru/data/category-directory.ts` fallback to the full official tree.
- Add `lib/nakuru/category-presentation.ts` (from browse icons/tints + `category-root-images`).
- Browse: `BrowseByTypeSection`, `app/category/[slug]/page.tsx` — generate from directory roots, not `BROWSE_CATEGORY_SLUGS`.
- Sell: `VendorProductForm` breadcrumb + grouped picker.
- Remove or shrink hardcoded lists in `constants.ts` `CATS` consumers, `FilterSheet`, `VendorView` demo, landing `CategoriesSection` (map to roots; Events stays a non-category link).
- Tests: fallback completeness vs a frozen list of seeded slugs; browse does not reference a duplicate slug array; vendor form helpers still unit-tested.

---

## 8. Error handling

- Categories fetch fails → fallback official tree; community names absent until retry.
- Unknown slug in presentation map → placeholder icon/image, directory label still shown.
- Vendor with no matching leaves → existing empty-state (“No listing categories match your shop sections”).

---

## 9. Testing

- Unit: fallback slug set equals the documented official inventory (roots + 013/014 children).
- Unit: presentation slugs ⊆ fallback slugs.
- Unit: alias `shop` / `property` resolve to canonical roots and are not listed as visible tiles.
- Existing API tests for `POST /api/products` leaf + vendor-root checks remain.
- Component/helper tests for breadcrumb label from `parentSlug` + leaf.

---

## 10. Amendments to prior specs

| Prior | Change |
|-------|--------|
| Directory spec: fallback = six officials | Fallback = **full official tree** |
| Category page redesign: `BROWSE_CATEGORY_GROUPS` as browse source | Browse source = directory roots + layout map |
| Jiji spec: Home TOPC unchanged | Unchanged (still not the catalog) |
