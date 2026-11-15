import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { GET as meGet } from "@/app/api/me/route";
import { POST as otpRequest } from "@/app/api/auth/otp/request/route";
import { POST as otpVerify } from "@/app/api/auth/otp/verify/route";
import { createTestServer } from "./test-server";

const hasDbEnv =
  !!process.env.DATABASE_URL &&
  !!process.env.JWT_ACCESS_SECRET &&
  !!process.env.OTP_HMAC_SECRET &&
  !!process.env.TOTP_ENC_KEY;

function testEmail(): string {
  return (
    process.env.OTP_TEST_EMAIL?.trim().toLowerCase() ||
    `vitest-otp+${Date.now()}@example.com`
  );
}

function codeFromDevMailLog(args: unknown[]): string | null {
  for (const arg of args) {
    if (typeof arg !== "string") continue;
    const m = /Your code is (\d{6})\./.exec(arg);
    if (m) return m[1];
  }
  return null;
}

describe("email OTP API", () => {
  let server: ReturnType<typeof createTestServer>;
  let consoleSpy: ReturnType<typeof vi.spyOn>;
  let dbReachable = false;

  beforeAll(async () => {
    if (hasDbEnv) {
      try {
        const { db } = await import("@/lib/server/db");
        await db.q("select 1");
        dbReachable = true;
      } catch {
        dbReachable = false;
      }
    }

    server = createTestServer({
      "/api/auth/otp/request": { POST: otpRequest },
      "/api/auth/otp/verify": { POST: otpVerify },
      "/api/me": { GET: meGet },
    });
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", () => resolve()),
    );
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterAll(async () => {
    consoleSpy.mockRestore();
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  it.skipIf(!hasDbEnv)(
    "requests OTP, verifies, and returns /me",
    async ({ skip }) => {
      if (!dbReachable) skip();

      const email = testEmail();

      await request(server)
        .post("/api/auth/otp/request")
        .send({ email })
        .expect(202)
        .expect({ ok: true });

      let code: string | null = null;
      for (const call of consoleSpy.mock.calls) {
        code = codeFromDevMailLog(call);
        if (code) break;
      }
      expect(code).toMatch(/^\d{6}$/);

      const verifyRes = await request(server)
        .post("/api/auth/otp/verify")
        .send({ email, code })
        .expect(200);

      expect(verifyRes.body.access).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
      expect(verifyRes.headers["set-cookie"]?.[0] ?? "").toContain("rt=");

      const meRes = await request(server)
        .get("/api/me")
        .set("Authorization", `Bearer ${verifyRes.body.access}`)
        .expect(200);

      expect(meRes.body).toMatchObject({
        id: expect.stringMatching(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        ),
        role: "customer",
      });
    },
  );
});