import { redirect } from "next/navigation";
import { BROWSE_CATEGORY_SLUGS } from "@/components/app/category/browse/categories";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return [...BROWSE_CATEGORY_SLUGS].map((slug) => ({ slug }));
}

export default async function CategorySlugPage({ params }: Props) {
  const { slug } = await params;
  if (!BROWSE_CATEGORY_SLUGS.has(slug)) {
    redirect("/app?tab=cat");
  }
  redirect(`/app?tab=cat&side=${encodeURIComponent(slug)}`);
}