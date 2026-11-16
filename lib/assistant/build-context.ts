import { itemById } from "@/lib/nakuru/data/items";
import type { NakuruState } from "@/lib/nakuru/types";
import type { LandingLang } from "@/lib/nakuru/i18n";
import type {
  AssistantAuthState,
  AssistantContext,
  AssistantScreen,
  CartLineSummary,
} from "./types";

export type BuildContextInput = {
  screen: AssistantScreen;
  lang: LandingLang;
  state: NakuruState;
  productId?: string;
  orderId?: string;
  signedIn: boolean;
  vendor?: { status: string; verified: boolean } | null;
};

function resolveAuthState(input: BuildContextInput): AssistantAuthState {
  if (!input.signedIn) return "signedOut";
  if (!input.vendor) return "buyer";
  if (input.vendor.status === "pending") return "vendorPending";
  if (input.vendor.verified) return "vendorVerified";
  return "vendorUnverified";
}

function buildCartSummary(cart: NakuruState["cart"]): CartLineSummary[] {
  return Object.entries(cart).map(([id, qty]) => {
    const item = itemById(id);
    return {
      productId: id,
      title: item?.t ?? id,
      vendorName: item?.vn,
      verified: item?.v === 1,
      qty,
    };
  });
}

export function buildAssistantContext(input: BuildContextInput): AssistantContext {
  return {
    screen: input.screen,
    language: input.lang,
    zone: input.state.area,
    cartSummary: buildCartSummary(input.state.cart),
    productId: input.productId,
    orderId: input.orderId ?? input.state.orders[0]?.id?.toString(),
    authState: resolveAuthState(input),
  };
}

export function inferScreenFromApp(
  state: NakuruState,
  pathname: string | null,
): AssistantScreen {
  if (pathname?.startsWith("/app/p/")) return "product";
  if (state.q.trim()) return "search";
  if (state.tab === "cart") return "cart";
  if (state.tab === "acc") return "acc";
  if (state.tab === "msg") return "msg";
  if (state.tab === "cat") return "cat";
  return "home";
}