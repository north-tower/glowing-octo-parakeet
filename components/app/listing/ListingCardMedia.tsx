"use client";

import Image from "next/image";
import { useState } from "react";
import {
  LISTING_BLUR_DATA_URL,
  isExtremePhotoAspect,
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
  imageWidth?: number;
  imageHeight?: number;
  category: ListingCardCategory;
  priority?: boolean;
  variant: "rail" | "grid";
};

export function ListingCardMedia({
  title,
  imageUrl,
  imageCount,
  imageWidth,
  imageHeight,
  category,
  priority,
  variant,
}: Props) {
  const [imgOk, setImgOk] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(
    imageWidth && imageHeight ? { w: imageWidth, h: imageHeight } : null,
  );
  const resolvedUrl =
    imageUrl && !isPlaceholderImage(imageUrl) ? imageUrl : undefined;
  const showPhoto = Boolean(resolvedUrl && imgOk);
  const Icon = category.icon;
  const tint = LISTING_TINT_TILE[category.tint];
  const contain = isExtremePhotoAspect(
    natural?.w ?? imageWidth,
    natural?.h ?? imageHeight,
  );

  return (
    <div className="lc-media">
      {showPhoto && resolvedUrl ? (
        <>
          {!loaded ? <span className="lc-skel" aria-hidden /> : null}
          {contain ? (
            <Image
              className="lc-photo-blur"
              src={resolvedUrl}
              alt=""
              fill
              sizes={productImageSizes(variant === "rail" ? "rail" : "grid")}
              priority={priority}
              aria-hidden
              unoptimized={!isOptimizablePhotoUrl(resolvedUrl)}
            />
          ) : null}
          <Image
            className={contain ? "lc-photo lc-photo--contain" : "lc-photo"}
            src={resolvedUrl}
            alt=""
            fill
            sizes={productImageSizes(variant === "rail" ? "rail" : "grid")}
            priority={priority}
            placeholder="blur"
            blurDataURL={LISTING_BLUR_DATA_URL}
            unoptimized={!isOptimizablePhotoUrl(resolvedUrl)}
            onLoad={(e) => {
              const img = e.currentTarget;
              setNatural({ w: img.naturalWidth, h: img.naturalHeight });
              setLoaded(true);
            }}
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
