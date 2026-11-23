"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/app/ProductCard";
import { useNakuruApp } from "@/components/app/AppProvider";
import { FEAT, TOPC } from "@/lib/nakuru/data/constants";
import { ITEMS } from "@/lib/nakuru/data/items";
import { isLiveCatalogEnabled } from "@/lib/nakuru/catalog-live";
import {
  ListingsEmpty,
  ListingsSkeleton,
} from "@/components/app/catalog/ListingsStates";
import { useCatalogListings } from "@/lib/nakuru/use-catalog-listings";
import { useListingAct } from "@/lib/nakuru/use-listing-act";
import { isOutsideArea } from "@/lib/nakuru/area";
import type { CategoryId, Listing } from "@/lib/nakuru/types";
import { InstallHomeCard } from "@/components/app/pwa/InstallHomeCard";
import { usePwaInstall } from "@/components/app/pwa/InstallProvider";
import { homeCopy, homeTopCategoryLabel } from "@/lib/nakuru/home-i18n";
import { BrowseStyleTileButton } from "@/components/app/category/browse/BrowseStyleTile";
import { popularLucideForTopcIndex } from "@/components/app/category/browse/popular-lucide";
import { useAssistantUi } from "@/components/app/assistant/AssistantUiProvider";
import { VendorSellCard } from "@/components/app/VendorSellCard";
import { HomeSectionHeader } from "@/components/app/HomeSectionHeader";
import { HomeUserGuide } from "@/components/app/HomeUserGuide";
import { HomeCategoryStrip } from "@/components/app/home/HomeCategoryStrip";
import { ProductSnapRail } from "@/components/app/home/ProductSnapRail";
import { HomePickedForYou } from "@/components/app/home/HomePickedForYou";
import { HomeHeroSection } from "@/components/app/home/hero/HomeHeroSection";
import type { HeroSlideAction } from "@/components/app/home/hero/heroSlides";
import { useAppDesktopUp } from "@/lib/nakuru/use-media-query";

function catalogCategoryForFilter(cat: CategoryId): CategoryId | "all" {
  if (cat === "all") return "all";
  return cat;
}

export function HomeView() {
  const { state, dispatch } = useNakuruApp();
  const { openAssistant } = useAssistantUi();
  const { lang } = usePwaInstall();
  const desktopUp = useAppDesktopUp();
  const { onAct, serviceInquiryEnabled, inquiryModal } = useListingAct();
  const [guideOpen, setGuideOpen] = useState(false);
  const carouselEnabled = state.tab === "home";
  const liveCatalog = isLiveCatalogEnabled();

  const activeCat = state.cat as CategoryId;
  const browseCat = catalogCategoryForFilter(activeCat);
  const catalogFetch = liveCatalog && !isOutsideArea(state.area);

  const { items: liveItems, loading, error } = useCatalogListings({
    enabled: catalogFetch,
    category: browseCat,
    query: state.q,
  });

  const onHomeLanding =
    state.cat === "all" && !state.q.trim() && !isOutsideArea(state.area);

  const catalogItems: Listing[] = useMemo(() => {
    if (!onHomeLanding) return [];
    return liveCatalog ? liveItems : ITEMS;
  }, [onHomeLanding, liveCatalog, liveItems]);

  const freshRail = useMemo(
    () => catalogItems.slice(0, 10),
    [catalogItems],
  );
  const verifiedRail = useMemo(
    () => catalogItems.filter((i) => i.v === 1).slice(0, 10),
    [catalogItems],
  );

  if (isOutsideArea(state.area)) {
    return (
      <>
        <div className="err">
          We&apos;re not in your area yet. NakuruHub serves Nakuru only. Join the
          waitlist and we&apos;ll tell you when we expand.
        </div>
        <button
          type="button"
          className="btn full"
          onClick={() => undefined}
        >
          Join the waitlist
        </button>
      </>
    );
  }

  const q = state.q.toLowerCase();
  const demoFiltered = ITEMS.filter(
    (i) =>
      (state.cat === "all" || i.c === state.cat) &&
      (i.t + i.s).toLowerCase().includes(q),
  );

  const filtered = liveCatalog ? liveItems : demoFiltered;

  if (state.cat !== "all" || q) {
    const warn =
      !liveCatalog &&
      (state.cat === "property" || state.cat === "cars") ? (
        <div className="warn">
          Safety: view first. Never pay before you inspect and verify ownership.
        </div>
      ) : null;

    return (
      <>
        {inquiryModal}
        {warn}
        {error ? (
          <div className="err" style={{ marginBottom: 8 }}>
            {error}
          </div>
        ) : null}
        {loading ? (
          <ListingsSkeleton count={6} />
        ) : filtered.length ? (
          <div className="g2">
            {filtered.map((i, idx) => (
              <ProductCard
                key={String(i.id)}
                item={i}
                zoneLabel={state.area}
                priorityImage={idx < 2}
                navOriginTab="home"
                serviceInquiryEnabled={serviceInquiryEnabled}
                onAct={onAct}
              />
            ))}
          </div>
        ) : liveCatalog ? (
          <ListingsEmpty />
        ) : (
          <div className="m">
            {lang === "sw"
              ? "Hakuna matokeo. Jaribu utafutaji mwingine."
              : "No results. Try a different search."}
          </div>
        )}
      </>
    );
  }

  const onSlideAction = (action: HeroSlideAction) => {
    if (action === "shop") dispatch({ type: "SLIDE_SHOP" });
    else if (action === "vendor") dispatch({ type: "SLIDE_VENDOR" });
    else
      openAssistant({
        screen: "help",
        source: "hero-verified",
      });
  };

  const openHelp = (source: string) => {
    openAssistant({ screen: "help", source });
  };

  const freshTitle = homeCopy("freshInZone", lang).replace(
    "{zone}",
    state.area,
  );

  return (
    <div className="home-flow">
      {inquiryModal}
      <InstallHomeCard />
      <HomeHeroSection
        lang={lang}
        carouselEnabled={carouselEnabled}
        guideOpen={guideOpen}
        onSlideAction={onSlideAction}
        onQuote={() => dispatch({ type: "QUOTE_HOME" })}
        onToggleGuide={() => setGuideOpen((v) => !v)}
        onTrustLink={() => openHelp("hero-trust-verify")}
        onPayLink={() => openHelp("hero-trust-pay")}
      />
      <HomeUserGuide
        open={guideOpen}
        lang={lang}
        onClose={() => setGuideOpen(false)}
      />
      {!desktopUp ? (
        <HomeCategoryStrip
          lang={lang}
          onCategory={(k) => dispatch({ type: "SELECT_TOPC", index: k })}
          onSeeAll={() => dispatch({ type: "SET_TAB", tab: "cat" })}
        />
      ) : (
        <>
          <HomeSectionHeader
            titleKey="topCategories"
            lang={lang}
            seeAll={{
              onClick: () => dispatch({ type: "SET_TAB", tab: "cat" }),
            }}
          />
          <div className="home-cat-grid grid grid-cols-4 sm:grid-cols-4 lg:!grid-cols-8">
            {FEAT.map((k) => {
              const t = TOPC[k]!;
              const visual = popularLucideForTopcIndex(k);
              return (
                <BrowseStyleTileButton
                  key={k}
                  icon={visual.icon}
                  tint={visual.tint}
                  label={
                    t[3] ? homeTopCategoryLabel(t[3], lang) : t[1]
                  }
                  onActivate={() => dispatch({ type: "SELECT_TOPC", index: k })}
                />
              );
            })}
          </div>
        </>
      )}
      {freshRail.length ? (
        <>
          <HomeSectionHeader
            titleKey="freshInZone"
            title={freshTitle}
            lang={lang}
            seeAll={{
              onClick: () => dispatch({ type: "SET_TAB", tab: "cat" }),
            }}
          />
          <ProductSnapRail
            items={freshRail}
            onAct={onAct}
            serviceInquiryEnabled={serviceInquiryEnabled}
          />
        </>
      ) : null}
      {verifiedRail.length >= 3 ? (
        <>
          <HomeSectionHeader titleKey="verifiedSellers" lang={lang} />
          <ProductSnapRail
            items={verifiedRail}
            onAct={onAct}
            serviceInquiryEnabled={serviceInquiryEnabled}
          />
        </>
      ) : null}
      {loading && liveCatalog ? (
        <ListingsSkeleton count={4} />
      ) : error && liveCatalog ? (
        <div className="err">{error}</div>
      ) : catalogItems.length ? (
        <HomePickedForYou
          lang={lang}
          items={catalogItems}
          zoneLabel={state.area}
          onAct={onAct}
          serviceInquiryEnabled={serviceInquiryEnabled}
        />
      ) : liveCatalog ? (
        <ListingsEmpty />
      ) : null}
      <VendorSellCard />
    </div>
  );
}