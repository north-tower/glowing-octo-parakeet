/** Official root slugs with static art in `public/categories/{slug}.png`. */
export const CATEGORY_ROOT_IMAGE_SLUGS = [
  "vehicles",
  "real-estate",
  "stays",
  "mobile-phones-tablets",
  "electronics",
  "home-garden",
  "fashion-and-beauty",
  "health-and-beauty",
  "babies-and-kids",
  "animals-and-pets",
  "agriculture-and-foodstuff",
  "hobbies-art-sport",
  "office-and-commercial-equipment-tools",
  "business-and-industry",
  "services",
  "repair-and-construction",
  "taxi",
  "rider",
  "jobs",
  "seeking-work-cvs",
] as const;

export type CategoryRootImageSlug = (typeof CATEGORY_ROOT_IMAGE_SLUGS)[number];

const ROOT_IMAGE_SET = new Set<string>(CATEGORY_ROOT_IMAGE_SLUGS);

export function imageForCategorySlug(slug: string): string | null {
  if (!ROOT_IMAGE_SET.has(slug)) return null;
  return `/categories/${slug}.png`;
}