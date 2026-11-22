# Public marketplace UI — design spec

**Status:** Approved  
**Date:** 2026-11-22  
**Repo:** `C:\Users\mhki\hub`

---

## 1. Summary

Restyle the public NakuruHub site (landing, in-app Home/browse, listing page) to the cream / forest green / gold classifieds look from the approved screenshots, with an **N** mark. Desktop matches the mock. Phones keep the current app shell (bottom tabs) with the new palette. Listing pages show **WhatsApp**, then **comments**, then **in-app messages**. Comments and chat are layout shells in this pass.

Staff and vendor dashboards stay as they are (staff may keep the flamingo mark).

## 2. Locked decisions

| Topic | Decision |
|---|---|
| Scope | Whole public site: `/`, `/app` Home/browse, `/app/p/[id]` |
| Brand | Cream canvas, forest green, gold headlines, N mark |
| Layout strategy | One catalog; two presentations (desktop classifieds vs phone app shell) |
| Listing open | Full page, not the screenshot overlay |
| Contact | WhatsApp first (real `wa.me` when a phone exists), then comments shell, then existing Messages tab |
| Comments / chat | UI layout only; no new persistence API |
| Saved | Existing “coming soon” toast |
| Routes | Unchanged |
| EN/SW | Kept |
| Category directory | Unchanged data source |

## 3. Surfaces

| Surface | Desktop | Phone |
|---|---|---|
| `/` | Split hero, search, featured card, proof row, browse by category | Same stacked; no bottom tabs |
| `/app` Home | Discover around you, pills, listing grid | Current Home (slides, strips), new tokens + N |
| `/app/p/[id]` | Full listing + WhatsApp / comments / messages | Same sections, current chrome |
| Staff / vendor | Unchanged | Unchanged |

## 4. Success criteria

- Desktop `/` and `/app` read like the screenshots (palette, hero, grid, header).
- Phone `/app` still has five tabs, new colors and N mark.
- Listing shows WhatsApp, then comments shell, then message-seller.
- Browse, search, cart, sign-in, post listing still work.
- WhatsApp is disabled (not fake) when the seller has no phone.

## 5. Out of scope

- Comments persistence, listing chat backend
- Save-gated contact overlay
- Flamingo retirement on staff/vendor
- New routes
