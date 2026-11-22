# User vs vendor authentication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** One email-OTP account for shoppers and sellers; Shopping vs Selling is a UI switch; approving a shop does not change `users.role`.

**Architecture:** Keep the existing JWT `{ sub, role }` and `vendors.owner_id`. Replace shop/seller OTP copy with one form. Persist `shopping | selling` in `sessionStorage`. Stop flipping `users.role` to `vendor` on approve; migrate existing vendor-role rows back to `customer`.

**Tech Stack:** Next.js App Router, Postgres/Supabase, Vitest, existing OTP + refresh cookie session.

## Global Constraints

- Marketplace sign-in stays email OTP only
- No JWT `mode` claim; APIs do not require selling mode
- `users.role` for marketplace people stays `customer`
- Selling workspace only when `vendors.status = approved`
- Staff login unchanged
- EN/SW via `homeCopy` for new Account/OTP strings

---

### Task 1: App mode + selling entry helpers

**Files:**
- Create: `lib/nakuru/app-mode.ts`
- Create: `lib/nakuru/app-mode.test.ts`
- Delete: `lib/nakuru/sign-in-intent.ts`, `lib/nakuru/sign-in-intent.test.ts`

**Interfaces:**
- Produces: `AppMode = "shopping" | "selling"`
- Produces: `wantsSellingEntry(start: string | null, hasVendorQueryFlag: boolean): boolean`
- Produces: `readAppMode()`, `persistAppMode(mode)`, `clearAppMode()` (sessionStorage key `nh:appMode`)

- [ ] Unit tests: default shopping; `start=vendor` and `?vendor` want selling; persist/read/clear with mocked sessionStorage
- [ ] Implement helpers; remove SignInIntent
- [ ] `pnpm test lib/nakuru/app-mode.test.ts`

### Task 2: Account menu — person vs shop

**Files:**
- Modify: `lib/nakuru/vendor-profile.ts`
- Create: `lib/nakuru/vendor-profile.test.ts`

**Interfaces:**
- Consumes: `VendorAccountSummary`
- Produces: `accountMenuRows` — signed-in with no shop includes Become a seller (`accSell` → `acc:vendor`); pending is **not** disabled (`accApplicationStatus`); rejected `accApplyAgain`; approved `accMyShop`

- [ ] Failing tests for those four states
- [ ] Update `accountMenuRows`
- [ ] `pnpm test lib/nakuru/vendor-profile.test.ts`

### Task 3: Approve keeps customer role + dual APIs

**Files:**
- Create: `supabase/migrations/011_users_role_customer.sql`
- Modify: `lib/server/vendors.ts` (`adminVendorAction` — remove `update users set role='vendor'`)
- Modify: `docs/db/README-supabase.md` (mention 011)
- Test: `tests/api/user-vendor-auth.test.ts`

**Interfaces:**
- Consumes: `adminVendorAction(vendorId, "approve", staffId, ip)`
- Produces: owner `users.role` remains `customer`; `vendors.status = approved`; same JWT can hit seller routes

- [ ] Failing API test: insert customer + pending vendor; approve; assert role customer; `GET /api/vendor/orders` 200 with customer JWT
- [ ] Migration SQL + drop role flip
- [ ] Apply 011 on the Vitest database (`update users set role='customer' where role='vendor'`)
- [ ] `pnpm test tests/api/user-vendor-auth.test.ts`

### Task 4: One OTP form + Account mode switch

**Files:**
- Modify: `components/app/auth/EmailOtpForm.tsx`
- Modify: `components/app/views/AccountView.tsx`
- Modify: `components/app/account/AccountSignedInView.tsx`
- Modify: `components/app/AppAuthProvider.tsx` (clear mode on logout)
- Modify: `components/app/vendor/VendorApplyForm.tsx` (same-account lead)
- Modify: `lib/nakuru/home-i18n.ts`
- Modify: `app/nakuru/styles.css`

**Behavior:**
- Single OTP copy (`signInTitle` / `signInLead` / …). No Shop vs Seller cards.
- `openSellingAfterSignIn` or URL `start=vendor` → `persistAppMode("selling")` + `SLIDE_VENDOR`.
- Signed-in identity: person (email), always buyer caption; shop chip allowed. Segmented **Shopping | Selling** (reuse cart-seg pattern). Selling → `acc:vendor`.
- Signed-out Account: one `EmailOtpForm`; Sell row still `acc:vendor` then same OTP with `openSellingAfterSignIn`.

- [ ] Wire UI + i18n + CSS
- [ ] Manual: OTP once; switch modes; `?start=vendor` after login opens Selling apply/status/workspace

---

## Self-review

Spec coverage: one OTP, mode switch, locked until apply, pending status not workspace (existing VendorView), no role flip, migration, buyer+seller same user, staff unchanged, no mode JWT. No placeholders.
