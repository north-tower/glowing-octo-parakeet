import { describe, expect, it } from "vitest";
import { esc, kes } from "./format";

describe("kes", () => {
  it("formats with en-KE locale grouping", () => {
    expect(kes(2500)).toBe("KES 2,500");
    expect(kes(1250000)).toBe("KES 1,250,000");
  });
});

describe("esc", () => {
  it("escapes HTML special characters", () => {
    expect(esc(`Tom & Jerry's "shop"`)).toBe(
      "Tom &amp; Jerry&#39;s &quot;shop&quot;",
    );
  });
});