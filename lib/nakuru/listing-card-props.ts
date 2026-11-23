import {
  Building2,
  Car,
  Handshake,
  Shirt,
  type LucideIcon,
} from "lucide-react";
import type { CategoryTint } from "@/components/app/category/browse/categories";
import { classifiedLocation } from "@/lib/nakuru/listing-card-display";
import { listingModeOf } from "@/lib/nakuru/listing-mode";
import {
  listingGallery,
  resolveListingImageSrc,
} from "@/lib/nakuru/listing-image";
import {
  formatPropertyPrice,
  propertyListingBadge,
  propertyTenure,
} from "@/lib/nakuru/property-display";
import type { LandingLang } from "@/lib/nakuru/i18n";
import type { Listing } from "@/lib/nakuru/types";
import type { ListingCardProps } from "@/lib/nakuru/listing-card-types";

const DEFAULT_ICON: Record<string, LucideIcon> = {
  shop: Shirt,
  property: Building2,
  cars: Car,
  services: Handshake,
  stays: Building2,
};

const DEFAULT_TINT: Record<string, CategoryTint> = {
  shop: "rose",
  property: "teal",
  cars: "amber",
  services: "emerald",
  stays: "sky",
};

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

function listingAction(
  item: Listing,
): ListingCardProps["action"] | undefined {
  const mode = listingModeOf(item);
  if (mode === "property" || mode === "cars") return "viewing";
  if (mode === "services") return "quote";
  return undefined;
}

function categoryVisual(item: Listing): {
  tint: CategoryTint;
  icon: LucideIcon;
} {
  const c = item.c in DEFAULT_TINT ? item.c : "shop";
  return {
    tint: DEFAULT_TINT[c] ?? "stone",
    icon: DEFAULT_ICON[c] ?? Shirt,
  };
}

export function listingToCardProps(
  item: Listing,
  lang: LandingLang,
  zoneLabel?: string,
): ListingCardProps {
  const mode = listingModeOf(item);
  const gallery = listingGallery(item);
  const loc = classifiedLocation(item, zoneLabel);
  const visual = categoryVisual(item);
  const tenure = mode === "property" ? propertyTenure(item) : null;
  const priceSuffix =
    mode === "property"
      ? formatPropertyPrice(item.p, tenure, lang).suffix
      : null;

  return {
    id: item.id,
    href: `/app/p/${item.id}`,
    title: item.t,
    price: item.p,
    currency: "KES",
    priceSuffix,
    imageUrl: resolveListingImageSrc(item) ?? undefined,
    imageCount: gallery.length > 0 ? gallery.length : undefined,
    category: visual,
    seller: vendorName(item),
    sellerVerified: item.v === 1,
    location: loc ?? zoneLabel ?? "",
    badges: listingBadges(item),
    payOnDelivery: mode === "shop" && item.v !== 1,
    action: listingAction(item),
    saved: false,
  };
}