import { describe, expect, it } from "vitest";
import { isExtremePhotoAspect } from "./listing-image";

describe("isExtremePhotoAspect", () => {
  it("treats 4:3 and 1:1 as cover-safe", () => {
    expect(isExtremePhotoAspect(800, 600)).toBe(false);
    expect(isExtremePhotoAspect(600, 600)).toBe(false);
  });

  it("flags banners and tall posters", () => {
    expect(isExtremePhotoAspect(1920, 600)).toBe(true);
    expect(isExtremePhotoAspect(600, 1200)).toBe(true);
  });

  it("ignores missing metadata", () => {
    expect(isExtremePhotoAspect(undefined, 600)).toBe(false);
    expect(isExtremePhotoAspect(0, 0)).toBe(false);
  });
});
