import { describe, expect, it } from "vitest";
import {
  CATEGORY_PRESENTATION_SLUGS,
  presentationForSlug,
} from "@/lib/nakuru/category-presentation";
import { OFFICIAL_DIRECTORY_FALLBACK } from "@/lib/nakuru/data/category-directory";

describe("category presentation", () => {
  const fallback = new Set(OFFICIAL_DIRECTORY_FALLBACK.map((r) => r.slug));

  it("only keys presentation to slugs that exist in the directory", () => {
    for (const slug of CATEGORY_PRESENTATION_SLUGS) {
      expect(fallback.has(slug), slug).toBe(true);
    }
  });

  it("uses a placeholder for unknown slugs", () => {
    const p = presentationForSlug("not-a-real-category");
    expect(p.icon).toBeTruthy();
    expect(p.image).toBeNull();
  });

  it("exposes root art for official category tiles", () => {
    expect(presentationForSlug("vehicles").image).toBe("/categories/vehicles.png");
    expect(presentationForSlug("electronics").image).toBe(
      "/categories/electronics.png",
    );
  });
});
