# NakuruHub POS showcase — design spec

**Status:** Implemented (showcase slice)  
**Date:** 2026-11-27  
**Repos:** Hub (`C:\Users\mhki\hub`), POS (`C:\Users\mhki\insightful-pos`)

---

## 1. Summary

NakuruHub is the public marketplace. Insightful POS is a separate till app. This spec is **showcase only**: Hub introduces **NakuruHub POS** on the landing page and at `/pos`, then sends people to the existing POS app on a subdomain. No shared login, no till inside Hub, no vendor-to-store mapping.

---

## 2. Goals and success criteria

### Goals

1. Shoppers and sellers on Hub can discover POS as a **NakuruHub** product.
2. A dedicated Hub page explains the till and links to a **live, view-only demo**.
3. POS stays its own deployment; Hub never imports POS UI.

### Success criteria

| Criterion | Measure |
|-----------|---------|
| Landing | Band on `/` after How it works, before FAQ; EN/SW |
| Pitch page | `/pos` uses landing header/footer; EN/SW |
| Nav | Header **POS** → `/pos`; footer **NakuruHub POS** → `/pos` |
| Try the till | Opens `NEXT_PUBLIC_POS_URL` in a new tab |
| SEO | `/pos` in sitemap; title/description set; indexable |
| POS door | With brand env set, login/title say **NakuruHub POS** |

### Non-goals

- Embedding or rewriting POS inside Next.js.
- Shared Hub/POS auth or SSO.
- Opening POS from the vendor selling workspace.
- Waitlist or billing for POS.
- Restyling the till to flamingo landing CSS.
- Changing demo data, demo passwords, or write-blocking behaviour.

---

## 3. Decisions (locked)

| Topic | Decision |
|-------|----------|
| Product name on Hub | **NakuruHub POS** |
| Surfaces | Landing mention **and** `/pos` |
| Hosting | POS on `pos.nakuruhub.co.ke`; Hub stays `nakuruhub.co.ke` |
| Architecture | Two apps, outbound link via env |
| Demo | Existing POS read-only shortcuts |
| POS chrome | Env display name only; no full Hub restyle |
| Try the till | New tab to POS login (not auto-sign-in) |

---

## 4. Architecture

```
nakuruhub.co.ke          pos.nakuruhub.co.ke
-----------------        -------------------
/  landing band          Vite POS (unchanged product)
/pos pitch page          login + demo shortcuts
NEXT_PUBLIC_POS_URL  -->  VITE_PUBLIC_APP_NAME=NakuruHub POS
```

- Hub: Next.js marketing + marketplace. New route `app/pos/page.tsx` (or equivalent under App Router). Public URL helper next to `SITE_URL`.
- POS: existing Vite app and Supabase. Optional env overlay for public name.
- Until DNS exists, Hub may point `NEXT_PUBLIC_POS_URL` at the current POS production host.

---

## 5. Hub surfaces

### 5.1 Landing band

Insert a section in `LandingBelowFold` **after** `HowSection`, **before** `FaqSection`. Reuse flamingo landing CSS (same patterns as Why / CTA bands). Do not put POS in the hero.

Copy (EN; SW via existing `Bi` / landing i18n):

- Title: NakuruHub POS
- Subtitle: Till for shops that sell on NakuruHub — sales, credit, and today’s numbers at the counter.
- **See NakuruHub POS** → `/pos`
- **Try the till** → `NEXT_PUBLIC_POS_URL` (`target="_blank"` `rel="noopener noreferrer"`)

### 5.2 `/pos`

Same `LandingHeader`, `LandingFooter`, lang toggle, `skip-link`. Not under `/app`.

1. Hero: NakuruHub POS; **Try the till** (outbound); **Post a listing** (`/app?start=vendor`).
2. Three beats: take payment; track credit; see the day.
3. Note: demo is **view-only**; a real shop gets its own store later.
4. Repeat CTAs.

### 5.3 Chrome and SEO

- Header nav: add `{ href: "/pos", en: "POS", sw: "POS" }` (or “Till” in SW if copy review prefers).
- Footer: **NakuruHub POS** → `/pos`.
- `app/sitemap.ts`: include `/pos`.
- Page metadata: title like `NakuruHub POS — Till for shops in Nakuru`; description matching the subtitle.
- Canonical `/pos`. No JSON-LD product schema required for v1.

### 5.4 Config

`NEXT_PUBLIC_POS_URL` — absolute HTTPS URL, no trailing slash. Document in Hub README Deploy section. If unset in local dev, buttons still render but must not invent a wrong production host; use a documented fallback only if the codebase already has a live POS URL, otherwise require the env in production.

---

## 6. POS chrome (insightful-pos)

When `VITE_PUBLIC_APP_NAME` is set (value: `NakuruHub POS`):

- Login heading / wordmark text
- `document.title` default
- `DEFAULT_APP_ICON_ALT` equivalent

When unset, keep **Insightful POS**. Do not replace shop logos in demo (Top Ranch / liquor branch branding stays). Demo shortcut buttons and `is_demo` write blocking stay as today.

Ops: deploy POS; DNS `pos.nakuruhub.co.ke`; set Hub env to that origin.

---

## 7. Data and auth

No Hub migrations. No POS schema changes. No cookies shared across subdomains in this spec.

---

## 8. Testing

- Hub unit or component test: POS URL helper builds outbound href from env.
- Hub: `/pos` is in sitemap list (extend existing sitemap test if present).
- Manual: landing band visible; `/pos` EN/SW; Try the till opens POS; POS login name with env on.
- No e2e across both apps required for v1.

---

## 9. Implementation order

1. Hub env + `/pos` page + nav/footer/sitemap.
2. Landing band.
3. POS display-name env.
4. DNS + production env (ops, not code).

---

## Spec self-review

- No TBD placeholders.
- Architecture matches Hub-only marketing + outbound POS.
- Scope is one showcase slice, not SSO or in-Hub till.
- POS URL: new tab, login page, no auto demo sign-in.
