"use client";

import Image from "next/image";
import { Camera, Images } from "lucide-react";
import { useState } from "react";
import {
  isOptimizablePhotoUrl,
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
  const showPhoto = imageUrl && imgOk;
  const Icon = category.icon;
  const tint = LISTING_TINT_TILE[category.tint];

  return (
    <div className="group/pim relative aspect-[4/3] w-full overflow-hidden rounded-t-2xl bg-stone-100">
      {showPhoto ? (
        <Image
          className="object-cover"
          src={imageUrl}
          alt=""
          fill
          sizes={productImageSizes(variant === "rail" ? "rail" : "grid")}
          priority={priority}
          unoptimized={!isOptimizablePhotoUrl(imageUrl)}
          onError={() => setImgOk(false)}
        />
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center ${tint}`}
          aria-hidden
        >
          <Icon size={40} strokeWidth={1.5} />
        </div>
      )}
      {imageCount && imageCount > 1 ? (
        <>
          <span className="absolute bottom-2 left-2 z-10 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white">
            <Camera size={12} aria-hidden />
            1/{imageCount}
          </span>
          <span className="pointer-events-none absolute inset-0 z-[1] hidden items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover/pim:opacity-100 [@media(hover:hover)]:flex">
            <span className="rounded-full bg-white/95 p-2 text-stone-800 shadow-sm">
              <Images size={18} aria-hidden />
            </span>
          </span>
        </>
      ) : null}
      <span className="sr-only">{title}</span>
    </div>
  );
}