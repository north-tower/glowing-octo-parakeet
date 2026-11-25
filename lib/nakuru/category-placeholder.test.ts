import { describe, expect, it } from "vitest";
import { listingPlaceholder } from "./category-placeholder";
import type { Listing } from "./types";

const base: Listing = {
  id: 1,
  c: "shop",
  e: "grid",
  t: "mikiv5",
  s: "miki",
  p: 100,
  v: 0,
};

describe("listingPlaceholder", () => {
  it("uses the listing icon key, not a generic shirt", () => {
    expect(listingPlaceholder({ ...base, e: "wrench" }).key).toBe("wrench");
    expect(listingPlaceholder({ ...base, e: "smartphone" }).key).toBe(
      "smartphone",
    );
  });

  it("falls back by listing mode when icon key is missing", () => {
    const none = "unknown" as Listing["e"];
    expect(
      listingPlaceholder({ ...base, c: "services", e: none }).tint,
    ).toBe("emerald");
    expect(listingPlaceholder({ ...base, c: "property", e: none }).key).toBe(
      "home",
    );
    expect(listingPlaceholder({ ...base, c: "cars", e: none }).key).toBe("car");
    expect(listingPlaceholder({ ...base, c: "shop", e: none }).key).toBe(
      "salad",
    );
  });
});
