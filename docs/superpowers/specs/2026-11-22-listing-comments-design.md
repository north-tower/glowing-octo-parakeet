# Listing comments — design spec

**Status:** Approved  
**Date:** 2026-11-22  
**Repo:** `C:\Users\mhki\hub`  
**Related:** [Public marketplace UI spec](./2026-11-22-public-marketplace-ui-design.md)

---

## 1. Summary

Replace the listing-page **Comments** shell (“coming soon”) with persisted public comments. Signed-in customers and vendors can post on `/app/p/[id]`. Guests can read. The list is flat (no replies). Comments go live immediately. Authors and staff can soft-delete.

## 2. Locked decisions

| Topic | Decision |
|---|---|
| Surface | Public comments on a listing (`/app/p/[id]`), after WhatsApp, before in-app messages |
| Who posts | Signed-in `customer` and `vendor` only |
| Who reads | Anyone |
| Staff post | No (`admin` / `support`) |
| Shape | Flat list, oldest first, no replies |
| Go live | Immediately (no approval queue) |
| Delete | Author or staff; soft delete |
| Rate limit | 10 comments per user per hour (counts deleted rows too) |
| Persistence | Postgres + Next.js API (same pattern as inquiries) |
| Display name | Public handle from email local-part; never the full address |
| Seller badge / likes / edit / notify | Out of scope |

## 3. Data model

Table `listing_comments`:

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | `gen_random_uuid()` |
| `product_id` | uuid FK → `products(id)` | `on delete cascade` |
| `author_id` | uuid FK → `users(id)` | |
| `body` | text | Trimmed, 1–500 characters |
| `deleted_at` | timestamptz | Null while public |
| `deleted_by` | uuid FK → `users(id)` | Author or staff |
| `created_at` | timestamptz | `now()` |

Index `(product_id, created_at)` for the listing feed. Public reads skip `deleted_at is not null`.

Handle is **not** stored. Join `users.email` and derive:

- If email present: substring before `@`, trimmed, max 32 chars.
- Else (phone-only account): `member`.

## 4. API

### `GET /api/listings/[id]/comments`

Public. Listing must be the same public set as `GET /api/listings/[id]` (`getPublicListingById`).

- Invalid uuid → `400` `{ error: "bad_request" }`
- Listing missing / not public → `404` `{ error: "not_found" }`
- Success → `200` JSON array, oldest first:

```json
[
  {
    "id": "uuid",
    "body": "Is this still available?",
    "authorHandle": "jane",
    "authorId": "uuid",
    "createdAt": "2026-11-22T12:00:00.000Z"
  }
]
```

No `Cache-Control` public cache (list changes on post).

### `POST /api/listings/[id]/comments`

Bearer JWT. Body `{ "body": "..." }` (strict). Same listing visibility as GET.

| Situation | Status | `error` |
|---|---|---|
| No/invalid token | 401 | `unauthorized` |
| Staff role | 403 | `forbidden` |
| Empty / over 500 chars / bad json | 400 | `bad_request` |
| Listing not public | 404 | `not_found` |
| Over 10 in the last hour | 429 | `rate_limited` |
| Success | 201 | shaped comment object |

### `DELETE /api/comments/[id]`

Bearer JWT. Soft-delete: set `deleted_at` and `deleted_by`.

| Situation | Status | `error` |
|---|---|---|
| No/invalid token | 401 | `unauthorized` |
| Not author and not staff | 403 | `forbidden` |
| Missing or already deleted | 404 | `not_found` |
| Success | 200 | `{ "ok": true }` |

Audit: `comment_create`, `comment_delete`.

## 5. Listing UI

Replace `ListingCommentsShell` with `ListingComments` on the product detail page (same card class `pd-comments`).

- Heading **Comments** plus live count in parentheses.
- Empty copy: existing `commentsEmpty`.
- Each row: handle, relative time, body. Author sees Delete; staff sees Delete on every row.
- Signed in (customer/vendor): textarea + Post. Success appends the comment and clears the form.
- Signed out: textarea disabled; control to open Account sign-in (`/app?tab=account`).
- Staff signed in: list + delete only (no composer).
- Errors: short EN/SW status for unauthorized, forbidden, rate_limited, not_found, and generic post/load failure.
- Drop `commentsSoon`.

Demo catalog IDs that are not UUIDs: do not call the API; show empty state without posting.

## 6. Success criteria

- Guest can read comments on a live public listing.
- Signed-in customer can post; the comment appears without reload.
- Full email never appears in the API or UI.
- Author can hide their comment; another customer cannot; staff can.
- Staff cannot post.
- Inactive listing rejects GET/POST with 404.

## 7. Out of scope

- Replies, edits, likes, seller highlight
- Staff moderation inbox
- Email/push notify
- Guest posting
- Listing chat backend
