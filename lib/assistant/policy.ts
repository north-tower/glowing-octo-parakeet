const MAX_INPUT = 500;
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 20;

type RateBucket = { count: number; windowStart: number };
const rateBuckets = new Map<string, RateBucket>();

export function clampUserInput(text: string): string {
  return text.trim().slice(0, MAX_INPUT);
}

/** Redact digit sequences that look like cards or national IDs before storage/logs. */
export function redactSensitiveText(text: string): string {
  let out = text.replace(/\b(?:\d[ -]*?){13,19}\b/g, "[redacted]");
  out = out.replace(/\b\d{6,12}\b/g, "[redacted]");
  return out;
}

export function checkDemoRateLimit(key = "demo"): { ok: true } | { ok: false; message: string } {
  const now = Date.now();
  const bucket = rateBuckets.get(key) ?? { count: 0, windowStart: now };
  if (now - bucket.windowStart > RATE_WINDOW_MS) {
    bucket.count = 0;
    bucket.windowStart = now;
  }
  bucket.count += 1;
  rateBuckets.set(key, bucket);
  if (bucket.count > RATE_MAX) {
    return {
      ok: false,
      message:
        "You're sending messages quickly. Please wait a moment and try again.",
    };
  }
  return { ok: true };
}

export const OUT_OF_SCOPE_REFUSAL = {
  en: "I can't help with that here. I'm focused on NakuruHub shopping, payments, delivery, and selling.",
  sw: "Siwezi kusaidia hilo hapa. Ninaangazia ununuzi, malipo, usafirishaji na uuzaaji kwenye NakuruHub.",
};

export const POLICY_MAX_INPUT = MAX_INPUT;