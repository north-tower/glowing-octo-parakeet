"use client";

import { IconCopy } from "@/components/app/icons/LineIcons";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import type { LandingLang } from "@/lib/nakuru/i18n";

type Props = {
  lang: LandingLang;
  code: string;
  onCopy: () => void;
};

export function OrderDeliveryCode({ lang, code, onCopy }: Props) {
  return (
    <div className="order-code-block">
      <p className="order-code-label m">{homeCopy("orderDeliveryCodeLabel", lang)}</p>
      <div className="order-code-row">
        <span className="order-code-value" aria-label={homeCopy("orderDeliveryCodeLabel", lang)}>
          {code}
        </span>
        <button
          type="button"
          className="order-icon-btn"
          onClick={onCopy}
          aria-label={homeCopy("orderCopyCode", lang)}
        >
          <IconCopy size={22} />
        </button>
      </div>
      <p className="order-code-hint m">{homeCopy("orderDeliveryCodeRider", lang)}</p>
    </div>
  );
}