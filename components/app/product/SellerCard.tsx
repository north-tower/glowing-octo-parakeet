"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { VerifiedBadge } from "@/components/app/product/VerifiedBadge";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import type { LandingLang } from "@/lib/nakuru/i18n";
import { formatMemberSince, vendorInitials } from "@/lib/nakuru/listing-detail";
import { isOptimizablePhotoUrl } from "@/lib/nakuru/listing-image";

type Props = {
  lang: LandingLang;
  vendorName: string;
  vendorId?: string;
  vendorLogoUrl?: string | null;
  verified: boolean;
  memberSince?: string | null;
};

export function SellerCard({
  lang,
  vendorName,
  vendorId,
  vendorLogoUrl,
  verified,
  memberSince,
}: Props) {
  const titleId = useId();
  const sheetRef = useRef<HTMLDivElement>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const initials = vendorInitials(vendorName);
  const since = formatMemberSince(memberSince, lang);
  const shopHref = vendorId ? `/v/${vendorId}` : "/app";

  useEffect(() => {
    if (!sheetOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSheetOpen(false);
    };
    window.addEventListener("keydown", onKey);
    sheetRef.current?.querySelector("button")?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [sheetOpen]);

  return (
    <section
      className="card pd-card pd-seller-card"
      aria-labelledby="pd-seller-h"
    >
      <h2 id="pd-seller-h" className="pd-about-title">
        {homeCopy("productSellerTitle", lang)}
      </h2>
      <div className="pd-seller-row">
        {vendorLogoUrl ? (
          <span className="pd-seller-av pd-seller-av--img">
            <Image
              src={vendorLogoUrl}
              alt=""
              width={48}
              height={48}
              unoptimized={!isOptimizablePhotoUrl(vendorLogoUrl)}
            />
          </span>
        ) : (
          <span className="pd-seller-av" aria-hidden>
            {initials || "?"}
          </span>
        )}
        <div className="pd-seller-meta">
          <p className="pd-seller-name">{vendorName}</p>
          {verified ? (
            <VerifiedBadge lang={lang} />
          ) : (
            <span className="pd-unverified-pill">
              {homeCopy("productNotVerifiedPill", lang)}
            </span>
          )}
          {since ? <p className="m">{since}</p> : null}
        </div>
      </div>
      <button
        type="button"
        className="pd-verified-help"
        onClick={() => setSheetOpen(true)}
      >
        {homeCopy("productWhatVerifiedMeans", lang)}
      </button>
      <Link href={shopHref} className="pd-seller-all">
        {homeCopy("productViewSellerListings", lang)}
      </Link>

      {sheetOpen ? (
        <div className="pwa-sheet-root" aria-hidden={false}>
          <button
            type="button"
            className="pwa-sheet-backdrop"
            aria-label="Close"
            onClick={() => setSheetOpen(false)}
          />
          <div
            ref={sheetRef}
            className="pwa-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <div className="pwa-sheet-handle" aria-hidden />
            <h2 id={titleId} className="pwa-sheet-title">
              {homeCopy("productVerifiedMeaningTitle", lang)}
            </h2>
            <p className="m">
              {verified
                ? homeCopy("productVerifiedMeaningBody", lang)
                : homeCopy("productUnverifiedMeaningBody", lang)}
            </p>
            <button
              type="button"
              className="btn full"
              style={{ marginTop: 12 }}
              onClick={() => setSheetOpen(false)}
            >
              OK
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
