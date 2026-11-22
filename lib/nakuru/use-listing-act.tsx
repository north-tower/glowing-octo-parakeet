"use client";

import { ServiceInquiryModal } from "@/components/app/ServiceInquiryModal";
import { useNakuruApp } from "@/components/app/AppProvider";
import { isLiveCatalogEnabled } from "@/lib/nakuru/catalog-live";
import { itemById } from "@/lib/nakuru/data/items";
import { listingModeOf } from "@/lib/nakuru/listing-mode";
import type { Listing } from "@/lib/nakuru/types";
import { recordProductOpen } from "@/lib/nakuru/pwa-engage";
import { useCallback, useState, type ReactNode } from "react";

export function useListingAct(): {
  onAct: (id: number | string) => void;
  serviceInquiryEnabled: boolean;
  inquiryModal: ReactNode;
} {
  const { dispatch } = useNakuruApp();
  const live = isLiveCatalogEnabled();
  const [inquiryTarget, setInquiryTarget] = useState<Listing | null>(null);

  const onAct = useCallback(
    (id: number | string) => {
      const item = itemById(id);
      if (!item) return;
      recordProductOpen(id);
      window.dispatchEvent(new Event("nh:engage"));
      const mode = listingModeOf(item);
      if (live && mode !== "shop") {
        setInquiryTarget(item);
        return;
      }
      dispatch({ type: "ITEM_ACT", id });
    },
    [dispatch, live],
  );

  const inquiryModal = inquiryTarget ? (
    <ServiceInquiryModal
      listing={inquiryTarget}
      onClose={() => setInquiryTarget(null)}
    />
  ) : null;

  return {
    onAct,
    serviceInquiryEnabled: live,
    inquiryModal,
  };
}