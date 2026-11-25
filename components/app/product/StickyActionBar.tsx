"use client";

import { listingDisplayPrice } from "@/lib/nakuru/listing-detail";
import type { Listing } from "@/lib/nakuru/types";
import { useStickyBar } from "@/components/app/assistant/useStickyBar";

type Props = {
  listing: Listing;
  ctaLabel: string;
  disabled?: boolean;
  title?: string;
  done?: boolean;
  onCta: () => void;
};

export function StickyActionBar({
  listing,
  ctaLabel,
  disabled,
  title,
  done,
  onCta,
}: Props) {
  const barRef = useStickyBar<HTMLDivElement>();

  return (
    <div
      ref={barRef}
      className="pd-bar pd-bar--solo"
      role="region"
      aria-label={ctaLabel}
    >
      <div className="pd-bar-left">
        <span className="pd-bar-price">{listingDisplayPrice(listing)}</span>
      </div>
      <button
        type="button"
        className={`btn pd-bar-cta${done ? " pc-add--done" : ""}`}
        disabled={disabled}
        title={title}
        onClick={onCta}
      >
        {ctaLabel}
      </button>
    </div>
  );
}
