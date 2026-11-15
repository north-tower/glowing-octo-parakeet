function needEnv(key: string, minLen = 1): string {
  const v = process.env[key];
  if (!v || v.length < minLen) {
    throw new Error(`Missing or too-short env var ${key}`);
  }
  return v;
}

const prod = (process.env.NODE_ENV || "development") === "production";

const mailgun = {
  key: process.env.MAILGUN_API_KEY || "",
  domain: process.env.MAILGUN_DOMAIN || "",
  from: process.env.MAILGUN_FROM || "",
};

if (prod && (!mailgun.key || !mailgun.domain || !mailgun.from)) {
  throw new Error(
    "Production needs MAILGUN_API_KEY, MAILGUN_DOMAIN, MAILGUN_FROM",
  );
}

const totpKey = needEnv("TOTP_ENC_KEY", 43);
if (Buffer.from(totpKey, "base64url").length !== 32) {
  throw new Error("TOTP_ENC_KEY must decode to exactly 32 bytes");
}

const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  "";

export const config = {
  env: process.env.NODE_ENV || "development",
  dbUrl: needEnv("DATABASE_URL"),
  dbSsl: process.env.DB_SSL === "off" ? ("off" as const) : ("verify" as const),
  accessSecret: needEnv("JWT_ACCESS_SECRET", 32),
  otpSecret: needEnv("OTP_HMAC_SECRET", 32),
  totpKey,
  accessTtl: "10m" as const,
  refreshDays: 30,
  mailgun,
  supabase: {
    url:
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    serviceKey: supabaseServiceKey,
  },
  otpEnforceVendorDocs: process.env.OTP_ENFORCE_VENDOR_DOCS === "true",
  launchCategories: (process.env.LAUNCH_CATEGORIES || "shop,services")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
} as const;

export type AppConfig = typeof config;