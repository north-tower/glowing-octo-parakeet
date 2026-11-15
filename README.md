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
- Web app manifest: `public/manifest.webmanifest`. Favicon / app icon: `app/icon.svg` and `public/icon.svg`.

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