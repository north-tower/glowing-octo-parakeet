/**
 * Remote assistant API stub (not enabled in demo builds).
 *
 * Future implementation notes:
 * - System prompt + tool schema: define here or in lib/assistant/prompt.ts
 * - Rate limiting: per-IP / per-user middleware before model call
 * - Input length limits: enforce POLICY_MAX_INPUT server-side
 * - PII redaction: reuse lib/assistant/policy redactSensitiveText on logs
 * - Logging policy: structured logs without raw card/ID numbers; audit actions only
 * - API key: read ONLY from server env (e.g. process.env.ASSISTANT_API_KEY), never NEXT_PUBLIC_
 * - Model stream: NDJSON lines matching AssistantEvent (`text-delta`, `parts`, `action`, `done`, `error`)
 */

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "not enabled", message: "Assistant API is not enabled in this environment." },
    { status: 501 },
  );
}