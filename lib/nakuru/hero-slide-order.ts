export type MergedHeroSlide<TPlatform, TVendor> =
  | { kind: "platform"; slide: TPlatform }
  | { kind: "vendor"; slide: TVendor };

/**
 * Keeps the pay-on-delivery message first, then vendor spotlights, then remaining platform slides.
 */
export function mergeHeroSlides<TPlatform, TVendor>(
  platform: readonly TPlatform[],
  vendor: readonly TVendor[],
): MergedHeroSlide<TPlatform, TVendor>[] {
  if (!platform.length) {
    return vendor.map((slide) => ({ kind: "vendor" as const, slide }));
  }
  return [
    { kind: "platform", slide: platform[0]! },
    ...vendor.map((slide) => ({ kind: "vendor" as const, slide })),
    ...platform.slice(1).map((slide) => ({
      kind: "platform" as const,
      slide,
    })),
  ];
}