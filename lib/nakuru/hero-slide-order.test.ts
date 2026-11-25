import { describe, expect, it } from "vitest";
import { mergeHeroSlides } from "./hero-slide-order";

describe("mergeHeroSlides", () => {
  it("inserts vendor slides after the first platform slide", () => {
    const merged = mergeHeroSlides(["a", "b", "c"], ["v1", "v2"]);
    expect(merged.map((s) => (s.kind === "platform" ? s.slide : `v:${s.slide}`))).toEqual([
      "a",
      "v:v1",
      "v:v2",
      "b",
      "c",
    ]);
  });

  it("returns only vendor slides when platform is empty", () => {
    const merged = mergeHeroSlides([], ["v1"]);
    expect(merged).toEqual([{ kind: "vendor", slide: "v1" }]);
  });
});