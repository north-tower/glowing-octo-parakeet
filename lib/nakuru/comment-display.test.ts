import { describe, expect, it } from "vitest";
import {
  commentPublicHandle,
  formatCommentTime,
} from "./comment-display";

describe("commentPublicHandle", () => {
  it("uses the email local-part", () => {
    expect(commentPublicHandle("jane@example.com")).toBe("jane");
  });

  it("does not return the full email", () => {
    const h = commentPublicHandle("jane.doe@example.com");
    expect(h).toBe("jane.doe");
    expect(h.includes("@")).toBe(false);
  });

  it("falls back for phone-only accounts", () => {
    expect(commentPublicHandle(null)).toBe("member");
    expect(commentPublicHandle(undefined)).toBe("member");
    expect(commentPublicHandle("")).toBe("member");
  });

  it("truncates long local-parts to 32", () => {
    const local = "a".repeat(40);
    expect(commentPublicHandle(`${local}@example.com`)).toBe("a".repeat(32));
  });
});

describe("formatCommentTime", () => {
  const now = Date.parse("2026-11-22T12:00:00.000Z");

  it("shows just now", () => {
    expect(
      formatCommentTime("2026-11-22T11:59:50.000Z", "en", now),
    ).toBe("just now");
  });

  it("shows minutes", () => {
    expect(
      formatCommentTime("2026-11-22T11:50:00.000Z", "en", now),
    ).toBe("10m ago");
  });
});
