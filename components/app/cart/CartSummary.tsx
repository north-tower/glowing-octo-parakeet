"use client";

import { IconChevronDown, IconMapPin } from "@/components/app/icons/LineIcons";
import { kes } from "@/lib/nakuru/format";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import type { FirstOrderPromoState } from "@/lib/nakuru/cart-first-order";
import type { LandingLang } from "@/lib/nakuru/i18n";

type Props = {
  lang: LandingLang;
  area: string;
  subtotal: number;
  fee: number;
  promo: FirstOrderPromoState;
  onZoneClick: () => void;
};

export function CartSummary({
  lang,
  area,
  subtotal,
  fee,
  promo,
  onZoneClick,
}: Props) {
  const displayTotal =
    promo === "eligible" ? subtotal : subtotal + fee;

  return (
    <div className="cart-summary">
      <h2 className="cart-section-title">{homeCopy("cartSectionSummary", lang)}</h2>
      <dl className="cart-summary-lines">
        <div className="cart-summary-row">
          <dt>{homeCopy("cartSubtotal", lang)}</dt>
          <dd>{kes(subtotal)}</dd>
        </div>
        <div className="cart-summary-row cart-summary-row--delivery">
          <dt>
            {homeCopy("cartDeliveryLine", lang)}{" "}
            <button
              type="button"
              className="cart-zone-pill"
              onClick={onZoneClick}
              aria-label={`${homeCopy("zoneSheetTitle", lang)}: ${area}`}
            >
              <IconMapPin size={14} aria-hidden />
              <span>{area}</span>
              <IconChevronDown size={14} aria-hidden />
            </button>
          </dt>
          <dd className="cart-summary-fee">
            {promo === "eligible" ? (
              <>
                <span className="cart-fee-struck" aria-hidden>
                  {kes(fee)}
                </span>
                <span>{homeCopy("cartDeliveryFree", lang)}</span>
                <span className="cart-first-chip">{homeCopy("cartFirstOrderChip", lang)}</span>
              </>
            ) : (
              kes(fee)
            )}
          </dd>
        </div>
        {promo === "unknown" ? (
          <p className="cart-first-note" role="note">
            {homeCopy("cartFirstOrderNote", lang)}
          </p>
        ) : null}
        <div className="cart-summary-row cart-summary-row--total">
          <dt>{homeCopy("cartTotal", lang)}</dt>
          <dd>{kes(displayTotal)}</dd>
        </div>
      </dl>
    </div>
  );
}

export function cartDisplayTotal(
  subtotal: number,
  fee: number,
  promo: FirstOrderPromoState,
): number {
  return promo === "eligible" ? subtotal : subtotal + fee;
}