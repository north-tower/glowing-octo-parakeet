"use client";

import Link from "next/link";
import { useState } from "react";
import { ACT } from "@/lib/nakuru/data/constants";
import { isLiveCatalogEnabled } from "@/lib/nakuru/catalog-live";
import { kes } from "@/lib/nakuru/format";
import type { Listing } from "@/lib/nakuru/types";
import {
  CategoryIcon,
  isCategoryIconKey,
  type CategoryIconKey,
} from "@/lib/nakuru/category-icons";
import { IconCheck, IconWallet } from "@/components/app/icons/LineIcons";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import { recordProductOpen } from "@/lib/nakuru/pwa-engage";
import { usePwaInstall } from "@/components/app/pwa/InstallProvider";
import {
  persistDetailNavTab,
  type DetailNavTab,
} from "@/lib/nakuru/detail-nav-tab";

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
  /** When set, records Home vs Category before opening product detail. */
  navOriginTab?: DetailNavTab;
};

function listingIconKey(item: Listing): CategoryIconKey {
  if (isCategoryIconKey(item.e)) return item.e;
  return DEFAULT_ICON[item.c] ?? "grid";
}

export function ProductCard({
  item,
  onAct,
  serviceInquiryEnabled = false,
  navOriginTab,
}: Props) {
  const { lang } = usePwaInstall();
  const live = isLiveCatalogEnabled();
  const serviceHeld =
    live && item.c === "services" && !serviceInquiryEnabled;
  const shopAdd = item.c === "shop" && !serviceHeld;
  const label = serviceHeld
    ? "Quote — coming soon"
    : shopAdd
      ? homeCopy("addToCart", lang)
      : ACT[item.c];
  const [imgOk, setImgOk] = useState(true);
  const [added, setAdded] = useState(false);
  const icon = listingIconKey(item);
  const showImg = Boolean(item.img) && imgOk;

  const handleAct = () => {
    if (serviceHeld) return;
    onAct(item.id);
    if (shopAdd) {
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1200);
    }
  };

  return (
    <article className="pc">
      <Link
        href={`/app/p/${item.id}`}
        className="pc-hit"
        onClick={() => {
          if (navOriginTab) persistDetailNavTab(navOriginTab);
          recordProductOpen(item.id);
          window.dispatchEvent(new Event("nh:engage"));
        }}
      >
        <div className={`pim pim--${item.c}`}>
          {showImg ? (
            <img
              src={item.img}
              alt=""
              loading="lazy"
              decoding="async"
              onError={() => setImgOk(false)}
            />
          ) : (
            <span className="pim-fallback" aria-hidden>
              <CategoryIcon icon={icon} size={32} />
            </span>
          )}
          {item.v ? (
            <span className="pc-verified-pill">
              <IconCheck size={14} />
              {homeCopy("verifiedPill", lang)}
            </span>
          ) : null}
        </div>
        <div className="pc-body">
          <h3 className="pc-title">{item.t}</h3>
          <p className="pc-vendor">{item.s}</p>
          {!item.v ? (
            <span className="pc-cod">
              <IconWallet size={14} />
              {homeCopy("payOnDelivery", lang)}
            </span>
          ) : null}
          <p className="pc-price">{kes(item.p)}</p>
        </div>
      </Link>
      <button
        type="button"
        className={`btn pc-add${added ? " pc-add--done" : ""}${shopAdd ? " o" : " s"}`}
        disabled={serviceHeld}
        aria-live={shopAdd ? "polite" : undefined}
        title={
          serviceHeld
            ? "Service quote requests open in the next release"
            : undefined
        }
        onClick={handleAct}
      >
        {added ? (
          <>
            {homeCopy("addedToCart", lang)} ✓
          </>
        ) : (
          label
        )}
      </button>
    </article>
  );
}