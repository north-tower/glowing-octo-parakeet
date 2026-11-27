"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useNakuruApp } from "@/components/app/AppProvider";
import { ITEMS } from "@/lib/nakuru/data/items";
import { isLiveCatalogEnabled } from "@/lib/nakuru/catalog-live";
import {
  ListingsEmpty,
} from "@/components/app/catalog/ListingsStates";
import { useCatalogListings } from "@/lib/nakuru/use-catalog-listings";
import { useListingAct } from "@/lib/nakuru/use-listing-act";
import { isOutsideArea } from "@/lib/nakuru/area";
import { listingModeOf } from "@/lib/nakuru/listing-mode";
import type { CategoryId, Listing } from "@/lib/nakuru/types";
import { InstallHomeCard } from "@/components/app/pwa/InstallHomeCard";
import { usePwaInstall } from "@/components/app/pwa/InstallProvider";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import { useAssistantUi } from "@/components/app/assistant/AssistantUiProvider";
import { HomeSectionHeader } from "@/components/app/HomeSectionHeader";
import { HomeHeroSection } from "@/components/app/home/hero/HomeHeroSection";
import { TrustStrip } from "@/components/app/home/TrustStrip";
import { CategoryTiles } from "@/components/app/home/CategoryTiles";
import { ListingRail } from "@/components/app/home/ListingRail";
import { SellPromoCard } from "@/components/app/home/SellPromoCard";
import { AssistantPromptRow } from "@/components/app/home/AssistantPromptRow";
import { MoreToExplore } from "@/components/app/home/MoreToExplore";
import { ResultsGrid } from "@/components/app/home/ResultsGrid";
import { useHomeFilters } from "@/components/app/home/useHomeFilters";
import { homeFiltersHref, homeFiltersLeaveLanding } from "@/lib/nakuru/home-filters";
import type { HeroSlideAction } from "@/components/app/home/hero/heroSlides";

function catalogCategoryForFilter(cat: CategoryId): CategoryId | "all" {
  if (cat === "all") return "all";
  return cat;
}

export function HomeView() {
  const { state, dispatch } = useNakuruApp();
  const router = useRouter();
  const { openAssistant } = useAssistantUi();
  const { lang } = usePwaInstall();
  const { inquiryModal } = useListingAct();
  const carouselEnabled = state.tab === "home";
  const liveCatalog = isLiveCatalogEnabled();
  const { filters, setFilters, clearAll } = useHomeFilters();

  const activeCat = state.cat as CategoryId;
  const browseCat = catalogCategoryForFilter(activeCat);
  const catalogFetch = liveCatalog && !isOutsideArea(state.area);

  const { items: liveItems, loading, error } = useCatalogListings({
    enabled: catalogFetch,
    category: browseCat,
    query: state.q,
  });

  const onHomeLanding =
    state.cat === "all" &&
    !state.q.trim() &&
    !isOutsideArea(state.area) &&
    !homeFiltersLeaveLanding(filters);

  const catalogItems: Listing[] = useMemo(() => {
    if (!onHomeLanding) return [];
    return liveCatalog ? liveItems : ITEMS;
  }, [onHomeLanding, liveCatalog, liveItems]);

  const freshRail = useMemo(
    () => catalogItems.slice(0, 10),
    [catalogItems],
  );
  const servicesRail = useMemo(
    () =>
      catalogItems.filter((i) => listingModeOf(i) === "services").slice(0, 10),
    [catalogItems],
  );
  const verifiedRail = useMemo(
    () => catalogItems.filter((i) => i.v === 1).slice(0, 10),
    [catalogItems],
  );
  const propertyCarsRail = useMemo(
    () =>
      catalogItems
        .filter((i) => {
          const m = listingModeOf(i);
          return m === "property" || m === "cars";
        })
        .slice(0, 10),
    [catalogItems],
  );

  if (isOutsideArea(state.area)) {
    return (
      <>
        <div className="err">
          We&apos;re not in your area yet. NakuruHub serves Nakuru only. Join the
          waitlist and we&apos;ll tell you when we expand.
        </div>
        <button type="button" className="btn full" onClick={() => undefined}>
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

  const onSlideAction = (action: HeroSlideAction) => {
    if (action === "shop") dispatch({ type: "SLIDE_SHOP" });
    else if (action === "vendor") dispatch({ type: "SLIDE_VENDOR" });
    else
      openAssistant({
        screen: "help",
        source: "hero-verified",
      });
  };

  const goSell = () => dispatch({ type: "SLIDE_VENDOR" });
  const goCat = () => dispatch({ type: "SET_TAB", tab: "cat" });
  const freshTitle = homeCopy("freshInZone", lang).replace(
    "{zone}",
    state.area,
  );

  if (!onHomeLanding) {
    return (
      <>
        {inquiryModal}
        <ResultsGrid
          lang={lang}
          items={filtered}
          loading={loading && liveCatalog}
          error={liveCatalog ? error : null}
          zoneLabel={state.area}
          filters={{ ...filters, cat: state.cat, q: state.q }}
          query={state.q}
          cat={state.cat}
          onFilters={(patch) => {
            if (patch.cat != null) dispatch({ type: "SET_CAT", cat: patch.cat });
            if (patch.q != null) dispatch({ type: "SET_Q", q: patch.q });
            setFilters(patch);
          }}
          onClearFilters={() => {
            dispatch({ type: "SET_CAT", cat: "all" });
            dispatch({ type: "SET_Q", q: "" });
            clearAll();
          }}
          onZone={(zone) => dispatch({ type: "SET_AREA", area: zone })}
          onBrowseCategories={goCat}
        />
      </>
    );
  }

  return (
    <div className="home-flow">
      {inquiryModal}
      <InstallHomeCard />
      <HomeHeroSection
        lang={lang}
        carouselEnabled={carouselEnabled}
        onSlideAction={onSlideAction}
        onPostListing={goSell}
        onPayExplain={() =>
          openAssistant({ screen: "help", source: "hero-pay" })
        }
      />
      <TrustStrip lang={lang} onSell={goSell} />
      <AssistantPromptRow
        lang={lang}
        onAsk={(prompt) =>
          openAssistant({
            screen: "help",
            source: "feed-ask-row",
            suggestedPrompt: prompt,
          })
        }
      />
      <CategoryTiles
        lang={lang}
        onCategory={(slug) => {
          dispatch({ type: "SET_CAT", cat: slug });
          dispatch({ type: "SET_TAB", tab: "home" });
          router.replace(homeFiltersHref({ cat: slug, q: "" }), {
            scroll: false,
          });
        }}
        onSeeAll={goCat}
      />
      <div className="home-block">
        <HomeSectionHeader
          titleKey="freshInZone"
          title={freshTitle}
          lang={lang}
          listingStyle
          noMarker
          seeAll={{ onClick: goCat }}
        />
        <ListingRail
          items={freshRail}
          lang={lang}
          zoneLabel={state.area}
          loading={loading && liveCatalog}
          ariaLabel={freshTitle}
        />
      </div>
      <SellPromoCard placement="feed" />
      <div className="home-block">
        <HomeSectionHeader
          titleKey="servicesNearYou"
          lang={lang}
          listingStyle
          noMarker
          seeAll={{
            onClick: () => {
              dispatch({ type: "SET_CAT", cat: "services" });
              setFilters({ cat: "services" });
            },
          }}
        />
        <ListingRail
          items={servicesRail}
          lang={lang}
          zoneLabel={state.area}
          loading={loading && liveCatalog}
          ariaLabel={homeCopy("servicesNearYou", lang)}
        />
      </div>
      <div className="home-block">
        <HomeSectionHeader
          titleKey="verifiedSellers"
          lang={lang}
          listingStyle
          noMarker
          seeAll={{
            onClick: () => setFilters({ verified: true }),
          }}
        />
        <ListingRail
          items={verifiedRail}
          lang={lang}
          zoneLabel={state.area}
          loading={loading && liveCatalog}
          ariaLabel={homeCopy("verifiedSellers", lang)}
        />
      </div>
      <div className="home-block">
        <HomeSectionHeader
          titleKey="propertyAndCars"
          lang={lang}
          listingStyle
          noMarker
          seeAll={{
            onClick: () => {
              dispatch({ type: "SET_CAT", cat: "property" });
              setFilters({ cat: "property" });
            },
          }}
        />
        <ListingRail
          items={propertyCarsRail}
          lang={lang}
          zoneLabel={state.area}
          loading={loading && liveCatalog}
          ariaLabel={homeCopy("propertyAndCars", lang)}
        />
      </div>
      {error && liveCatalog ? (
        <div className="err">{error}</div>
      ) : catalogItems.length || (loading && liveCatalog) ? (
        <MoreToExplore
          lang={lang}
          items={catalogItems}
          priorRailItems={[freshRail, servicesRail, verifiedRail, propertyCarsRail]}
          zoneLabel={state.area}
          loading={loading && liveCatalog}
          filters={filters}
          onFilters={setFilters}
          onClearFilters={clearAll}
          onZone={(zone) => dispatch({ type: "SET_AREA", area: zone })}
          onBrowseCategories={goCat}
        />
      ) : liveCatalog ? (
        <ListingsEmpty
          lang={lang}
          spacious={false}
          onBrowseCategories={goCat}
        />
      ) : null}
      <SellPromoCard placement="footer" />
    </div>
  );
}
