"use client";

import { Heart } from "lucide-react";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import { usePwaInstall } from "@/components/app/pwa/InstallProvider";
import { useSavedListing } from "@/components/app/product/useSavedListing";

type Props = {
  listingId: number | string;
  initialSaved?: boolean;
};

export function ListingCardSaveButton({ listingId }: Props) {
  const { lang } = usePwaInstall();
  const { saved, toggle } = useSavedListing(String(listingId));

  return (
    <button
      type="button"
      className="lc-save"
      aria-pressed={saved}
      aria-label={
        saved
          ? homeCopy("productUnsaveAria", lang)
          : homeCopy("saveListingAria", lang)
      }
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }}
    >
      <span className="lc-save-hit">
        <Heart
          size={18}
          className={saved ? "lc-save-icon is-on" : "lc-save-icon"}
          aria-hidden
        />
      </span>
    </button>
  );
}
