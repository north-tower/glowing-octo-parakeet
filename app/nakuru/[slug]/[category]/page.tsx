import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DirectoryView } from "@/components/seo/DirectoryView";
import { SeoShell } from "@/components/seo/SeoShell";
import { areaBySlug, SEO_AREAS } from "@/lib/seo/areas";
import {
  filterListings,
  getDirectoryData,
  type DirectoryData,
} from "@/lib/seo/directory";
import { categoryHeading, categoryIntro, placeName } from "@/lib/seo/directory-copy";
import {
  areaLinks,
  categoryBySlug,
  categoryLinks,
  directoryMetadata,
} from "@/lib/seo/directory-pages";

type PageProps = { params: Promise<{ slug: string; category: string }> };

export async function generateStaticParams() {
  const data = await getDirectoryData();
  return SEO_AREAS.flatMap((a) =>
    data.categories.map((c) => ({ slug: a.slug, category: c.slug })),
  );
}

function resolve(data: DirectoryData, slug: string, categorySlug: string) {
  const area = areaBySlug(slug);
  const category = categoryBySlug(data, categorySlug);
  if (!area || !category) return null;
  const place = placeName(area.name);
  return {
    area,
    category,
    heading: categoryHeading(category, place),
    intro: `${categoryIntro(category, place)} ${area.blurb}`,
    listings: filterListings(data.listings, { area, category }),
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, category } = await params;
  const data = await getDirectoryData();
  const r = resolve(data, slug, category);
  if (!r) return { title: "Not found", robots: { index: false } };
  return directoryMetadata({
    path: `/nakuru/${slug}/${category}`,
    title: r.heading,
    description: categoryIntro(r.category, placeName(r.area.name)),
    listingCount: r.listings.length,
  });
}

export default async function NakuruAreaCategoryPage({ params }: PageProps) {
  const { slug, category } = await params;
  const data = await getDirectoryData();
  const r = resolve(data, slug, category);
  if (!r) notFound();
  const path = `/nakuru/${slug}/${category}`;

  return (
    <SeoShell categories={data.categories}>
      <DirectoryView
        path={path}
        crumbs={[
          { name: "NakuruHub", href: "/" },
          { name: "Nakuru", href: "/nakuru" },
          { name: r.area.name, href: `/nakuru/${slug}` },
          { name: r.category.label, href: path },
        ]}
        heading={r.heading}
        intro={r.intro}
        listings={r.listings}
        related={[
          {
            title: `${r.category.label} in other areas`,
            links: areaLinks(data, { category: r.category, exclude: slug }),
          },
          {
            title: `More in ${r.area.name}`,
            links: categoryLinks(data, { area: r.area, exclude: category }),
          },
        ]}
      />
    </SeoShell>
  );
}
