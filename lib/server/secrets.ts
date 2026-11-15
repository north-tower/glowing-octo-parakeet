import crypto from "node:crypto";
import { config } from "./config";

const key = () => Buffer.from(config.totpKey, "base64url");

/** AES-256-GCM for staff authenticator secrets stored in the database. */
export function enc(plain: string): string {
  const iv = crypto.randomBytes(12);
  const ci = crypto.createCipheriv("aes-256-gcm", key(), iv);
  const ct = Buffer.concat([ci.update(plain, "utf8"), ci.final()]);
  return (
    "v1." + Buffer.concat([iv, ci.getAuthTag(), ct]).toString("base64url")
  );
}

export function dec(s: string): string {
  if (typeof s !== "string" || !s.startsWith("v1.")) {
    throw new Error("bad secret");
  }
  const b = Buffer.from(s.slice(3), "base64url");
  const d = crypto.createDecipheriv("aes-256-gcm", key(), b.subarray(0, 12));
  d.setAuthTag(b.subarray(12, 28));
  return Buffer.concat([d.update(b.subarray(28)), d.final()]).toString(
    "utf8",
  );
}