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

  it("fills WhatsApp from the shop when the listing has no contact number", () => {
    expect(
      listingAttributesWithShopArea({}, "Milimani", "+254712345678"),
    ).toEqual({
      location: "Milimani",
      whatsapp: "+254712345678",
    });
  });

  it("keeps a listing WhatsApp over the shop number", () => {
    expect(
      listingAttributesWithShopArea(
        { whatsapp: "0711111111" },
        "Milimani",
        "+254712345678",
      ),
    ).toEqual({
      location: "Milimani",
      whatsapp: "0711111111",
    });
  });

  it("does not overwrite listing phone or mobile", () => {
    expect(
      listingAttributesWithShopArea(
        { phone: "0722222222" },
        null,
        "+254712345678",
      ),
    ).toEqual({ phone: "0722222222" });
  });
});
