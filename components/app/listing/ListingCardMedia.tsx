"use client";

import Image from "next/image";
import { useState } from "react";
import {
  LISTING_BLUR_DATA_URL,
  isOptimizablePhotoUrl,
  isPlaceholderImage,
  productImageSizes,
} from "@/lib/nakuru/listing-image";
import { LISTING_TINT_TILE } from "@/components/app/listing/listing-tints";
import type { ListingCardCategory } from "@/components/app/listing/listing-card-types";

type Props = {
  title: string;
  imageUrl?: string;
  imageCount?: number;
  category: ListingCardCategory;
  priority?: boolean;
  variant: "rail" | "grid";
};

export function ListingCardMedia({
  title,
  imageUrl,
  imageCount,
  category,
  priority,
  variant,
}: Props) {
  const [imgOk, setImgOk] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const resolvedUrl =
    imageUrl && !isPlaceholderImage(imageUrl) ? imageUrl : undefined;
  const showPhoto = Boolean(resolvedUrl && imgOk);
  const Icon = category.icon;
  const tint = LISTING_TINT_TILE[category.tint];

  return (
    <div className="lc-media">
      {showPhoto && resolvedUrl ? (
        <>
          {!loaded ? <span className="lc-skel" aria-hidden /> : null}
          <Image
            className="lc-photo"
            src={resolvedUrl}
            alt=""
            fill
            sizes={productImageSizes(variant === "rail" ? "rail" : "grid")}
            priority={priority}
            placeholder="blur"
            blurDataURL={LISTING_BLUR_DATA_URL}
            unoptimized={!isOptimizablePhotoUrl(resolvedUrl)}
            onLoad={() => setLoaded(true)}
            onError={() => {
              setImgOk(false);
              setLoaded(true);
            }}
          />
        </>
      ) : (
        <div className={`lc-ph ${tint}`} aria-hidden>
          <Icon className="lc-ph-icon" strokeWidth={1.5} />
        </div>
      )}
      {imageCount && imageCount > 1 ? (
        <span className="lc-count">1/{imageCount}</span>
      ) : null}
      <span className="sr-only">{title}</span>
    </div>
  );
}
