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

function useHomeCarousel(active: boolean) {
  const carRef = useRef<HTMLDivElement>(null);
  const [ci, setCi] = useState(0);
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
      if (document.hidden) return;
      setCi((prev) => {
        const next = (prev + 1) % SLIDES.length;
        c.scrollTo({
          left: next * c.clientWidth,
          behavior: "smooth",
        });
        return next;
      });
    }, 4500);
    return () => clearInterval(id);
  }, [active, reduced]);

  return { carRef, ci };
}

function catalogCategoryForFilter(cat: CategoryId): CategoryId | "all" {
  if (cat === "all" || cat === "stays" || cat === "taxi") return "all";
  return cat;
}

export function HomeView() {
  const { state, dispatch, toast } = useNakuruApp();
  const { onAct, serviceInquiryEnabled, inquiryModal } = useListingAct();
  const { carRef, ci } = useHomeCarousel(state.tab === "home");
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
                serviceInquiryEnabled={serviceInquiryEnabled}
                onAct={onAct}
              />
            ))}
          </div>
        ) : (
          liveCatalog ? (
            <ListingsEmpty />
          ) : (
            <div className="m">No results. Try a different search.</div>
          )
        )}
      </>
    );
  }

  const picked = liveCatalog
    ? liveItems.slice(0, 8)
    : ITEMS.slice(0, 8);

  return (
    <>
      {inquiryModal}
      <div className="trust">
        <div>
          🛡️<b>Verified vendors</b>ID and shop checked
        </div>
        <div>
          💵<b>Pay on delivery</b>Pay when it arrives
        </div>
      </div>
      <div className="hs">
        <div
          className="tile"
          role="button"
          tabIndex={0}
          onClick={() => dispatch({ type: "SET_TAB", tab: "cat" })}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              dispatch({ type: "SET_TAB", tab: "cat" });
            }
          }}
        >
          🗂️ Categories
        </div>
        <div
          className="tile"
          role="button"
          tabIndex={0}
          onClick={() => dispatch({ type: "QUOTE_HOME" })}
        >
          🎯 Request a quote
        </div>
        <div
          className="tile"
          role="button"
          tabIndex={0}
          onClick={() => dispatch({ type: "SIGNIN" })}
        >
          🏪 Sell with us
        </div>
        <div
          className="tile"
          role="button"
          tabIndex={0}
          onClick={() =>
            toast("1 Browse · 2 Order · 3 Pay when it arrives")
          }
        >
          💡 New user guide
        </div>
      </div>
      <div className="car" id="car" ref={carRef}>
        {SLIDES.map((s, k) => (
          <div
            key={k}
            className="sl"
            style={{ background: s[0] }}
            role="button"
            tabIndex={0}
            onClick={() =>
              k === 0
                ? dispatch({ type: "SLIDE_SHOP" })
                : dispatch({ type: "SLIDE_VENDOR" })
            }
          >
            <div>
              <b>{s[1]}</b>
              <span>{s[2]}</span>
            </div>
            <i>{s[3]}</i>
          </div>
        ))}
      </div>
      <div className="dots">
        {SLIDES.map((_, k) => (
          <i key={k} className={k === ci ? "on" : ""} />
        ))}
      </div>
      {!liveCatalog ? (
        <div className="rank">
          <h3>Top rankings</h3>
          <div className="m">Make shopping efficient</div>
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
                    {i.e}
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
      <h2>Top categories</h2>
      <div className="card">
        <div className="g3">
          {FEAT.map((k) => {
            const t = TOPC[k];
            return (
              <div
                key={k}
                className="ct"
                role="button"
                tabIndex={0}
                onClick={() => dispatch({ type: "SELECT_TOPC", index: k })}
              >
                <div>{t[0]}</div>
                {t[1]}
              </div>
            );
          })}
        </div>
      </div>
      <h2>Picked for you</h2>
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
                onAct={onAct}
              />
            ))}
        </div>
      )}
    </>
  );
}