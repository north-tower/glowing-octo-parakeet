# User vs vendor authentication — design spec

**Status:** Approved  
**Date:** 2026-11-22  
**Repo:** `C:\Users\mhki\hub`  
**Related:** [Vendor onboarding](./2026-11-15-vendor-onboarding-launch-design.md), [Vendor shop workspace](./2026-11-22-vendor-shop-workspace-design.md)

---

## 1. Summary

NakuruHub keeps **one account per email** for shoppers and sellers. Sign-in is **email OTP only** (unchanged). After sign-in, people switch **Shopping** vs **Selling** in the app. Selling is **not a second login**.

A person is a `users` row. A shop is a `vendors` row owned by that user. Approving a vendor **does not** change `users.role` to `vendor`. Buyer features always use the signed-in user id. Seller features require a `vendors` row on that user.

Staff stays on **email + password + TOTP** at `/staff` and cannot use marketplace OTP.

## 2. Locked decisions

| Topic | Decision |
|---|---|
| Identity | One account, two modes (Shopping / Selling) |
| Sign-in | Single email OTP; no Shop vs Seller OTP cards |
| Passwords (marketplace) | Out of scope |
| Session | One JWT `{ sub: userId, role }`; no `mode` claim |
| Mode wall | UI-only; APIs do not require “selling mode” |
| `users.role` | Marketplace people stay `customer`. Do not flip to `vendor` on approve |
| Shop capability | Presence + `status` of `vendors` for `owner_id = user.id` |
| Selling locked | No `vendors` row → “Become a seller” apply page only |
| Selling unlocked | After they **submit** an application (`pending` / `rejected` / `approved`) |
| Workspace | Shop workspace only when `vendors.status = approved` |
| Pending | Selling mode shows **status / wait copy**, not the workspace |
| Staff | Unchanged password + TOTP; OTP returns `use_staff_login` |
| Rider | Unchanged; out of scope |

## 3. Identity and data

### 3.1 Person vs shop

- `users`: login identity (email OTP, refresh tokens). Default `role = customer`.
- `vendors`: shop profile (`owner_id` → `users.id`), `status` (`pending` / `approved` / `rejected`), `verified`.
- One owner, one shop (existing apply rules). No second user row for selling.

### 3.2 Role

Allowed `users.role` values stay `customer | vendor | rider | support | admin` in the database check so a mid-deploy row cannot fail the constraint.

Application rules after this change:

- New OTP users: `customer`.
- Approve vendor: update `vendors.status` only. **Do not** `update users set role='vendor'`.
- One-time migration: `update users set role = 'customer' where role = 'vendor'`.
- JWT `role` for marketplace sessions is `customer`. Vendor APIs key off the `vendors` row, not `role === 'vendor'`.
- `admin` / `support` still blocked from OTP.

Existing API guards that already allow `requireRole(user, "customer", "vendor")` keep working for leftover `vendor` rows until the migration runs. New code should treat marketplace as **signed-in non-staff** (`customer`, and `vendor` only as a legacy JWT until migration).

### 3.3 Capability

| `vendors` row | Shopping | Selling switch | Selling screen |
|---|---|---|---|
| None | Full buyer app | Visible | Locked: Become a seller (apply) |
| `pending` | Full buyer app | Unlocked | Status / waiting for review |
| `rejected` | Full buyer app | Unlocked | Apply again |
| `approved` | Full buyer app | Unlocked | Existing shop workspace |

Buyer cart, orders, inquiries, and listing comments stay available in Shopping regardless of shop status.

## 4. Sign-in and session

- Keep `POST /api/auth/otp/request`, `POST /api/auth/otp/verify`, refresh, logout.
- Verify: upsert by email, reject staff, reject `disabled`, issue access JWT + refresh cookie.
- Remove **seller vs shop OTP copy** (`SignInIntent` shop/seller cards and the in-form switch). One form: save orders, cart, quotes; email a code.
- `/app?start=vendor` (landing “Sell”, “Post a listing”, “Open vendor sign-up”) is **post-login destination**, not a different authenticator:
  1. If signed out → same OTP, then open Selling.
  2. If signed in, no shop → Selling locked page (apply).
  3. If signed in, has shop → Selling screen for that status (status vs workspace).
- Mode is client UI state in `sessionStorage` (default **Shopping**). Survives the OTP step when `start=vendor` sent them to Selling. Sign-out clears it. Not stored on the server.

## 5. UI

### 5.1 Mode switch

Signed-in **Account** identity (name / email) includes a **Shopping | Selling** control. Home / cart chrome stays the shopping app. Opening Selling shows the existing vendor panel (`VendorView`): apply, pending status, or shop workspace. Landing `start=vendor` jumps to Account + Selling after login.

- **Shopping:** current marketplace (home, listing, cart, buyer orders, comments). Account caption is the person (email or name), not “you are a vendor now.” If they have a shop, a small extra chip (e.g. pending / verified) is allowed; it does not replace buyer identity.
- **Selling (locked):** Become a seller — existing apply form, short copy that this is not a second account.
- **Selling (unlocked, not approved):** pending or rejected copy; no add-listing / stock / orders / earnings workspace.
- **Selling (approved):** existing `VendorShopWorkspace`.

Signed-out Account: one “Sign in” (not “Seller sign-in”). “Sell on NakuruHub” still routes to OTP then Selling.

### 5.2 Account menu

- Shopping section: buyer orders, saved, help — always for signed-in users.
- Selling section: “Become a seller” if no row; “Seller status” if pending; “Apply again” if rejected; “My shop” if approved (opens Selling / workspace).
- Do not disable pending “My shop” entirely; it opens the pending status screen in Selling (workspace remains closed).

### 5.3 Out of scope for UI

- Separate `/sell` origin or vendor subdomain.
- Password set/reset for marketplace users.
- Mode persisted in JWT.

## 6. APIs

No new auth routes.

| Area | Rule |
|---|---|
| Buyer (`/api/orders`, `/api/orders/mine`, inquiries, comments POST) | Bearer user, not staff. Use `user.id`. Having a shop does not block buying. |
| Apply `POST /api/vendors` | Bearer marketplace user, no existing shop (existing apply errors). |
| Seller (`/api/vendors/mine`, products, vendor orders, earnings) | Bearer user **and** `vendors` row for that owner. Status gates unchanged (e.g. publish needs approved + area). |
| `GET /api/me` | `{ id, role }` unchanged. UI loads shop via `GET /api/vendors/mine` (`[]` means no shop → Selling locked). |
| Staff | Existing role checks. |

Do **not** add `selling_mode_required`. Calling a seller API while the UI is in Shopping is allowed if that user owns a shop.

Error codes stay as today: `unauthorized`, `invalid_code`, `use_staff_login`, `disabled`, vendor apply / not_found codes.

## 7. Testing

- OTP verify creates/returns `role = customer`; staff email still `403 use_staff_login`.
- Admin approve does not change `users.role`; owner remains `customer`.
- Migration (or equivalent test setup): a former `vendor` role user is `customer` and still owns `vendors`.
- Same user with an approved shop can `POST /api/orders` as a buyer and `GET /api/vendor/orders` as a seller.
- Workspace routes still fail without an approved shop where they already do.
- UI/unit: no seller OTP intent; `start=vendor` only selects Selling after login; no shop → Become a seller; pending → status not workspace.

## 8. Non-goals

- Email + password for shoppers or vendors.
- Two sessions or two cookies for one email.
- JWT `mode` claim or server-enforced Shopping vs Selling.
- Dropping `vendor` from the `users.role` check constraint in this change.
- Changing staff login.
- Changing rider auth.
- KYC / documents (still P1).

## 9. Implementation notes

- Remove or collapse `lib/nakuru/sign-in-intent.ts` shop/seller copy once the single OTP form exists; keep a small helper for `start=vendor` → open Selling after login if that is cleaner than overloading intent.
- `adminVendorAction("approve")` must drop the `users.role` update.
- Listing comments and other “customer or vendor” checks should mean **signed-in non-staff**, not a vendor login.
