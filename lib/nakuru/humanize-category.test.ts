import { describe, expect, it } from "vitest";
import { humanizeCategoryName } from "./humanize-category";

describe("humanizeCategoryName", () => {
  it("uses a known map for phone repair", () => {
    expect(humanizeCategoryName("phone-and-laptop-repair")).toBe(
      "Phone & Laptop Repair",
    );
  });

  it("prefers the name map over a raw API label", () => {
    expect(
      humanizeCategoryName("phone-and-laptop-repair", "Phone and laptop repair"),
    ).toBe("Phone & Laptop Repair");
  });

  it("uses API labels for unmapped slugs", () => {
    expect(humanizeCategoryName("custom-leaf", "Custom Leaf")).toBe("Custom Leaf");
  });

  it("title-cases unknown slugs and turns and into &", () => {
    expect(humanizeCategoryName("home-and-office-cleaning")).toBe(
      "Home & Office Cleaning",
    );
  });
});
