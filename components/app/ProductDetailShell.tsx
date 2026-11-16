"use client";

import { AppProvider } from "@/components/app/AppProvider";
import { BottomNav } from "@/components/app/BottomNav";
import { ProductDetailView } from "@/components/app/ProductDetailView";

type Props = {
  productId: string;
};

export function ProductDetailShell({ productId }: Props) {
  return (
    <AppProvider>
      <div className="app-shell app-shell--detail">
        <main id="v">
          <ProductDetailView productId={productId} />
        </main>
        <BottomNav />
      </div>
    </AppProvider>
  );
}