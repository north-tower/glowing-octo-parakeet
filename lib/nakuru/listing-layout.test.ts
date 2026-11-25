import { describe, expect, it } from "vitest";
import { isFixedPrice, LISTING_LAYOUT } from "./listing-layout";

describe("LISTING_LAYOUT", () => {
  it("keeps cart UX on shop only", () => {
    expect(LISTING_LAYOUT.shop.showQuantity).toBe(true);
    expect(LISTING_LAYOUT.shop.showDelivery).toBe(true);
    expect(LISTING_LAYOUT.shop.showFreeDeliveryPromo).toBe(true);
    expect(LISTING_LAYOUT.shop.primaryCta).toBe("addToCart");
  });

  it("drops cart and delivery for services", () => {
    expect(LISTING_LAYOUT.services.showQuantity).toBe(false);
    expect(LISTING_LAYOUT.services.showDelivery).toBe(false);
    expect(LISTING_LAYOUT.services.showFreeDeliveryPromo).toBe(false);
    expect(LISTING_LAYOUT.services.priceFromUnlessFixed).toBe(true);
    expect(LISTING_LAYOUT.services.primaryCta).toBe("requestQuote");
  });

  it("uses viewing CTA for property and cars", () => {
    expect(LISTING_LAYOUT.property.primaryCta).toBe("requestViewing");
    expect(LISTING_LAYOUT.cars.primaryCta).toBe("requestViewing");
    expect(LISTING_LAYOUT.property.showQuantity).toBe(false);
  });
});

describe("isFixedPrice", () => {
  it("treats priceKind=fixed as fixed", () => {
    expect(isFixedPrice({ priceKind: "fixed" })).toBe(true);
    expect(isFixedPrice({ priceKind: "from" })).toBe(false);
    expect(isFixedPrice({ fixedPrice: "true" })).toBe(true);
    expect(isFixedPrice(undefined)).toBe(false);
  });
});
