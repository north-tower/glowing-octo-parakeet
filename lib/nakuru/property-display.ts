import type { LandingLang } from "@/lib/nakuru/i18n";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import { kes } from "@/lib/nakuru/format";
import type { Listing } from "@/lib/nakuru/types";

export type PropertyTenure = "rent" | "sale" | "plot";

export function propertyTenure(item: Listing): PropertyTenure | null {
  if (item.c !== "property") return null;
  const raw = item.attrs?.tenure?.toLowerCase();
  if (raw === "rent" || raw === "sale" || raw === "plot") return raw;

  const sub = item.s.toLowerCase();
  if (sub.includes("rent")) return "rent";
  if (sub.includes("for sale") || sub.includes("sale ·")) return "sale";

  if (
    item.e === "land-plot" ||
    item.e === "mountain" ||
    /\bplot\b|acre|land\b/i.test(item.t)
  ) {
    return "plot";
  }
  if (item.e === "home-sale") return "sale";
  if (item.e === "home") return "rent";
  return null;
}

export function propertyLocation(item: Listing): string | null {
  if (item.c !== "property") return null;
  const loc = item.attrs?.location?.trim();
  if (loc) return loc;
  const area = item.attrs?.area?.trim();
  if (area && propertyTenure(item) !== "plot") return area;
  return null;
}

export function propertyListingBadge(item: Listing): string | null {
  const badge = item.attrs?.badge?.trim();
  return badge || null;
}

export function formatPropertyPrice(
  amount: number,
  tenure: PropertyTenure | null,
  lang: LandingLang,
): { amount: string; suffix: string | null } {
  const base = kes(amount);
  if (tenure === "rent") {
    return { amount: base, suffix: homeCopy("productPricePerMonth", lang) };
  }
  if (tenure === "sale" || tenure === "plot") {
    return { amount: base, suffix: homeCopy("productPriceForSale", lang) };
  }
  return { amount: base, suffix: null };
}