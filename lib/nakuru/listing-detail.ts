import type { LandingLang } from "@/lib/nakuru/i18n";
import { homeCopy, type HomeCopyKey } from "@/lib/nakuru/home-i18n";
import { humanizeCategoryName } from "@/lib/nakuru/humanize-category";
import { listingModeOf } from "@/lib/nakuru/listing-mode";
import { isFixedPrice, listingLayoutOf } from "@/lib/nakuru/listing-layout";
import { formatListingPrice } from "@/lib/nakuru/format";
import type { CategoryId, Listing } from "@/lib/nakuru/types";
import type { ApiListing } from "@/lib/nakuru/listings-map";

const ATTR_LABEL_KEYS: Record<string, HomeCopyKey> = {
  bedrooms: "productAttrBedrooms",
  bathrooms: "productAttrBathrooms",
  mileage: "productAttrMileage",
  year: "productAttrYear",
  area: "productAttrArea",
  location: "productAttrLocation",
  tenure: "productAttrTenure",
  plotSize: "productAttrPlotSize",
  condition: "productAttrCondition",
  hours: "productAttrHours",
  serviceHours: "productAttrHours",
  serviceArea: "productAttrServiceArea",
  walkIn: "productAttrWalkIn",
  walkInAddress: "productAttrWalkIn",
  walkInHours: "productAttrHours",
  transmission: "productAttrTransmission",
};

const SKIP_ATTR = new Set([
  "badge",
  "whatsapp",
  "phone",
  "mobile",
  "priceKind",
  "fixedPrice",
  "priceFixed",
  "fixed",
]);

export type ProductDetail = Listing & {
  vendorName: string;
  vendorId?: string;
  vendorLogoUrl?: string | null;
  createdAt?: string | null;
  vendorCreatedAt?: string | null;
  gallery: string[];
  attributeRows: { label: string; value: string }[];
};

export type ListingFactIcon =
  | "location"
  | "posted"
  | "category"
  | "condition"
  | "hours"
  | "area"
  | "beds"
  | "baths"
  | "size"
  | "year"
  | "mileage"
  | "gear"
  | "default";

export type ListingKeyFact = {
  key: string;
  label: string;
  value: string;
  icon: ListingFactIcon;
};

export type SellerContact = {
  callHref: string | null;
  whatsappHref: string | null;
  phone: string | null;
};

export function demoVendorName(item: Listing): string {
  if (item.vn) return item.vn;
  const mode = listingModeOf(item);
  if (mode === "shop") return item.s;
  if (mode === "services") {
    return item.s.split(" · ")[1]?.trim() || item.t.split(",")[0]?.trim() || item.t;
  }
  const parts = item.s.split(" · ");
  if (parts.length >= 2) return parts[parts.length - 1]!.trim();
  return item.s;
}

export function demoGallery(item: Listing): string[] {
  if (item.imgs?.length) return item.imgs;
  if (item.img) return [item.img];
  return [];
}

export function attributeRowsFromRecord(
  attrs: Record<string, string> | undefined,
  lang: LandingLang,
): { label: string; value: string }[] {
  if (!attrs) return [];
  return Object.entries(attrs)
    .filter(([key, v]) => !SKIP_ATTR.has(key) && String(v).trim())
    .map(([key, value]) => {
      const copyKey = ATTR_LABEL_KEYS[key];
      const label = copyKey ? homeCopy(copyKey, lang) : key;
      return { label, value: String(value) };
    });
}

export function toProductDetail(
  item: Listing,
  lang: LandingLang,
  api?: Pick<
    ApiListing,
    | "vendor"
    | "vendorId"
    | "galleryUrls"
    | "attributes"
    | "vendorLogoUrl"
    | "createdAt"
    | "vendorCreatedAt"
    | "categoryLabel"
  >,
): ProductDetail {
  const vendorName = api?.vendor ?? demoVendorName(item);
  const gallery =
    api?.galleryUrls?.filter(Boolean).length
      ? api.galleryUrls!.filter(Boolean)
      : demoGallery(item);
  const merged: Listing = {
    ...item,
    vn: vendorName,
    img: gallery[0] ?? item.img,
    imgs: gallery.length ? gallery : item.imgs,
    attrs: api?.attributes ?? item.attrs,
    categoryLabel: api?.categoryLabel ?? item.categoryLabel,
  };
  const attributeRows = attributeRowsFromRecord(merged.attrs, lang);
  return {
    ...merged,
    vendorName,
    vendorId: api?.vendorId,
    vendorLogoUrl: api?.vendorLogoUrl,
    createdAt: api?.createdAt,
    vendorCreatedAt: api?.vendorCreatedAt,
    gallery: gallery.length ? gallery : demoGallery(merged),
    attributeRows,
  };
}

export function categoryTint(c: CategoryId | string): string {
  switch (c) {
    case "property":
      return "green";
    case "cars":
      return "sand";
    case "services":
      return "pink";
    default:
      return "teal";
  }
}

export function similarByVendor(
  items: Listing[],
  current: ProductDetail,
  limit = 6,
): Listing[] {
  const vendor = current.vendorName.toLowerCase();
  return items
    .filter(
      (x) =>
        String(x.id) !== String(current.id) &&
        demoVendorName(x).toLowerCase() === vendor,
    )
    .slice(0, limit);
}

export function similarByCategory(
  items: Listing[],
  current: ProductDetail,
  limit = 6,
): Listing[] {
  return items
    .filter(
      (x) => String(x.id) !== String(current.id) && x.c === current.c,
    )
    .slice(0, limit);
}

export function listingCategoryLabel(detail: Listing): string {
  return humanizeCategoryName(detail.c, detail.categoryLabel);
}

export function listingDisplayPrice(detail: Listing): string {
  const layout = listingLayoutOf(listingModeOf(detail));
  const from = layout.priceFromUnlessFixed && !isFixedPrice(detail.attrs);
  return formatListingPrice(detail.p, { from });
}

const FACT_ICON: Record<string, ListingFactIcon> = {
  location: "location",
  bedrooms: "beds",
  bathrooms: "baths",
  area: "size",
  plotSize: "size",
  year: "year",
  mileage: "mileage",
  transmission: "gear",
  condition: "condition",
  hours: "hours",
  serviceHours: "hours",
  walkInHours: "hours",
  serviceArea: "area",
  walkIn: "location",
  walkInAddress: "location",
};

function attrValue(
  attrs: Record<string, string> | undefined,
  ...keys: string[]
): string {
  if (!attrs) return "";
  for (const key of keys) {
    const v = attrs[key]?.trim();
    if (v) return v;
  }
  return "";
}

function formatPosted(iso: string | null | undefined, lang: LandingLang): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(lang === "sw" ? "sw-KE" : "en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function listingKeyFacts(
  detail: ProductDetail,
  lang: LandingLang,
): ListingKeyFact[] {
  const facts: ListingKeyFact[] = [];
  const push = (
    key: string,
    label: string,
    value: string,
    icon: ListingFactIcon,
  ) => {
    const v = value.trim();
    if (!v) return;
    facts.push({ key, label, value: v, icon });
  };

  const loc = attrValue(detail.attrs, "location");
  push("location", homeCopy("productAttrLocation", lang), loc, "location");
  push(
    "posted",
    homeCopy("productAttrPosted", lang),
    formatPosted(detail.createdAt, lang),
    "posted",
  );
  push(
    "category",
    homeCopy("productAttrCategory", lang),
    listingCategoryLabel(detail),
    "category",
  );
  push(
    "condition",
    homeCopy("productAttrCondition", lang),
    attrValue(detail.attrs, "condition"),
    "condition",
  );
  push(
    "hours",
    homeCopy("productAttrHours", lang),
    attrValue(detail.attrs, "hours", "serviceHours", "walkInHours"),
    "hours",
  );
  push(
    "serviceArea",
    homeCopy("productAttrServiceArea", lang),
    attrValue(detail.attrs, "serviceArea"),
    "area",
  );

  const extraKeys = [
    "bedrooms",
    "bathrooms",
    "area",
    "plotSize",
    "year",
    "mileage",
    "transmission",
    "tenure",
    "walkIn",
    "walkInAddress",
  ];
  for (const key of extraKeys) {
    if (facts.some((f) => f.key === key)) continue;
    const value = attrValue(detail.attrs, key);
    if (!value) continue;
    const copyKey = ATTR_LABEL_KEYS[key];
    const label = copyKey ? homeCopy(copyKey, lang) : key;
    push(key, label, value, FACT_ICON[key] ?? "default");
  }

  return facts;
}

export function vendorInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();
}

export function formatMemberSince(
  iso: string | null | undefined,
  lang: LandingLang,
): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const when = d.toLocaleDateString(lang === "sw" ? "sw-KE" : "en-KE", {
    month: "short",
    year: "numeric",
  });
  return lang === "sw" ? `Mwanachama tangu ${when}` : `Member since ${when}`;
}

export function walkInCopy(attrs: Record<string, string> | undefined): string {
  const address = attrValue(attrs, "walkInAddress", "walkIn");
  const hours = attrValue(attrs, "walkInHours", "hours", "serviceHours");
  return [address, hours].filter(Boolean).join(" · ");
}
