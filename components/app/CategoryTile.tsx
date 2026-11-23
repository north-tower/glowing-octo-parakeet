"use client";

import Image from "next/image";
import {
  CategoryIcon,
  type CategoryIconKey,
} from "@/lib/nakuru/category-icons";
import type { TopCategoryTint } from "@/lib/nakuru/data/constants";

type BaseProps = {
  tint: TopCategoryTint;
  label: string;
  onActivate: () => void;
};

type Props = BaseProps &
  (
    | { imageSrc: string; icon?: CategoryIconKey }
    | { imageSrc?: undefined; icon: CategoryIconKey }
  );

export function CategoryTile(props: Props) {
  const { tint, label, onActivate, imageSrc, icon } = props;
  const useImage = Boolean(imageSrc);

  return (
    <div
      className={`ct ct--${tint}${useImage ? " ct--image" : ""}`}
      role="button"
      tabIndex={0}
      onClick={onActivate}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onActivate();
        }
      }}
    >
      <span
        className={`ct-icon${useImage ? " ct-icon--img" : ""}`}
        aria-hidden
      >
        {useImage ? (
          <Image
            src={imageSrc}
            alt=""
            width={104}
            height={104}
            sizes="52px"
            className="ct-img"
            draggable={false}
          />
        ) : (
          <CategoryIcon icon={icon!} size={24} />
        )}
      </span>
      <span className="ct-label">{label}</span>
    </div>
  );
}