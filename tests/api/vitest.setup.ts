import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadDotEnv(filename: string): void {
  const path = resolve(process.cwd(), filename);
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

loadDotEnv(".env");
loadDotEnv(".env.local");

/** Force dev Mailgun path (console log) so tests can read OTP without API calls. */
process.env.MAILGUN_API_KEY = "";
if (process.env.NODE_ENV === "production") {
  process.env.NODE_ENV = "test";
}