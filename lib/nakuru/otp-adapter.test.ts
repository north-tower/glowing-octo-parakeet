import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DEMO_OTP_CODE,
  isClientOtpDemo,
  isValidEmail,
  requestSignInCode,
  resetDemoOtpState,
  verifySignInCode,
} from "./otp-adapter";

describe("otp-adapter demo", () => {
  afterEach(() => {
    resetDemoOtpState();
    vi.unstubAllEnvs();
  });

  it("accepts a normal email", () => {
    expect(isValidEmail("you@example.com")).toBe(true);
    expect(isValidEmail("nope")).toBe(false);
  });

  it("verifies the demo code and rejects a wrong one", async () => {
    vi.stubEnv("NEXT_PUBLIC_OTP_DEMO", "true");
    await requestSignInCode("you@example.com");
    await expect(
      verifySignInCode("you@example.com", "000000", false),
    ).rejects.toMatchObject({ code: "invalid_code" });
    const ok = await verifySignInCode("you@example.com", DEMO_OTP_CODE, false);
    expect(ok.access.split(".")).toHaveLength(3);
  });

  it("rate-limits extra resends", async () => {
    vi.stubEnv("NEXT_PUBLIC_OTP_DEMO", "true");
    await requestSignInCode("you@example.com");
    await requestSignInCode("you@example.com");
    await requestSignInCode("you@example.com");
    await requestSignInCode("you@example.com");
    await expect(requestSignInCode("you@example.com")).rejects.toMatchObject({
      code: "rate_limited",
    });
  });

  it("uses server OTP when live API mode is on", () => {
    vi.stubEnv("NEXT_PUBLIC_OTP_DEMO", "true");
    vi.stubEnv("NEXT_PUBLIC_USE_LIVE_API", "true");
    expect(isClientOtpDemo()).toBe(false);
  });

  it("disables client demo unless explicitly enabled", () => {
    vi.stubEnv("NEXT_PUBLIC_OTP_DEMO", undefined);
    vi.stubEnv("NEXT_PUBLIC_USE_LIVE_API", undefined);
    expect(isClientOtpDemo()).toBe(false);
  });
});
