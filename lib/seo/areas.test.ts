import { describe, expect, it } from "vitest";
import { areaBySlug, areaForLocation, SEO_AREAS } from "./areas";

describe("areaForLocation", () => {
  it("matches free-text listing locations to an area", () => {
    expect(areaForLocation("Section 58, Nakuru")?.slug).toBe("section-58");
    expect(areaForLocation("Milimani")?.slug).toBe("milimani");
    expect(areaForLocation("Town/CBD")?.slug).toBe("town-cbd");
    expect(areaForLocation("free area estate")?.slug).toBe("free-area");
  });

  it("returns undefined for unknown or empty locations", () => {
    expect(areaForLocation("Eldoret")).toBeUndefined();
    expect(areaForLocation("")).toBeUndefined();
    expect(areaForLocation(null)).toBeUndefined();
  });

  it("does not match partial words", () => {
    expect(areaForLocation("Planet Mall")).toBeUndefined();
  });
});

describe("SEO_AREAS", () => {
  it("has unique URL-safe slugs", () => {
    const slugs = SEO_AREAS.map((a) => a.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    expect(areaBySlug("lanet")?.name).toBe("Lanet");
  });
});
