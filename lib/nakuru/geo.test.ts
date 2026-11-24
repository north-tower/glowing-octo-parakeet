import { describe, expect, it } from "vitest";
import { inNakuruBox, nearestNakuruZone } from "./geo";

describe("nearestNakuruZone", () => {
  it("maps Milimani coordinates to Milimani", () => {
    expect(nearestNakuruZone(-0.292, 36.078)).toBe("Milimani");
  });

  it("maps CBD coordinates to Town/CBD", () => {
    expect(nearestNakuruZone(-0.2833, 36.0667)).toBe("Town/CBD");
  });

  it("returns null outside the Nakuru box", () => {
    expect(nearestNakuruZone(-1.2921, 36.8219)).toBeNull();
  });
});

describe("inNakuruBox", () => {
  it("accepts points inside the box", () => {
    expect(inNakuruBox(-0.29, 36.08)).toBe(true);
  });

  it("rejects distant points", () => {
    expect(inNakuruBox(0, 37)).toBe(false);
  });
});