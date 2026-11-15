/** Client-side session helpers (in-memory access JWT; refresh lives in httpOnly cookie). */

export type AuthUser = {
  id: string;
  role: string;
  email?: string;
};

let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function clearAccessToken(): void {
  accessToken = null;
}

type JwtPayload = {
  sub?: string;
  role?: string;
};

/** Decode JWT claims for UI only (no signature verification). */
export function userFromAccessToken(
  token: string | null,
  email?: string,
): AuthUser | null {
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  if (!payload?.sub || typeof payload.role !== "string") return null;
  return {
    id: payload.sub,
    role: payload.role,
    ...(email ? { email } : {}),
  };
}

function decodeJwtPayload(token: string): JwtPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4 ? "=".repeat(4 - (b64.length % 4)) : "";
    const json = atob(b64 + pad);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}