import { describe, expect, it } from "vitest";
import { mergeHeroSlides } from "./hero-slide-order";

describe("mergeHeroSlides", () => {
  it("leads with vendor slides, then platform slides", () => {
    const merged = mergeHeroSlides(["a", "b", "c"], ["v1", "v2"]);
    expect(merged.map((s) => (s.kind === "platform" ? s.slide : `v:${s.slide}`))).toEqual([
      "v:v1",
      "v:v2",
      "a",
      "b",
      "c",
    ]);
  });

  it("returns only vendor slides when platform is empty", () => {
    const merged = mergeHeroSlides([], ["v1"]);
    expect(merged).toEqual([{ kind: "vendor", slide: "v1" }]);
  });
});