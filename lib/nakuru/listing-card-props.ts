import { classifiedLocation } from "@/lib/nakuru/listing-card-display";
import { listingPlaceholder } from "@/lib/nakuru/category-placeholder";
import { formatListingPriceParts } from "@/lib/nakuru/format-listing-price";
import { listingModeOf } from "@/lib/nakuru/listing-mode";
import {
  listingGallery,
  resolveListingImageSrc,
} from "@/lib/nakuru/listing-image";
import { propertyListingBadge } from "@/lib/nakuru/property-display";
import type { LandingLang } from "@/lib/nakuru/i18n";
import type { Listing } from "@/lib/nakuru/types";
import type {
  ListingCardChip,
  ListingCardProps,
} from "@/lib/nakuru/listing-card-types";

function vendorName(item: Listing): string {
  return item.vn ?? item.s.split("·")[0]?.trim() ?? item.s;
}

function listingBadges(item: Listing): ListingCardProps["badges"] {
  const badges: ListingCardProps["badges"] = [];
  const raw = propertyListingBadge(item);
  if (raw?.toLowerCase().includes("feature")) badges.push("featured");
  const hot = item.attrs?.hot?.trim();
  const isNew = item.attrs?.new?.trim();
  if (hot) badges.push("hot");
  if (isNew) badges.push("new");
  if (item.v === 1) badges.push("verified");
  const order = ["featured", "verified", "hot", "new"] as const;
  return badges.sort((a, b) => order.indexOf(a) - order.indexOf(b));
}

function listingChip(item: Listing): ListingCardChip | undefined {
  const mode = listingModeOf(item);
  if (item.attrs?.freeDelivery?.trim()) return "free-delivery";
  if (mode === "property" || mode === "cars") return "viewing";
  if (mode === "services") return "quote";
  if (mode === "shop") return "cod";
  return undefined;
}

export function listingToCardProps(
  item: Listing,
  lang: LandingLang,
  zoneLabel?: string,
): ListingCardProps {
  const gallery = listingGallery(item);
  const loc = classifiedLocation(item, zoneLabel);
  const visual = listingPlaceholder(item);
  const price = formatListingPriceParts(item, lang);
  const chip = listingChip(item);

  return {
    id: item.id,
    href: `/app/p/${item.id}`,
    title: item.t,
    price: item.p,
    currency: price.currency,
    pricePrefix: price.prefix,
    priceSuffix: price.suffix,
    priceLabel: price.label,
    imageUrl: resolveListingImageSrc(item) ?? undefined,
    imageCount: gallery.length > 0 ? gallery.length : undefined,
    category: { tint: visual.tint, icon: visual.icon },
    seller: vendorName(item),
    sellerVerified: item.v === 1,
    location: loc ?? zoneLabel ?? "",
    badges: listingBadges(item),
    chip,
    payOnDelivery: chip === "cod",
    action:
      chip === "quote" ? "quote" : chip === "viewing" ? "viewing" : undefined,
    saved: false,
  };
}
