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
import { requireAuth } from "@/lib/nakuru/require-auth";

export function VendorSellCard() {
  const { dispatch, state } = useNakuruApp();
  const { user, ready } = useAuth();
  const { lang } = usePwaInstall();
  const [visible, setVisible] = useState(false);

  const signedIn = ready && Boolean(user);
  const signedOutDemo = !state.me && !signedIn;

  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    if (!signedOutDemo) {
      setVisible(false);
      return;
    }
    setVisible(canShowVendorSellCard());
  }, [signedOutDemo]);

  useEffect(() => {
    if (!visible) return;
    const hero = document.querySelector(".home-hero-section");
    if (!hero || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setPastHero(Boolean(entry && !entry.isIntersecting));
      },
      { threshold: 0, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(hero);
    return () => io.disconnect();
  }, [visible]);

  if (!visible || !pastHero) return null;

  const dismiss = () => {
    markVendorSellCardDismissed();
    setVisible(false);
  };

  return (
    <div
      className="vendor-sell-card card fixed bottom-4 right-4 z-40 max-w-[min(100vw-2rem,22rem)] shadow-lg"
      role="region"
      aria-labelledby="vendor-sell-title"
    >
      <button
        type="button"
        className="vendor-sell-close"
        aria-label={homeCopy("vendorCardDismissAria", lang)}
        onClick={dismiss}
      >
        <IconX size={16} />
      </button>
      <div className="vendor-sell-row">
        <div className="vendor-sell-icon" aria-hidden>
          <IconStore size={24} />
        </div>
        <div className="vendor-sell-main">
          <div className="vendor-sell-copy">
            <div className="vendor-sell-title" id="vendor-sell-title">
              {homeCopy("vendorCardTitle", lang)}
            </div>
            <p className="m vendor-sell-sub">
              {homeCopy("vendorCardSub", lang)}
            </p>
          </div>
          <button
            type="button"
            className="btn s vendor-sell-cta"
            onClick={() => {
              requireAuth(
                user,
                { tab: "acc", saveReturn: false },
                () => dispatch({ type: "SIGNIN" }),
              );
            }}
          >
            {homeCopy("vendorCardCta", lang)}
          </button>
        </div>
      </div>
    </div>
  );
}