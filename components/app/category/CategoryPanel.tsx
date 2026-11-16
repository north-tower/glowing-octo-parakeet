"use client";

import { ProductCard } from "@/components/app/ProductCard";
import { useNakuruApp } from "@/components/app/AppProvider";
import { CategoryTile } from "@/components/app/CategoryTile";
import { HomeSectionHeader } from "@/components/app/HomeSectionHeader";
import { SlideArtDelivery } from "@/components/app/HomeSlideArt";
import {
  BROWSE_GROUPS,
  BROWSE_SIDES,
  CAT_POPULAR,
  TOPC,
} from "@/lib/nakuru/data/constants";
import {
  homeCategoryAllLabel,
  homeCategoryGroupDesc,
  homeCategoryLabel,
  homeCopy,
  homeTopCategoryLabel,
} from "@/lib/nakuru/home-i18n";
import {
  ListingsEmpty,
  ListingsSkeleton,
} from "@/components/app/catalog/ListingsStates";
import type { CategoryId, Listing } from "@/lib/nakuru/types";
import type { LandingLang } from "@/lib/nakuru/i18n";
import { IconSparkle } from "@/components/app/icons/LineIcons";

const BROWSE_SIDE_SET = new Set<string>(BROWSE_SIDES);

type ListingsState = {
  items: Listing[];
  loading: boolean;
  error: string | null;
};

type Props = {
  lang: LandingLang;
  liveCatalog: boolean;
  listings: ListingsState;
  serviceInquiryEnabled: boolean;
  onAct: Parameters<typeof ProductCard>[0]["onAct"];
};

function topIndicesForSide(side: string): number[] {
  const ks: number[] = [];
  TOPC.forEach((t, k) => {
    if (t[2] === side) ks.push(k);
  });
  return ks;
}

function PromoBanner({ lang, onShop }: { lang: LandingLang; onShop: () => void }) {
  return (
    <div
      className="sl sl--teal cat-promo-slide"
      role="button"
      tabIndex={0}
      onClick={onShop}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onShop();
        }
      }}
    >
      <div className="sl-grain" aria-hidden />
      <div className="sl-text">
        <b>{homeCopy("slide0Title", lang)}</b>
        <span>{homeCopy("slide0Sub", lang)}</span>
      </div>
      <SlideArtDelivery />
    </div>
  );
}

function EmptySubcats({ lang }: { lang: LandingLang }) {
  return (
    <div className="cat-empty" role="status">
      <span className="cat-empty-icon" aria-hidden>
        <IconSparkle size={32} />
      </span>
      <p>{homeCopy("moreComingSoon", lang)}</p>
    </div>
  );
}

export function CategoryPanel({
  lang,
  liveCatalog,
  listings,
  serviceInquiryEnabled,
  onAct,
}: Props) {
  const { state, dispatch } = useNakuruApp();
  const s = state.side;
  const isBrowseGroup = BROWSE_SIDE_SET.has(s);

  const showListings = liveCatalog && isBrowseGroup;
  const ks = topIndicesForSide(s);
  const sparse = ks.length > 0 && ks.length <= 2;
  const gridClass = `home-cat-grid${sparse ? " home-cat-grid--sparse" : ""}${s === "feat" ? "" : ""}`;
  const browseGridClass = "home-cat-grid home-cat-grid--browse";

  return (
    <div className="cat-panel rp">
      {s === "feat" ? (
        <>
          <PromoBanner
            lang={lang}
            onShop={() => dispatch({ type: "SLIDE_SHOP" })}
          />
          <HomeSectionHeader titleKey="popularRightNow" lang={lang} />
          <div className="home-cat-grid">
            {CAT_POPULAR.map((k) => {
              const t = TOPC[k]!;
              return (
                <CategoryTile
                  key={k}
                  icon={t[0]}
                  tint={t[4]}
                  label={
                    t[3]
                      ? homeTopCategoryLabel(t[3], lang)
                      : t[1]
                  }
                  onActivate={() =>
                    dispatch({ type: "SELECT_TOPC", index: k })
                  }
                />
              );
            })}
          </div>
          <HomeSectionHeader titleKey="browseByType" lang={lang} />
          <div className={browseGridClass}>
            {BROWSE_GROUPS.map((g) => (
              <CategoryTile
                key={g.side}
                icon={g.icon}
                tint={g.tint}
                label={homeCategoryLabel(g.side as CategoryId, lang)}
                onActivate={() =>
                  dispatch({ type: "SET_SIDE", side: g.side })
                }
              />
            ))}
          </div>
        </>
      ) : isBrowseGroup ? (
        <>
          <PromoBanner
            lang={lang}
            onShop={() => dispatch({ type: "SLIDE_SHOP" })}
          />
          <div className="cat-panel-group-hd">
            <h2 className="cat-panel-group-title">
              {homeCategoryLabel(s as CategoryId, lang)}
            </h2>
            <p className="cat-panel-group-desc m">
              {homeCategoryGroupDesc(s as CategoryId, lang)}
            </p>
          </div>
          {ks.length === 0 ? (
            <EmptySubcats lang={lang} />
          ) : (
            <div className={gridClass}>
              {ks.map((k) => {
                const t = TOPC[k]!;
                return (
                  <CategoryTile
                    key={k}
                    icon={t[0]}
                    tint={t[4]}
                    label={
                      t[3]
                        ? homeTopCategoryLabel(t[3], lang)
                        : t[1]
                    }
                    onActivate={() =>
                      dispatch({ type: "SELECT_TOPC", index: k })
                    }
                  />
                );
              })}
              {sparse ? (
                <CategoryTile
                  icon="grid"
                  tint={TOPC[ks[0]!]![4]}
                  label={homeCategoryAllLabel(s as CategoryId, lang)}
                  onActivate={() =>
                    dispatch({
                      type: "SET_CAT",
                      cat: s as CategoryId,
                    })
                  }
                />
              ) : null}
            </div>
          )}
        </>
      ) : null}

      {showListings ? (
        <div className="cat-listings-block">
          <HomeSectionHeader
            titleKey="listings"
            lang={lang}
            seeAll={{
              onClick: () =>
                dispatch({ type: "SET_CAT", cat: s as CategoryId }),
            }}
          />
          {listings.error ? (
            <div className="err" style={{ marginTop: 8 }}>
              {listings.error}
            </div>
          ) : null}
          {listings.loading ? (
            <ListingsSkeleton count={4} />
          ) : listings.items.length ? (
            <div className="g2" style={{ marginTop: 8 }}>
              {listings.items.map((i) => (
                <ProductCard
                  key={String(i.id)}
                  item={i}
                  navOriginTab="cat"
                  serviceInquiryEnabled={serviceInquiryEnabled}
                  onAct={onAct}
                />
              ))}
            </div>
          ) : (
            <div style={{ marginTop: 8 }}>
              <ListingsEmpty />
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}