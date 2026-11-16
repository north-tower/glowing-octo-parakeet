"use client";

import { useEffect, useRef, useState } from "react";
import { useMyVendorProfile } from "@/components/app/useMyVendorProfile";
import { useNakuruApp } from "@/components/app/AppProvider";
import { accountHeaderVendorLine } from "@/lib/nakuru/vendor-profile";
import { CATS, SOON } from "@/lib/nakuru/data/constants";
import { homeCategoryLabel, homeCopy } from "@/lib/nakuru/home-i18n";
import type { CategoryId } from "@/lib/nakuru/types";
import { usePwaInstall } from "@/components/app/pwa/InstallProvider";
import { ZoneSheet } from "@/components/app/ZoneSheet";
import {
  IconCamera,
  IconChevronDown,
  IconFlamingo,
  IconMapPin,
  IconSearch,
} from "@/components/app/icons/LineIcons";

export function AppHeader() {
  const { state, dispatch, toast } = useNakuruApp();
  const { lang } = usePwaInstall();
  const { profile: vendorProfile } = useMyVendorProfile();
  const vendorBanner =
    state.tab === "acc" ? accountHeaderVendorLine(vendorProfile) : null;
  const [qLocal, setQLocal] = useState(state.q);
  const [zoneOpen, setZoneOpen] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    setQLocal(state.q);
  }, [state.q]);

  useEffect(() => {
    const tabs = tabsRef.current;
    if (!tabs || state.tab !== "home" && state.tab !== "cat") return;
    const active = tabs.querySelector<HTMLElement>(".tb.on");
    active?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: reduced ? "auto" : "smooth",
    });
  }, [state.cat, state.tab, reduced]);

  const onSearchInput = (value: string) => {
    setQLocal(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      dispatch({ type: "SET_Q", q: value });
    }, 120);
  };

  const submitSearch = () => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    dispatch({ type: "SET_Q", q: qLocal });
    dispatch({ type: "SET_TAB", tab: "home" });
  };

  return (
  <>
    <header id="hd" className={`t-${state.tab}`}>
      <div className="row sp hd-top">
        <span className="logo">
          <span className="logo-mark" aria-hidden>
            <IconFlamingo size={20} />
          </span>
          NakuruHub
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
            <span className="zone-pill-prefix">{homeCopy("deliverTo", lang)}</span>
            <span className="zone-pill-name">{state.area}</span>
          </span>
          <IconChevronDown size={18} />
        </button>
      </div>
      {vendorBanner ? (
        <p className="acc-hd-banner" role="status">
          {vendorBanner}
        </p>
      ) : null}
      <form
        className="search"
        onSubmit={(e) => {
          e.preventDefault();
          submitSearch();
        }}
      >
        <span className="search-ico" aria-hidden>
          <IconSearch size={24} />
        </span>
        <input
          id="q"
          type="search"
          enterKeyHint="search"
          placeholder={homeCopy("searchPlaceholder", lang)}
          value={qLocal}
          onChange={(e) => onSearchInput(e.target.value)}
        />
        <button
          id="cam"
          type="button"
          className="search-ghost-btn"
          aria-label={homeCopy("searchPhoto", lang)}
          onClick={() => toast(
            lang === "sw"
              ? "Utafutaji kwa picha unakuja hivi karibuni"
              : "Search by photo is coming soon",
          )}
        >
          <IconCamera size={24} />
        </button>
        <button type="submit" className="sr-only">
          {homeCopy("searchSubmit", lang)}
        </button>
      </form>
      <div className="tabs-scroll">
        <div className="tabs" id="tabs" ref={tabsRef}>
          {CATS.map(([id]) => {
            const soon = Boolean(SOON[id as CategoryId]);
            const label = homeCategoryLabel(id as CategoryId, lang);
            return (
              <button
                key={id}
                type="button"
                className={`tb${state.cat === id ? " on" : ""}${soon ? " soon" : ""}`}
                disabled={soon}
                aria-disabled={soon}
                onClick={() =>
                  dispatch({ type: "SET_CAT", cat: id as CategoryId })
                }
              >
                {label}
                {soon ? (
                  <span className="tab-soon-pill">{homeCopy("soon", lang)}</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </header>
    <ZoneSheet
      open={zoneOpen}
      area={state.area}
      lang={lang}
      onClose={() => setZoneOpen(false)}
      onSelect={(zone) => dispatch({ type: "SET_AREA", area: zone })}
    />
  </>
  );
}