import { homeCategoryLabel } from "@/lib/nakuru/home-i18n";
import type { LandingLang } from "@/lib/nakuru/i18n";
import { propertyListingBadge, propertyLocation } from "@/lib/nakuru/property-display";
import type { Listing } from "@/lib/nakuru/types";

const CLASSIFIED_CAT: Record<string, Record<LandingLang, string>> = {
  shop: { en: "Shopping", sw: "Ununuzi" },
  cars: { en: "Vehicles", sw: "Magari" },
  property: { en: "Property", sw: "Mali isimu" },
  services: { en: "Services", sw: "Huduma" },
};

export function classifiedCategoryLabel(
  item: Listing,
  lang: LandingLang,
): string {
  const fromApi = item.categoryLabel?.trim();
  if (fromApi) return fromApi;
  return CLASSIFIED_CAT[item.c]?.[lang] ?? homeCategoryLabel(item.c, lang);
}

export function classifiedPhotoBadge(
  item: Listing,
  lang: LandingLang,
): string {
  return propertyListingBadge(item) ?? classifiedCategoryLabel(item, lang);
}

export function classifiedLocation(
  item: Listing,
  zoneLabel?: string,
): string | null {
  const loc = item.attrs?.location?.trim();
  if (loc) return loc;
  const property = propertyLocation(item);
  if (property) return property;
  const zone = zoneLabel?.trim();
  return zone || null;
}

export function formatClassifiedPrice(amount: number): string {
  return `Ksh ${amount.toLocaleString("en-KE")}`;
}
