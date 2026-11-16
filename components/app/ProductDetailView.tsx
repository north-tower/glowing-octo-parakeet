"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  CategoryIcon,
  isCategoryIconKey,
  type CategoryIconKey,
} from "@/lib/nakuru/category-icons";
import { ACT } from "@/lib/nakuru/data/constants";
import { itemById } from "@/lib/nakuru/data/items";
import { apiFetch } from "@/lib/nakuru/api";
import { syncLiveListings, isLiveCatalogEnabled } from "@/lib/nakuru/catalog-live";
import { kes } from "@/lib/nakuru/format";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import {
  toProductCardItem,
  type ApiListing,
} from "@/lib/nakuru/listings-map";
import type { Listing } from "@/lib/nakuru/types";
import { useListingAct } from "@/lib/nakuru/use-listing-act";
import { recordProductOpen } from "@/lib/nakuru/pwa-engage";
import { usePwaInstall } from "@/components/app/pwa/InstallProvider";
import { IconCheck, IconChevronLeft, IconWallet } from "@/components/app/icons/LineIcons";

const DEFAULT_ICON: Record<string, CategoryIconKey> = {
  shop: "shirt",
  property: "home",
  cars: "car",
  services: "bolt",
};

function listingIconKey(item: Listing): CategoryIconKey {
  if (isCategoryIconKey(item.e)) return item.e;
  return DEFAULT_ICON[item.c] ?? "grid";
}

function detailBody(item: Listing): string {
  if (item.desc?.trim()) return item.desc.trim();
  if (item.c === "services") return item.s;
  return item.s;
}

type Props = {
  productId: string;
};

export function ProductDetailView({ productId }: Props) {
  const { lang } = usePwaInstall();
  const { onAct, serviceInquiryEnabled, inquiryModal } = useListingAct();
  const live = isLiveCatalogEnabled();

  const [listing, setListing] = useState<Listing | null | undefined>(
    undefined,
  );
  const [imgOk, setImgOk] = useState(true);
  const [added, setAdded] = useState(false);

  const load = useCallback(async () => {
    if (!live) {
      const found = itemById(productId);
      setListing(found ?? null);
      if (found) syncLiveListings([found]);
      return;
    }

    try {
      const row = await apiFetch<ApiListing>(`/api/listings/${productId}`, {
        skipAuthRetry: true,
        credentials: "omit",
      });
      const item = toProductCardItem(row);
      syncLiveListings([item]);
      setListing(item);
    } catch {
      const cached = itemById(productId);
      setListing(cached ?? null);
    }
  }, [live, productId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (listing) {
      recordProductOpen(listing.id);
      window.dispatchEvent(new Event("nh:engage"));
    }
  }, [listing]);

  const handlePrimary = () => {
    if (!listing) return;
    const serviceHeld =
      live && listing.c === "services" && !serviceInquiryEnabled;
    if (serviceHeld) return;
    onAct(listing.id);
    if (listing.c === "shop") {
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1200);
    }
  };

  if (listing === undefined) {
    return (
      <div className="pd" aria-busy="true">
        <div className="pd-skel pim" />
        <div className="pd-skel" style={{ height: 28, width: "70%" }} />
        <div className="pd-skel" style={{ height: 18, width: "40%" }} />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="pd">
        <Link href="/app" className="pd-back">
          <IconChevronLeft size={20} />
          {homeCopy("productBack", lang)}
        </Link>
        <div className="card">
          <p className="t">{homeCopy("productNotFoundTitle", lang)}</p>
          <p className="m">{homeCopy("productNotFoundBody", lang)}</p>
          <Link href="/app" className="btn o full" style={{ marginTop: 12 }}>
            {homeCopy("productBrowse", lang)}
          </Link>
        </div>
      </div>
    );
  }

  const serviceHeld =
    live && listing.c === "services" && !serviceInquiryEnabled;
  const shopAdd = listing.c === "shop" && !serviceHeld;
  const label = serviceHeld
    ? "Quote — coming soon"
    : shopAdd
      ? added
        ? `${homeCopy("addedToCart", lang)} ✓`
        : homeCopy("addToCart", lang)
      : ACT[listing.c] ?? homeCopy("addToCart", lang);
  const icon = listingIconKey(listing);
  const showImg = Boolean(listing.img) && imgOk;
  const body = detailBody(listing);

  return (
    <>
      <article className="pd">
        <Link href="/app" className="pd-back">
          <IconChevronLeft size={20} />
          {homeCopy("productBack", lang)}
        </Link>

        <div className={`pd-hero pim pim--${listing.c}`}>
          {showImg ? (
            <img
              src={listing.img}
              alt=""
              decoding="async"
              onError={() => setImgOk(false)}
            />
          ) : (
            <span className="pim-fallback" aria-hidden>
              <CategoryIcon icon={icon} size={48} />
            </span>
          )}
          {listing.v ? (
            <span className="pc-verified-pill">
              <IconCheck size={14} />
              {homeCopy("verifiedPill", lang)}
            </span>
          ) : null}
        </div>

        <header className="pd-head">
          <h1 className="pd-title">{listing.t}</h1>
          <p className="pd-vendor">{listing.s}</p>
          {!listing.v ? (
            <span className="pc-cod">
              <IconWallet size={14} />
              {homeCopy("payOnDelivery", lang)}
            </span>
          ) : null}
          <p className="pd-price">{kes(listing.p)}</p>
        </header>

        <section className="pd-about" aria-labelledby="pd-about-h">
          <h2 id="pd-about-h" className="pd-about-title">
            {homeCopy("productAbout", lang)}
          </h2>
          <p className="pd-about-body">{body}</p>
        </section>

        <div className="pd-cta">
          <button
            type="button"
            className={`btn pd-cta-btn${added ? " pc-add--done" : ""}${shopAdd ? " o" : " s"}`}
            disabled={serviceHeld}
            onClick={handlePrimary}
          >
            {label}
          </button>
        </div>
      </article>
      {inquiryModal}
    </>
  );
}