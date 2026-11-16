"use client";

import { IconCheck } from "@/components/app/icons/LineIcons";
import { OrderDeliveryCode } from "@/components/app/cart/OrderDeliveryCode";
import { copyOrderText } from "@/components/app/cart/copy-order";
import { kes } from "@/lib/nakuru/format";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import { showDeliveryCode } from "@/lib/nakuru/order-ui";
import type { LandingLang } from "@/lib/nakuru/i18n";
import type { Order } from "@/lib/nakuru/types";

type Props = {
  lang: LandingLang;
  order: Order;
  onTrack: () => void;
  onContinue: () => void;
  onToast: (msg: string) => void;
};

export function OrderPlacedSuccess({
  lang,
  order,
  onTrack,
  onContinue,
  onToast,
}: Props) {
  const onCopyCode = () => {
    void copyOrderText(order.code, onToast, homeCopy("orderCodeCopied", lang));
  };

  return (
    <section className="order-placed" aria-labelledby="order-placed-title">
      <span className="order-placed__icon" aria-hidden>
        <IconCheck size={36} />
      </span>
      <h2 id="order-placed-title" className="order-placed__title">
        {homeCopy("orderPlacedTitle", lang)}
      </h2>
      <p className="order-placed__total pr">{kes(order.total)}</p>
      <div className="order-placed__meta">
        <span className="order-meta-chip">{order.pay}</span>
        {order.zone ? <span className="order-meta-chip">{order.zone}</span> : null}
        {order.promoFreeDelivery ? (
          <span className="order-promo-chip">{homeCopy("orderFirstFreeDelivery", lang)}</span>
        ) : null}
      </div>

      {showDeliveryCode(order) ? (
        <OrderDeliveryCode lang={lang} code={order.code} onCopy={onCopyCode} />
      ) : null}

      <div className="order-placed__actions">
        <button type="button" className="btn order-placed__primary" onClick={onTrack}>
          {homeCopy("cartTrackOrder", lang)}
        </button>
        <button type="button" className="btn o order-placed__ghost" onClick={onContinue}>
          {homeCopy("orderContinueShopping", lang)}
        </button>
      </div>
    </section>
  );
}

function motionMeta({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={className}>{children}</div>;
}