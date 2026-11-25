import { describe, expect, it } from "vitest";
import { nextHeaderScrolled } from "./header-scroll-collapse";

describe("nextHeaderScrolled", () => {
  it("uses hysteresis so the shadow does not flicker at the threshold", () => {
    expect(nextHeaderScrolled(10, false)).toBe(false);
    expect(nextHeaderScrolled(13, false)).toBe(true);
    expect(nextHeaderScrolled(4, true)).toBe(true);
    expect(nextHeaderScrolled(2, true)).toBe(false);
  });
});
