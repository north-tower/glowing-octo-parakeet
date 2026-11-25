import { listingModeOf } from "@/lib/nakuru/listing-mode";
import type { CategoryId, Listing } from "@/lib/nakuru/types";

export type ListingAspect = "1" | "4/3";

export function listingAspect(category: CategoryId): ListingAspect {
  return category === "shop" ? "1" : "4/3";
}

export function listingAspectForListing(item: Listing): ListingAspect {
  return listingModeOf(item) === "shop" ? "1" : "4/3";
}

export function listingGallery(item: Listing): string[] {
  const fromList = (item.imgs ?? []).filter(Boolean);
  if (fromList.length) return fromList;
  if (item.img) return [item.img];
  return [];
}

const DEMO_ART: { match: RegExp; slug: string }[] = [
  { match: /jacket|kitenge|shirt/i, slug: "jacket" },
  { match: /charger|phone/i, slug: "charger" },
  { match: /vegg|salad|fresh/i, slug: "veggies" },
  { match: /sofa|couch/i, slug: "sofa" },
  { match: /house|bedroom|rent|milimani|property|plot|acre/i, slug: "house" },
  { match: /toyota|car|axio|subaru|motors/i, slug: "car" },
  { match: /plumb|wrench|electric|service|clean/i, slug: "tools" },
];

function demoArtSlug(item: Listing): string {
  const hay = `${item.t} ${item.e} ${item.s}`;
  for (const { match, slug } of DEMO_ART) {
    if (match.test(hay)) return slug;
  }
  switch (item.c) {
    case "shop":
      return "jacket";
    case "property":
      return "house";
    case "cars":
      return "car";
    case "services":
      return "tools";
    default:
      return "jacket";
  }
}

/** Local duotone SVG when a listing has no uploaded photo. */
export function demoPlaceholderSrc(item: Listing): string {
  const slug = demoArtSlug(item);
  const ratio = listingAspectForListing(item) === "1" ? "1x1" : "4x3";
  return `/demo/${slug}-${ratio}.svg`;
}

export function resolveListingImageSrc(item: Listing): string | null {
  const gallery = listingGallery(item);
  if (gallery[0]) return gallery[0];
  return null;
}

/** Prefer explicit photo, else in-brand demo illustration. */
export function displayImageSrc(item: Listing): string {
  return resolveListingImageSrc(item) ?? demoPlaceholderSrc(item);
}

/** Tiny teal placeholder for listing hero blur-up. */
export const LISTING_BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

export function productImageSizes(
  variant: "rail" | "grid" | "classified" | "hero" = "grid",
): string {
  if (variant === "rail") {
    return "(max-width: 767px) 42vw, (max-width: 1023px) 33vw, (max-width: 1279px) 25vw, (max-width: 1535px) 20vw, 16vw";
  }
  if (variant === "classified") {
    return "(min-width: 1440px) 270px, (min-width: 1024px) 360px, 90vw";
  }
  if (variant === "hero") {
    return "(max-width: 767px) 100vw, (max-width: 1023px) 100vw, (min-width: 1536px) 960px, 70vw";
  }
  return "(max-width: 767px) 48vw, (max-width: 1023px) 33vw, (max-width: 1279px) 25vw, (max-width: 1535px) 20vw, 16vw";
}

export function isOptimizablePhotoUrl(src: string): boolean {
  return !src.endsWith(".svg") && !src.startsWith("data:");
}

/** Generated duotone demo SVGs — not real listing photos. */
export function isPlaceholderImage(url: string | undefined | null): boolean {
  if (!url?.trim()) return false;
  try {
    const path = url.startsWith("http")
      ? new URL(url).pathname
      : url.split("?")[0] ?? url;
    return /^\/demo\/[a-z0-9-]+-\d+x\d+\.svg$/i.test(path);
  } catch {
    return /^\/demo\/[a-z0-9-]+-\d+x\d+\.svg/i.test(url.split("?")[0] ?? "");
  }
}

/** Optional named files in `public/demo/photos/` referenced by seed. */
export function demoPhotoPath(filename: string): string {
  return `/demo/photos/${filename}`;
}