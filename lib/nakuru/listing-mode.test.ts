import { describe, expect, it } from "vitest";
import type { Listing } from "@/lib/nakuru/types";
import { listingModeOf } from "@/lib/nakuru/listing-mode";

describe("listingModeOf", () => {
  it("defaults community slug to shop", () => {
    expect(listingModeOf({ c: "fashion" } as Listing)).toBe("shop");
  });

  it("honors listingMode", () => {
    expect(
      listingModeOf({ c: "fashion", listingMode: "services" } as Listing),
    ).toBe("services");
  });
});