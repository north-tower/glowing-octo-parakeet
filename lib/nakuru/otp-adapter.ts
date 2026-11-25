import { apiFetch, ApiError } from "@/lib/nakuru/api";
import { useLiveApi } from "@/lib/nakuru/api-mode";
import { userFromAccessToken } from "@/lib/nakuru/auth";

/**
 * Passwordless OTP adapter.
 *
 * Swap point for a real SMS/email OTP provider (e.g. Africa's Talking) or the
 * existing Next routes at `/api/auth/otp/*`.
 *
 * - Production (default): `liveOtpRequest` / `liveOtpVerify`.
 * - Client demo (opt-in): `NEXT_PUBLIC_OTP_DEMO=true`. Demo code is **123456**;
 *   does not issue server JWTs (incompatible with live API / vendor apply).
 *
 * Keep this file as the only place that knows about those two backends.
 */

export const DEMO_OTP_CODE = "123456";
export const OTP_TTL_MS = 10 * 60 * 1000;
export const OTP_MAX_RESENDS = 3;
const DEMO_SESSION_KEY = "nh:demo-otp-session";

export type OtpErrorCode =
  | "invalid_email"
  | "invalid_code"
  | "expired"
  | "rate_limited"
  | "send_failed"
  | "use_staff_login"
  | "disabled";

export class OtpAdapterError extends Error {
  readonly code: OtpErrorCode;

  constructor(code: OtpErrorCode, message: string) {
    super(message);
    this.name = "OtpAdapterError";
    this.code = code;
  }
}

export function isValidEmail(raw: string): boolean {
  const s = raw.trim();
  if (s.length < 3 || s.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export function isClientOtpDemo(): boolean {
  if (useLiveApi()) return false;
  if (process.env.NEXT_PUBLIC_OTP_DEMO === "false") return false;
  return process.env.NEXT_PUBLIC_OTP_DEMO === "true";
}

type DemoIssue = {
  issuedAt: number;
  resends: number;
};

const demoIssues = new Map<string, DemoIssue>();

function b64url(json: object): string {
  const s = JSON.stringify(json);
  const bytes =
    typeof Buffer !== "undefined"
      ? Buffer.from(s, "utf8").toString("base64")
      : btoa(s);
  return bytes.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function demoAccessToken(email: string): string {
  const header = b64url({ alg: "none", typ: "JWT" });
  const payload = b64url({
    sub: `demo:${email}`,
    role: "customer",
    email,
  });
  return `${header}.${payload}.demo`;
}

/** Isolated demo issuer — replace with Africa's Talking / email OTP. */
function demoRequest(email: string): { ok: true; devCode: string } {
  const prev = demoIssues.get(email);
  if (prev) {
    if (prev.resends >= OTP_MAX_RESENDS) {
      throw new OtpAdapterError(
        "rate_limited",
        "Too many codes sent. Wait a few minutes.",
      );
    }
    demoIssues.set(email, {
      issuedAt: Date.now(),
      resends: prev.resends + 1,
    });
  } else {
    demoIssues.set(email, { issuedAt: Date.now(), resends: 0 });
  }
  return { ok: true, devCode: DEMO_OTP_CODE };
}

/** Isolated demo checker — replace with provider verify. */
function demoVerify(email: string, code: string): { access: string } {
  const issue = demoIssues.get(email);
  if (!issue) {
    throw new OtpAdapterError("expired", "This code expired. Request a new one.");
  }
  if (Date.now() - issue.issuedAt > OTP_TTL_MS) {
    demoIssues.delete(email);
    throw new OtpAdapterError("expired", "This code expired. Request a new one.");
  }
  if (code !== DEMO_OTP_CODE) {
    throw new OtpAdapterError("invalid_code", "That code doesn’t match. Try again.");
  }
  demoIssues.delete(email);
  return { access: demoAccessToken(email) };
}

async function liveOtpRequest(
  email: string,
): Promise<{ ok: true; devCode?: string }> {
  try {
    const res = await apiFetch<{ ok: boolean; devCode?: string }>(
      "/api/auth/otp/request",
      {
        method: "POST",
        body: JSON.stringify({ email }),
        skipAuthRetry: true,
      },
    );
    return { ok: true, devCode: res.devCode };
  } catch {
    throw new OtpAdapterError("send_failed", "Could not send sign-in code");
  }
}

async function liveOtpVerify(
  email: string,
  code: string,
  remember: boolean,
): Promise<{ access: string }> {
  try {
    return await apiFetch<{ access: string }>("/api/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify({ email, code, remember }),
      skipAuthRetry: true,
    });
  } catch (err) {
    if (err instanceof ApiError) {
      const codeErr = err.body.error;
      if (codeErr === "invalid_code") {
        throw new OtpAdapterError(
          "invalid_code",
          "That code doesn’t match. Try again.",
        );
      }
      if (codeErr === "use_staff_login") {
        throw new OtpAdapterError(
          "use_staff_login",
          "Staff accounts must use the staff login page",
        );
      }
      if (codeErr === "disabled") {
        throw new OtpAdapterError("disabled", "This account is disabled");
      }
      throw new OtpAdapterError("send_failed", err.message);
    }
    throw new OtpAdapterError("send_failed", "Verification failed");
  }
}

export async function requestSignInCode(
  email: string,
): Promise<{ ok: true; devCode?: string }> {
  const normalized = email.trim().toLowerCase();
  if (!isValidEmail(normalized)) {
    throw new OtpAdapterError("invalid_email", "Enter a valid email address");
  }
  if (isClientOtpDemo()) return demoRequest(normalized);
  return liveOtpRequest(normalized);
}

export async function verifySignInCode(
  email: string,
  code: string,
  remember: boolean,
): Promise<{ access: string }> {
  const digits = code.replace(/\D/g, "").slice(0, 6);
  if (digits.length !== 6) {
    throw new OtpAdapterError("invalid_code", "Enter the 6-digit code");
  }
  if (isClientOtpDemo()) {
    const result = demoVerify(email.trim().toLowerCase(), digits);
    persistDemoSession(result.access, email.trim().toLowerCase(), remember);
    return result;
  }
  return liveOtpVerify(email.trim().toLowerCase(), digits, remember);
}

export type DemoSession = { access: string; email: string };

function storageFor(remember: boolean): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return remember ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

export function persistDemoSession(
  access: string,
  email: string,
  remember: boolean,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(DEMO_SESSION_KEY);
    window.sessionStorage.removeItem(DEMO_SESSION_KEY);
  } catch {
    /* private mode */
  }
  const store = storageFor(remember);
  try {
    store?.setItem(DEMO_SESSION_KEY, JSON.stringify({ access, email }));
  } catch {
    /* quota */
  }
}

export function readDemoSession(): DemoSession | null {
  if (typeof window === "undefined") return null;
  for (const store of [window.sessionStorage, window.localStorage]) {
    try {
      const raw = store.getItem(DEMO_SESSION_KEY);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as DemoSession;
      if (
        typeof parsed?.access === "string" &&
        typeof parsed?.email === "string" &&
        userFromAccessToken(parsed.access, parsed.email)
      ) {
        return parsed;
      }
    } catch {
      /* ignore */
    }
  }
  return null;
}

export function clearDemoSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(DEMO_SESSION_KEY);
    window.sessionStorage.removeItem(DEMO_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

/** Test helper — reset in-memory demo issues. */
export function resetDemoOtpState(): void {
  demoIssues.clear();
}
