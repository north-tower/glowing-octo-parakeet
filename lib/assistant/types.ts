import type { LandingLang } from "@/lib/nakuru/i18n";

export type AssistantRole = "user" | "assistant";

export type AssistantScreen =
  | "home"
  | "cat"
  | "cart"
  | "acc"
  | "msg"
  | "product"
  | "search"
  | "help";

export type AssistantAuthState =
  | "signedOut"
  | "buyer"
  | "vendorPending"
  | "vendorUnverified"
  | "vendorVerified";

export type CartLineSummary = {
  productId: string;
  title: string;
  vendorName?: string;
  verified: boolean;
  qty: number;
};

export type AssistantContext = {
  screen: AssistantScreen;
  language: LandingLang;
  zone: string;
  cartSummary: CartLineSummary[];
  productId?: string;
  orderId?: string;
  authState: AssistantAuthState;
};

export type TextPart = { type: "text"; text: string };
export type QuickRepliesPart = {
  type: "quickReplies";
  items: { id: string; label: string }[];
};
export type ProductCardsPart = {
  type: "productCards";
  items: { id: string | number; title: string; price: number; verified: boolean }[];
};
export type OrderCardPart = { type: "orderCard"; orderId: string | number };
export type ActionPart = {
  type: "action";
  action: AssistantAction;
  label?: string;
  requiresConfirm?: boolean;
};
export type NoticePart = {
  type: "notice";
  tone: "info" | "warn";
  text: string;
};

export type AssistantPart =
  | TextPart
  | QuickRepliesPart
  | ProductCardsPart
  | OrderCardPart
  | ActionPart
  | NoticePart;

export type AssistantMessage = {
  id: string;
  role: AssistantRole;
  parts: AssistantPart[];
  createdAt?: number;
};

export type NavigateParams = {
  tab?: "home" | "cat" | "msg" | "cart" | "acc";
  acc?: "vendor" | null;
  category?: string;
};

export type AssistantAction =
  | { type: "navigate"; screen: AssistantScreen; params?: NavigateParams }
  | { type: "search"; query: string }
  | { type: "setZone"; zone: string }
  | { type: "openProduct"; id: string | number }
  | { type: "openOrder"; id: string | number }
  | { type: "openHelp" }
  | { type: "startInstall" };

export type AssistantEvent =
  | { type: "text-delta"; text: string }
  | { type: "parts"; parts: AssistantPart[] }
  | { type: "action"; action: AssistantAction; requiresConfirm?: boolean; label?: string }
  | { type: "done" }
  | { type: "error"; message: string };

export type AssistantIntent =
  | "verified"
  | "payment"
  | "delivery"
  | "free_delivery"
  | "orders"
  | "view_first"
  | "sell"
  | "install"
  | "search"
  | "human"
  | "greeting"
  | "fallback";