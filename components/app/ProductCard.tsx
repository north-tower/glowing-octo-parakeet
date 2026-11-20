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
  IconPlus,
  IconWallet,
} from "@/components/app/icons/LineIcons";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import { recordProductOpen } from "@/lib/nakuru/pwa-engage";
import { usePwaInstall } from "@/components/app/pwa/InstallProvider";
import {
  persistDetailNavTab,
  type DetailNavTab,
} from "@/lib/nakuru/detail-nav-tab";
import { VerifiedBadge } from "@/components/app/product/VerifiedBadge";
import {
  displayImageSrc,
  isOptimizablePhotoUrl,
  listingAspect,
  listingGallery,
  productImageSizes,
} from "@/lib/nakuru/listing-image";

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
  layout?: "grid" | "rail";
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
  const live = isLiveCatalogEnabled();
  const serviceHeld =
    live && item.c === "services" && !serviceInquiryEnabled;
  const shopAdd = item.c === "shop" && !serviceHeld;
  const nonShop = item.c !== "shop";
  const aspect = listingAspect(item.c);
  const gallery = listingGallery(item);
  const [imgOk, setImgOk] = useState(true);
  const [added, setAdded] = useState(false);
  const icon = listingIconKey(item);
  const src = imgOk ? displayImageSrc(item) : null;
  const actionLabel =
    item.c === "property" || item.c === "cars"
      ? homeCopy("productRequestViewing", lang)
      : item.c === "services"
        ? homeCopy("productRequestQuote", lang)
        : "";

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
        <div className={`pim pim--${item.c} pim--ratio-${aspect === "1" ? "1" : "43"}`}>
          {src ? (
            <Image
              className="pim-photo"
              src={src}
              alt=""
              fill
              sizes={productImageSizes(layout)}
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
        </div>
        <div className="pc-body">
          <h3 className="pc-title">{item.t}</h3>
          <p className="pc-price">
            <span className="pc-price-kes">KES</span>
            <span className="pc-price-num">
              {item.p.toLocaleString("en-KE")}
            </span>
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
      </Link>
    </article>
  );
}