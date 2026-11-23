import { describe, expect, it } from "vitest";
import { buildCategoryTree } from "./category-tree";

describe("buildCategoryTree", () => {
  it("nests children under roots", () => {
    const tree = buildCategoryTree([
      {
        slug: "vehicles",
        label: "Vehicles",
        kind: "official",
        listingMode: "cars",
        openForApply: false,
        sortOrder: 10,
        parentSlug: null,
        depth: 0,
      },
      {
        slug: "cars",
        label: "Cars",
        kind: "official",
        listingMode: "cars",
        openForApply: false,
        sortOrder: 11,
        parentSlug: "vehicles",
        depth: 1,
      },
    ]);
    expect(tree).toHaveLength(1);
    expect(tree[0]!.slug).toBe("vehicles");
    expect(tree[0]!.children[0]!.slug).toBe("cars");
  });
});