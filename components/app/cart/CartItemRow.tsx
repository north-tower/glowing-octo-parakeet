"use client";

import { useState } from "react";
import {
  CategoryIcon,
  isCategoryIconKey,
  type CategoryIconKey,
} from "@/lib/nakuru/category-icons";
import {
  IconCheck,
  IconMinus,
  IconPlus,
  IconTrash2,
} from "@/components/app/icons/LineIcons";
import { kes } from "@/lib/nakuru/format";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import type { LandingLang } from "@/lib/nakuru/i18n";
import type { Listing } from "@/lib/nakuru/types";
import type { NakuruAction } from "@/lib/nakuru/reducer";

const DEFAULT_ICON: Record<string, CategoryIconKey> = {
  shop: "shirt",
  property: "home",
  cars: "car",
  services: "bolt",
};

function listingIconKey(item: Listing): CategoryIconKey {
  if (isCategoryIconKey(item.e)) return item.e;
  return DEFAULT_ICON[item.c] ?? "grid";
}

type Props = {
  item: Listing;
  qty: number;
  lang: LandingLang;
  dispatch: (action: NakuruAction) => void;
  onRemoved: (id: string | number, prevQty: number) => void;
};

export function CartItemRow({ item, qty, lang, dispatch, onRemoved }: Props) {
  const [imgOk, setImgOk] = useState(true);
  const icon = listingIconKey(item);
  const showImg = Boolean(item.img) && imgOk;
  const vendor = item.vn ?? item.s;

  const dec = () => {
    if (qty <= 1) {
      onRemoved(item.id, qty);
      dispatch({ type: "CART_DEC", id: String(item.id) });
    } else {
      dispatch({ type: "CART_DEC", id: String(item.id) });
    }
  };

  return (
    <article className="cart-item card">
      <div className="cart-item-thumb pim pim--shop">
        {showImg ? (
          <img
            src={item.img}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setImgOk(false)}
          />
        ) : (
          <span className="pim-fallback" aria-hidden>
            <CategoryIcon icon={icon} size={28} />
          </span>
        )}
      </div>
      <div className="cart-item-body">
        <h3 className="cart-item-title">{item.t}</h3>
        <p className="cart-item-vendor">
          {vendor}
          {item.v ? (
            <span className="cart-item-verified">
              <IconCheck size={14} aria-hidden />
              {homeCopy("verifiedPill", lang)}
            </span>
          ) : null}
        </p>
        {!item.v ? (
          <span className="cart-item-cod-chip">{homeCopy("productTrustUnverified", lang)}</span>
        ) : null}
        {qty > 1 ? <p className="cart-item-unit m">{kes(item.p)}</p> : null}
        <div className="cart-item-foot">
          <div className="cart-qty" role="group" aria-label={item.t}>
            <button
              type="button"
              className="cart-qty-btn"
              onClick={dec}
              aria-label={qty <= 1 ? "Remove item" : "Decrease quantity"}
            >
              {qty <= 1 ? <IconTrash2 size={20} /> : <IconMinus size={20} />}
            </button>
            <span className="cart-qty-val" aria-live="polite">
              {qty}
            </span>
            <button
              type="button"
              className="cart-qty-btn"
              onClick={() => dispatch({ type: "CART_INC", id: String(item.id) })}
              aria-label="Increase quantity"
            >
              <IconPlus size={20} />
            </button>
          </div>
          <p className="cart-item-line-total">{kes(item.p * qty)}</p>
        </div>
      </div>
    </article>
  );
}

export function CartItemMissing({
  id,
  lang,
  dispatch,
}: {
  id: string;
  lang: LandingLang;
  dispatch: (action: NakuruAction) => void;
}) {
  return (
    <div className="card cart-item cart-item--gone">
      <p className="m">{homeCopy("cartListingGone", lang)}</p>
      <button
        type="button"
        className="btn s o"
        onClick={() => dispatch({ type: "CART_DEC", id })}
      >
        {homeCopy("cartRemoveListing", lang)}
      </button>
    </div>
  );
}