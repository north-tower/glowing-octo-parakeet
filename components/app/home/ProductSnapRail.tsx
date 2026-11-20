"use client";

import { ProductCard } from "@/components/app/ProductCard";
import type { Listing } from "@/lib/nakuru/types";
import type { DetailNavTab } from "@/lib/nakuru/detail-nav-tab";

type Props = {
  items: Listing[];
  onAct: (id: number | string) => void;
  serviceInquiryEnabled?: boolean;
  navOriginTab?: DetailNavTab;
  stagger?: boolean;
};

export function ProductSnapRail({
  items,
  onAct,
  serviceInquiryEnabled,
  navOriginTab = "home",
  stagger = true,
}: Props) {
  if (!items.length) return null;
  return (
    <div
      className={`home-product-rail-wrap${stagger ? " home-rail--stagger" : ""}`}
    >
      <div className="home-product-rail-fade home-product-rail-fade--start" aria-hidden />
      <div className="home-product-rail">
        {items.map((item, i) => (
          <ProductCard
            key={String(item.id)}
            item={item}
            layout="rail"
            priorityImage={i < 2}
            onAct={onAct}
            serviceInquiryEnabled={serviceInquiryEnabled}
            navOriginTab={navOriginTab}
          />
        ))}
      </div>
      <div className="home-product-rail-fade home-product-rail-fade--end" aria-hidden />
    </div>
  );
}