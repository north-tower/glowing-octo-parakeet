import { describe, expect, it } from "vitest";
import {
  CATEGORY_ROOT_IMAGE_SLUGS,
  imageForCategorySlug,
} from "./category-root-images";

describe("imageForCategorySlug", () => {
  it("maps official roots to /categories/{slug}.png", () => {
    for (const slug of CATEGORY_ROOT_IMAGE_SLUGS) {
      expect(imageForCategorySlug(slug)).toBe(`/categories/${slug}.png`);
    }
  });

  it("returns null for unknown slugs", () => {
    expect(imageForCategorySlug("cars")).toBeNull();
    expect(imageForCategorySlug("unknown")).toBeNull();
  });
});