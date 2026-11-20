import type { CategoryId, Listing } from "@/lib/nakuru/types";

export type ListingAspect = "1" | "4/3";

export function listingAspect(category: CategoryId): ListingAspect {
  return category === "shop" ? "1" : "4/3";
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
  { match: /house|bedroom|rent|milimani|property/i, slug: "house" },
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
  const ratio = listingAspect(item.c) === "1" ? "1x1" : "4x3";
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

export function productImageSizes(variant: "rail" | "grid" = "grid"): string {
  if (variant === "rail") {
    return "(max-width: 480px) 42vw, (max-width: 768px) 36vw, 320px";
  }
  return "(max-width: 480px) 44vw, (max-width: 1024px) 33vw, 320px";
}

export function isOptimizablePhotoUrl(src: string): boolean {
  return !src.endsWith(".svg") && !src.startsWith("data:");
}

/** Optional named files in `public/demo/photos/` referenced by seed. */
export function demoPhotoPath(filename: string): string {
  return `/demo/photos/${filename}`;
}