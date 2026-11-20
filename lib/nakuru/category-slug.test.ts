import { describe, expect, it } from "vitest";
import { slugifyCategoryLabel } from "@/lib/nakuru/category-slug";

describe("slugifyCategoryLabel", () => {
  it("lowercases and hyphenates", () => {
    expect(slugifyCategoryLabel("Fashion")).toBe("fashion");
    expect(slugifyCategoryLabel("  Home  Decor ")).toBe("home-decor");
  });

  it("treats slash as a separator and strips other punctuation", () => {
    expect(slugifyCategoryLabel("Kids/Baby")).toBe("kids-baby");
    expect(slugifyCategoryLabel("A & B!!!")).toBe("a-b");
  });

  it("collapses dashes and returns empty for junk", () => {
    expect(slugifyCategoryLabel("foo---bar")).toBe("foo-bar");
    expect(slugifyCategoryLabel("!!!")).toBe("");
  });
});