"use client";

import { orderStatusLabel, orderStatusTone, type OrderStatusTone } from "@/lib/nakuru/order-ui";
import type { LandingLang } from "@/lib/nakuru/i18n";
import type { Order } from "@/lib/nakuru/types";

type Props = {
  lang: LandingLang;
  order: Order;
};

export function OrderStatusChip({ lang, order }: Props) {
  const tone = orderStatusTone(order);
  return (
    <span className={`order-status-chip order-status-chip--${tone as OrderStatusTone}`}>
      {orderStatusLabel(order, lang)}
    </span>
  );
}