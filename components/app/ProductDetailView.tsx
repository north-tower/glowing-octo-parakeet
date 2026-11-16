"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { appHrefForDetailNavTab } from "@/lib/nakuru/detail-nav-tab";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ProductCard } from "@/components/app/ProductCard";
import { VerifiedBadge } from "@/components/app/product/VerifiedBadge";
import {
  CategoryIcon,
  isCategoryIconKey,
  type CategoryIconKey,
} from "@/lib/nakuru/category-icons";
import { itemById, ITEMS } from "@/lib/nakuru/data/items";
import { MAX_CART_QTY } from "@/lib/nakuru/data/constants";
import { apiFetch } from "@/lib/nakuru/api";
import { syncLiveListings, isLiveCatalogEnabled } from "@/lib/nakuru/catalog-live";
import { kes } from "@/lib/nakuru/format";
import { homeCopy, homeCategoryLabel } from "@/lib/nakuru/home-i18n";
import {
  toProductCardItem,
  type ApiListing,
} from "@/lib/nakuru/listings-map";
import {
  categoryTint,
  similarByCategory,
  similarByVendor,
  toProductDetail,
  type ProductDetail,
} from "@/lib/nakuru/listing-detail";
import type { Listing } from "@/lib/nakuru/types";
import { useListingAct } from "@/lib/nakuru/use-listing-act";
import { recordProductOpen } from "@/lib/nakuru/pwa-engage";
import { usePwaInstall } from "@/components/app/pwa/InstallProvider";
import { useNakuruApp } from "@/components/app/AppProvider";
import { AssistantEntryChip } from "@/components/app/assistant/AssistantEntryChip";
import { useAssistantUi } from "@/components/app/assistant/AssistantUiProvider";
import { isOutsideArea } from "@/lib/nakuru/area";
import {
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconMapPin,
  IconMinus,
  IconPlus,
  IconPromoDelivery,
  IconShare2,
  IconShieldCheck,
  IconWallet,
} from "@/components/app/icons/LineIcons";

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

type Props = {
  productId: string;
};

export function ProductDetailView({ productId }: Props) {
  const router = useRouter();
  const { lang } = usePwaInstall();
  const { state, dispatch, toast } = useNakuruApp();
  const { openAssistant } = useAssistantUi();
  const { onAct, serviceInquiryEnabled, inquiryModal } = useListingAct();
  const live = isLiveCatalogEnabled();

  const [rawListing, setRawListing] = useState<Listing | null | undefined>(
    undefined,
  );
  const [apiMeta, setApiMeta] = useState<
    Pick<ApiListing, "vendor" | "vendorId" | "galleryUrls" | "attributes"> | null
  >(null);
  const [related, setRelated] = useState<Listing[]>([]);
  const [relatedFromVendor, setRelatedFromVendor] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [imgFailed, setImgFailed] = useState<Record<number, boolean>>({});
  const [addedPulse, setAddedPulse] = useState(false);
  const [goCart, setGoCart] = useState(false);
  const [localQty, setLocalQty] = useState(1);
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [aboutClamp, setAboutClamp] = useState(false);
  const aboutRef = useRef<HTMLParagraphElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const sellerSectionRef = useRef<HTMLElement>(null);
  const backHref = appHrefForDetailNavTab();

  const load = useCallback(async () => {
    if (!live) {
      const found = itemById(productId);
      setRawListing(found ?? null);
      setApiMeta(null);
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
      setRawListing(item);
      setApiMeta({
        vendor: row.vendor,
        vendorId: row.vendorId,
        galleryUrls: row.galleryUrls,
        attributes: row.attributes,
      });
    } catch {
      const cached = itemById(productId);
      setRawListing(cached ?? null);
      setApiMeta(null);
    }
  }, [live, productId]);

  const loadRelated = useCallback(async (detail: ProductDetail) => {
    if (!live) {
      const byVendor = similarByVendor(ITEMS, detail);
      setRelatedFromVendor(byVendor.length > 0);
      setRelated(
        byVendor.length ? byVendor : similarByCategory(ITEMS, detail),
      );
      return;
    }
    try {
      const rows = await apiFetch<ApiListing[]>(`/api/listings`, {
        skipAuthRetry: true,
        credentials: "omit",
      });
      const items = rows.map(toProductCardItem);
      syncLiveListings(items);
      const byVendor = detail.vendorId
        ? items.filter(
            (x) =>
              String(x.id) !== String(detail.id) &&
              rows.find((r) => r.id === String(x.id))?.vendorId ===
                detail.vendorId,
          )
        : similarByVendor(items, detail);
      const picked = byVendor.length
        ? byVendor.slice(0, 6)
        : similarByCategory(items, detail);
      setRelatedFromVendor(byVendor.length > 0);
      setRelated(picked);
    } catch {
      setRelated([]);
      setRelatedFromVendor(false);
    }
  }, [live]);

  useEffect(() => {
    void load();
  }, [load]);

  const detail = useMemo(() => {
    if (!rawListing) return null;
    return toProductDetail(rawListing, lang, apiMeta ?? undefined);
  }, [rawListing, lang, apiMeta]);

  useEffect(() => {
    if (detail) void loadRelated(detail);
  }, [detail, loadRelated]);

  useEffect(() => {
    if (detail) {
      recordProductOpen(detail.id);
      window.dispatchEvent(new Event("nh:engage"));
    }
  }, [detail]);

  useEffect(() => {
    const el = aboutRef.current;
    if (!el || aboutExpanded) return;
    const lh = parseFloat(getComputedStyle(el).lineHeight);
    setAboutClamp(el.scrollHeight > lh * 5 + 2);
  }, [detail, aboutExpanded, lang]);

  useEffect(() => {
    const node = galleryRef.current;
    if (!node) return;
    const onScroll = () => {
      const w = node.clientWidth || 1;
      const i = Math.round(node.scrollLeft / w);
      setGalleryIndex(i);
    };
    node.addEventListener("scroll", onScroll, { passive: true });
    return () => node.removeEventListener("scroll", onScroll);
  }, [detail?.gallery.length]);

  const cartKey = detail ? String(detail.id) : "";
  const inCart = cartKey ? (state.cart[cartKey] ?? 0) : 0;
  const shopQty = inCart > 0 ? inCart : localQty;

  useEffect(() => {
    if (inCart === 0) setGoCart(false);
  }, [inCart]);

  const shareUrl =
    typeof window !== "undefined" && detail
      ? `${window.location.origin}/app/p/${detail.id}`
      : "";

  const handleShare = async () => {
    if (!shareUrl) return;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: detail?.t,
          url: shareUrl,
        });
        return;
      }
    } catch {
      /* fall through to copy */
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast(homeCopy("productShareCopied", lang));
    } catch {
      toast(shareUrl);
    }
  };

  const setShopQty = (next: number) => {
    const clamped = Math.max(1, Math.min(MAX_CART_QTY, next));
    if (inCart > 0) {
      if (clamped > inCart) {
        for (let i = inCart; i < clamped; i++) {
          dispatch({ type: "CART_INC", id: cartKey });
        }
      } else if (clamped < inCart) {
        for (let i = inCart; i > clamped; i--) {
          dispatch({ type: "CART_DEC", id: cartKey });
        }
      }
    } else {
      setLocalQty(clamped);
    }
  };

  const messageSeller = () => {
    dispatch({ type: "SET_TAB", tab: "msg" });
    toast(homeCopy("productViewingPrefill", lang));
    router.push("/app?tab=msg");
  };

  const requestViewing = () => {
    if (!detail) return;
    dispatch({ type: "ITEM_ACT", id: detail.id });
    dispatch({ type: "SET_TAB", tab: "msg" });
    toast(homeCopy("productViewingPrefill", lang));
    router.push("/app?tab=msg");
  };

  const handlePrimary = () => {
    if (!detail) return;
    if (goCart) {
      router.push("/app?tab=cart");
      dispatch({ type: "SET_TAB", tab: "cart" });
      return;
    }

    const serviceHeld =
      live && detail.c === "services" && !serviceInquiryEnabled;
    if (serviceHeld) return;

    if (detail.c === "shop") {
      if (isOutsideArea(state.area)) return;
      const need = shopQty - inCart;
      for (let i = 0; i < need; i++) {
        onAct(detail.id);
      }
      setAddedPulse(true);
      setGoCart(true);
      window.setTimeout(() => setAddedPulse(false), 1200);
      return;
    }

    if (detail.c === "services") {
      onAct(detail.id);
      return;
    }

    if (detail.c === "property" || detail.c === "cars") {
      requestViewing();
    }
  };

  if (rawListing === undefined) {
    return (
      <div className="pd" aria-busy="true">
        <div className="pd-skel pim" />
        <div className="pd-inner">
          <div className="pd-skel" style={{ height: 28, width: "70%" }} />
          <div className="pd-skel" style={{ height: 18, width: "40%" }} />
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="pd">
        <div className="pd-inner">
          <Link href="/app" className="pd-back-inline">
            <IconChevronLeft size={20} />
            {homeCopy("productBack", lang)}
          </Link>
          <div className="card pd-card">
            <p className="t">{homeCopy("productNotFoundTitle", lang)}</p>
            <p className="m">{homeCopy("productNotFoundBody", lang)}</p>
            <Link href="/app" className="btn o full" style={{ marginTop: 12 }}>
              {homeCopy("productBrowse", lang)}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const verified = detail.v === 1;
  const icon = listingIconKey(detail);
  const tint = categoryTint(detail.c);
  const bodyText = detail.desc?.trim() ?? "";
  const serviceHeld =
    live && detail.c === "services" && !serviceInquiryEnabled;
  const shopBlock =
    detail.c === "shop" && isOutsideArea(state.area);
  const gallery = detail.gallery.length ? detail.gallery : [];
  const openVendor = () => {
    sellerSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  let primaryLabel = homeCopy("productMessageSeller", lang);
  if (detail.c === "shop") {
    if (addedPulse) primaryLabel = `${homeCopy("addedToCart", lang)} ✓`;
    else if (goCart || inCart > 0) primaryLabel = homeCopy("productGoToCart", lang);
    else primaryLabel = homeCopy("addToCart", lang);
  } else if (detail.c === "property" || detail.c === "cars") {
    primaryLabel = homeCopy("productRequestViewing", lang);
  } else if (detail.c === "services") {
    primaryLabel = serviceHeld
      ? "Quote — coming soon"
      : homeCopy("productRequestQuote", lang);
  }

  const vendorInitials = detail.vendorName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <>
      <article className="pd">
        <div className={`pd-gallery-wrap pd-gallery-wrap--${tint}`}>
          <div
            className="pd-gallery"
            ref={galleryRef}
            role="region"
            aria-label={detail.t}
          >
            {gallery.length ? (
              gallery.map((src, i) => (
                <div className="pd-gallery-slide" key={`${src}-${i}`}>
                  {!imgFailed[i] ? (
                    <img
                      src={src}
                      alt=""
                      loading={i === 0 ? "eager" : "lazy"}
                      decoding="async"
                      onError={() =>
                        setImgFailed((prev) => ({ ...prev, [i]: true }))
                      }
                    />
                  ) : (
                    <span className="pim-fallback" aria-hidden>
                      <CategoryIcon icon={icon} size={48} />
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="pd-gallery-slide">
                <span className={`pim-fallback pim pim--${detail.c}`} aria-hidden>
                  <CategoryIcon icon={icon} size={48} />
                </span>
              </div>
            )}
          </div>

          <div className="pd-overlay">
            <Link
              href={backHref}
              className="pd-icon-btn"
              aria-label={homeCopy("productBackAria", lang)}
            >
              <IconChevronLeft size={22} />
            </Link>
            <div className="pd-overlay-end">
              <button
                type="button"
                className="pd-icon-btn"
                aria-label={homeCopy("productShareAria", lang)}
                onClick={() => void handleShare()}
              >
                <IconShare2 size={22} />
              </button>
            </div>
          </div>

          {gallery.length > 1 ? (
            <span className="pd-gallery-pill" aria-live="polite">
              {galleryIndex + 1}/{gallery.length}
            </span>
          ) : null}
        </div>

        <div className="pd-inner">
          <div className="pd-head">
            <span className={`pd-chip pd-chip--${tint}`}>
              {homeCategoryLabel(detail.c, lang)}
            </span>
            <h1 className="pd-title">{detail.t}</h1>
            <p className="pd-price">{kes(detail.p)}</p>
            <button
              type="button"
              className="pd-vendor-link"
              onClick={openVendor}
            >
              <span className="pd-vendor-link-label">{detail.vendorName}</span>
              {verified ? (
                <span className="pd-vendor-tick" aria-label={homeCopy("verifiedPill", lang)}>
                  <IconCheck size={16} />
                </span>
              ) : null}
              <IconChevronRight size={20} aria-hidden />
            </button>
          </div>

          <section className="card pd-card pd-trust" aria-labelledby="pd-trust-h">
            <h2 id="pd-trust-h" className="sr-only">
              {homeCopy("trustVerifiedTitle", lang)}
            </h2>
            {verified ? (
              <div className="pd-trust-row pd-trust-row--verified">
                <IconShieldCheck size={22} />
                <div className="pd-trust-copy">
                  <VerifiedBadge lang={lang} />
                  <span className="m">{homeCopy("trustVerifiedSub", lang)}</span>
                </div>
              </div>
            ) : (
              <div className="pd-trust-row pd-trust-row--unverified">
                <IconWallet size={22} />
                <div className="pd-trust-copy pd-trust-copy--stack">
                  <strong className="pd-trust-unverified-title">
                    {homeCopy("productTrustUnverifiedTitle", lang)}
                  </strong>
                  <span className="m">
                    {homeCopy("productTrustUnverifiedBody", lang)}
                  </span>
                </div>
              </div>
            )}
            {verified ? (
              <ul className="pd-pay-list">
                <li>{homeCopy("productPayCodDetail", lang)}</li>
                <li>{homeCopy("productPayMpesaDetail", lang)}</li>
              </ul>
            ) : null}
            <div className="pd-delivery">
              <IconMapPin size={20} />
              <div>
                <p className="pd-delivery-line">
                  {homeCopy("productDeliveringTo", lang)}{" "}
                  <strong>{state.area}</strong>
                </p>
                <p className="m">{homeCopy("productDeliveryFeeHint", lang)}</p>
              </div>
            </div>
            <div className="pd-promo-row" role="note">
              <IconPromoDelivery size={22} aria-hidden />
              <div className="pd-promo-copy">
                <b>{homeCopy("slide0Title", lang)}</b>
                <span>{homeCopy("slide0Sub", lang)}</span>
              </div>
            </div>
          </section>

          <div className="assistant-entry-row">
            <AssistantEntryChip
              label={homeCopy("assistantEntryProduct", lang)}
              onClick={() =>
                openAssistant({
                  screen: "product",
                  productId: String(productId),
                  source: "product",
                  suggestedPrompt:
                    lang === "sw"
                      ? "Je, muuzaji ame Verified?"
                      : "Is this seller Verified?",
                })
              }
            />
          </div>

          <section
            ref={sellerSectionRef}
            className="card pd-card pd-seller"
            aria-labelledby="pd-seller-h"
          >
            <h2 id="pd-seller-h" className="sr-only">
              {detail.vendorName}
            </h2>
            <div className="pd-seller-row">
              <span className="pd-seller-av" aria-hidden>
                {vendorInitials || "?"}
              </span>
              <div className="pd-seller-meta">
                <p className="pd-seller-name">{detail.vendorName}</p>
                {verified ? <VerifiedBadge lang={lang} /> : null}
              </div>
            </div>
            <button
              type="button"
              className="btn o full pd-seller-msg"
              onClick={messageSeller}
            >
              {homeCopy("productMessageSeller", lang)}
            </button>
          </section>

          {bodyText ? (
            <section className="card pd-card pd-about" aria-labelledby="pd-about-h">
              <h2 id="pd-about-h" className="pd-about-title">
                {homeCopy("productAbout", lang)}
              </h2>
              <p
                ref={aboutRef}
                className={`pd-about-body${aboutExpanded ? "" : aboutClamp ? " pd-about-body--clamp" : ""}`}
              >
                {bodyText}
              </p>
              {aboutClamp ? (
                <button
                  type="button"
                  className="pd-read-more"
                  onClick={() => setAboutExpanded((v) => !v)}
                >
                  {aboutExpanded
                    ? homeCopy("productReadLess", lang)
                    : homeCopy("productReadMore", lang)}
                </button>
              ) : null}
            </section>
          ) : null}

          {detail.attributeRows.length ? (
            <section className="card pd-card pd-attrs" aria-labelledby="pd-attrs-h">
              <h2 id="pd-attrs-h" className="pd-about-title">
                {homeCopy("productDetails", lang)}
              </h2>
              <dl className="pd-attr-grid">
                {detail.attributeRows.map((row) => (
                  <div key={row.label}>
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          {related.length ? (
            <section className="pd-related" aria-labelledby="pd-related-h">
              <div className="home-section-hd">
                <h2 id="pd-related-h" className="home-section-title">
                  {relatedFromVendor
                    ? homeCopy("productMoreFromSeller", lang)
                    : homeCopy("productSimilar", lang)}
                </h2>
              </div>
              <div className="pd-related-scroll hs">
                {related.map((item) => (
                  <div className="pd-related-card" key={item.id}>
                    <ProductCard
                      item={item}
                      onAct={onAct}
                      serviceInquiryEnabled={serviceInquiryEnabled}
                    />
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <div className="pd-bar" role="region" aria-label={primaryLabel}>
          <div className="pd-bar-left">
            <span className="pd-bar-price">{kes(detail.p)}</span>
            {detail.c === "shop" ? (
              <div className="pd-qty" aria-label="Quantity">
                <button
                  type="button"
                  className="pd-qty-btn"
                  disabled={shopQty <= 1}
                  onClick={() => setShopQty(shopQty - 1)}
                  aria-label="Decrease quantity"
                >
                  <IconMinus size={18} />
                </button>
                <span className="pd-qty-val" aria-live="polite">
                  {shopQty}
                </span>
                <button
                  type="button"
                  className="pd-qty-btn"
                  disabled={shopQty >= MAX_CART_QTY}
                  onClick={() => setShopQty(shopQty + 1)}
                  aria-label="Increase quantity"
                >
                  <IconPlus size={18} />
                </button>
              </div>
            ) : null}
          </div>
          <button
            type="button"
            className={`btn pd-bar-cta${addedPulse ? " pc-add--done" : ""}`}
            disabled={serviceHeld || (detail.c === "shop" && shopBlock)}
            aria-live={detail.c === "shop" ? "polite" : undefined}
            title={shopBlock ? homeCopy("productOutsideZone", lang) : undefined}
            onClick={handlePrimary}
          >
            {primaryLabel}
          </button>
        </div>
        {shopBlock ? (
          <p className="pd-zone-hint m" role="status">
            {homeCopy("productOutsideZone", lang)}
          </p>
        ) : null}
      </article>
      {inquiryModal}
    </>
  );
}