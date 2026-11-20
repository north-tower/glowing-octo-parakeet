import { describe, expect, it } from "vitest";
import type { Listing } from "@/lib/nakuru/types";
import {
  formatPropertyPrice,
  propertyListingBadge,
  propertyLocation,
  propertyTenure,
} from "./property-display";

const rentHome: Listing = {
  id: 1,
  c: "property",
  e: "home",
  t: "2 bedroom, Milimani",
  s: "Zawadi Agents",
  p: 35000,
  v: 1,
  attrs: { tenure: "rent", location: "Milimani", bedrooms: "2" },
};

describe("propertyTenure", () => {
  it("reads explicit attrs.tenure", () => {
    expect(propertyTenure(rentHome)).toBe("rent");
  });

  it("infers plot from title", () => {
    const plot: Listing = {
      ...rentHome,
      e: "mountain",
      t: "¼ acre plot, Lanet",
      attrs: { tenure: "sale" },
    };
    expect(propertyTenure(plot)).toBe("sale");
  });
});

describe("propertyLocation", () => {
  it("prefers attrs.location", () => {
    expect(propertyLocation(rentHome)).toBe("Milimani");
  });
});

describe("propertyListingBadge", () => {
  it("returns badge when set", () => {
    expect(
      propertyListingBadge({
        ...rentHome,
        attrs: { ...rentHome.attrs, badge: "Featured" },
      }),
    ).toBe("Featured");
  });
});

describe("formatPropertyPrice", () => {
  it("appends rent suffix", () => {
    const { amount, suffix } = formatPropertyPrice(35000, "rent", "en");
    expect(amount).toBe("KES 35,000");
    expect(suffix).toBe("/ month");
  });
});