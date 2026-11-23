import { redirect } from "next/navigation";
import { Suspense } from "react";
import { BROWSE_CATEGORY_SLUGS } from "@/components/app/category/browse/categories";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return [...BROWSE_CATEGORY_SLUGS].map((slug) => ({ slug }));
}

async function CategorySlugRedirect({ params }: Props) {
  const { slug } = await params;
  if (!BROWSE_CATEGORY_SLUGS.has(slug)) {
    redirect("/app?tab=cat");
  }
  redirect(`/app?tab=cat&side=${encodeURIComponent(slug)}`);
}

export default function CategorySlugPage({ params }: Props) {
  return (
    <Suspense fallback={null}>
      <CategorySlugRedirect params={params} />
    </Suspense>
  );
}