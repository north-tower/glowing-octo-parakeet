# Category page redesign — design spec

**Status:** Approved  
**Date:** 2026-11-22  
**Repo:** `C:\Users\mhki\hub`  
**Related:** [Category directory](./2026-11-20-category-directory-design.md), [Public marketplace UI](./2026-11-22-public-marketplace-ui-design.md)

---

## 1. Summary

Redesign the Category tab while keeping the Glovo-style left rail + tile grid. Shoppers can browse **all six** official types (Shop, Property, Cars, Services, Stays, Taxi). Vendor onboarding stays unchanged: apply/listing only for categories with `open_for_apply` (Shop, Services, and community names).

---

## 2. Locked decisions

| Topic | Decision |
|-------|----------|
| Layout | Keep left category rail + main panel (option A / approach 1) |
| Shopper browse | All official categories tappable on rail, Browse by type, and Home header tabs |
| Vendor apply | Still gated by `open_for_apply`; waitlist copy on closed official chips |
| `open_for_apply` DB | No migration; property/cars/stays/taxi remain `false` for vendors |
| Empty Stays/Taxi | Standard empty listings state, not “Coming soon” |
| Featured | Popular shortcuts unchanged; Browse by type expands to 6 tiles (2×3 grid) |

---

## 3. UI changes

### Category rail
- Remove Soon badges and disabled state for Stays and Taxi.
- Keyboard nav includes all rail items.

### Featured panel
- **Browse by type:** six tiles with distinct tints (Stays: teal family, Taxi: sand/pink per existing tokens).
- **Stays rail panel:** shortcut tiles (BnBs, Hotels, Short stays, All stays) + listings block when live catalog on.
- **Taxi rail panel:** shortcut tiles (Airport, Town rides, Boda, All taxi) + listings block.

### Home header tabs
- Official categories browsable even when `open_for_apply` is false.
- Soon pill only where we still block action (none for browse); vendor waitlist stays on apply form only.

### Visual polish
- Tighter Browse by type rhythm on phone (2-col, consistent tile height).
- Rail active state unchanged (forest green accent).

---

## 4. Code touchpoints

- `lib/nakuru/data/constants.ts` — `BROWSE_SIDES`, `BROWSE_GROUPS`, `TOPC` stays/taxi rows, clear shopper `SOON` for stays/taxi
- `components/app/category/CategoryRail.tsx`
- `components/app/category/CategoryPanel.tsx`
- `components/app/AppHeader.tsx`
- `components/app/views/HomeView.tsx`
- `lib/nakuru/reducer.ts`
- `lib/nakuru/home-i18n.ts`

---

## 5. Out of scope

- Opening vendor apply for property/cars/stays/taxi
- New routes or category directory schema changes
- Dedicated Stays/Taxi demo inventory in `ITEMS` (live catalog only until seeded)

---

## 6. Success criteria

- Rail shows no Soon on Stays/Taxi; panels render shortcuts + listings filter.
- Home tabs for Property/Cars/Stays/Taxi work without “coming soon” card.
- Vendor apply form still disables non-open official categories.
- `pnpm test` category-related tests still pass (update expectations if header tab behavior tested).