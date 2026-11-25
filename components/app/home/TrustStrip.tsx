"use client";

import { useState } from "react";
import { BadgeCheck, Store, Wallet } from "lucide-react";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import type { LandingLang } from "@/lib/nakuru/i18n";
import { HomeBottomSheet } from "@/components/app/home/HomeBottomSheet";

type SheetId = "verify" | "pay" | "sell";

type Props = {
  lang: LandingLang;
  onSell: () => void;
};

export function TrustStrip({ lang, onSell }: Props) {
  const [sheet, setSheet] = useState<SheetId | null>(null);

  return (
    <>
      <ul className="trust-strip" aria-label="Trust">
        <li>
          <button
            type="button"
            className="trust-chip"
            onClick={() => setSheet("verify")}
          >
            <BadgeCheck size={20} aria-hidden />
            <span className="trust-copy">
              <b>{homeCopy("trustStripVerified", lang)}</b>
            </span>
          </button>
        </li>
        <li>
          <button
            type="button"
            className="trust-chip"
            onClick={() => setSheet("pay")}
          >
            <Wallet size={20} aria-hidden />
            <span className="trust-copy">
              <b>{homeCopy("trustStripPay", lang)}</b>
            </span>
          </button>
        </li>
        <li>
          <button
            type="button"
            className="trust-chip"
            onClick={() => setSheet("sell")}
          >
            <Store size={20} aria-hidden />
            <span className="trust-copy">
              <b>{homeCopy("trustStripFreeJoin", lang)}</b>
            </span>
          </button>
        </li>
      </ul>
      <HomeBottomSheet
        open={sheet === "verify"}
        title={homeCopy("trustVerifyTitle", lang)}
        onClose={() => setSheet(null)}
      >
        <p className="pwa-sheet-hint">{homeCopy("trustVerifyBody", lang)}</p>
      </HomeBottomSheet>
      <HomeBottomSheet
        open={sheet === "pay"}
        title={homeCopy("trustPayTitle", lang)}
        onClose={() => setSheet(null)}
      >
        <p className="pwa-sheet-hint">{homeCopy("trustPayBody", lang)}</p>
      </HomeBottomSheet>
      <HomeBottomSheet
        open={sheet === "sell"}
        title={homeCopy("vendorCardTitle", lang)}
        onClose={() => setSheet(null)}
      >
        <p className="pwa-sheet-hint">{homeCopy("vendorCardSub", lang)}</p>
        <button
          type="button"
          className="btn full"
          onClick={() => {
            setSheet(null);
            onSell();
          }}
        >
          {homeCopy("vendorCardCta", lang)}
        </button>
      </HomeBottomSheet>
    </>
  );
}
