"use client";

import { IconMessageCircle } from "@/components/app/icons/LineIcons";
import { OrderDeliveryCode } from "@/components/app/cart/OrderDeliveryCode";
import { OrderProgressMini } from "@/components/app/cart/OrderProgressMini";
import { OrderStatusChip } from "@/components/app/cart/OrderStatusChip";
import { copyOrderText } from "@/components/app/cart/copy-order";
import { kes } from "@/lib/nakuru/format";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import {
  formatOrderDate,
  fullOrderId,
  itemSummary,
  shortOrderId,
  showDeliveryCode,
} from "@/lib/nakuru/order-ui";
import type { LandingLang } from "@/lib/nakuru/i18n";
import type { Order } from "@/lib/nakuru/types";
import type { NakuruAction } from "@/lib/nakuru/reducer";

type Props = {
  lang: LandingLang;
  order: Order;
  dispatch: (action: NakuruAction) => void;
  onTrack: (id: string | number) => void;
  onToast: (msg: string) => void;
};

const MSG_DEMO_SUPPORTED = true;

export function CartOrderCard({
  lang,
  order,
  dispatch,
  onTrack,
  onToast,
}: Props) {
  const placed = formatOrderDate(order.createdAt, lang);
  const zone = order.zone;

  const onCopyId = () => {
    void copyOrderText(
      fullOrderId(order.id),
      onToast,
      homeCopy("orderIdCopied", lang),
    );
  };

  const onCopyCode = () => {
    void copyOrderText(order.code, onToast, homeCopy("orderCodeCopied", lang));
  };

  return (
    <article className="card cart-order-card">
      <div className="cart-order-card__top">
        <button
          type="button"
          className="cart-order-card__id"
          onClick={onCopyId}
          aria-label={homeCopy("orderCopyId", lang)}
        >
          {shortOrderId(order.id)}
        </button>
        <OrderStatusChip lang={lang} order={order} />
        <span className="cart-order-card__total pr">{kes(order.total)}</span>
      </div>

      <p className="cart-order-card__summary m">
        {itemSummary(order.items, lang)}
        {order.vendor ? (
          <>
            <span className="cart-order-card__dot" aria-hidden>
              {" · "}
            </span>
            <span>{order.vendor}</span>
          </>
        ) : null}
      </p>

      <div className="cart-order-card__chips">
        <span className="order-meta-chip">{order.pay}</span>
        {zone ? <span className="order-meta-chip">{zone}</span> : null}
      </div>

      {placed ? <p className="cart-order-card__when m">{placed}</p> : null}

      {showDeliveryCode(order) ? (
        <OrderDeliveryCode lang={lang} code={order.code} onCopy={onCopyCode} />
      ) : null}

      <OrderProgressMini lang={lang} order={order} />

      <div className="cart-order-card__actions">
        <button
          type="button"
          className="btn s cart-order-card__track"
          onClick={() => onTrack(order.id)}
        >
          {homeCopy("cartTrackOrder", lang)}
        </button>
        {MSG_DEMO_SUPPORTED && order.vendor ? (
          <button
            type="button"
            className="btn o cart-order-card__msg"
            onClick={() => dispatch({ type: "SET_TAB", tab: "msg" })}
          >
            <IconMessageCircle size={18} aria-hidden />
            {homeCopy("orderMessageSeller", lang)}
          </button>
        ) : null}
      </div>
    </article>
  );
}