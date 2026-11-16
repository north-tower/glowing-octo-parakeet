"use client";

import { IconReceipt } from "@/components/app/icons/LineIcons";
import { CartOrderCard } from "@/components/app/cart/CartOrderCard";
import { isActiveOrder, isPastOrder } from "@/lib/nakuru/order-ui";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import type { LandingLang } from "@/lib/nakuru/i18n";
import type { Order } from "@/lib/nakuru/types";
import type { NakuruAction } from "@/lib/nakuru/reducer";

type Props = {
  lang: LandingLang;
  orders: Order[];
  dispatch: (action: NakuruAction) => void;
  onTrack: (id: string | number) => void;
  onToast: (msg: string) => void;
};

export function CartOrdersEmpty({ lang }: { lang: LandingLang }) {
  return (
    <div className="cart-empty" role="status">
      <span className="cart-empty-icon" aria-hidden>
        <IconReceipt size={28} />
      </span>
      <h2 className="cart-empty-title">{homeCopy("cartOrdersEmptyTitle", lang)}</h2>
      <p className="m">{homeCopy("cartOrdersEmptyBody", lang)}</p>
    </div>
  );
}

export function CartOrdersList({
  lang,
  orders,
  dispatch,
  onTrack,
  onToast,
}: Props) {
  if (!orders.length) {
    return <CartOrdersEmpty lang={lang} />;
  }

  const byDate = (a: Order, b: Order) => {
    const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
    const tb = b.createdAt ? Date.parse(b.createdAt) : 0;
    return tb - ta;
  };
  const active = orders.filter(isActiveOrder).sort(byDate);
  const past = orders.filter(isPastOrder).sort(byDate);

  return (
    <div className="cart-orders-wrap">
      {active.length ? (
        <section className="cart-orders-group" aria-labelledby="cart-orders-active">
          <h2 id="cart-orders-active" className="cart-orders-group-title">
            {homeCopy("orderGroupActive", lang)}
          </h2>
          <ul className="cart-orders">
            {active.map((o) => (
              <li key={String(o.id)}>
                <CartOrderCard
                  lang={lang}
                  order={o}
                  dispatch={dispatch}
                  onTrack={onTrack}
                  onToast={onToast}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {past.length ? (
        <section className="cart-orders-group" aria-labelledby="cart-orders-past">
          <h2 id="cart-orders-past" className="cart-orders-group-title">
            {homeCopy("orderGroupPast", lang)}
          </h2>
          <ul className="cart-orders">
            {past.map((o) => (
              <li key={String(o.id)}>
                <CartOrderCard
                  lang={lang}
                  order={o}
                  dispatch={dispatch}
                  onTrack={onTrack}
                  onToast={onToast}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}