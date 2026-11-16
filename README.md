# NakuruHub (Next.js)

Next.js App Router port of the NakuruHub static prototype (`C:\Users\mhki\nakuruhub\nakuruhub`). Marketing and demo UI use the original Flamingo Lake CSS (`app/nakuru-globals.css`), not a Tailwind rewrite.

## Requirements

- [pnpm](https://pnpm.io/) 9+ (see `packageManager` in `package.json`)

## Scripts

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Dev server at [http://localhost:3000](http://localhost:3000) |
| `pnpm build` | Production build |
| `pnpm start` | Run production server (after `build`) |
| `pnpm test` | Vitest (`lib/nakuru/format.test.ts`, etc.) |
| `pnpm lint` | ESLint |

## Routes

| URL | Page |
|-----|------|
| `/` | Marketing landing (EN/SW) |
| `/app` | Interactive marketplace demo |
| `/app?start=vendor` | Opens vendor signup in the demo |

Legacy paths redirect via `next.config.ts`: `/landing.html` → `/`, `/index.html` → `/app`.

## Fonts & PWA

- Self-hosted **Bricolage Grotesque** and **Figtree** in `public/fonts/` (loaded via `@font-face` in CSS; preloaded in root `layout.tsx`).
- Web app manifest: `public/manifest.webmanifest`. PNG icons in `public/icons/` (regenerate with `pnpm icons:pwa`). Favicon: `app/icon.svg` and `public/icon.svg`.
- **PWA / install:** Service worker `public/sw.js` registers on `/app`. Install UI is in the marketplace shell only. Service workers and “Add to Home screen” work on **HTTPS** or **http://localhost** only — not on `file://`.
- **Local PWA test:** `pnpm build && pnpm start` (or `npx serve out` if exporting static), open `/app` in Chrome, use DevTools → Application → Manifest / Service workers. For a quick static server: `npx serve public -p 3000` does **not** run the Next app; use `pnpm dev` or `pnpm start` instead.

For production canonical URLs, set `NEXT_PUBLIC_SITE_URL` (e.g. `https://nakuruhub.co.ke`) so Open Graph and sitemap metadata resolve correctly. Until then, placeholders use `https://nakuruhub.example`.

## QA (local)

Playwright specs live under `e2e/` (ported from the prototype’s visual QA). With the dev server running:

```bash
pnpm exec playwright test e2e/landing.spec.mjs
pnpm exec playwright test e2e/app-smoke.spec.mjs
```

## Migration notes

Implementation plan: `docs/superpowers/plans/2026-11-15-nakuruhub-nextjs-migration.md`. Backend API integration (Express in `nakuruhub/server`) is **Phase 5**, not included here.

## Deploy

Standard Next.js deploy (e.g. [Vercel](https://vercel.com/docs/frameworks/nextjs)): `pnpm build`, set `NEXT_PUBLIC_SITE_URL`, and update `public/sitemap.xml` / `public/robots.txt` with your live domain.