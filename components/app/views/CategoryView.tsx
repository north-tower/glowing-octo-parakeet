"use client";

import { useNakuruApp } from "@/components/app/AppProvider";
import { CategoryRail } from "@/components/app/category/CategoryRail";
import { CategoryPanel } from "@/components/app/category/CategoryPanel";
import { BROWSE_SIDES } from "@/lib/nakuru/data/constants";
import { isLiveCatalogEnabled } from "@/lib/nakuru/catalog-live";
import { useCatalogListings } from "@/lib/nakuru/use-catalog-listings";
import { useListingAct } from "@/lib/nakuru/use-listing-act";
import type { CategoryId } from "@/lib/nakuru/types";
import { usePwaInstall } from "@/components/app/pwa/InstallProvider";

const BROWSE_SIDE_SET = new Set<string>(BROWSE_SIDES);

export function CategoryView() {
  const { state } = useNakuruApp();
  const { lang } = usePwaInstall();
  const { onAct, serviceInquiryEnabled, inquiryModal } = useListingAct();
  const s = state.side;
  const liveCatalog = isLiveCatalogEnabled();
  const apiCategory =
    s === "feat" || !BROWSE_SIDE_SET.has(s) ? ("all" as const) : (s as CategoryId);

  const { items, loading, error } = useCatalogListings({
    enabled: liveCatalog && BROWSE_SIDE_SET.has(s),
    category: apiCategory,
    query: state.q,
  });

  return (
    <div className="cl cat-layout">
      {inquiryModal}
      <CategoryRail lang={lang} />
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