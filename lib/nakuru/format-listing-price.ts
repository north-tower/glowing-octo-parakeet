import { formatKES } from "@/lib/nakuru/format";
import { listingModeOf } from "@/lib/nakuru/listing-mode";
import {
  propertyTenure,
  type PropertyTenure,
} from "@/lib/nakuru/property-display";
import type { LandingLang } from "@/lib/nakuru/i18n";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import type { Listing } from "@/lib/nakuru/types";

export type ListingPriceParts = {
  /** e.g. "From" for services */
  prefix: string | null;
  currency: string;
  amount: string;
  /** e.g. "/ month" or "for sale" */
  suffix: string | null;
  /** Full spoken string for aria-label */
  label: string;
};

function tenureSuffix(
  tenure: PropertyTenure | null,
  lang: LandingLang,
): string | null {
  if (tenure === "rent") return homeCopy("productPricePerMonth", lang);
  if (tenure === "sale" || tenure === "plot") {
    return homeCopy("productPriceForSale", lang);
  }
  return null;
}

/** Type-aware listing price: services "From …", property with tenure, shop plain. */
export function formatListingPriceParts(
  item: Listing,
  lang: LandingLang,
): ListingPriceParts {
  const mode = listingModeOf(item);
  const currency = "KES";
  const amount = item.p.toLocaleString("en-KE");
  const kes = formatKES(item.p);

  if (mode === "services") {
    const prefix = homeCopy("priceFrom", lang);
    return {
      prefix,
      currency,
      amount,
      suffix: null,
      label: `${prefix} ${kes}`,
    };
  }

  if (mode === "property") {
    const suffix = tenureSuffix(propertyTenure(item), lang);
    return {
      prefix: null,
      currency,
      amount,
      suffix,
      label: suffix ? `${kes} ${suffix}` : kes,
    };
  }

  return {
    prefix: null,
    currency,
    amount,
    suffix: null,
    label: kes,
  };
}
