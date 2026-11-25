export type MergedHeroSlide<TPlatform, TVendor> =
  | { kind: "platform"; slide: TPlatform }
  | { kind: "vendor"; slide: TVendor };

/**
 * Vendor spotlights lead the carousel so a live shop is the first thing people see.
 */
export function mergeHeroSlides<TPlatform, TVendor>(
  platform: readonly TPlatform[],
  vendor: readonly TVendor[],
): MergedHeroSlide<TPlatform, TVendor>[] {
  return [
    ...vendor.map((slide) => ({ kind: "vendor" as const, slide })),
    ...platform.map((slide) => ({ kind: "platform" as const, slide })),
  ];
}