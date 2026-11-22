# Vendor shop workspace — design spec

**Status:** Approved  
**Date:** 2026-11-22  
**Repo:** `C:\Users\mhki\hub`  
**Related:** [Category directory](./2026-11-20-category-directory-design.md), [Vendor onboarding](./2026-11-15-vendor-onboarding-launch-design.md)

---

## 1. Summary

Approved vendors get one shop workspace: a profile card with a Nakuru zone, then four working tabs (Add listing, Stock, Orders, Earnings). Dummy dashboard chips go away. Listing category is any visible directory name (no Shop vs Services gate, no four-category cap on publish). The shop zone is inherited by every listing at catalog read time.

## 2. Locked decisions

| Topic | Decision |
|---|---|
| Layout | A: profile on top, four-tab bar, one panel |
| Zone | One `vendors.area` from header Nakuru list; not Outside waitlist |
| Inheritance | Join at listing read; do not copy onto each product |
| Categories | Any visible directory slug; apply 1–4 cap stays for applications only |
| Earnings | Delivered-order goods totals (COD vs M-Pesa); no payouts |
| Vendor order actions | `placed → accepted → ready`, or cancel from placed/accepted |
| Quote requests | Shown on the Orders tab |

## 3. Data and APIs

- `vendors.area` text, nullable. Allowed values: Town/CBD, Milimani, Section 58, Lanet, Free Area.
- `PATCH /api/vendors/mine` `{ area }`. `GET /api/vendors/mine` includes `area`.
- `POST /api/products` requires shop area set (`area_required`) and a visible directory category. No `category_not_approved`.
- Public listings merge `vendors.area` into `attributes.location` when the product has no location.
- `GET /api/vendor/orders`, `POST /api/vendor/orders` `{ orderId, status }`.
- `GET /api/vendor/earnings` `{ deliveredCount, goodsTotal, codTotal, mpesaTotal }`. Goods = `total_kes - delivery_fee_kes`.

## 4. UI

Profile: photo, name, status, zone chip (same sheet as header, Nakuru-only). Publish blocked until zone is set.

Tabs: Add listing (all visible categories, photo, price, stock if listing_mode is shop), Stock (edit price/qty, hide), Orders (shop orders + quote requests), Earnings (three numbers + empty state).
