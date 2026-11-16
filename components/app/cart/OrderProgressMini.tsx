"use client";

import {
  orderProgressStep,
  trackStepLabel,
  TRACK_STEPS,
  isDemoTracking,
} from "@/lib/nakuru/order-ui";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import type { LandingLang } from "@/lib/nakuru/i18n";
import type { Order } from "@/lib/nakuru/types";

type Props = {
  lang: LandingLang;
  order: Order;
};

export function OrderProgressMini({ lang, order }: Props) {
  const cur = orderProgressStep(order);
  const currentLabel =
    cur >= 0 && cur < TRACK_STEPS.length
      ? trackStepLabel(TRACK_STEPS[cur]!, lang)
      : "";

  return (
    <div className="order-progress-mini">
      <div className="order-progress-mini__track" aria-hidden>
        {TRACK_STEPS.map((step, i) => (
          <span
            key={step}
            className={`order-progress-mini__seg${i <= cur ? " is-on" : ""}`}
          />
        ))}
      </div>
      {currentLabel ? (
        <p className="order-progress-mini__label m">{currentLabel}</p>
      ) : null}
      {isDemoTracking(order) ? (
        <p className="order-demo-tag m">{homeCopy("orderDemoTracking", lang)}</p>
      ) : null}
    </div>
  );
}