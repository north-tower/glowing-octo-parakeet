import { describe, expect, it } from "vitest";
import {
  aliasMap,
  findCategory,
  leafSlugsInSubtree,
  listingInCategorySubtree,
  resolveCategorySlug,
  type SeoCategoryNode,
} from "./category-tree";

const tree: SeoCategoryNode[] = [
  {
    slug: "vehicles",
    label: "Vehicles",
    listingMode: "cars",
    parentSlug: null,
    depth: 0,
  },
  {
    slug: "cars",
    label: "Cars",
    listingMode: "cars",
    parentSlug: "vehicles",
    depth: 1,
  },
  {
    slug: "buses",
    label: "Buses",
    listingMode: "cars",
    parentSlug: "vehicles",
    depth: 1,
  },
  {
    slug: "business-and-industry",
    label: "Business",
    listingMode: "shop",
    parentSlug: null,
    depth: 0,
  },
  {
    slug: "general-merchandise",
    label: "General",
    listingMode: "shop",
    parentSlug: "business-and-industry",
    depth: 1,
  },
];

describe("seo category-tree", () => {
  it("resolves aliases", () => {
    const aliases = aliasMap([
      { aliasSlug: "shop", canonicalSlug: "business-and-industry" },
    ]);
    expect(resolveCategorySlug("shop", aliases)).toBe("business-and-industry");
    expect(resolveCategorySlug("cars", aliases)).toBe("cars");
  });

  it("collects leaf slugs under a parent", () => {
    const leaves = leafSlugsInSubtree("vehicles", tree);
    expect(leaves).toEqual(new Set(["cars", "buses"]));
    expect(leafSlugsInSubtree("cars", tree)).toEqual(new Set(["cars"]));
  });

  it("matches listings in subtree", () => {
    const vehicles = tree.find((c) => c.slug === "vehicles")!;
    expect(listingInCategorySubtree("cars", vehicles, tree)).toBe(true);
    expect(listingInCategorySubtree("general-merchandise", vehicles, tree)).toBe(
      false,
    );
  });

  it("finds category after alias resolve", () => {
    const aliases = aliasMap([
      { aliasSlug: "shop", canonicalSlug: "business-and-industry" },
    ]);
    const hit = findCategory({ categories: tree }, "shop", aliases);
    expect(hit?.slug).toBe("business-and-industry");
  });
});