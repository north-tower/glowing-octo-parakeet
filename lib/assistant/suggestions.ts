import type { LandingLang } from "@/lib/nakuru/i18n";
import type { AssistantScreen } from "./types";

export function suggestedPrompts(
  screen: AssistantScreen,
  lang: LandingLang,
): string[] {
  const sw = lang === "sw";
  if (screen === "cart") {
    return sw
      ? [
          "Kwa nini siwezi kulipa kwa M-Pesa?",
          "Je, usafirishaji ni bure?",
          "Verified ni nini?",
          "Usafirishaji unafanyaje?",
        ]
      : [
          "Why can't I pay with M-Pesa?",
          "Is delivery free?",
          "What is Verified?",
          "How does delivery work?",
        ];
  }
  if (screen === "product") {
    return sw
      ? [
          "Je, muuzaji ame Verified?",
          "Ninalipaje?",
          "Gharama ya usafirishaji?",
          "Naweza kutumia M-Pesa?",
        ]
      : [
          "Is this seller Verified?",
          "How do I pay?",
          "What's the delivery fee?",
          "Can I use M-Pesa?",
        ];
  }
  return sw
    ? [
        "Verified ni nini?",
        "Usafirishaji unafanyaje?",
        "Ninawezaje kuuza?",
        "Sakinisha programu",
      ]
    : [
        "What is Verified?",
        "How does delivery work?",
        "How do I sell?",
        "Install the app",
      ];
}

export function quickReplyToMessage(id: string, lang: LandingLang): string {
  const sw = lang === "sw";
  const map: Record<string, { en: string; sw: string }> = {
    verified: { en: "What is Verified?", sw: "Verified ni nini?" },
    pay: { en: "Payment options", sw: "Chaguo za malipo" },
    payment: { en: "How do I pay?", sw: "Ninalipaje?" },
    delivery: { en: "How does delivery work?", sw: "Usafirishaji unafanyaje?" },
    free: { en: "Is delivery free?", sw: "Usafirishaji ni bure?" },
    order: { en: "Track my order", sw: "Fuatilia agizo" },
    cart: { en: "Open cart", sw: "Fungua kikapu" },
    help: { en: "I need support", sw: "Nahitaji msaada" },
    sell: { en: "How do I sell?", sw: "Ninawezaje kuuza?" },
    zones: { en: "Change my delivery zone", sw: "Badilisha eneo langu" },
    browse: { en: "Browse shop items", sw: "Vinjari bidhaa za dukani" },
    search: { en: "Help me search", sw: "Nisaidie kutafuta" },
  };
  const entry = map[id];
  if (!entry) return id;
  return sw ? entry.sw : entry.en;
}