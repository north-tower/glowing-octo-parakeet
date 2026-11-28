# NakuruHub POS showcase Implementation Plan

> **For agentic workers:** Execute inline in this session. Steps use checkbox syntax.

**Goal:** Hub landing + `/pos` pitch NakuruHub POS and link out to the existing POS app; POS can show that name via env.

**Architecture:** Two apps. Hub `NEXT_PUBLIC_POS_URL` for the outbound till link. POS `VITE_PUBLIC_APP_NAME` for login/title chrome only.

**Tech Stack:** Next.js App Router (Hub), Vite React (POS), Vitest, flamingo landing CSS.

## Global Constraints

- Product name on Hub: NakuruHub POS
- No iframe, no SSO, no POS restyle to flamingo
- Try the till: new tab, `rel="noopener noreferrer"`
- If POS URL unset, omit Try the till (do not invent a host)
- Skip git commits unless the user asks

---

### Task 1: POS URL helper + sitemap

**Files:** `lib/seo/pos-url.ts`, `lib/seo/pos-url.test.ts`, `app/sitemap.ts`, `README.md`

- [ ] `posAppUrl()` reads `NEXT_PUBLIC_POS_URL`, trim, strip trailing slash, empty if unset
- [ ] Sitemap includes `/pos` at priority 0.7 weekly
- [ ] README documents both env vars

### Task 2: Hub chrome + `/pos` + landing band

**Files:** header/footer, `PosBandSection`, `PosMarketingPage`, `app/pos/page.tsx`, `LandingBelowFold`

- [ ] Header: `/#categories`, `/#how`, `/pos`
- [ ] Footer POS link
- [ ] Landing band after How, before FAQ
- [ ] `/pos` metadata + same landing shell

### Task 3: POS display name

**Files:** `src/lib/appBranding.ts`, `Login.tsx`, `DemoBrandingEffect.tsx`

- [ ] `PUBLIC_APP_NAME` from `VITE_PUBLIC_APP_NAME` or Insightful POS
