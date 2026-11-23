import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { DirectoryView, type LinkGroup } from "@/components/seo/DirectoryView";
import { SeoShell } from "@/components/seo/SeoShell";
import { SEO_AREAS } from "@/lib/seo/areas";
import {
  filterListings,
  getDirectoryData,
  type DirectoryData,
} from "@/lib/seo/directory";
import { categoryHeading, categoryIntro, placeName } from "@/lib/seo/directory-copy";
import {
  areaLinks,
  canonicalCategoryPathSlug,
  categoryLinks,
  directoryMetadata,
  resolveSegment,
  type Segment,
} from "@/lib/seo/directory-pages";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const data = await getDirectoryData();
  return [
    ...SEO_AREAS.map((a) => ({ slug: a.slug })),
    ...data.categories.map((c) => ({ slug: c.slug })),
  ];
}

function pageContent(data: DirectoryData, seg: Segment) {
  if (seg.kind === "area") {
    const { area } = seg;
    const related: LinkGroup[] = [
      { title: `Categories in ${area.name}`, links: categoryLinks(data, { area }) },
      { title: "Other areas in Nakuru", links: areaLinks(data, { exclude: area.slug }) },
    ];
    return {
      heading: `Buy, sell & rent in ${placeName(area.name)}`,
      title: `${area.name}, Nakuru: shops, homes, cars & services`,
      intro: area.blurb,
      listings: filterListings(data.listings, { area, categories: data.categories }),
      crumbName: area.name,
      related,
    };
  }
  const { category } = seg;
  const related: LinkGroup[] = [
    { title: `${category.label} by area`, links: areaLinks(data, { category }) },
    { title: "Other categories", links: categoryLinks(data, { exclude: category.slug }) },
  ];
  const heading = categoryHeading(category, "Nakuru");
  return {
    heading,
    title: heading,
    intro: categoryIntro(category, "Nakuru"),
    listings: filterListings(data.listings, {
      category,
      categories: data.categories,
    }),
    crumbName: category.label,
    related,
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getDirectoryData();
  const canonical = canonicalCategoryPathSlug(data, slug) ?? slug;
  const seg = resolveSegment(data, slug);
  if (!seg) return { title: "Not found", robots: { index: false } };
  const c = pageContent(data, seg);
  return directoryMetadata({
    path: `/nakuru/${canonical}`,
    title: c.title,
    description: c.intro,
    listingCount: c.listings.length,
  });
}

export default async function NakuruSegmentPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getDirectoryData();
  const canonicalSlug = canonicalCategoryPathSlug(data, slug);
  if (canonicalSlug) redirect(`/nakuru/${canonicalSlug}`);
  const seg = resolveSegment(data, slug);
  if (!seg) notFound();
  const c = pageContent(data, seg);
  const path = `/nakuru/${slug}`;

  return (
    <SeoShell categories={data.categories}>
      <DirectoryView
        path={path}
        crumbs={[
          { name: "NakuruHub", href: "/" },
          { name: "Nakuru", href: "/nakuru" },
          { name: c.crumbName, href: path },
        ]}
        heading={c.heading}
        intro={c.intro}
        listings={c.listings}
        related={c.related}
      />
    </SeoShell>
  );
}
