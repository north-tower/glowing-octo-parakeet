import jwt from "jsonwebtoken";
import { config } from "./config";
import type { SessionUser } from "./tokens";

export function bearerUser(req: Request): SessionUser | null {
  const m = /^Bearer ([\w-]+\.[\w-]+\.[\w-]+)$/.exec(
    req.headers.get("authorization") || "",
  );
  if (!m) return null;
  try {
    const p = jwt.verify(m[1], config.accessSecret, {
      algorithms: ["HS256"],
      issuer: "nakuruhub",
    }) as jwt.JwtPayload;
    if (typeof p.sub !== "string" || typeof p.role !== "string") return null;
    return { id: p.sub, role: p.role };
  } catch {
    return null;
  }
}

export function requireRole(user: SessionUser, ...roles: string[]): boolean {
  return roles.includes(user.role);
}