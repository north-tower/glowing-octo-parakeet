"use client";

import { ProductCard } from "@/components/app/ProductCard";
import { useNakuruApp } from "@/components/app/AppProvider";
import {
  FEAT,
  SIDE,
  SLIDES,
  SOON,
  TOPC,
  categoryName,
} from "@/lib/nakuru/data/constants";
import { isLiveCatalogEnabled } from "@/lib/nakuru/catalog-live";
import {
  ListingsEmpty,
  ListingsSkeleton,
} from "@/components/app/catalog/ListingsStates";
import { useCatalogListings } from "@/lib/nakuru/use-catalog-listings";
import { useListingAct } from "@/lib/nakuru/use-listing-act";
import type { CategoryId } from "@/lib/nakuru/types";
import { CategoryTile } from "@/components/app/CategoryTile";
import { homeTopCategoryLabel } from "@/lib/nakuru/home-i18n";
import { usePwaInstall } from "@/components/app/pwa/InstallProvider";

const BROWSE_SIDES = new Set(["shop", "property", "cars", "services"]);

export function CategoryView() {
  const { state, dispatch, toast } = useNakuruApp();
  const { lang } = usePwaInstall();
  const { onAct, serviceInquiryEnabled, inquiryModal } = useListingAct();
  const s = state.side;
  const liveCatalog = isLiveCatalogEnabled();
  const apiCategory =
    s === "feat" || !BROWSE_SIDES.has(s) ? ("all" as const) : (s as CategoryId);

  const { items, loading, error } = useCatalogListings({
    enabled: liveCatalog && BROWSE_SIDES.has(s),
    category: apiCategory,
    query: state.q,
  });

  const ks: number[] = [];
  TOPC.forEach((t, k) => {
    if (s === "feat" ? FEAT.includes(k) : t[2] === s) ks.push(k);
  });

  return (
    <div className="cl">
      {inquiryModal}
      <div className="sd">
        {SIDE.map((x) => (
          <button
            key={x[0]}
            type="button"
            className={s === x[0] ? "on" : ""}
            onClick={() => dispatch({ type: "SET_SIDE", side: x[0] })}
          >
            <b>{x[2]}</b>
            {x[1]}
          </button>
        ))}
      </div>
      <div className="rp">
        {SOON[s as CategoryId] ? (
          <div className="card">
            <div className="t">Coming soon</div>
            <div className="m">
              We'll open this category soon. Join the waitlist.
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
        ) : (
          <>
            <div
              className="sl"
              style={{
                background: SLIDES[s === "feat" ? 0 : 1][0],
                borderRadius: 14,
                minHeight: 96,
              }}
              role="button"
              tabIndex={0}
              onClick={() => dispatch({ type: "SLIDE_SHOP" })}
            >
              <div>
                <b style={{ fontSize: 17 }}>
                  {s === "feat" ? "Free first delivery" : categoryName(s)}
                </b>
                <span>
                  {s === "feat" ? "Pay on delivery" : "Browse verified sellers"}
                </span>
              </div>
            </div>
            <div className="card" style={{ marginTop: 10 }}>
              <div className="row sp">
                <b>Top categories</b>
                <span
                  className="m"
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    dispatch({
                      type: "SET_CAT",
                      cat: (s === "feat" ? "all" : s) as CategoryId,
                    })
                  }
                >
                  All ›
                </span>
              </div>
              <div className="home-cat-grid" style={{ marginTop: 10 }}>
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
              </div>
            </div>
            {liveCatalog && BROWSE_SIDES.has(s) ? (
              <div style={{ marginTop: 14 }}>
                <b>Listings</b>
                {error ? (
                  <div className="err" style={{ marginTop: 8 }}>
                    {error}
                  </div>
                ) : null}
                {loading ? (
                  <div style={{ marginTop: 8 }}>
                    <ListingsSkeleton count={4} />
                  </div>
                ) : items.length ? (
                  <div className="g2" style={{ marginTop: 8 }}>
                    {items.map((i) => (
                      <ProductCard
                        key={String(i.id)}
                        item={i}
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
          </>
        )}
      </div>
    </div>
  );
}