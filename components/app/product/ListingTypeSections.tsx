import {
  IconMapPin,
  IconMinus,
  IconPlus,
  IconPromoDelivery,
} from "@/components/app/icons/LineIcons";
import { MAX_CART_QTY } from "@/lib/nakuru/data/constants";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import type { LandingLang } from "@/lib/nakuru/i18n";
import type { ListingLayoutConfig } from "@/lib/nakuru/listing-layout";
import { walkInCopy } from "@/lib/nakuru/listing-detail";
import type { Listing } from "@/lib/nakuru/types";

type Props = {
  lang: LandingLang;
  layout: ListingLayoutConfig;
  listing: Listing;
  area: string;
  qty: number;
  onQty: (next: number) => void;
};

export function ListingTypeSections({
  lang,
  layout,
  listing,
  area,
  qty,
  onQty,
}: Props) {
  const serviceArea = listing.attrs?.serviceArea?.trim();
  const walkIn = walkInCopy(listing.attrs);

  return (
    <>
      {layout.showDelivery || layout.showQuantity ? (
        <section className="card pd-card pd-shop-block">
          {layout.showQuantity ? (
            <div className="pd-shop-qty" aria-label="Quantity">
              <div className="pd-qty">
                <button
                  type="button"
                  className="pd-qty-btn"
                  disabled={qty <= 1}
                  onClick={() => onQty(qty - 1)}
                  aria-label="Decrease quantity"
                >
                  <IconMinus size={18} />
                </button>
                <span className="pd-qty-val" aria-live="polite">
                  {qty}
                </span>
                <button
                  type="button"
                  className="pd-qty-btn"
                  disabled={qty >= MAX_CART_QTY}
                  onClick={() => onQty(qty + 1)}
                  aria-label="Increase quantity"
                >
                  <IconPlus size={18} />
                </button>
              </div>
            </div>
          ) : null}
          {layout.showDelivery ? (
          <>
          <div className="pd-delivery">
            <IconMapPin size={20} />
            <div>
              <p className="pd-delivery-line">
                {homeCopy("productDeliveringTo", lang)} <strong>{area}</strong>
              </p>
              <p className="m">{homeCopy("productDeliveryFeeHint", lang)}</p>
            </div>
          </div>
          <ul className="pd-pay-list">
            <li>{homeCopy("productPayCodDetail", lang)}</li>
            <li>{homeCopy("productPayMpesaDetail", lang)}</li>
          </ul>
          {layout.showFreeDeliveryPromo ? (
            <div className="pd-promo-row" role="note">
              <IconPromoDelivery size={22} aria-hidden />
              <div className="pd-promo-copy">
                <b>{homeCopy("slide0Title", lang)}</b>
                <span>{homeCopy("slide0Sub", lang)}</span>
              </div>
            </div>
          ) : null}
          </>
          ) : null}
        </section>
      ) : null}

      {layout.showServiceArea && serviceArea ? (
        <section className="card pd-card" aria-labelledby="pd-svc-area">
          <h2 id="pd-svc-area" className="pd-about-title">
            {homeCopy("productServiceAreaTitle", lang)}
          </h2>
          <p className="pd-about-body">{serviceArea}</p>
        </section>
      ) : null}

      {layout.showWalkIn && walkIn ? (
        <section className="card pd-card" aria-labelledby="pd-walkin">
          <h2 id="pd-walkin" className="pd-about-title">
            {homeCopy("productWalkInTitle", lang)}
          </h2>
          <p className="pd-about-body">{walkIn}</p>
        </section>
      ) : null}
    </>
  );
}
