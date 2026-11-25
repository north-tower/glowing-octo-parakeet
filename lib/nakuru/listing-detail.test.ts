import { describe, expect, it } from "vitest";
import {
  attributeRowsFromRecord,
  listingDisplayPrice,
  listingKeyFacts,
  toProductDetail,
} from "./listing-detail";
import type { Listing } from "@/lib/nakuru/types";

const service: Listing = {
  id: "svc",
  c: "phone-and-laptop-repair",
  listingMode: "services",
  categoryLabel: "Phone & Laptop Repair",
  e: "bolt",
  t: "Phone and laptop fast and affordable",
  s: "Nakuru Tech Hub",
  vn: "Nakuru Tech Hub",
  p: 2500,
  v: 0,
  desc: "Board-level repair",
  attrs: {
    location: "Nakuru CBD",
    serviceArea: "Nakuru town",
    hours: "Mon–Sat 8am–6pm",
    walkInAddress: "Kenyatta Avenue",
  },
};

describe("attributeRowsFromRecord", () => {
  it("hides contact numbers that already power WhatsApp", () => {
    const rows = attributeRowsFromRecord(
      {
        location: "Milimani",
        whatsapp: "+254712345678",
        phone: "0711111111",
        mobile: "0722222222",
      },
      "en",
    );
    expect(rows.map((r) => r.label)).toEqual(["Location"]);
  });
});

describe("listingDisplayPrice", () => {
  it("prefixes From on services unless the price is fixed", () => {
    expect(listingDisplayPrice(service)).toBe("From KES 2,500");
    expect(
      listingDisplayPrice({
        ...service,
        attrs: { ...service.attrs, priceKind: "fixed" },
      }),
    ).toBe("KES 2,500");
  });
});

describe("listingKeyFacts", () => {
  it("omits empty rows and includes location, category, hours, area", () => {
    const detail = toProductDetail(service, "en");
    const keys = listingKeyFacts(detail, "en").map((f) => f.key);
    expect(keys).toContain("location");
    expect(keys).toContain("category");
    expect(keys).toContain("hours");
    expect(keys).toContain("serviceArea");
    expect(keys).not.toContain("condition");
  });
});
