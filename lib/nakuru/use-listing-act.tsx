"use client";

import { ServiceInquiryModal } from "@/components/app/ServiceInquiryModal";
import { useNakuruApp } from "@/components/app/AppProvider";
import { isLiveCatalogEnabled } from "@/lib/nakuru/catalog-live";
import { itemById } from "@/lib/nakuru/data/items";
import type { Listing } from "@/lib/nakuru/types";
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
      if (live && item.c === "services") {
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