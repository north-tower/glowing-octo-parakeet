"use client";

import { useNakuruApp } from "@/components/app/AppProvider";
import { CategoryHubNav } from "@/components/app/category/CategoryHubNav";
import { CategoryPanel } from "@/components/app/category/CategoryPanel";
import { isLiveCatalogEnabled } from "@/lib/nakuru/catalog-live";
import { useCatalogListings } from "@/lib/nakuru/use-catalog-listings";
import { useListingAct } from "@/lib/nakuru/use-listing-act";
import { useCategories } from "@/lib/nakuru/use-categories";
import { usePwaInstall } from "@/components/app/pwa/InstallProvider";
import { useMemo } from "react";

export function CategoryView() {
  const { state } = useNakuruApp();
  const { lang } = usePwaInstall();
  const { onAct, serviceInquiryEnabled, inquiryModal } = useListingAct();
  const { rows: categoryRows } = useCategories();
  const s = state.side;
  const liveCatalog = isLiveCatalogEnabled();

  const rootSlugs = useMemo(
    () =>
      new Set(
        categoryRows
          .filter((r) => r.depth === 0)
          .map((r) => r.slug),
      ),
    [categoryRows],
  );

  const browseActive =
    s !== "feat" && (rootSlugs.has(s) || state.cat !== "all");
  const apiCategory =
    state.cat !== "all" ? state.cat : rootSlugs.has(s) ? s : "all";

  const { items, loading, error } = useCatalogListings({
    enabled: liveCatalog && browseActive,
    category: apiCategory,
    query: state.q,
  });

  return (
    <div className="cl cat-layout cat-layout--hub">
      {inquiryModal}
      <CategoryHubNav lang={lang} />
      <CategoryPanel
        lang={lang}
        liveCatalog={liveCatalog}
        listings={{ items, loading, error }}
        serviceInquiryEnabled={serviceInquiryEnabled}
        onAct={onAct}
      />
    </div>
  );
}