import { describe, expect, it } from "vitest";
import type { Listing } from "@/lib/nakuru/types";
import { formatListingPriceParts } from "./format-listing-price";

const shop: Listing = {
  id: 1,
  c: "shop",
  e: "shirt",
  t: "Jacket",
  s: "Mama",
  p: 2500,
  v: 0,
};

describe("formatListingPriceParts", () => {
  it("prints a plain shop price", () => {
    const p = formatListingPriceParts(shop, "en");
    expect(p.prefix).toBeNull();
    expect(p.amount).toBe("2,500");
    expect(p.label).toBe("KES 2,500");
  });

  it("prefixes services with From", () => {
    const p = formatListingPriceParts(
      { ...shop, c: "services", e: "wrench", t: "Plumber" },
      "en",
    );
    expect(p.prefix).toBe("From");
    expect(p.label).toBe("From KES 2,500");
  });

  it("adds / month for rental property", () => {
    const p = formatListingPriceParts(
      {
        ...shop,
        c: "property",
        e: "home",
        t: "Bedsitter",
        attrs: { tenure: "rent" },
      },
      "en",
    );
    expect(p.suffix).toBe("/ month");
    expect(p.label).toBe("KES 2,500 / month");
  });

  it("adds for sale for sale listings", () => {
    const p = formatListingPriceParts(
      {
        ...shop,
        c: "property",
        e: "home-sale",
        t: "Family home",
        p: 18500000,
        attrs: { tenure: "sale" },
      },
      "en",
    );
    expect(p.suffix).toBe("for sale");
  });
});
