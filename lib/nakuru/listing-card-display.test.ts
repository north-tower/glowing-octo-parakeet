import { describe, expect, it } from "vitest";
import type { Listing } from "@/lib/nakuru/types";
import {
  classifiedCategoryLabel,
  classifiedLocation,
  classifiedPhotoBadge,
  formatClassifiedPrice,
} from "./listing-card-display";

const shop: Listing = {
  id: 1,
  c: "shop",
  e: "shirt",
  t: "Premium leather office chair",
  s: "Urban Living Store",
  p: 18500,
  v: 0,
  attrs: { location: "Section 58, Nakuru" },
};

describe("classifiedCategoryLabel", () => {
  it("uses marketplace labels from the classifieds mock", () => {
    expect(classifiedCategoryLabel(shop, "en")).toBe("Shopping");
    expect(classifiedCategoryLabel({ ...shop, c: "cars" }, "en")).toBe(
      "Vehicles",
    );
    expect(classifiedCategoryLabel({ ...shop, c: "property" }, "en")).toBe(
      "Property",
    );
  });

  it("prefers API categoryLabel", () => {
    expect(
      classifiedCategoryLabel({ ...shop, categoryLabel: "Jobs" }, "en"),
    ).toBe("Jobs");
  });
});

describe("classifiedPhotoBadge", () => {
  it("uses listing badge when set", () => {
    expect(
      classifiedPhotoBadge(
        { ...shop, c: "property", attrs: { badge: "Featured" } },
        "en",
      ),
    ).toBe("Featured");
  });

  it("falls back to category name", () => {
    expect(classifiedPhotoBadge(shop, "en")).toBe("Shopping");
  });
});

describe("classifiedLocation", () => {
  it("prefers attrs.location over the delivery zone", () => {
    expect(classifiedLocation(shop, "Town/CBD")).toBe("Section 58, Nakuru");
  });

  it("uses the delivery zone when the listing has no location", () => {
    expect(classifiedLocation({ ...shop, attrs: undefined }, "Town/CBD")).toBe(
      "Town/CBD",
    );
  });
});

describe("formatClassifiedPrice", () => {
  it("uses the Ksh prefix from the mock", () => {
    expect(formatClassifiedPrice(18500000)).toBe("Ksh 18,500,000");
  });
});
