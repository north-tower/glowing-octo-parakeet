import { ITEMS } from "@/lib/nakuru/data/items";
import { ZONES } from "@/lib/nakuru/data/zones";
import type { LandingLang } from "@/lib/nakuru/i18n";
import type {
  AssistantAction,
  AssistantContext,
  AssistantIntent,
  AssistantPart,
} from "./types";

function lang(ctx: AssistantContext): LandingLang {
  return ctx.language;
}

function zoneList(): string {
  return Object.keys(ZONES)
    .filter((z) => !z.startsWith("Outside"))
    .join(", ");
}

export function searchProducts(query: string, limit = 3) {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return ITEMS.filter(
    (i) =>
      (i.t + i.s + (i.vn ?? "")).toLowerCase().includes(q) ||
      i.c.includes(q),
  )
    .slice(0, limit)
    .map((i) => ({
      id: i.id,
      title: i.t,
      price: i.p,
      verified: i.v === 1,
    }));
}

export function extractSearchQuery(text: string): string {
  const cleaned = text
    .replace(/^(find|search|tafuta|nipe|looking for)\s+/i, "")
    .trim();
  return cleaned || text.trim();
}

type IntentReply = {
  parts: AssistantPart[];
  intentLabel: AssistantIntent;
};

export function buildIntentReply(
  intent: AssistantIntent,
  ctx: AssistantContext,
  userText: string,
): IntentReply {
  const sw = lang(ctx) === "sw";

  switch (intent) {
    case "verified": {
      const text = sw
        ? "Verified inamaanisha muuzaji amepitisha ukaguzi wa kitambulisho na duka. Wauzaji Verified wanaweza kupokea M-Pesa mapema kwenye maagizo. Wasio Verified: lipa ukifika tu (fedha taslimu au M-Pesa kwa dereva)."
        : "Verified means a vendor passed ID and shop checks. Verified vendors can accept M-Pesa upfront on orders. Unverified vendors: pay on delivery only (cash or M-Pesa to the rider).";
      const actions: AssistantPart[] = [];
      if (
        ctx.authState === "vendorUnverified" ||
        ctx.authState === "vendorPending"
      ) {
        actions.push({
          type: "action",
          action: { type: "navigate", screen: "acc", params: { tab: "acc" } },
          label: sw ? "Fungua Akaunti" : "Open account",
        });
      }
      return {
        intentLabel: intent,
        parts: [
          { type: "text", text },
          {
            type: "quickReplies",
            items: [
              { id: "pay", label: sw ? "Chaguo za malipo" : "Payment options" },
              { id: "sell", label: sw ? "Jinsi ya kuuza" : "How to sell" },
            ],
          },
          ...actions,
        ],
      };
    }
    case "payment": {
      let text = sw
        ? "Lipa ukifika — fedha taslimu au M-Pesa kwa dereva — inapatikana kila wakati. M-Pesa sasa inapatikana wakati bidhaa zote kwenye kikapu ni kutoka kwa wauzaji Verified."
        : "Pay on delivery — cash or M-Pesa to the rider — is always available. M-Pesa now is available only when every item in your cart is from a Verified vendor.";
      if (ctx.cartSummary.length) {
        const blocked = ctx.cartSummary.filter((l) => !l.verified);
        if (blocked.length) {
          const names = blocked
            .map((b) => `${b.title}${b.vendorName ? ` (${b.vendorName})` : ""}`)
            .join("; ");
          text += sw
            ? ` Kwa sasa huwezi kutumia M-Pesa sasa kwa: ${names}.`
            : ` Right now M-Pesa now is blocked by: ${names}.`;
        } else {
          text += sw
            ? " Kikapu chako kinaruhusu M-Pesa sasa."
            : " Your cart qualifies for M-Pesa now.";
        }
      }
      return {
        intentLabel: intent,
        parts: [
          { type: "text", text },
          {
            type: "quickReplies",
            items: [
              { id: "verified", label: sw ? "Verified ni nini?" : "What is Verified?" },
              { id: "free", label: sw ? "Usafirishaji bure?" : "Free delivery?" },
            ],
          },
        ],
      };
    }
    case "delivery": {
      const text = sw
        ? `Tunafikisha Nakuru pekee. Chagua eneo lako ili kuona gharama ya usafiri (mf. CBD, Milimani, Section 58, Lanet na zaidi). Uko nje ya Nakuru? Jiunge na orodha ya kusubiri kwenye eneo.`
        : `We deliver in Nakuru only. Pick your zone to see the delivery fee (${zoneList()}, and more). Outside Nakuru? Choose the waitlist zone in the area picker.`;
      const parts: AssistantPart[] = [
        { type: "text", text },
        {
          type: "quickReplies",
          items: [
            { id: "zones", label: sw ? "Badilisha eneo" : "Change my zone" },
            { id: "free", label: sw ? "Usafirishaji bure" : "Free delivery" },
          ],
        },
      ];
      const lower = userText.toLowerCase();
      const aliases: Record<string, string> = {
        milimani: "Milimani",
        lanet: "Lanet",
        "section 58": "Section 58",
        "free area": "Free Area",
        cbd: "Town/CBD",
        town: "Town/CBD",
      };
      const mentioned =
        Object.keys(ZONES).find((z) => lower.includes(z.toLowerCase())) ??
        Object.entries(aliases).find(([k]) => lower.includes(k))?.[1];
      if (mentioned) {
        parts.push({
          type: "action",
          action: { type: "setZone", zone: mentioned },
          label: sw ? `Weka ${mentioned}` : `Set ${mentioned}`,
          requiresConfirm: true,
        });
      }
      return { intentLabel: intent, parts };
    }
    case "free_delivery": {
      const text = sw
        ? "Agizo la kwanza linaweza kupata usafirishaji bure ndani ya Nakuru. Ustahiki unaonyeshwa wakati wa malipo ukishaingia."
        : "Your first order may qualify for free delivery in Nakuru. Eligibility is shown at checkout once you're signed in.";
      return {
        intentLabel: intent,
        parts: [
          { type: "text", text },
          {
            type: "quickReplies",
            items: [
              { id: "delivery", label: sw ? "Usafirishaji" : "How delivery works" },
              { id: "order", label: sw ? "Fuatilia agizo" : "Track an order" },
            ],
          },
        ],
      };
    }
    case "orders": {
      const text = sw
        ? "Agiza kwenye kikapu, weka anuani, kisha weka agizo. Fuatilia hali kwenye kichupo cha Kikapu. Wakati wa kufikishwa, toa msimbo wa usafirishaji kwa dereva."
        : "Order from your cart, add your address, then place the order. Track status in the Cart tab. On delivery, give your delivery code to the rider.";
      const parts: AssistantPart[] = [
        { type: "text", text },
        {
          type: "quickReplies",
          items: [
            { id: "cart", label: sw ? "Fungua kikapu" : "Open cart" },
            { id: "help", label: sw ? "Msaada" : "Get support" },
          ],
        },
      ];
      if (ctx.orderId) {
        parts.push({
          type: "action",
          action: { type: "openOrder", id: ctx.orderId },
          label: sw ? "Fungua agizo" : "Open order",
        });
      }
      return { intentLabel: intent, parts };
    }
    case "view_first": {
      const text = sw
        ? "Mali (nyumba, magari) ni angalia kwanza — omba kuona, usilipe kabla ya kuhakiki. Huduma: omba bei, si malipo ya papo hapo."
        : "Property and cars are view first — request a viewing, don't pay before you inspect. Services: request a quote, not instant checkout.";
      return {
        intentLabel: intent,
        parts: [
          { type: "text", text },
          {
            type: "quickReplies",
            items: [
              { id: "pay", label: sw ? "Malipo" : "Payments" },
              { id: "search", label: sw ? "Tafuta bidhaa" : "Search listings" },
            ],
          },
        ],
      };
    }
    case "sell": {
      const text = sw
        ? "Ni bure kujiunga na kuorodhesha. Ongeza picha, chagua kategoria — kila orodha inakaguliwa kando. Unaweza kuomba kuwa muuzaji kutoka kwenye akaunti yako."
        : "It's free to join and list. Add a photo, pick categories — each listing is reviewed separately. You can apply to sell from your account.";
      return {
        intentLabel: intent,
        parts: [
          { type: "text", text },
          {
            type: "action",
            action: {
              type: "navigate",
              screen: "acc",
              params: { tab: "acc", acc: "vendor" },
            },
            label: sw ? "Jiunge kama muuzaji" : "Seller sign-up",
          },
          {
            type: "quickReplies",
            items: [
              { id: "verified", label: sw ? "Verified" : "Get Verified" },
            ],
          },
        ],
      };
    }
    case "install": {
      const text = sw
        ? "Ongeza NakuruHub kwenye skrini ya nyumbani ili uweke agizo haraka."
        : "Add NakuruHub to your home screen for faster ordering.";
      return {
        intentLabel: intent,
        parts: [
          { type: "text", text },
          {
            type: "action",
            action: { type: "startInstall" },
            label: sw ? "Sakinisha programu" : "Install the app",
          },
        ],
      };
    }
    case "search": {
      const query = extractSearchQuery(userText);
      const hits = searchProducts(query, 3);
      if (!hits.length) {
        const text = sw
          ? `Sikupata bidhaa zinazolingana na "${query}". Jaribu maneno mengine au tafuta kwenye kichupo cha Nyumbani.`
          : `I couldn't find listings matching "${query}". Try different words or browse on Home.`;
        return {
          intentLabel: intent,
          parts: [
            { type: "text", text },
            {
              type: "quickReplies",
              items: [
                { id: "browse", label: sw ? "Vinjari bidhaa" : "Browse shop" },
              ],
            },
          ],
        };
      }
      const text = sw
        ? `Nimepata ${hits.length} zinazolingana:`
        : `Here are ${hits.length} matches:`;
      return {
        intentLabel: intent,
        parts: [
          { type: "text", text },
          { type: "productCards", items: hits },
          {
            type: "action",
            action: { type: "search", query },
            label: sw ? `Tafuta "${query}"` : `Search "${query}"`,
          },
        ],
      };
    }
    case "human": {
      const text = sw
        ? "Niko hapa kwa maswali ya kawaida. Kwa msaada wa mtu, fungua Ujumbe au tumia msaada kutoka kwenye Akaunti."
        : "I'm here for common questions. For a person, open Messages or use support from Account.";
      const parts: AssistantPart[] = [
        { type: "text", text },
        {
          type: "action",
          action: { type: "openHelp" },
          label: sw ? "Msaada na mawasiliano" : "Help and support",
        },
      ];
      if (ctx.productId) {
        parts.push({
          type: "notice",
          tone: "info",
          text: sw
            ? "Unaweza pia kuwasiliana na muuzaji kutoka ukurasa wa bidhaa."
            : "You can also message the seller from the product page.",
        });
        parts.push({
          type: "action",
          action: { type: "openProduct", id: ctx.productId },
          label: sw ? "Mtumie muuzaji" : "Message seller",
        });
      }
      return { intentLabel: intent, parts };
    }
    case "greeting": {
      const text = sw
        ? "Karibu! Nina maswali kuhusu Verified, malipo, usafirishaji na kuuza. Ungependa nikusaidieje?"
        : "Hi! I can help with Verified, payments, delivery, and selling. What do you need?";
      return {
        intentLabel: intent,
        parts: [
          { type: "text", text },
          {
            type: "quickReplies",
            items: [
              { id: "verified", label: sw ? "Verified" : "What is Verified?" },
              { id: "delivery", label: sw ? "Usafirishaji" : "Delivery" },
            ],
          },
        ],
      };
    }
    case "fallback":
    default: {
      const text = sw
        ? "Sina uhakika bado. Ninaweza kusaidia na Verified, malipo, usafirishaji, maagizo na kuuza."
        : "I'm not sure about that yet. I can help with Verified, payments, delivery, orders, and selling.";
      return {
        intentLabel: "fallback",
        parts: [
          { type: "text", text },
          {
            type: "quickReplies",
            items: [
              { id: "verified", label: sw ? "Verified" : "What is Verified?" },
              { id: "pay", label: sw ? "Malipo" : "Payments" },
              { id: "sell", label: sw ? "Uuza" : "Sell" },
            ],
          },
          {
            type: "action",
            action: { type: "openHelp" },
            label: sw ? "Pata msaada" : "Get support",
          },
        ],
      };
    }
  }
}