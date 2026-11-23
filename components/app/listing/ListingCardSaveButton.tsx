"use client";

import { Heart } from "lucide-react";
import { useState } from "react";
import { useNakuruApp } from "@/components/app/AppProvider";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import { usePwaInstall } from "@/components/app/pwa/InstallProvider";

type Props = {
  initialSaved?: boolean;
};

export function ListingCardSaveButton({ initialSaved = false }: Props) {
  const { lang } = usePwaInstall();
  const { dispatch } = useNakuruApp();
  const [saved, setSaved] = useState(initialSaved);

  return (
    <button
      type="button"
      className="absolute right-2 top-2 z-20 flex h-11 w-11 items-center justify-center"
      aria-pressed={saved}
      aria-label={homeCopy("saveListingAria", lang)}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setSaved((v) => !v);
        dispatch({ type: "ACCOUNT_ROW", id: "acc:saved" });
      }}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur">
        <Heart
          size={18}
          className={
            saved
              ? "fill-red-500 stroke-red-500"
              : "stroke-stone-700"
          }
          aria-hidden
        />
      </span>
    </button>
  );
}