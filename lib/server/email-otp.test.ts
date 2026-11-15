import crypto from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { q, sendMail, otpSecret } = vi.hoisted(() => ({
  q: vi.fn(),
  sendMail: vi.fn(),
  otpSecret: "test-otp-hmac-secret-32-chars!!",
}));

vi.mock("./config", () => ({
  config: {
    otpSecret: "test-otp-hmac-secret-32-chars!!",
    otpDevOnScreen: false,
  },
}));

vi.mock("./db", () => ({
  db: { q },
}));

vi.mock("./mailgun", () => ({
  sendMail,
}));

import {
  check,
  issue,
  parseOtpRequestBody,
  parseOtpVerifyBody,
} from "./email-otp";

function codeHash(email: string, code: string): Buffer {
  return crypto
    .createHmac("sha256", otpSecret)
    .update(`${email}:${code}`)
    .digest();
}

describe("parseOtpRequestBody", () => {
  it("normalizes email", () => {
    expect(parseOtpRequestBody({ email: "  User@Example.COM  " })).toBe(
      "user@example.com",
    );
  });
});

describe("parseOtpVerifyBody", () => {
  it("requires six-digit code", () => {
    expect(
      parseOtpVerifyBody({ email: "a@b.com", code: "12345" }),
    ).toBeNull();
    expect(
      parseOtpVerifyBody({ email: "a@b.com", code: "123456" }),
    ).toEqual({ email: "a@b.com", code: "123456" });
  });
});

describe("issue", () => {
  beforeEach(() => {
    q.mockReset();
    sendMail.mockReset();
  });

  it("sends mail when under daily cap", async () => {
    q
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ n: 1 }] })
      .mockResolvedValueOnce({ rows: [] });

    await issue("vendor@example.com");

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "vendor@example.com",
        subject: "Your NakuruHub sign-in code",
      }),
    );
  });
});

describe("check", () => {
  beforeEach(() => {
    q.mockReset();
  });

  it("returns true and deletes row on valid code", async () => {
    const email = "user@example.com";
    const code = "042069";
    q.mockResolvedValueOnce({ rows: [{ code_hash: codeHash(email, code) }] });
    q.mockResolvedValueOnce({ rows: [] });

    await expect(check(email, code)).resolves.toBe(true);
    expect(q).toHaveBeenLastCalledWith(
      "delete from otp_codes where email = $1",
      [email],
    );
  });

  it("returns false when no active row", async () => {
    q.mockResolvedValueOnce({ rows: [] });
    await expect(check("user@example.com", "000000")).resolves.toBe(false);
  });
});