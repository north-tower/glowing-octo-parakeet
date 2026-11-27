import { redirect } from "next/navigation";
import { officialRootSlugs } from "@/lib/nakuru/data/category-directory";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return officialRootSlugs().map((slug) => ({ slug }));
}

export default async function CategorySlugPage({ params }: Props) {
  const { slug } = await params;
  if (!officialRootSlugs().includes(slug)) {
    redirect("/app?tab=cat");
  }
  redirect(`/app?tab=cat&side=${encodeURIComponent(slug)}`);
}
