"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useNakuruApp } from "@/components/app/AppProvider";
import { AppTopNav } from "@/components/app/AppTopNav";
import { PublicAppNav } from "@/components/app/PublicAppNav";
import { BrandLogoMark } from "@/components/app/BrandLogoMark";
import { CategoryTabs } from "@/components/app/home/CategoryTabs";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import { homeFiltersHref, parseHomeFilters } from "@/lib/nakuru/home-filters";
import { useCategories } from "@/lib/nakuru/use-categories";
import { usePwaInstall } from "@/components/app/pwa/InstallProvider";
import { ZoneSheet } from "@/components/app/ZoneSheet";
import { usePrimaryNav } from "@/components/app/usePrimaryNav";
import { useAssistantUi } from "@/components/app/assistant/AssistantUiProvider";
import {
  useAppDesktopUp,
  useAppTabletUp,
  useMediaQuery,
} from "@/lib/nakuru/use-media-query";
import {
  IconCamera,
  IconChevronDown,
  IconMapPin,
  IconSearch,
  IconSparkle,
} from "@/components/app/icons/LineIcons";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/nakuru/brand";
import {
  SearchSuggest,
  rememberSearch,
} from "@/components/app/home/SearchSuggest";
import Link from "next/link";

export function AppHeader() {
  const { state, dispatch, toast } = useNakuruApp();
  const { rows: categoryRows } = useCategories();
  const { lang } = usePwaInstall();
  const { goHome } = usePrimaryNav();
  const { openAssistant } = useAssistantUi();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlFilters = useMemo(
    () => parseHomeFilters(searchParams),
    [searchParams],
  );
  const tabletUp = useAppTabletUp();
  const desktopUp = useAppDesktopUp();
  const wideUp = useMediaQuery("(min-width: 1280px)");
  const [qLocal, setQLocal] = useState(state.q);
  const [zoneOpen, setZoneOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestIdx, setSuggestIdx] = useState(0);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const zoneBtnRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const lastY = useRef(0);

  useEffect(() => {
    setQLocal(state.q);
  }, [state.q]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target;
      if (
        t instanceof HTMLElement &&
        (t.isContentEditable ||
          t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.tagName === "SELECT")
      ) {
        return;
      }
      e.preventDefault();
      searchRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    lastY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY.current;
      setScrolled(y > 8);
      if (y < 24) {
        setCollapsed(false);
      } else if (delta > 8) {
        setCollapsed(true);
      } else if (delta < -8) {
        setCollapsed(false);
      }
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onSearchInput = (value: string) => {
    setQLocal(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      dispatch({ type: "SET_Q", q: value });
      router.replace(
        homeFiltersHref({ ...urlFilters, cat: state.cat, q: value }),
        { scroll: false },
      );
    }, 120);
  };

  const submitSearch = () => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    rememberSearch(qLocal);
    dispatch({ type: "SET_Q", q: qLocal });
    dispatch({ type: "SET_TAB", tab: "home" });
    router.replace(
      homeFiltersHref({ ...urlFilters, cat: state.cat, q: qLocal }),
      { scroll: false },
    );
    setSuggestOpen(false);
  };

  const onSelectCat = (slug: string) => {
    dispatch({ type: "SET_CAT", cat: slug });
    router.replace(homeFiltersHref({ cat: slug, q: "" }), { scroll: false });
  };

  const tabsBlock = (
    <CategoryTabs
      lang={lang}
      cat={state.cat}
      rows={categoryRows}
      onSelect={onSelectCat}
    />
  );

  const searchForm = (
    <form
      className="search"
      onSubmit={(e) => {
        e.preventDefault();
        submitSearch();
      }}
    >
      <span className="search-ico" aria-hidden>
        <IconSearch size={22} />
      </span>
      <input
        id="q"
        ref={searchRef}
        type="search"
        enterKeyHint="search"
        placeholder={homeCopy("searchPlaceholder", lang)}
        value={qLocal}
        onChange={(e) => {
          onSearchInput(e.target.value);
          setSuggestOpen(true);
          setSuggestIdx(0);
        }}
        onFocus={() => tabletUp && setSuggestOpen(true)}
        onBlur={() => {
          window.setTimeout(() => setSuggestOpen(false), 160);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") setSuggestOpen(false);
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setSuggestIdx((n) => n + 1);
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            setSuggestIdx((n) => Math.max(0, n - 1));
          }
        }}
        autoComplete="off"
        aria-autocomplete="list"
      />
      {tabletUp ? (
        <kbd className="search-kbd" aria-hidden>
          /
        </kbd>
      ) : null}
      <button
        type="button"
        className="search-ask-btn"
        aria-label={homeCopy("assistantFabAria", lang)}
        onClick={() => openAssistant({ source: "search-ask" })}
      >
        <span className="search-ask-icon" aria-hidden>
          <IconSparkle size={16} />
        </span>
        <span className="search-ask-label">{homeCopy("searchAsk", lang)}</span>
      </button>
      {!tabletUp ? (
        <button
          id="cam"
          type="button"
          className="search-ghost-btn"
          aria-label={homeCopy("searchPhoto", lang)}
          onClick={() => toast(homeCopy("photoSearchSoon", lang))}
        >
          <IconCamera size={22} />
        </button>
      ) : null}
      <button type="submit" className="sr-only">
        {homeCopy("searchSubmit", lang)}
      </button>
    </form>
  );

  return (
    <>
      <header
        id="hd"
        className={`t-${state.tab}${collapsed ? " hd-collapsed" : ""}${scrolled ? " hd-scrolled" : ""}`}
      >
        <div className="app-hd-band">
          <div className="app-container app-hd-bar">
            {!tabletUp ? (
              <div className="app-hd-mobile-block">
                <div className="row sp hd-top">
                  <span className="logo">
                    <BrandLogoMark size={36} />
                    <span className="logo-stack">
                      <span className="logo-text">{BRAND_NAME}</span>
                    </span>
                  </span>
                  <button
                    type="button"
                    id="area"
                    className="zone-pill"
                    aria-haspopup="dialog"
                    aria-expanded={zoneOpen}
                    aria-label={`${homeCopy("deliverTo", lang)} · ${state.area}`}
                    onClick={() => setZoneOpen(true)}
                  >
                    <IconMapPin size={18} />
                    <span className="zone-pill-text">
                      <span className="zone-pill-prefix">
                        {homeCopy("deliverTo", lang)}
                      </span>
                      <span className="zone-pill-name">{state.area}</span>
                    </span>
                    <IconChevronDown size={18} />
                  </button>
                </div>
                {searchForm}
              </div>
            ) : (
              <div className="app-hd-wide-block">
                <Link
                  href="/app"
                  prefetch
                  className="logo app-hd-home-link"
                  onClick={(e) => {
                    e.preventDefault();
                    goHome();
                  }}
                >
                  <BrandLogoMark size={40} />
                  <span className="logo-stack">
                    <span className="logo-text">{BRAND_NAME}</span>
                    {wideUp ? (
                      <span className="logo-tagline">{BRAND_TAGLINE}</span>
                    ) : null}
                  </span>
                </Link>
                <div className="app-hd-zone-wrap">
                  <button
                    type="button"
                    ref={zoneBtnRef}
                    className="zone-pill"
                    aria-haspopup="dialog"
                    aria-expanded={zoneOpen}
                    aria-label={`${homeCopy("deliverTo", lang)} · ${state.area}`}
                    onClick={() => setZoneOpen(true)}
                  >
                    <IconMapPin size={18} />
                    <span className="zone-pill-text">
                      <span className="zone-pill-prefix">
                        {homeCopy("deliverTo", lang)}
                      </span>
                      <span className="zone-pill-name">{state.area}</span>
                    </span>
                    <IconChevronDown size={18} />
                  </button>
                </div>
                <div className="app-hd-search-wrap">
                  {searchForm}
                  {tabletUp ? (
                    <SearchSuggest
                      lang={lang}
                      query={qLocal}
                      open={suggestOpen}
                      activeIndex={suggestIdx}
                      onActiveIndex={setSuggestIdx}
                      onPickQuery={(q) => {
                        setQLocal(q);
                        rememberSearch(q);
                        dispatch({ type: "SET_Q", q });
                        router.replace(
                          homeFiltersHref({ ...urlFilters, cat: state.cat, q }),
                          { scroll: false },
                        );
                        setSuggestOpen(false);
                      }}
                      onPickListing={(id) => {
                        setSuggestOpen(false);
                        router.push(`/app/p/${id}`);
                      }}
                      onPickCategory={(index) => {
                        setSuggestOpen(false);
                        dispatch({ type: "SELECT_TOPC", index });
                      }}
                    />
                  ) : null}
                </div>
                {desktopUp ? <PublicAppNav /> : <AppTopNav />}
              </div>
            )}
          </div>
        </div>
        <div className="app-container app-hd-tabs">{tabsBlock}</div>
      </header>
      <ZoneSheet
        open={zoneOpen}
        area={state.area}
        lang={lang}
        anchorRef={tabletUp ? zoneBtnRef : undefined}
        variant={tabletUp ? "popover" : "sheet"}
        onClose={() => setZoneOpen(false)}
        onSelect={(zone) => dispatch({ type: "SET_AREA", area: zone })}
      />
    </>
  );
}

export { AppHeader as HomeHeader };
