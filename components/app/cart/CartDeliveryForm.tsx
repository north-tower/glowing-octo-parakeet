"use client";

import { IconAlertCircle } from "@/components/app/icons/LineIcons";
import { PHONE_REGEX } from "@/lib/nakuru/data/constants";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import type { LandingLang } from "@/lib/nakuru/i18n";

type FieldErrors = { address?: string; phone?: string };

type Props = {
  lang: LandingLang;
  address: string;
  phone: string;
  errors: FieldErrors;
  savedHint: boolean;
  onAddress: (v: string) => void;
  onPhone: (v: string) => void;
  onBlurAddress: () => void;
  onBlurPhone: () => void;
  onClearSaved: () => void;
};

export function CartDeliveryForm({
  lang,
  address,
  phone,
  errors,
  savedHint,
  onAddress,
  onPhone,
  onBlurAddress,
  onBlurPhone,
  onClearSaved,
}: Props) {
  return (
    <section className="cart-section" aria-labelledby="cart-delivery-heading">
      <h2 id="cart-delivery-heading" className="cart-section-title">
        {homeCopy("cartSectionDelivery", lang)}
      </h2>
      <label className="cart-field-label" htmlFor="checkout-address">
        {homeCopy("cartAddressLabel", lang)}
      </label>
      <div className={`cart-field${errors.address ? " cart-field--err" : ""}`}>
        {errors.address ? (
          <span className="cart-field-ico" aria-hidden>
            <IconAlertCircle size={18} />
          </span>
        ) : null}
        <input
          id="checkout-address"
          className="inp full cart-inp"
          value={address}
          maxLength={200}
          autoComplete="street-address"
          enterKeyHint="next"
          aria-invalid={errors.address ? true : undefined}
          aria-describedby={errors.address ? "checkout-address-err" : undefined}
          onChange={(e) => onAddress(e.target.value)}
          onBlur={onBlurAddress}
          placeholder={homeCopy("cartAddressPlaceholder", lang)}
        />
      </div>
      {errors.address ? (
        <p id="checkout-address-err" className="cart-field-error" role="alert">
          {errors.address}
        </p>
      ) : null}

      <label className="cart-field-label" htmlFor="checkout-phone">
        {homeCopy("cartPhoneLabel", lang)}
      </label>
      <div className={`cart-field${errors.phone ? " cart-field--err" : ""}`}>
        {errors.phone ? (
          <span className="cart-field-ico" aria-hidden>
            <IconAlertCircle size={18} />
          </span>
        ) : null}
        <input
          id="checkout-phone"
          className="inp full cart-inp"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          enterKeyHint="done"
          value={phone}
          maxLength={16}
          aria-invalid={errors.phone ? true : undefined}
          aria-describedby={
            errors.phone ? "checkout-phone-err" : "checkout-phone-hint"
          }
          onChange={(e) => onPhone(e.target.value)}
          onBlur={onBlurPhone}
          placeholder={homeCopy("cartPhonePlaceholder", lang)}
        />
      </div>
      {errors.phone ? (
        <p id="checkout-phone-err" className="cart-field-error" role="alert">
          {errors.phone}
        </p>
      ) : (
        <p id="checkout-phone-hint" className="m cart-field-hint">
          {homeCopy("cartPhoneHelper", lang)}
        </p>
      )}

      {savedHint ? (
        <div className="cart-saved-row">
          <span className="m">{homeCopy("cartSavedOnDevice", lang)}</span>
          <button type="button" className="cart-clear-saved" onClick={onClearSaved}>
            {homeCopy("cartClearSaved", lang)}
          </button>
        </div>
      ) : null}
    </section>
  );
}

export function validateCheckoutFields(
  address: string,
  phone: string,
  lang: LandingLang,
  requirePhone: boolean,
): FieldErrors {
  const errors: FieldErrors = {};
  if (address.trim().length < 3) {
    errors.address = homeCopy("cartAddressError", lang);
  }
  const rawPhone = phone.replace(/[\s-]/g, "");
  if (requirePhone && !rawPhone) {
    errors.phone = homeCopy("cartPhoneError", lang);
  } else if (rawPhone && !PHONE_REGEX.test(rawPhone)) {
    errors.phone = homeCopy("cartPhoneError", lang);
  }
  return errors;
}