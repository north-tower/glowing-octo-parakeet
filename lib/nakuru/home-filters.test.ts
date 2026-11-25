import { describe, expect, it } from "vitest";
import type { Listing } from "@/lib/nakuru/types";
import {
  applyHomeFilters,
  countActiveHomeFilters,
  DEFAULT_HOME_FILTERS,
  homeFiltersHref,
  homeFiltersLeaveLanding,
  parseHomeFilters,
} from "./home-filters";

const shop: Listing = {
  id: 1,
  c: "shop",
  e: "shirt",
  t: "Jacket",
  s: "Mama Fashions",
  p: 850,
  v: 1,
};
const service: Listing = {
  id: 2,
  c: "services",
  e: "wrench",
  t: "Plumber",
  s: "Peter",
  p: 2500,
  v: 0,
};
const house: Listing = {
  id: 3,
  c: "property",
  e: "home",
  t: "Bedsitter",
  s: "Kamau Homes",
  p: 8000,
  v: 1,
  attrs: { location: "Section 58, Nakuru", tenure: "rent" },
};

describe("parseHomeFilters", () => {
  it("reads shareable query params", () => {
    const p = new URLSearchParams(
      "cat=shop&sort=price-asc&verified=1&type=services&min=100&max=5000",
    );
    expect(parseHomeFilters(p)).toEqual({
      cat: "shop",
      q: "",
      sort: "price-asc",
      verified: true,
      type: "services",
      min: 100,
      max: 5000,
    });
  });
});

describe("homeFiltersHref", () => {
  it("omits defaults so /app stays clean", () => {
    expect(homeFiltersHref(DEFAULT_HOME_FILTERS)).toBe("/app");
    expect(homeFiltersHref({ cat: "cars", sort: "newest" })).toBe(
      "/app?cat=cars",
    );
  });
});

describe("applyHomeFilters", () => {
  const items = [shop, service, house];

  it("filters verified, type, and price", () => {
    const rows = applyHomeFilters(items, {
      ...DEFAULT_HOME_FILTERS,
      verified: true,
      type: "property",
    });
    expect(rows.map((i) => i.id)).toEqual([3]);
  });

  it("sorts nearest zone first", () => {
    const rows = applyHomeFilters(
      items,
      { ...DEFAULT_HOME_FILTERS, sort: "nearest" },
      "Section 58",
    );
    expect(rows[0]?.id).toBe(3);
  });
});

describe("countActiveHomeFilters", () => {
  it("counts chips besides category/search", () => {
    expect(countActiveHomeFilters(DEFAULT_HOME_FILTERS)).toBe(0);
    expect(
      countActiveHomeFilters({
        ...DEFAULT_HOME_FILTERS,
        verified: true,
        sort: "price-desc",
      }),
    ).toBe(2);
  });
});

describe("homeFiltersLeaveLanding", () => {
  it("keeps the feed when only sort changes", () => {
    expect(
      homeFiltersLeaveLanding({ ...DEFAULT_HOME_FILTERS, sort: "price-asc" }),
    ).toBe(false);
  });

  it("opens results for verified, type, or price", () => {
    expect(
      homeFiltersLeaveLanding({ ...DEFAULT_HOME_FILTERS, verified: true }),
    ).toBe(true);
    expect(
      homeFiltersLeaveLanding({ ...DEFAULT_HOME_FILTERS, type: "services" }),
    ).toBe(true);
  });
});
