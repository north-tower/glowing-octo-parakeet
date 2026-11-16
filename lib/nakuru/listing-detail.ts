import type { LandingLang } from "@/lib/nakuru/i18n";
import { homeCopy, type HomeCopyKey } from "@/lib/nakuru/home-i18n";
import type { CategoryId, Listing } from "@/lib/nakuru/types";
import type { ApiListing } from "@/lib/nakuru/listings-map";

const ATTR_LABEL_KEYS: Record<string, HomeCopyKey> = {
  bedrooms: "productAttrBedrooms",
  mileage: "productAttrMileage",
  year: "productAttrYear",
  area: "productAttrArea",
};

export type ProductDetail = Listing & {
  vendorName: string;
  vendorId?: string;
  gallery: string[];
  attributeRows: { label: string; value: string }[];
};

export function demoVendorName(item: Listing): string {
  if (item.vn) return item.vn;
  if (item.c === "shop") return item.s;
  if (item.c === "services") {
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
    .filter(([, v]) => String(v).trim())
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
    "vendor" | "vendorId" | "galleryUrls" | "attributes"
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
  };
  const attributeRows = attributeRowsFromRecord(merged.attrs, lang);
  return {
    ...merged,
    vendorName,
    vendorId: api?.vendorId,
    gallery: gallery.length ? gallery : demoGallery(merged),
    attributeRows,
  };
}

export function categoryTint(c: CategoryId): string {
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
      (x) =>
        String(x.id) !== String(current.id) && x.c === current.c,
    )
    .slice(0, limit);
}