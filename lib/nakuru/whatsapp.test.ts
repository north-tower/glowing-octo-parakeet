import { describe, expect, it } from "vitest";
import { toWhatsAppHref } from "./whatsapp";

describe("toWhatsAppHref", () => {
  it("builds wa.me for a 0-prefix Kenyan mobile", () => {
    expect(toWhatsAppHref("0712345678", "Hello")).toBe(
      "https://wa.me/254712345678?text=Hello",
    );
  });

  it("accepts +254 numbers", () => {
    expect(toWhatsAppHref("+254712345678", "")).toBe(
      "https://wa.me/254712345678",
    );
  });

  it("returns null for invalid numbers", () => {
    expect(toWhatsAppHref("123", "Hi")).toBeNull();
    expect(toWhatsAppHref("", "Hi")).toBeNull();
  });
});
