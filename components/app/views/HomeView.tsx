"use client";

import { useEffect, useRef, useState } from "react";
import { ProductCard } from "@/components/app/ProductCard";
import { useNakuruApp } from "@/components/app/AppProvider";
import {
  FEAT,
  RANK,
  SLIDES,
  SOON,
  TOPC,
} from "@/lib/nakuru/data/constants";
import { demoItems, itemById, ITEMS } from "@/lib/nakuru/data/items";
import { isLiveCatalogEnabled } from "@/lib/nakuru/catalog-live";
import {
  ListingsEmpty,
  ListingsSkeleton,
} from "@/components/app/catalog/ListingsStates";
import { useCatalogListings } from "@/lib/nakuru/use-catalog-listings";
import { useListingAct } from "@/lib/nakuru/use-listing-act";
import { isOutsideArea } from "@/lib/nakuru/area";
import { kes } from "@/lib/nakuru/format";
import type { CategoryId } from "@/lib/nakuru/types";
import { InstallHomeCard } from "@/components/app/pwa/InstallHomeCard";
import { usePwaInstall } from "@/components/app/pwa/InstallProvider";
import {
  homeCopy,
  homeTopCategoryLabel,
  SLIDE_COPY_KEYS,
} from "@/lib/nakuru/home-i18n";
import { CategoryTile } from "@/components/app/CategoryTile";
import { AssistantEntryChip } from "@/components/app/assistant/AssistantEntryChip";
import { useAssistantUi } from "@/components/app/assistant/AssistantUiProvider";
import { VendorSellCard } from "@/components/app/VendorSellCard";
import { HomeSectionHeader } from "@/components/app/HomeSectionHeader";
import { HomeUserGuide } from "@/components/app/HomeUserGuide";
import {
  SlideArtDelivery,
  SlideArtProperty,
  SlideArtVerified,
} from "@/components/app/HomeSlideArt";
import {
  IconMessageQuote,
  IconShieldCheck,
  IconBookOpen,
  IconWallet,
} from "@/components/app/icons/LineIcons";
import {
  CategoryIcon,
  isCategoryIconKey,
  type CategoryIconKey,
} from "@/lib/nakuru/category-icons";

const SLIDE_CLASS = ["sl--teal", "sl--pink", "sl--deep"] as const;
const SLIDE_ART = [SlideArtDelivery, SlideArtProperty, SlideArtVerified] as const;

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
  const { state, dispatch, toast } = useNakuruApp();
  const { openAssistant } = useAssistantUi();
  const { lang } = usePwaInstall();
  const { onAct, serviceInquiryEnabled, inquiryModal } = useListingAct();
  const { carRef, ci, setPaused } = useHomeCarousel(state.tab === "home");
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

  if (isOutsideArea(state.area)) {
    return (
      <>
        <div className="err">
          We're not in your area yet. NakuruHub serves Nakuru only. Join the
          waitlist and we'll tell you when we expand.
        </div>
        <button
          type="button"
          className="btn full"
          onClick={() => toast("You're on the waitlist. We'll message you.")}
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
        <button
          type="button"
          className="btn s"
          style={{ marginTop: 8 }}
          onClick={() => toast("You're on the waitlist. We'll message you.")}
        >
          Notify me
        </button>
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
            {filtered.map((i) => (
              <ProductCard
                key={String(i.id)}
                item={i}
                navOriginTab="home"
                serviceInquiryEnabled={serviceInquiryEnabled}
                onAct={onAct}
              />
            ))}
          </div>
        ) : liveCatalog ? (
          <ListingsEmpty />
        ) : (
          <>
            <div className="m">
              {lang === "sw"
                ? "Hakuna matokeo. Jaribu utafutaji mwingine."
                : "No results. Try a different search."}
            </div>
            <div className="assistant-entry-row">
              <AssistantEntryChip
                label={homeCopy("assistantEntrySearch", lang)}
                onClick={() =>
                  openAssistant({
                    screen: "search",
                    source: "search-empty",
                    suggestedPrompt:
                      lang === "sw"
                        ? `Tafuta ${state.q || "bidhaa"}`
                        : `Find ${state.q || "products"}`,
                  })
                }
              />
            </div>
          </>
        )}
      </>
    );
  }

  const picked = liveCatalog ? liveItems.slice(0, 8) : ITEMS.slice(0, 8);

  return (
    <>
      {inquiryModal}
      <InstallHomeCard />
      <div className="trust" role="group" aria-label={homeCopy("trustVerifiedTitle", lang)}>
        <div className="trust-item">
          <IconShieldCheck size={20} />
          <span className="trust-copy">
            <b>{homeCopy("trustVerifiedTitle", lang)}</b>
            <span className="m">{homeCopy("trustVerifiedSub", lang)}</span>
          </span>
        </div>
        <div className="trust-sep" aria-hidden />
        <div className="trust-item">
          <IconWallet size={20} />
          <span className="trust-copy">
            <b>{homeCopy("trustPayTitle", lang)}</b>
            <span className="m">{homeCopy("trustPaySub", lang)}</span>
          </span>
        </div>
      </div>
      <div className="qa-scroll">
        <div className="hs qa-chips">
          <div
            className="tile qa-chip"
            role="button"
            tabIndex={0}
            onClick={() => dispatch({ type: "QUOTE_HOME" })}
          >
            <IconMessageQuote size={24} />
            {homeCopy("qaQuote", lang)}
          </div>
          <div
            className={`tile qa-chip${guideOpen ? " on" : ""}`}
            role="button"
            tabIndex={0}
            aria-expanded={guideOpen}
            onClick={() => setGuideOpen((v) => !v)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setGuideOpen((v) => !v);
              }
            }}
          >
            <IconBookOpen size={24} />
            {homeCopy("qaGuide", lang)}
          </div>
        </div>
      </div>
      <HomeUserGuide
        open={guideOpen}
        lang={lang}
        onClose={() => setGuideOpen(false)}
      />
      <div
        className="car"
        id="car"
        ref={carRef}
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        {SLIDES.map((_, k) => {
          const [titleKey, subKey] = SLIDE_COPY_KEYS[k]!;
          const Art = SLIDE_ART[k]!;
          return (
            <div
              key={k}
              className={`sl ${SLIDE_CLASS[k] ?? ""}`}
              role="button"
              tabIndex={0}
              onClick={() =>
                k === 0
                  ? dispatch({ type: "SLIDE_SHOP" })
                  : dispatch({ type: "SLIDE_VENDOR" })
              }
            >
              <div className="sl-grain" aria-hidden />
              <div className="sl-text">
                <b>{homeCopy(titleKey, lang)}</b>
                <span>{homeCopy(subKey, lang)}</span>
              </div>
              <Art />
            </div>
          );
        })}
      </div>
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
                behavior: "smooth",
              });
            }}
          />
        ))}
      </div>
      {!liveCatalog ? (
        <div className="rank">
          <h3>{homeCopy("topRankings", lang)}</h3>
          <div className="m">{homeCopy("topRankingsSub", lang)}</div>
          <div className="hs">
            {RANK.map((r) => {
              const i = itemById(r[0]);
              if (!i) return null;
              return (
                <div
                  key={r[0]}
                  className="rc"
                  role="button"
                  tabIndex={0}
                  onClick={() => dispatch({ type: "ITEM_ACT", id: i.id })}
                >
                  <div className="rim">
                    {isCategoryIconKey(i.e) ? (
                      <CategoryIcon icon={i.e as CategoryIconKey} size={40} />
                    ) : (
                      i.e
                    )}
                    <u>{r[1]}</u>
                  </div>
                  <div className="pr">{kes(i.p)}</div>
                  <div className="m">{r[2]}</div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
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
      <VendorSellCard />
      <HomeSectionHeader titleKey="pickedForYou" lang={lang} />
      {loading && liveCatalog ? (
        <ListingsSkeleton count={4} />
      ) : error && liveCatalog ? (
        <div className="err">{error}</div>
      ) : picked.length ? (
        <div className="g2">
          {picked.map((i) => (
            <ProductCard
              key={String(i.id)}
              item={i}
              navOriginTab="home"
              serviceInquiryEnabled={serviceInquiryEnabled}
              onAct={onAct}
            />
          ))}
        </div>
      ) : liveCatalog ? (
        <ListingsEmpty />
      ) : (
        <div className="g2">
          {demoItems()
            .slice(0, 8)
            .map((i) => (
              <ProductCard
                key={i.id}
                item={i}
                navOriginTab="home"
                onAct={onAct}
              />
            ))}
        </div>
      )}
    </>
  );
}