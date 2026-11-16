"use client";

import { IconPromoDelivery } from "@/components/app/icons/LineIcons";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import type { LandingLang } from "@/lib/nakuru/i18n";

export function CartPromoRow({ lang }: { lang: LandingLang }) {
  return (
    <div className="cart-promo-row pd-promo-row" role="note">
      <IconPromoDelivery size={22} aria-hidden />
      <div className="cart-promo-copy pd-promo-copy">
        <p className="cart-promo-title">{homeCopy("slide0Title", lang)}</p>
        <p className="m">{homeCopy("slide0Sub", lang)}</p>
      </div>
    </div>
  );
}