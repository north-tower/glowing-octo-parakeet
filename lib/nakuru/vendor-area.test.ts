import { describe, expect, it } from "vitest";
import { listingAttributesWithShopArea } from "./vendor-area";

describe("listingAttributesWithShopArea", () => {
  it("fills location from the shop zone when the listing has none", () => {
    expect(listingAttributesWithShopArea({}, "Milimani")).toEqual({
      location: "Milimani",
    });
  });

  it("keeps an explicit listing location", () => {
    expect(
      listingAttributesWithShopArea(
        { location: "Section 58, Nakuru" },
        "Milimani",
      ),
    ).toEqual({ location: "Section 58, Nakuru" });
  });
});
