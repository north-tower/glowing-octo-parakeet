import { describe, expect, it } from "vitest";
import { cleanDescription } from "./clean-description";

describe("cleanDescription", () => {
  it("strips instruction prefix, category-name line, quotes, asterisks, and dupes", () => {
    const raw = `Sawa, hapa imejazwa tayari - copy paste tu kwa NakuruHub:
*New category name:* Phone & Laptop Repair
> Fast board-level repair
> Fast board-level repair
*Same-day quotes*
- Screens and batteries
- Screens and batteries
- Charging ports`;

    expect(cleanDescription(raw)).toEqual({
      paragraphs: ["Fast board-level repair Same-day quotes"],
      bullets: ["Screens and batteries", "Charging ports"],
    });
  });

  it("collapses blank lines into paragraphs", () => {
    const raw = `We repair phones.


We also do laptops.`;
    expect(cleanDescription(raw).paragraphs).toEqual([
      "We repair phones.",
      "We also do laptops.",
    ]);
  });

  it("cleans the live phone-repair paste blob", () => {
    const raw = [
      "Sawa, hapa imejazwa tayari – copy paste tu kwa NakuruHub:",
      "",
      "*New category name:*",
      "- Phone & Laptop Repair",
      "",
      "- Phone and Laptop Repair – Fast &",
      "> Tracytech Solutions – Phone & L",
    ].join("\n");
    const out = cleanDescription(raw);
    expect(out.paragraphs.join(" ")).not.toMatch(/sawa/i);
    expect(out.paragraphs.join(" ")).not.toMatch(/new category name/i);
    expect(out.bullets.some((b) => /phone/i.test(b))).toBe(true);
  });

  it("returns empty for blank input", () => {
    expect(cleanDescription("")).toEqual({ paragraphs: [], bullets: [] });
    expect(cleanDescription(null)).toEqual({ paragraphs: [], bullets: [] });
  });
});
