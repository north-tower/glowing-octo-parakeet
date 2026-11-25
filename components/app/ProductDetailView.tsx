"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { appHrefForDetailNavTab } from "@/lib/nakuru/detail-nav-tab";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ProductDetailSkeleton } from "@/components/app/loading/LoadingUi";
import { isCategoryIconKey, type CategoryIconKey } from "@/lib/nakuru/category-icons";
import { itemById, ITEMS } from "@/lib/nakuru/data/items";
import { MAX_CART_QTY } from "@/lib/nakuru/data/constants";
import { apiFetch } from "@/lib/nakuru/api";
import { syncLiveListings, isLiveCatalogEnabled } from "@/lib/nakuru/catalog-live";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import {
  toProductCardItem,
  type ApiListing,
} from "@/lib/nakuru/listings-map";
import {
  categoryTint,
  listingDisplayPrice,
  listingKeyFacts,
  similarByCategory,
  similarByVendor,
  toProductDetail,
  type ProductDetail,
} from "@/lib/nakuru/listing-detail";
import { listingLayoutOf } from "@/lib/nakuru/listing-layout";
import { listingModeOf } from "@/lib/nakuru/listing-mode";
import type { Listing } from "@/lib/nakuru/types";
import { useListingAct } from "@/lib/nakuru/use-listing-act";
import { recordProductOpen } from "@/lib/nakuru/pwa-engage";
import { usePwaInstall } from "@/components/app/pwa/InstallProvider";
import { useNakuruApp } from "@/components/app/AppProvider";
import { ListingComments } from "@/components/app/product/ListingComments";
import { ListingInAppMessages } from "@/components/app/product/ListingInAppMessages";
import { ListingGallery } from "@/components/app/product/ListingGallery";
import { ListingHeader } from "@/components/app/product/ListingHeader";
import { ListingQuickActions } from "@/components/app/product/ListingQuickActions";
import { SellerCard } from "@/components/app/product/SellerCard";
import { KeyFacts } from "@/components/app/product/KeyFacts";
import { Description } from "@/components/app/product/Description";
import { ListingTypeSections } from "@/components/app/product/ListingTypeSections";
import { StickyActionBar } from "@/components/app/product/StickyActionBar";
import {
  SimilarListings,
  similarCategoryTitle,
} from "@/components/app/product/SimilarListings";
import { ListingSafety } from "@/components/app/product/ListingSafety";
import { useSavedListing } from "@/components/app/product/useSavedListing";
import { useAssistantUi } from "@/components/app/assistant/AssistantUiProvider";
import { isOutsideArea } from "@/lib/nakuru/area";
import { toTelHref, toWhatsAppHref } from "@/lib/nakuru/whatsapp";
import { IconChevronLeft } from "@/components/app/icons/LineIcons";

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
  const { saved, toggle: toggleSaved } = useSavedListing(productId);

  const [rawListing, setRawListing] = useState<Listing | null | undefined>(
    undefined,
  );
  const [apiMeta, setApiMeta] = useState<
    Pick<
      ApiListing,
      | "vendor"
      | "vendorId"
      | "galleryUrls"
      | "attributes"
      | "vendorLogoUrl"
      | "createdAt"
      | "vendorCreatedAt"
      | "categoryLabel"
    > | null
  >(null);
  const [fromSeller, setFromSeller] = useState<Listing[]>([]);
  const [similar, setSimilar] = useState<Listing[]>([]);
  const [addedPulse, setAddedPulse] = useState(false);
  const [goCart, setGoCart] = useState(false);
  const [localQty, setLocalQty] = useState(1);
  const sellerSectionRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);
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
        vendorLogoUrl: row.vendorLogoUrl,
        createdAt: row.createdAt,
        vendorCreatedAt: row.vendorCreatedAt,
        categoryLabel: row.categoryLabel,
      });
    } catch {
      const cached = itemById(productId);
      setRawListing(cached ?? null);
      setApiMeta(null);
    }
  }, [live, productId]);

  const loadRelated = useCallback(async (detail: ProductDetail) => {
    if (!live) {
      setFromSeller(similarByVendor(ITEMS, detail));
      setSimilar(similarByCategory(ITEMS, detail));
      return;
    }
    try {
      const rows = await apiFetch<ApiListing[]>(`/api/listings`, {
        skipAuthRetry: true,
        credentials: "omit",
      });
      const items = rows.map(toProductCardItem);
      syncLiveListings(items);
      const vendorItems = detail.vendorId
        ? items.filter(
            (x) =>
              String(x.id) !== String(detail.id) &&
              rows.find((r) => r.id === String(x.id))?.vendorId ===
                detail.vendorId,
          )
        : similarByVendor(items, detail);
      setFromSeller(vendorItems.slice(0, 6));
      setSimilar(similarByCategory(items, detail));
    } catch {
      setFromSeller([]);
      setSimilar([]);
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

  const cartKey = detail ? String(detail.id) : "";
  const inCart = cartKey ? (state.cart[cartKey] ?? 0) : 0;
  const shopQty = inCart > 0 ? inCart : localQty;

  useEffect(() => {
    if (inCart === 0) setGoCart(false);
  }, [inCart]);

  const handleShare = async () => {
    if (!detail) return;
    const shareUrl = `${window.location.origin}/app/p/${detail.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: detail.t, url: shareUrl });
        return;
      }
    } catch {
      /* fall through */
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

  const requestViewing = () => {
    if (!detail) return;
    if (live) {
      onAct(detail.id);
      return;
    }
    dispatch({ type: "ITEM_ACT", id: detail.id });
    sellerSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    toast(homeCopy("messagesHint", lang));
  };

  const handlePrimary = () => {
    if (!detail) return;
    if (goCart) {
      router.push("/app?tab=cart");
      dispatch({ type: "SET_TAB", tab: "cart" });
      return;
    }

    const detailMode = listingModeOf(detail);
    const serviceHeld =
      live && detailMode === "services" && !serviceInquiryEnabled;
    if (serviceHeld) return;

    if (detailMode === "shop") {
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

    if (detailMode === "services") {
      onAct(detail.id);
      return;
    }

    if (detailMode === "property" || detailMode === "cars") {
      requestViewing();
    }
  };

  if (rawListing === undefined) {
    return <ProductDetailSkeleton />;
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
  const mode = listingModeOf(detail);
  const layout = listingLayoutOf(mode);
  const icon = listingIconKey(detail);
  const tint = categoryTint(detail.c);
  const serviceHeld =
    live && mode === "services" && !serviceInquiryEnabled;
  const shopBlock = mode === "shop" && isOutsideArea(state.area);
  const phone =
    detail.attrs?.phone || detail.attrs?.mobile || detail.attrs?.whatsapp;
  const callHref = phone ? toTelHref(phone) : null;
  const waNumber = detail.attrs?.whatsapp || null;
  const whatsappHref = waNumber
    ? toWhatsAppHref(waNumber, `Hi, I am interested in ${detail.t} on NakuruHub`)
    : null;
  const containHero = Boolean(
    detail.vendorLogoUrl &&
      detail.gallery[0] &&
      detail.gallery[0] === detail.vendorLogoUrl,
  );

  let primaryLabel = homeCopy("productMessageSeller", lang);
  if (mode === "shop") {
    if (addedPulse) primaryLabel = `${homeCopy("addedToCart", lang)} ✓`;
    else if (goCart || inCart > 0) primaryLabel = homeCopy("productGoToCart", lang);
    else primaryLabel = homeCopy("addToCart", lang);
  } else if (mode === "property" || mode === "cars") {
    primaryLabel = homeCopy("productRequestViewing", lang);
  } else if (mode === "services") {
    primaryLabel = serviceHeld
      ? "Quote — coming soon"
      : homeCopy("productRequestQuote", lang);
  }

  const facts = listingKeyFacts(detail, lang);
  const similarOnly = similar.filter(
    (x) => !fromSeller.some((s) => String(s.id) === String(x.id)),
  );

  const openVendor = () => {
    sellerSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const openMessage = () => {
    messageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <article className="pd">
        <ListingGallery
          title={detail.t}
          gallery={detail.gallery}
          tint={tint}
          icon={icon}
          containHero={containHero}
          lang={lang}
          backHref={backHref}
          saved={saved}
          onShare={() => void handleShare()}
          onSave={toggleSaved}
        />

        <div className="pd-inner">
          <ListingHeader
            detail={detail}
            tint={tint}
            lang={lang}
            onOpenSeller={openVendor}
          />

          <ListingQuickActions
            lang={lang}
            callHref={callHref}
            whatsappHref={whatsappHref}
            onMessage={openMessage}
            onAsk={() =>
              openAssistant({
                screen: "product",
                productId: String(productId),
                source: "product",
                suggestedPrompt: `${homeCopy("assistantEntryProduct", lang)}: ${detail.t}`,
              })
            }
          />

          <div ref={sellerSectionRef}>
            <SellerCard
              lang={lang}
              vendorName={detail.vendorName}
              vendorId={detail.vendorId}
              vendorLogoUrl={detail.vendorLogoUrl}
              verified={verified}
              memberSince={detail.vendorCreatedAt}
            />
          </div>

          <KeyFacts lang={lang} facts={facts} />
          <Description lang={lang} raw={detail.desc} />
          <ListingTypeSections
            lang={lang}
            layout={layout}
            listing={detail}
            area={state.area}
            qty={shopQty}
            onQty={setShopQty}
          />

          <ListingComments lang={lang} productId={productId} />

          <div ref={messageRef}>
            <ListingInAppMessages
              lang={lang}
              productId={productId}
              vendorName={detail.vendorName}
              vendorInitials={
                detail.vendorName
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()
              }
              verified={verified}
            />
          </div>

          <ListingSafety
            lang={lang}
            listingTitle={detail.t}
            onReport={() =>
              openAssistant({
                screen: "product",
                productId: String(productId),
                source: "product-report",
                suggestedPrompt: `I want to report this listing: ${detail.t}`,
              })
            }
          />

          <SimilarListings
            lang={lang}
            title={homeCopy("productMoreFromSeller", lang)}
            items={fromSeller}
            onAct={onAct}
            serviceInquiryEnabled={serviceInquiryEnabled}
          />
          <SimilarListings
            lang={lang}
            title={similarCategoryTitle(detail, lang)}
            items={similarOnly}
            onAct={onAct}
            serviceInquiryEnabled={serviceInquiryEnabled}
          />
        </div>

        <StickyActionBar
          listing={detail}
          ctaLabel={primaryLabel}
          disabled={serviceHeld || (mode === "shop" && shopBlock)}
          title={shopBlock ? homeCopy("productOutsideZone", lang) : undefined}
          done={addedPulse}
          onCta={handlePrimary}
        />
        {shopBlock ? (
          <p className="pd-zone-hint m" role="status">
            {homeCopy("productOutsideZone", lang)}
          </p>
        ) : null}
        <span className="sr-only">{listingDisplayPrice(detail)}</span>
      </article>
      {inquiryModal}
    </>
  );
}
