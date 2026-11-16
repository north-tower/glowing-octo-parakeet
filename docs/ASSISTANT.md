# NakuruHub in-app assistant

## Architecture

```
Entry points (header, product, cart, search, account)
        │
        ▼
AssistantUiProvider (React) ── builds AssistantContext from app state
        │
        ├── policy.ts (input clamp, PII redaction, demo rate limit)
        ├── getAssistantProvider()
        │     ├── mockProvider (default, local intent + knowledge)
        │     └── remoteProvider → POST /api/assistant (stub 501)
        └── actions.ts (whitelisted executor; setZone needs confirm)
```

Swappable brain: implement `AssistantProvider` in `lib/assistant/provider.ts` and select via `NEXT_PUBLIC_ASSISTANT_MODE` (`demo` | `remote`).

## Add an intent

1. Add patterns in `lib/assistant/intent.ts` (`RULES` + optional `contextBoost`).
2. Add copy/actions in `lib/assistant/knowledge.ts` (`buildIntentReply`) using existing `home-i18n` / FAQ facts only.
3. Add phrases to `lib/assistant/intent.test.ts`.
4. Optional quick-reply ids in `lib/assistant/suggestions.ts`.

## Switch to remote mode

Set `NEXT_PUBLIC_ASSISTANT_MODE=remote`. Implement `app/api/assistant/route.ts` to stream NDJSON `AssistantEvent` lines (see below). Keys only in server env (e.g. `ASSISTANT_API_KEY`).

## `/api/assistant` contract

**Request:** `POST` JSON `{ messages: AssistantMessage[], context: AssistantContext }`

**Response:** `200` with `Content-Type: application/x-ndjson` body, one JSON object per line:

| Event | Fields |
|-------|--------|
| `text-delta` | `text: string` |
| `parts` | `parts: AssistantPart[]` |
| `action` | `action`, optional `requiresConfirm`, `label` |
| `done` | — |
| `error` | `message` |

Demo stub returns **501** `{ "error": "not enabled" }`.

## Security checklist

- [ ] Model/API keys only in server env vars
- [ ] Rate limits (IP + user) on `/api/assistant`
- [ ] Max input length (500 chars) server + client
- [ ] PII redaction before logs/storage (`policy.ts`)
- [ ] Treat user messages and product text as untrusted (prompt injection)
- [ ] Tool whitelist only (`actions.ts`); no cart edits, payments, sign-out
- [ ] No money-moving tools

## Evaluation checklist (20 questions)

| # | Question | Expected |
|---|----------|----------|
| 1 | What is Verified? | ID/shop checks; M-Pesa upfront vs COD |
| 2 | Why can't I pay M-Pesa? (cart w/ unverified) | Names blocking items |
| 3 | Payment options | COD always; M-Pesa now when all Verified |
| 4 | Deliver to Milimani | Nakuru zones; optional setZone confirm |
| 5 | Outside Nakuru? | Waitlist / not served yet |
| 6 | Free delivery? | First order in Nakuru; shown at checkout when signed in |
| 7 | How to track order? | Cart tab; delivery code to rider |
| 8 | Property viewing | View first, no instant pay |
| 9 | Car listing | View first |
| 10 | Plumber / services | Request quote |
| 11 | How to sell? | Free list; seller sign-up action |
| 12 | Install app | startInstall |
| 13 | Find phones | search action + product cards |
| 14 | Talk to human | openHelp (+ message seller if product context) |
| 15 | Habari (SW) | Greeting + quick replies |
| 16 | lipa ukifika | Payment / COD copy |
| 17 | bei (SW) | Payment intent |
| 18 | Loan advice | Refusal / fallback |
| 19 | Set zone Lanet | setZone confirm chip |
| 20 | Random nonsense | Fallback + quick replies + help |

## Analytics (client)

CustomEvents: `nh:assistant-open`, `nh:assistant-message`, `nh:assistant-action`, `nh:assistant-fallback` (no external send in demo).