import { describe, expect, it } from "vitest";
import type { DirectoryCategory } from "@/lib/nakuru/data/category-directory";
import {
  defaultListingCategorySlug,
  listingLeavesForVendor,
  vendorApplyChipRows,
} from "@/lib/nakuru/vendor-category-pick";

function row(partial: Partial<DirectoryCategory> & Pick<DirectoryCategory, "slug" | "label">): DirectoryCategory {
  return {
    kind: "official",
    listingMode: "shop",
    visible: true,
    openForApply: true,
    sortOrder: 10,
    parentSlug: null,
    depth: 0,
    hasChildren: false,
    ...partial,
  };
}

describe("vendorApplyChipRows", () => {
  it("includes every visible root and open community rows", () => {
    const rows: DirectoryCategory[] = [
      row({ slug: "electronics", label: "Electronics", depth: 0, sortOrder: 40 }),
      row({ slug: "vitest-bikes", label: "Vitest Bikes", kind: "community", depth: 1, parentSlug: "business-and-industry", sortOrder: 500 }),
    ];
    const chips = vendorApplyChipRows(rows);
    expect(chips.map((c) => c.slug)).toEqual(["electronics", "vitest-bikes"]);
  });

  it("limits listing leaves to vendor profile roots", () => {
    const rows: DirectoryCategory[] = [
      row({ slug: "vehicles", label: "Vehicles", depth: 0, hasChildren: true }),
      row({
        slug: "cars",
        label: "Cars",
        depth: 1,
        parentSlug: "vehicles",
        hasChildren: false,
      }),
      row({
        slug: "mobile-phones",
        label: "Mobile Phones",
        depth: 1,
        parentSlug: "mobile-phones-tablets",
        hasChildren: false,
      }),
    ];
    const leaves = listingLeavesForVendor(rows, ["vehicles"]);
    expect(leaves.map((l) => l.slug)).toEqual(["cars"]);
    expect(defaultListingCategorySlug(leaves, ["vehicles"], rows)).toBe("cars");
  });

  it("dedupes when a slug would appear twice", () => {
    const rows: DirectoryCategory[] = [
      row({ slug: "electronics", label: "Electronics", depth: 0 }),
      row({ slug: "electronics", label: "Electronics dup", depth: 0 }),
    ];
    expect(vendorApplyChipRows(rows)).toHaveLength(1);
  });
});