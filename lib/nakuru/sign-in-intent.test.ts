import { describe, expect, it } from "vitest";
import { intentFromStartParam, signInCopy } from "./sign-in-intent";

describe("intentFromStartParam", () => {
  it("defaults to shop", () => {
    expect(intentFromStartParam(null, false)).toBe("shop");
    expect(intentFromStartParam("shop", false)).toBe("shop");
  });

  it("detects seller entry", () => {
    expect(intentFromStartParam("vendor", false)).toBe("seller");
    expect(intentFromStartParam(null, true)).toBe("seller");
  });
});

describe("signInCopy", () => {
  it("uses distinct headings", () => {
    expect(signInCopy("shop").emailTitle).toBe("Shop sign-in");
    expect(signInCopy("seller").emailTitle).toBe("Seller sign-in");
  });
});