"use client";

import { BottomNav } from "@/components/app/BottomNav";
import { ProductDetailView } from "@/components/app/ProductDetailView";

type Props = {
  productId: string;
};

export function ProductDetailShell({ productId }: Props) {
  return (
    <div className="app-shell app-shell--detail">
      <main id="v" className="pd-main">
        <ProductDetailView productId={productId} />
      </main>
      <BottomNav />
    </div>
  );
}