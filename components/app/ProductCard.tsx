"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { isLiveCatalogEnabled } from "@/lib/nakuru/catalog-live";
import type { Listing } from "@/lib/nakuru/types";
import {
  CategoryIcon,
  isCategoryIconKey,
  type CategoryIconKey,
} from "@/lib/nakuru/category-icons";
import {
  IconCheck,
  IconChevronRight,
  IconHeart,
  IconMapPin,
  IconPlus,
  IconWallet,
} from "@/components/app/icons/LineIcons";
import { useNakuruApp } from "@/components/app/AppProvider";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import {
  classifiedCategoryLabel,
  classifiedLocation,
  classifiedPhotoBadge,
  formatClassifiedPrice,
} from "@/lib/nakuru/listing-card-display";
import { recordProductOpen } from "@/lib/nakuru/pwa-engage";
import { usePwaInstall } from "@/components/app/pwa/InstallProvider";
import {
  persistDetailNavTab,
  type DetailNavTab,
} from "@/lib/nakuru/detail-nav-tab";
import { VerifiedBadge } from "@/components/app/product/VerifiedBadge";
import { listingModeOf } from "@/lib/nakuru/listing-mode";
import {
  displayImageSrc,
  isOptimizablePhotoUrl,
  listingAspectForListing,
  listingGallery,
  productImageSizes,
} from "@/lib/nakuru/listing-image";
import {
  formatPropertyPrice,
  propertyListingBadge,
  propertyLocation,
  propertyTenure,
} from "@/lib/nakuru/property-display";

const DEFAULT_ICON: Record<string, CategoryIconKey> = {
  shop: "shirt",
  property: "home",
  cars: "car",
  services: "bolt",
};

type Props = {
  item: Listing;
  onAct: (id: number | string) => void;
  serviceInquiryEnabled?: boolean;
  navOriginTab?: DetailNavTab;
  layout?: "grid" | "rail" | "classified";
  priorityImage?: boolean;
  /** Delivery zone shown on the meta line (from app state). */
  zoneLabel?: string;
};

function listingIconKey(item: Listing): CategoryIconKey {
  if (isCategoryIconKey(item.e)) return item.e;
  return DEFAULT_ICON[item.c] ?? "grid";
}

function vendorName(item: Listing): string {
  return item.vn ?? item.s.split("·")[0]?.trim() ?? item.s;
}

export function ProductCard({
  item,
  onAct,
  serviceInquiryEnabled = false,
  navOriginTab,
  layout = "grid",
  priorityImage = false,
  zoneLabel,
}: Props) {
  const { lang } = usePwaInstall();
  const { dispatch } = useNakuruApp();
  const live = isLiveCatalogEnabled();
  const mode = listingModeOf(item);
  const serviceHeld =
    live && mode === "services" && !serviceInquiryEnabled;
  const shopAdd = mode === "shop" && !serviceHeld;
  const nonShop = mode !== "shop";
  const aspect = listingAspectForListing(item);
  const gallery = listingGallery(item);
  const [imgOk, setImgOk] = useState(true);
  const [added, setAdded] = useState(false);
  const icon = listingIconKey(item);
  const src = imgOk ? displayImageSrc(item) : null;
  const actionLabel =
    mode === "property" || mode === "cars"
      ? homeCopy("productRequestViewing", lang)
      : mode === "services"
        ? homeCopy("productRequestQuote", lang)
        : "";
  const classified = layout === "classified";
  const propertyBadge =
    mode === "property" ? propertyListingBadge(item) : null;
  const loc = classified
    ? classifiedLocation(item, zoneLabel)
    : mode === "property"
      ? propertyLocation(item)
      : null;
  const priceParts =
    mode === "property"
      ? formatPropertyPrice(item.p, propertyTenure(item), lang)
      : null;

  const handleAct = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (serviceHeld) return;
    onAct(item.id);
    if (shopAdd) {
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1200);
    }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch({ type: "ACCOUNT_ROW", id: "acc:saved" });
  };

  const imageRatio = classified || aspect !== "1" ? "43" : "1";

  return (
    <article className={`pc pc--${layout} pc--${item.c}`}>
      <Link
        href={`/app/p/${item.id}`}
        className="pc-hit"
        onClick={() => {
          if (navOriginTab) persistDetailNavTab(navOriginTab);
          recordProductOpen(item.id);
          window.dispatchEvent(new Event("nh:engage"));
        }}
      >
        <div className={`pim pim--${item.c} pim--ratio-${imageRatio}`}>
          {src ? (
            <Image
              className="pim-photo"
              src={src}
              alt=""
              fill
              sizes={productImageSizes(classified ? "classified" : layout)}
              priority={priorityImage}
              unoptimized={!isOptimizablePhotoUrl(src)}
              onError={() => setImgOk(false)}
            />
          ) : (
            <span className="pim-fallback pim-fallback--error" aria-hidden>
              <CategoryIcon icon={icon} size={32} />
            </span>
          )}
          <span className="pim-shade" aria-hidden />
          {classified ? (
            <>
              <span className="pc-photo-badge">
                {classifiedPhotoBadge(item, lang)}
              </span>
              <button
                type="button"
                className="pc-save"
                aria-label={homeCopy("saveListingAria", lang)}
                onClick={handleSave}
              >
                <IconHeart size={18} />
              </button>
            </>
          ) : (
            <>
              {propertyBadge ? (
                <span className="pc-listing-badge">{propertyBadge}</span>
              ) : null}
              {item.v ? (
                <span className="pc-verified-on-img">
                  <VerifiedBadge lang={lang} />
                </span>
              ) : null}
              {gallery.length > 1 ? (
                <span className="pc-photo-count">
                  {homeCopy("photoCountPill", lang)
                    .replace("{i}", "1")
                    .replace("{n}", String(gallery.length))}
                </span>
              ) : null}
              {shopAdd ? (
                <button
                  type="button"
                  className={`pc-fab-add${added ? " pc-fab-add--done" : ""}`}
                  aria-label={homeCopy("addToCartAria", lang).replace(
                    "{name}",
                    item.t,
                  )}
                  onClick={handleAct}
                >
                  {added ? <IconCheck size={20} /> : <IconPlus size={20} />}
                </button>
              ) : nonShop ? (
                <span className="pc-fab-chevron" aria-hidden>
                  <IconChevronRight size={20} />
                </span>
              ) : null}
            </>
          )}
        </div>
        {classified ? (
          <div className="pc-body">
            <p className="pc-cat">{classifiedCategoryLabel(item, lang)}</p>
            <h3 className="pc-title">{item.t}</h3>
            {loc ? (
              <p className="pc-location">
                <IconMapPin size={14} aria-hidden />
                {loc}
              </p>
            ) : null}
            <div className="pc-price-row">
              <p className="pc-price">{formatClassifiedPrice(item.p)}</p>
              <p className="pc-vendor">{vendorName(item)}</p>
            </div>
            <p className="pc-view-details">
              {homeCopy("viewDetails", lang)}
              <span aria-hidden> →</span>
            </p>
          </div>
        ) : (
          <div className="pc-body">
            <h3 className="pc-title">{item.t}</h3>
            {loc ? (
              <p className="pc-location">
                <IconMapPin size={14} aria-hidden />
                {loc}
              </p>
            ) : null}
            <p className="pc-price">
              {priceParts ? (
                <>
                  <span className="pc-price-amount">{priceParts.amount}</span>
                  {priceParts.suffix ? (
                    <span className="pc-price-suffix">{priceParts.suffix}</span>
                  ) : null}
                </>
              ) : (
                <>
                  <span className="pc-price-kes">KES</span>
                  <span className="pc-price-num">
                    {item.p.toLocaleString("en-KE")}
                  </span>
                </>
              )}
            </p>
            {nonShop && actionLabel ? (
              <p className="pc-action-hint">{actionLabel}</p>
            ) : null}
            <p className="pc-meta">
              <span className="pc-meta-vendor">{vendorName(item)}</span>
              {zoneLabel ? (
                <>
                  <span className="pc-meta-dot" aria-hidden>
                    ·
                  </span>
                  <span className="pc-meta-zone">{zoneLabel}</span>
                </>
              ) : null}
            </p>
            {!item.v ? (
              <span className="pc-cod">
                <IconWallet size={14} />
                {homeCopy("payOnDelivery", lang)}
              </span>
            ) : null}
          </div>
        )}
      </Link>
    </article>
  );
}