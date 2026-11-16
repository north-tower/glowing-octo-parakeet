"use client";

import { AppHeader } from "@/components/app/AppHeader";
import { BottomNav } from "@/components/app/BottomNav";
import { ProductDetailView } from "@/components/app/ProductDetailView";

type Props = {
  productId: string;
};

export function ProductDetailShell({ productId }: Props) {
  return (
    <div className="app-shell app-shell--detail">
      <AppHeader />
      <main id="v" className="pd-main">
        <ProductDetailView productId={productId} />
      </main>
      <BottomNav />
    </div>
  );
}