import { describe, expect, it } from "vitest";
import { toProductCardItem, type ApiListing } from "@/lib/nakuru/listings-map";

describe("toProductCardItem", () => {
  it("maps API rows to card model", () => {
    const api: ApiListing = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      category: "shop",
      title: "Ankara dress",
      emoji: "👗",
      price: 2500,
      vendor: "Mama Fashions",
      verified: true,
    };
    const card = toProductCardItem(api);
    expect(card.id).toBe(api.id);
    expect(card.c).toBe("shop");
    expect(card.t).toBe("Ankara dress");
    expect(card.s).toBe("Mama Fashions");
    expect(card.p).toBe(2500);
    expect(card.v).toBe(1);
  });

  it("uses description subtitle for services", () => {
    const card = toProductCardItem({
      id: "abc",
      category: "services",
      title: "Peter, plumber",
      description: "Leaks and fittings",
      emoji: "🔧",
      price: 700,
      vendor: "Peter",
      verified: false,
    });
    expect(card.s).toBe("Leaks and fittings");
    expect(card.v).toBe(0);
    expect(card.desc).toBe("Leaks and fittings");
  });

  it("maps description for detail view", () => {
    const card = toProductCardItem({
      id: "x",
      category: "shop",
      title: "Dress",
      description: "Size M, cotton blend",
      emoji: "👗",
      price: 1200,
      vendor: "Boutique",
      verified: true,
    });
    expect(card.desc).toBe("Size M, cotton blend");
  });
});