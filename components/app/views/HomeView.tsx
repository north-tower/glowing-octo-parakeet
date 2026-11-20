"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ProductCard } from "@/components/app/ProductCard";
import { useNakuruApp } from "@/components/app/AppProvider";
import { FEAT, SLIDES, SOON, TOPC } from "@/lib/nakuru/data/constants";
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
import {
  homeCopy,
  homeTopCategoryLabel,
  SLIDE_COPY_KEYS,
} from "@/lib/nakuru/home-i18n";
import { CategoryTile } from "@/components/app/CategoryTile";
import { useAssistantUi } from "@/components/app/assistant/AssistantUiProvider";
import { VendorSellCard } from "@/components/app/VendorSellCard";
import { HomeSectionHeader } from "@/components/app/HomeSectionHeader";
import { HomeUserGuide } from "@/components/app/HomeUserGuide";
import { HomeCategoryStrip } from "@/components/app/home/HomeCategoryStrip";
import { ProductSnapRail } from "@/components/app/home/ProductSnapRail";
import { HomePickedForYou } from "@/components/app/home/HomePickedForYou";
import {
  SlideArtDelivery,
  SlideArtProperty,
  SlideArtVerified,
} from "@/components/app/HomeSlideArt";
import {
  IconBookOpen,
  IconChevronLeft,
  IconChevronRight,
  IconMessageQuote,
  IconShieldCheck,
  IconWallet,
} from "@/components/app/icons/LineIcons";
import { useAppDesktopUp } from "@/lib/nakuru/use-media-query";

const SLIDE_CLASS = ["sl--teal", "sl--pink", "sl--deep"] as const;
const SLIDE_ART = [SlideArtDelivery, SlideArtProperty, SlideArtVerified] as const;
const SLIDE_CTAS: ("slide0Cta" | "slide1Cta" | "slide2Cta")[] = [
  "slide0Cta",
  "slide1Cta",
  "slide2Cta",
];

function useHomeCarousel(active: boolean) {
  const carRef = useRef<HTMLDivElement>(null);
  const [ci, setCi] = useState(0);
  const pausedRef = useRef(false);
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const c = carRef.current;
    if (!active || !c) return;
    const onScroll = () => {
      if (!c.clientWidth) return;
      setCi(Math.round(c.scrollLeft / c.clientWidth));
    };
    c.addEventListener("scroll", onScroll, { passive: true });
    return () => c.removeEventListener("scroll", onScroll);
  }, [active]);

  useEffect(() => {
    if (!active || reduced) return;
    const c = carRef.current;
    if (!c) return;
    const id = setInterval(() => {
      if (document.hidden || pausedRef.current) return;
      setCi((prev) => {
        const next = (prev + 1) % SLIDES.length;
        c.scrollTo({
          left: next * c.clientWidth,
          behavior: "smooth",
        });
        return next;
      });
    }, 5000);
    return () => clearInterval(id);
  }, [active, reduced]);

  const setPaused = (v: boolean) => {
    pausedRef.current = v;
  };

  return { carRef, ci, setPaused, reduced };
}

function catalogCategoryForFilter(cat: CategoryId): CategoryId | "all" {
  if (cat === "all" || cat === "stays" || cat === "taxi") return "all";
  return cat;
}

export function HomeView() {
  const { state, dispatch } = useNakuruApp();
  const { openAssistant } = useAssistantUi();
  const { lang } = usePwaInstall();
  const desktopUp = useAppDesktopUp();
  const { onAct, serviceInquiryEnabled, inquiryModal } = useListingAct();
  const { carRef, ci, setPaused, reduced } = useHomeCarousel(
    state.tab === "home",
  );
  const [guideOpen, setGuideOpen] = useState(false);
  const liveCatalog = isLiveCatalogEnabled();

  const browseCat = catalogCategoryForFilter(state.cat);
  const catalogFetch =
    liveCatalog &&
    !isOutsideArea(state.area) &&
    !SOON[state.cat] &&
    state.cat !== "stays" &&
    state.cat !== "taxi";

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

  const scrollCarousel = (dir: -1 | 1) => {
    const c = carRef.current;
    if (!c) return;
    const next = Math.max(0, Math.min(SLIDES.length - 1, ci + dir));
    c.scrollTo({
      left: next * c.clientWidth,
      behavior: reduced ? "auto" : "smooth",
    });
  };

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

  if (SOON[state.cat]) {
    return (
      <div className="card">
        <div className="t">
          {state.cat === "stays" ? "BnB and stays" : "Taxi"} is coming soon
        </div>
        <div className="m">
          {state.cat === "stays"
            ? "Book verified apartments and BnBs in Nakuru."
            : "Ride-hailing with live tracking and safety features."}
        </div>
      </div>
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

  const onSlideCta = (k: number) => {
    if (k === 0) dispatch({ type: "SLIDE_SHOP" });
    else if (k === 1) dispatch({ type: "SLIDE_VENDOR" });
    else
      openAssistant({
        screen: "help",
        source: "hero-verified",
      });
  };

  const freshTitle = homeCopy("freshInZone", lang).replace(
    "{zone}",
    state.area,
  );

  return (
    <div className="home-flow">
      {inquiryModal}
      <InstallHomeCard />
      <div
        className="trust trust--home trust--compact"
        role="group"
        aria-label={homeCopy("trustVerifiedTitle", lang)}
      >
        <div className="trust-item trust-tile">
          <IconShieldCheck size={20} />
          <span className="trust-copy">
            <b>{homeCopy("trustVerifiedTitle", lang)}</b>
            <span className="m">{homeCopy("trustVerifiedSub", lang)}</span>
          </span>
        </div>
        <div className="trust-sep" aria-hidden />
        <div className="trust-item trust-tile">
          <IconWallet size={20} />
          <span className="trust-copy">
            <b>{homeCopy("trustPayTitle", lang)}</b>
            <span className="m">{homeCopy("trustPaySub", lang)}</span>
          </span>
        </div>
      </div>
      <div
        className="home-hero-wrap"
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        <div
          className="car car--hero"
          id="car"
          ref={carRef}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setPaused(false)}
        >
          {SLIDES.map((_, k) => {
            const [titleKey, subKey] = SLIDE_COPY_KEYS[k]!;
            const Art = SLIDE_ART[k]!;
            const ctaKey = SLIDE_CTAS[k]!;
            return (
              <div key={k} className={`sl ${SLIDE_CLASS[k] ?? ""}`}>
                <div className="sl-grain" aria-hidden />
                <div className="sl-text">
                  <b>{homeCopy(titleKey, lang)}</b>
                  <span>{homeCopy(subKey, lang)}</span>
                  <button
                    type="button"
                    className={`btn ${k === 1 ? "s" : "o"} sl-cta`}
                    onClick={() => onSlideCta(k)}
                  >
                    {homeCopy(ctaKey, lang)}
                  </button>
                </div>
                <Art />
              </div>
            );
          })}
        </div>
        <div className="home-hero-quick">
          <button
            type="button"
            className="home-inline-action home-inline-action--sm"
            onClick={() => dispatch({ type: "QUOTE_HOME" })}
          >
            <IconMessageQuote size={18} />
            {homeCopy("qaQuote", lang)}
          </button>
          <button
            type="button"
            className={`home-inline-action home-inline-action--sm${guideOpen ? " on" : ""}`}
            aria-expanded={guideOpen}
            onClick={() => setGuideOpen((v) => !v)}
          >
            <IconBookOpen size={18} />
            {homeCopy("qaGuide", lang)}
          </button>
        </div>
        <button
          type="button"
          className="car-arrow car-arrow--prev"
          aria-label={lang === "sw" ? "Tangazo lililopita" : "Previous slide"}
          onClick={() => scrollCarousel(-1)}
        >
          <IconChevronLeft size={24} />
        </button>
        <button
          type="button"
          className="car-arrow car-arrow--next"
          aria-label={lang === "sw" ? "Tangazo linalofuata" : "Next slide"}
          onClick={() => scrollCarousel(1)}
        >
          <IconChevronRight size={24} />
        </button>
        <div
          className="car-pill"
          role="tablist"
          aria-label={homeCopy("slide0Title", lang)}
        >
          {SLIDES.map((_, k) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={k === ci}
              className={k === ci ? "on" : ""}
              onClick={() => {
                const c = carRef.current;
                if (!c) return;
                c.scrollTo({
                  left: k * c.clientWidth,
                  behavior: reduced ? "auto" : "smooth",
                });
              }}
            />
          ))}
        </div>
      </div>
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
          <div className="home-cat-grid">
            {FEAT.map((k) => {
              const t = TOPC[k]!;
              return (
                <CategoryTile
                  key={k}
                  icon={t[0]}
                  tint={t[4]}
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