import type { AssistantContext, AssistantIntent } from "./types";

export type IntentRule = {
  intent: AssistantIntent;
  phrases: string[];
  weight?: number;
};

const RULES: IntentRule[] = [
  {
    intent: "verified",
    phrases: [
      "verified",
      "thibitishwa",
      "verify",
      "verification",
      "get verified",
      "pata thibitisho",
      "thibitisho",
      "thibitisho ni nini",
      "verifed seller",
      "verified seller",
      "trusted seller",
      "muuzaji anayeaminika",
      "id check",
      "shop check",
    ],
  },
  {
    intent: "payment",
    phrases: [
      "pay",
      "payment",
      "mpesa",
      "m-pesa",
      "lipa",
      "pesa",
      "cash",
      "cod",
      "malipo",
      "bei",
      "why cant i pay",
      "pay with mpesa",
      "lipa na mpesa",
    ],
    weight: 1.1,
  },
  {
    intent: "delivery",
    phrases: [
      "deliver",
      "delivery",
      "usafirishaji",
      "fikisha",
      "zone",
      "area",
      "cbd",
      "milimani",
      "lanet",
      "section 58",
      "free area",
      "fee",
      "gharama ya usafiri",
      "outside nakuru",
      "nje ya nakuru",
    ],
  },
  {
    intent: "free_delivery",
    phrases: [
      "free delivery",
      "delivery bure",
      "first order",
      "agizo la kwanza",
      "bure",
      "free shipping",
    ],
  },
  {
    intent: "orders",
    phrases: [
      "order",
      "track",
      "agizo",
      "fuatilia",
      "delivery code",
      "msimbo wa usafirishaji",
      "msimbo",
      "usimbo",
      "rider",
      "dereva",
      "status",
      "where is my order",
      "wapi agizo",
    ],
  },
  {
    intent: "view_first",
    phrases: [
      "property",
      "nyumba",
      "house",
      "rent",
      "kupangisha",
      "car",
      "gari",
      "viewing",
      "view first",
      "quote",
      "huduma",
      "plumber",
      "fundi",
      "services",
    ],
  },
  {
    intent: "sell",
    phrases: [
      "sell",
      "vendor",
      "seller",
      "uuza",
      "duka",
      "list",
      "orodhesha",
      "join as seller",
      "sign up shop",
      "kuuza",
    ],
  },
  {
    intent: "install",
    phrases: [
      "install",
      "app",
      "pwa",
      "home screen",
      "pakua",
      "ongeza kwenye simu",
      "download",
    ],
  },
  {
    intent: "search",
    phrases: [
      "find",
      "search",
      "tafuta",
      "nipe",
      "looking for",
      "phones",
      "simu",
      "shoes",
      "viatu",
    ],
  },
  {
    intent: "human",
    phrases: [
      "human",
      "person",
      "support",
      "help",
      "msaada",
      "problem",
      "report",
      "complain",
      "seller message",
      "message seller",
      "mtumie muuzaji",
      "talk to",
    ],
  },
  {
    intent: "greeting",
    phrases: [
      "hi",
      "hello",
      "hey",
      "habari",
      "mambo",
      "sasa",
      "thanks",
      "thank you",
      "asante",
      "shukrani",
    ],
  },
];

const SYNONYMS: Record<string, string[]> = {
  mpesa: ["m pesa", "em pesa", "mobile money"],
  deliver: ["deliveri", "deleva"],
  verified: ["verifed", "verfied", "verifed seller"],
};

export function normalizeForIntent(text: string): string {
  let t = text.toLowerCase();
  t = t.replace(/[^\p{L}\p{N}\s]/gu, " ");
  t = t.replace(/\s+/g, " ").trim();
  for (const [key, alts] of Object.entries(SYNONYMS)) {
    for (const alt of alts) {
      if (t.includes(alt)) t += ` ${key}`;
    }
  }
  return t;
}

function contextBoost(intent: AssistantIntent, ctx: AssistantContext): number {
  let boost = 0;
  if (intent === "payment" && ctx.screen === "cart") boost += 2;
  if (intent === "payment" && ctx.cartSummary.some((l) => !l.verified)) boost += 1.5;
  if (intent === "verified" && ctx.screen === "product") boost += 1;
  if (intent === "orders" && ctx.orderId) boost += 2;
  if (intent === "human" && ctx.screen === "help") boost += 1;
  if (intent === "search" && ctx.screen === "search") boost += 1;
  return boost;
}

const THRESHOLD = 1.2;

export function matchIntent(
  raw: string,
  context: AssistantContext,
): { intent: AssistantIntent; score: number } {
  const text = normalizeForIntent(raw);
  if (!text) return { intent: "fallback", score: 0 };

  let best: AssistantIntent = "fallback";
  let bestScore = 0;

  for (const rule of RULES) {
    let score = 0;
    for (const phrase of rule.phrases) {
      const p = normalizeForIntent(phrase);
      if (text === p) score += 3;
      else if (text.includes(p)) score += 1.5 + p.split(" ").length * 0.1;
      else if (p.split(" ").every((w) => text.includes(w))) score += 1;
    }
    score *= rule.weight ?? 1;
    if (
      rule.intent === "verified" &&
      /\b(verif|thibitish)/i.test(text)
    ) {
      score += 1.2;
    }
    if (rule.intent === "sell" && /\bsell\b/.test(text)) {
      score += 1;
    }
    if (rule.intent === "orders" && /msimbo|delivery code/.test(text)) {
      score += 1.5;
    }
    score += contextBoost(rule.intent, context);
    if (score > bestScore) {
      bestScore = score;
      best = rule.intent;
    }
  }

  if (bestScore < THRESHOLD) {
    return { intent: "fallback", score: bestScore };
  }
  return { intent: best, score: bestScore };
}

export function isOutOfScopePolicyQuestion(text: string): boolean {
  const t = normalizeForIntent(text);
  return (
    t.includes("legal advice") ||
    t.includes("invest") ||
    t.includes("loan") ||
    t.includes("password") ||
    t.includes("sign out") ||
    t.includes("delete account")
  );
}