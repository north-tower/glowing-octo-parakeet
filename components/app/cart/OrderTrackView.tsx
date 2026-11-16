"use client";

import {
  IconCheck,
  IconChevronLeft,
  IconMessageCircle,
} from "@/components/app/icons/LineIcons";
import { OrderDeliveryCode } from "@/components/app/cart/OrderDeliveryCode";
import { copyOrderText } from "@/components/app/cart/copy-order";
import { kes } from "@/lib/nakuru/format";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import {
  formatOrderDate,
  isDemoTracking,
  orderDeliveryFee,
  orderProgressStep,
  orderSubtotal,
  shortOrderId,
  showDeliveryCode,
  trackStepLabel,
  TRACK_STEPS,
} from "@/lib/nakuru/order-ui";
import type { LandingLang } from "@/lib/nakuru/i18n";
import type { Order } from "@/lib/nakuru/types";
import type { NakuruAction } from "@/lib/nakuru/reducer";

type Props = {
  lang: LandingLang;
  order: Order;
  onBack: () => void;
  onToast: (msg: string) => void;
  dispatch: (action: NakuruAction) => void;
};

export function OrderTrackView({ lang, order, onBack, onToast, dispatch }: Props) {
  const step = orderProgressStep(order);
  const placedAt = formatOrderDate(order.createdAt, lang);

  const onCopyCode = () => {
    void copyOrderText(order.code, onToast, homeCopy("orderCodeCopied", lang));
  };

  return (
    <div className="order-track">
      <header className="order-track__hd">
        <button
          type="button"
          className="order-track__back"
          onClick={onBack}
          aria-label={homeCopy("orderTrackBack", lang)}
        >
          <IconChevronLeft size={22} />
        </button>
        <h1 className="order-track__title">{shortOrderId(order.id)}</h1>
      </header>

      <ol className="order-stepper" aria-label={homeCopy("cartTrackOrder", lang)}>
        {TRACK_STEPS.map((key, i) => {
          const done = i < step;
          const current = i === step;
          const time =
            key === "placed" && placedAt ? placedAt : null;
          return (
            <li
              key={key}
              className={`order-stepper__item${current ? " is-current" : ""}${done ? " is-done" : ""}`}
            >
              <span className="order-stepper__dot" aria-hidden>
                {done ? <IconCheck size={16} /> : null}
              </span>
              <div className="order-stepper__body">
                <span className="order-stepper__label">{trackStepLabel(key, lang)}</span>
                {time ? <span className="order-stepper__time m">{time}</span> : null}
              </div>
            </li>
          );
        })}
      </ol>

      {isDemoTracking(order) ? (
        <p className="order-demo-tag m">{homeCopy("orderDemoTracking", lang)}</p>
      ) : null}

      {isDemoTracking(order) && step < 3 ? (
        <button
          type="button"
          className="btn s o order-track__demo-adv"
          onClick={() => dispatch({ type: "ADV_ORDER", id: order.id })}
        >
          {homeCopy("cartDemoNextStatus", lang)}
        </button>
      ) : null}

      {order.items?.length ? (
        <section className="order-track__section" aria-labelledby="order-track-items">
          <h2 id="order-track-items" className="order-track__section-title">
            {homeCopy("cartSectionItems", lang)}
          </h2>
          <ul className="order-track-items">
            {order.items.map((it) => (
              <li key={`${it.productId ?? it.title}-${it.qty}`} className="order-track-item">
                <span className="order-track-item__title">{it.title}</span>
                <span className="order-track-item__qty m">×{it.qty}</span>
                <span className="order-track-item__price">{kes(it.unit * it.qty)}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="order-track__section" aria-labelledby="order-track-delivery">
        <h2 id="order-track-delivery" className="order-track__section-title">
          {homeCopy("cartSectionDelivery", lang)}
        </h2>
        {order.address ? <p className="m">{order.address}</p> : null}
        {order.zone ? (
          <p className="m">
            <span className="order-meta-chip">{order.zone}</span>
          </p>
        ) : null}
        <p className="m">
          <span className="order-meta-chip">{order.pay}</span>
        </p>
      </section>

      {order.vendor ? (
        <p className="order-track-vendor">
          {order.vendor}
          {order.vendorVerified ? (
            <span className="cart-item-verified">
              <IconCheck size={14} aria-hidden />
              {homeCopy("verifiedPill", lang)}
            </span>
          ) : null}
        </p>
      ) : null}

      {showDeliveryCode(order) ? (
        <OrderDeliveryCode lang={lang} code={order.code} onCopy={onCopyCode} />
      ) : null}

      <dl className="cart-summary-lines order-track-summary">
        <div className="cart-summary-row">
          <dt>{homeCopy("cartSubtotal", lang)}</dt>
          <dd>{kes(orderSubtotal(order))}</dd>
        </div>
        <div className="cart-summary-row">
          <dt>{homeCopy("cartDeliveryLine", lang)}</dt>
          <dd>
            {order.promoFreeDelivery ? (
              homeCopy("cartDeliveryFree", lang)
            ) : (
              kes(orderDeliveryFee(order))
            )}
          </dd>
        </div>
        <div className="cart-summary-row cart-summary-row--total">
          <dt>{homeCopy("cartTotal", lang)}</dt>
          <dd>{kes(order.total)}</dd>
        </div>
      </dl>

      {order.vendor ? (
        <button
          type="button"
          className="btn o order-track__msg"
          onClick={() => dispatch({ type: "SET_TAB", tab: "msg" })}
        >
          <IconMessageCircle size={18} aria-hidden />
          {homeCopy("orderMessageSeller", lang)}
        </button>
      ) : null}
    </div>
  );
}