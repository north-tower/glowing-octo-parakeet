import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductDetailShell } from "@/components/app/ProductDetailShell";
import { getPublicListingById } from "@/lib/server/catalog";
import { itemById } from "@/lib/nakuru/data/items";
import { isLiveCatalogEnabled } from "@/lib/nakuru/catalog-live";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;

  if (!isLiveCatalogEnabled()) {
    const demo = itemById(id);
    if (demo) {
      return {
        title: `${demo.t} · NakuruHub`,
        description: demo.desc ?? demo.s,
      };
    }
    return { title: "Listing · NakuruHub" };
  }

  try {
    const row = await getPublicListingById(id);
    if (!row) {
      return { title: "Listing · NakuruHub" };
    }
    return {
      title: `${row.title} · NakuruHub`,
      description: row.description?.trim() || `${row.title} on NakuruHub`,
    };
  } catch {
    return { title: "Listing · NakuruHub" };
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Suspense fallback={null}>
      <ProductDetailShell productId={id} />
    </Suspense>
  );
}