# Listing Comments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist public listing comments and wire the existing `/app/p/[id]` Comments card to real GET/POST/DELETE APIs.

**Architecture:** New `listing_comments` table; server module `lib/server/comments.ts` used by App Router handlers; listing UI fetches via `apiFetch` like the rest of the catalog. Handles are derived from `users.email`, never stored.

**Tech Stack:** Postgres (Supabase migrations), Next.js App Router, Zod, Vitest, existing `bearerUser` JWT.

## Global Constraints

- Body 1–500 chars, trimmed
- 10 comments per user per hour (including deleted)
- Staff (`admin`/`support`) cannot POST
- Soft delete only
- Oldest-first public list
- EN/SW via `homeCopy`
- No replies, edits, likes, notify, or staff inbox

---

### Task 1: Public handle helper

**Files:**
- Create: `lib/nakuru/comment-display.ts`
- Test: `lib/nakuru/comment-display.test.ts`

**Interfaces:**
- Produces: `commentPublicHandle(email: string | null | undefined): string`
- Produces: `formatCommentTime(iso: string, lang: "en" | "sw", nowMs?: number): string`

- [ ] Unit tests for handle (email local-part, phone-only → `member`, truncate 32)
- [ ] Implement helpers
- [ ] `pnpm test lib/nakuru/comment-display.test.ts`

### Task 2: Migration + comments server module + API

**Files:**
- Create: `supabase/migrations/010_listing_comments.sql`
- Create: `lib/server/comments.ts`
- Modify: `lib/server/schemas.ts` (add `commentNew`)
- Create: `app/api/listings/[id]/comments/route.ts`
- Create: `app/api/comments/[id]/route.ts`
- Test: `tests/api/listing-comments.test.ts`
- Modify: `docs/db/README-supabase.md` (mention 010)

**Interfaces:**
- Produces: `ListingCommentRow { id, body, authorHandle, authorId, createdAt }`
- Produces: `listPublicComments(productId)`, `createListingComment(user, productId, body, ip)`, `softDeleteListingComment(user, commentId)`

- [ ] Failing API tests (guest GET empty; POST 201 + handle not full email; guest POST 401; staff POST 403; author DELETE hides; other customer DELETE 403; staff DELETE ok; inactive listing 404)
- [ ] Migration + module + routes
- [ ] Apply 010 to the dev database used by Vitest
- [ ] `pnpm test tests/api/listing-comments.test.ts`

### Task 3: Listing UI

**Files:**
- Create: `components/app/product/ListingComments.tsx`
- Modify: `components/app/product/ListingContactBlocks.tsx` (remove shell)
- Modify: `components/app/ProductDetailView.tsx`
- Modify: `lib/nakuru/home-i18n.ts`
- Modify: `app/nakuru/styles.css`

- [ ] Wire real list/composer/delete; sign-in prompt; staff no composer
- [ ] Manual: listing page signed out / signed in / staff

---

## Self-review

Spec coverage: table, three routes, handle masking, rate limit, UI states, tests. No placeholders. Types use `ListingCommentRow` throughout.
