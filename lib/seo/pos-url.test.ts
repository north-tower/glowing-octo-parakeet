import { afterEach, describe, expect, it, vi } from "vitest";
import { posAppUrl } from "./pos-url";

describe("posAppUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns empty when unset", () => {
    vi.stubEnv("NEXT_PUBLIC_POS_URL", "");
    expect(posAppUrl()).toBe("");
  });

  it("strips trailing slashes", () => {
    vi.stubEnv("NEXT_PUBLIC_POS_URL", "https://pos.nakuruhub.co.ke/");
    expect(posAppUrl()).toBe("https://pos.nakuruhub.co.ke");
  });
});
