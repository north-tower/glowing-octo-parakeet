import { describe, expect, it } from "vitest";
import { matchIntent } from "./intent";
import type { AssistantContext } from "./types";

const base: AssistantContext = {
  screen: "home",
  language: "en",
  zone: "Town/CBD",
  cartSummary: [],
  authState: "signedOut",
};

const cartBlocked: AssistantContext = {
  ...base,
  screen: "cart",
  cartSummary: [
    {
      productId: "1",
      title: "Demo sneaker",
      verified: false,
      qty: 1,
      vendorName: "Kicks254",
    },
  ],
};

const cases: { text: string; intent: string; ctx?: AssistantContext }[] = [
  { text: "What is Verified?", intent: "verified" },
  { text: "thibitisho ni nini", intent: "verified" },
  { text: "how do I get verified", intent: "verified" },
  { text: "verifed seller", intent: "verified" },
  { text: "mpesa payment", intent: "payment" },
  { text: "lipa na pesa", intent: "payment" },
  { text: "why cant i pay with mpesa", intent: "payment", ctx: cartBlocked },
  { text: "bei ya malipo", intent: "payment" },
  { text: "delivery to milimani", intent: "delivery" },
  { text: "usafirishaji", intent: "delivery" },
  { text: "do you deliver in lanet", intent: "delivery" },
  { text: "nje ya nakuru", intent: "delivery" },
  { text: "free delivery first order", intent: "free_delivery" },
  { text: "agizo la kwanza bure", intent: "free_delivery" },
  { text: "track my order", intent: "orders" },
  { text: "msimbo wa usafirishaji", intent: "orders" },
  { text: "wapi agizo langu", intent: "orders" },
  { text: "nyumba ya kupangisha", intent: "view_first" },
  { text: "need a plumber quote", intent: "view_first" },
  { text: "how to sell on nakuru", intent: "sell" },
  { text: "nataka kuuza dukani", intent: "sell" },
  { text: "install the app", intent: "install" },
  { text: "ongeza kwenye simu", intent: "install" },
  { text: "find phones", intent: "search" },
  { text: "tafuta viatu", intent: "search" },
  { text: "nipe simu", intent: "search" },
  { text: "talk to a human", intent: "human" },
  { text: "msaada", intent: "human" },
  { text: "habari", intent: "greeting" },
  { text: "asante sana", intent: "greeting" },
  { text: "hello there", intent: "greeting" },
  { text: "quantum physics homework", intent: "fallback" },
  { text: "random gibberish xyz", intent: "fallback" },
  { text: "supercollider particle physics", intent: "fallback" },
];

describe("matchIntent", () => {
  it.each(cases)("maps %j -> %s", ({ text, intent, ctx }) => {
    const { intent: got } = matchIntent(text, ctx ?? base);
    expect(got).toBe(intent);
  });

  it("boosts payment on cart with unverified items", () => {
    const a = matchIntent("payment help", base);
    const b = matchIntent("payment help", cartBlocked);
    expect(b.score).toBeGreaterThan(a.score);
    expect(b.intent).toBe("payment");
  });
});