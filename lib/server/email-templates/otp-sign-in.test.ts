import { describe, expect, it } from "vitest";
import { buildOtpSignInMail } from "./otp-sign-in";

describe("buildOtpSignInMail", () => {
  it("includes code in text and html", () => {
    const { text, html } = buildOtpSignInMail("mike.ndegwa@gmail.com", "123456");
    expect(text).toContain("123456");
    expect(html).toContain("123456");
    expect(html).toContain("Mike Ndegwa");
  });

  it("escapes html in code", () => {
    const { html } = buildOtpSignInMail("a@b.co", "<script>");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});