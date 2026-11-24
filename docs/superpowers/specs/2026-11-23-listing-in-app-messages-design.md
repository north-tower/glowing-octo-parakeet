# In-app listing messages — design spec

**Status:** Approved  
**Date:** 2026-11-23  
**Repo:** `C:\Users\mhki\hub`

---

## Summary

Replace the Messages tab mock data and the listing-page “message seller” shell with persisted **private threads** between a signed-in buyer and the listing’s vendor owner. One thread per `(product, customer)`. Buyers start from `/app/p/[id]`; both parties continue in the **Messages** tab (`/app?tab=msg`).

## Locked decisions

| Topic | Decision |
|---|---|
| Surface | Listing block after comments; Messages tab inbox + thread view |
| Who posts | Signed-in customers and vendor owners (participants only) |
| Staff | Cannot start or send |
| Shape | Flat chronological messages in a thread |
| Rate limit | 30 messages per user per hour |
| Display name | Email local-part handle (same as comments) |
| Notify | Out of scope |

## API

- `POST /api/listings/[id]/message-thread` — start or reuse thread + first message
- `GET /api/message-threads/mine` — inbox for buyer and seller hats
- `GET /api/message-threads/[id]` — thread + messages (participant only)
- `POST /api/message-threads/[id]/messages` — reply

Migration: `016_listing_message_threads.sql`.