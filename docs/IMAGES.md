# Product and listing images

## Storage (live catalog)

- **Primary field:** `products.image_url` (public URL string, nullable).
- **Gallery:** `products.gallery_urls` (`text[]`, default `{}`). API exposes `imageUrl` and `galleryUrls`.
- **Upload path:** Supabase bucket `product-images`, object key `{vendorId}/{productId}.{jpg|png|webp}` via `lib/server/storage.ts` → `uploadProductImage`.
- **Vendor UI:** `VendorProductForm` accepts **one** image per listing (`imageDataUrl` on `POST /api/products`). No multi-image upload in the vendor form today; gallery is supported in the database and seed only.

## Client compression (current)

`lib/nakuru/resize-image.ts` runs in the browser before upload:

- Allowed types: JPEG, PNG, WebP.
- Max file size before resize: **5 MB** (`MAX_IMAGE_BYTES`).
- Longest edge scaled to **max 960 px**; output **JPEG data URL at quality 0.85**.
- Server accepts data URLs up to **5 MB** (`parseImageDataUrl`).

## Rendering in the app

- **Product cards (Home / Category):** `next/image` via `components/app/ProductCard.tsx` and `lib/nakuru/listing-image.ts` (`sizes`, AVIF/WebP for remote photos, `priority` on first two visible images, SVG demo art unoptimized).
- **Product detail:** still uses `<img>` in the gallery scroller (out of scope for this pass).
- **Fallbacks:** Duotone SVGs under `public/demo/*-{1x1|4x3}.svg`, or optional real files in `public/demo/photos/` referenced by name from `pnpm seed:demo`.

## Recommendations for vendors (documentation only)

1. Resize photos client-side to **max 1280 px** longest edge before upload.
2. Prefer **WebP** at ~**0.8** quality (or JPEG 0.85 as today).
3. Use **1–6** clear photos: front, detail, scale/context; bright light, plain background.

This pass does **not** change the upload API or vendor form.