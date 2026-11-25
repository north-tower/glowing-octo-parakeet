import { describe, expect, it } from "vitest";
import { esc, formatKES, formatListingPrice, kes } from "./format";

describe("formatKES", () => {
  it("formats with en-KE locale grouping", () => {
    expect(formatKES(2500)).toBe("KES 2,500");
    expect(kes(1250000)).toBe("KES 1,250,000");
  });

  it("prefixes From when asked", () => {
    expect(formatListingPrice(2500, { from: true })).toBe("From KES 2,500");
    expect(formatListingPrice(2500)).toBe("KES 2,500");
  });
});

describe("esc", () => {
  it("escapes HTML special characters", () => {
    expect(esc(`Tom & Jerry's "shop"`)).toBe(
      "Tom &amp; Jerry&#39;s &quot;shop&quot;",
    );
  });
});