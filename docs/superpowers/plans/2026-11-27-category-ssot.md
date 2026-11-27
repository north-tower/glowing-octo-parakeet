# Category SSOT Implementation Plan

> **For agentic workers:** Execute inline in this session. Spec: `docs/superpowers/specs/2026-11-27-category-ssot-design.md`.

**Goal:** One Postgres-backed category tree (plus a complete official fallback) drives browse, apply, publish, filters, landing, and SEO.

**Architecture:** Expand `OFFICIAL_DIRECTORY_FALLBACK` from migrations 008/012/013/014/019. Presentation (icon/tint/image) is slug-keyed. Browse groups come from `HUB_GROUPS` + directory roots. Sell form shows `parent › leaf`.

**Tech Stack:** Next.js, Vitest, existing `useCategories` / `GET /api/categories`.

## Global Constraints

- Do not invent an `events` category.
- Do not put TOPC shortcuts into `categories`.
- Hidden `shop` / `property` stay aliases, not tiles.
- `listing_mode` unchanged.
