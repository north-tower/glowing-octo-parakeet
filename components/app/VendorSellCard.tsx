"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/app/AppAuthProvider";
import { useNakuruApp } from "@/components/app/AppProvider";
import { IconStore, IconX } from "@/components/app/icons/LineIcons";
import { usePwaInstall } from "@/components/app/pwa/InstallProvider";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import {
  canShowVendorSellCard,
  markVendorSellCardDismissed,
} from "@/lib/nakuru/vendor-sell-card";

export function VendorSellCard() {
  const { dispatch, state } = useNakuruApp();
  const { user, ready } = useAuth();
  const { lang } = usePwaInstall();
  const [visible, setVisible] = useState(false);

  const signedIn = ready && Boolean(user);
  const signedOutDemo = !state.me && !signedIn;

  useEffect(() => {
    if (!signedOutDemo) {
      setVisible(false);
      return;
    }
    setVisible(canShowVendorSellCard());
  }, [signedOutDemo]);

  if (!visible) return null;

  const dismiss = () => {
    markVendorSellCardDismissed();
    setVisible(false);
  };

  return (
    <div
      className="vendor-sell-card card"
      role="region"
      aria-labelledby="vendor-sell-title"
    >
      <div className="vendor-sell-icon" aria-hidden>
        <IconStore size={24} />
      </div>
      <div className="vendor-sell-copy">
        <div className="t" id="vendor-sell-title">
          {homeCopy("vendorCardTitle", lang)}
        </div>
        <p className="m">{homeCopy("vendorCardSub", lang)}</p>
      </div>
      <div className="vendor-sell-actions">
        <button
          type="button"
          className="btn s"
          onClick={() => dispatch({ type: "SIGNIN" })}
        >
          {homeCopy("vendorCardCta", lang)}
        </button>
        <button
          type="button"
          className="vendor-sell-close"
          aria-label={homeCopy("vendorCardDismissAria", lang)}
          onClick={dismiss}
        >
          <IconX size={20} />
        </button>
      </div>
    </div>
  );
}