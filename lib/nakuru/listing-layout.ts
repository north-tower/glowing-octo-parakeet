import type { ListingMode } from "@/lib/nakuru/types";

export type ListingPrimaryCta = "addToCart" | "requestQuote" | "requestViewing";

export type ListingLayoutConfig = {
  primaryCta: ListingPrimaryCta;
  /** Secondary contact slots; render only when the seller actually has them. */
  secondary: Array<"call" | "whatsapp" | "message">;
  showQuantity: boolean;
  showDelivery: boolean;
  showFreeDeliveryPromo: boolean;
  /** Prefix price with "From" unless the vendor marked the price as fixed. */
  priceFromUnlessFixed: boolean;
  showServiceArea: boolean;
  showWalkIn: boolean;
  showKeyFactsGrid: boolean;
};

export const LISTING_LAYOUT: Record<ListingMode, ListingLayoutConfig> = {
  shop: {
    primaryCta: "addToCart",
    secondary: ["call", "whatsapp", "message"],
    showQuantity: true,
    showDelivery: true,
    showFreeDeliveryPromo: true,
    priceFromUnlessFixed: false,
    showServiceArea: false,
    showWalkIn: false,
    showKeyFactsGrid: true,
  },
  services: {
    primaryCta: "requestQuote",
    secondary: ["call", "whatsapp", "message"],
    showQuantity: false,
    showDelivery: false,
    showFreeDeliveryPromo: false,
    priceFromUnlessFixed: true,
    showServiceArea: true,
    showWalkIn: true,
    showKeyFactsGrid: true,
  },
  property: {
    primaryCta: "requestViewing",
    secondary: ["call", "whatsapp", "message"],
    showQuantity: false,
    showDelivery: false,
    showFreeDeliveryPromo: false,
    priceFromUnlessFixed: false,
    showServiceArea: false,
    showWalkIn: false,
    showKeyFactsGrid: true,
  },
  cars: {
    primaryCta: "requestViewing",
    secondary: ["call", "whatsapp", "message"],
    showQuantity: false,
    showDelivery: false,
    showFreeDeliveryPromo: false,
    priceFromUnlessFixed: false,
    showServiceArea: false,
    showWalkIn: false,
    showKeyFactsGrid: true,
  },
};

export function listingLayoutOf(mode: ListingMode): ListingLayoutConfig {
  return LISTING_LAYOUT[mode];
}

const FIXED_TRUE = new Set(["1", "true", "yes", "fixed"]);

export function isFixedPrice(attrs: Record<string, string> | undefined): boolean {
  if (!attrs) return false;
  const kind = attrs.priceKind?.trim().toLowerCase();
  if (kind === "fixed") return true;
  for (const key of ["fixedPrice", "priceFixed", "fixed"]) {
    const v = attrs[key]?.trim().toLowerCase();
    if (v && FIXED_TRUE.has(v)) return true;
  }
  return false;
}
