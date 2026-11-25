"use client";

import { useId, useState } from "react";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import type { LandingLang } from "@/lib/nakuru/i18n";

type Props = {
  lang: LandingLang;
  listingTitle: string;
  onReport: () => void;
};

export function ListingSafety({ lang, listingTitle, onReport }: Props) {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  void listingTitle;

  return (
    <section className="card pd-card pd-safety">
      <button
        type="button"
        className="pd-safety-toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        {homeCopy("productSafetyTitle", lang)}
      </button>
      {open ? (
        <div id={panelId} className="pd-safety-body">
          <ul className="pd-pay-list">
            <li>{homeCopy("productSafetyMeet", lang)}</li>
            <li>{homeCopy("productSafetyPay", lang)}</li>
          </ul>
          <button type="button" className="pd-report" onClick={onReport}>
            {homeCopy("productReport", lang)}
          </button>
        </div>
      ) : (
        <button type="button" className="pd-report" onClick={onReport}>
          {homeCopy("productReport", lang)}
        </button>
      )}
    </section>
  );
}
