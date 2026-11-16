"use client";

import { IconLock } from "@/components/app/icons/LineIcons";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import type { LandingLang } from "@/lib/nakuru/i18n";
import type { PayMethod } from "@/lib/nakuru/types";

type Props = {
  lang: LandingLang;
  pay: PayMethod;
  mpesaDisabled: boolean;
  mpesaReason: "unverified" | "soon" | null;
  onSelect: (pay: PayMethod) => void;
  onDisabledMpesa: () => void;
};

export function CartPaymentOptions({
  lang,
  pay,
  mpesaDisabled,
  mpesaReason,
  onSelect,
  onDisabledMpesa,
}: Props) {
  const mpesaHint =
    mpesaReason === "unverified"
      ? homeCopy("cartPayMpesaLocked", lang)
      : mpesaReason === "soon"
        ? homeCopy("cartPayMpesaSoon", lang)
        : homeCopy("cartPayMpesaOk", lang);

  return (
    <section className="cart-section" aria-labelledby="cart-payment-heading">
      <h2 id="cart-payment-heading" className="cart-section-title">
        {homeCopy("cartSectionPayment", lang)}
      </h2>
      <div
        className="cart-pay-group"
        role="radiogroup"
        aria-label={homeCopy("cartSectionPayment", lang)}
      >
        <button
          type="button"
          role="radio"
          aria-checked={pay === "cod"}
          className={`cart-pay-row${pay === "cod" ? " is-on" : ""}`}
          onClick={() => onSelect("cod")}
        >
          <span className="cart-pay-radio" aria-hidden />
          <span className="cart-pay-copy">
            <span className="cart-pay-title">{homeCopy("trustPayTitle", lang)}</span>
            <span className="m">{homeCopy("productPayCodDetail", lang)}</span>
          </span>
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={pay === "mpesa"}
          aria-disabled={mpesaDisabled}
          disabled={mpesaDisabled}
          className={`cart-pay-row${pay === "mpesa" ? " is-on" : ""}${mpesaDisabled ? " is-off" : ""}`}
          onClick={() => {
            if (mpesaDisabled) {
              onDisabledMpesa();
              return;
            }
            onSelect("mpesa");
          }}
        >
          <span className="cart-pay-radio" aria-hidden />
          <span className="cart-pay-copy">
            <span className="cart-pay-title">
              {mpesaDisabled && mpesaReason === "unverified" ? (
                <span className="cart-pay-lock" aria-hidden>
                  <IconLock size={16} />
                </span>
              ) : null}
              {homeCopy("cartPayMpesaTitle", lang)}
            </span>
            <span className="m">{mpesaHint}</span>
          </span>
        </button>
      </div>
    </section>
  );
}