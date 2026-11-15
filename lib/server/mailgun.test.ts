import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./config", () => ({
  config: {
    env: "development",
    mailgun: { key: "", domain: "", from: "NakuruHub <test@example.com>" },
    otpDevOnScreen: true,
  },
}));

import { sendMail } from "./mailgun";

describe("sendMail", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("logs in dev when Mailgun credentials are missing", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    await sendMail({
      to: "vendor@example.com",
      subject: "Smoke test",
      text: "Hello",
    });
    expect(log).toHaveBeenCalledWith(
      "[dev mail]",
      "vendor@example.com",
      "Smoke test",
      "Hello",
    );
  });
});