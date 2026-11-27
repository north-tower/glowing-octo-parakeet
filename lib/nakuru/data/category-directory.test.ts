import { describe, expect, it } from "vitest";
import { CATEGORY_ROOT_IMAGE_SLUGS } from "@/lib/nakuru/category-root-images";
import { HUB_GROUPS } from "@/lib/nakuru/category-hub-groups";
import {
  LEGACY_CATEGORY_ALIASES,
  OFFICIAL_DIRECTORY_FALLBACK,
  officialRootSlugs,
  resolveCategoryAlias,
} from "@/lib/nakuru/data/category-directory";

describe("OFFICIAL_DIRECTORY_FALLBACK", () => {
  const slugs = new Set(OFFICIAL_DIRECTORY_FALLBACK.map((r) => r.slug));

  it("includes every hub layout slug and root image slug", () => {
    for (const slug of HUB_GROUPS.flatMap((g) => g.slugs)) {
      expect(slugs.has(slug), slug).toBe(true);
    }
    for (const slug of CATEGORY_ROOT_IMAGE_SLUGS) {
      expect(slugs.has(slug), slug).toBe(true);
    }
  });

  it("does not list hidden legacy shop/property rows", () => {
    expect(slugs.has("shop")).toBe(false);
    expect(slugs.has("property")).toBe(false);
  });

  it("has 20 official roots and nested parents that exist", () => {
    expect(officialRootSlugs()).toHaveLength(20);
    for (const row of OFFICIAL_DIRECTORY_FALLBACK) {
      if (row.parentSlug) {
        expect(slugs.has(row.parentSlug), row.slug).toBe(true);
      }
    }
  });

  it("resolves legacy aliases to canonical roots", () => {
    expect(resolveCategoryAlias("shop")).toBe("business-and-industry");
    expect(resolveCategoryAlias("property")).toBe("real-estate");
    expect(resolveCategoryAlias("vehicles")).toBe("vehicles");
    expect(Object.values(LEGACY_CATEGORY_ALIASES)).toEqual(
      expect.arrayContaining(["business-and-industry", "real-estate"]),
    );
  });
});
