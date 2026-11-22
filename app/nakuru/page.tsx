import type { Metadata } from "next";
import { DirectoryView } from "@/components/seo/DirectoryView";
import { SeoShell } from "@/components/seo/SeoShell";
import { getDirectoryData } from "@/lib/seo/directory";
import {
  areaLinks,
  categoryLinks,
  directoryMetadata,
} from "@/lib/seo/directory-pages";

const HEADING = "Buy, sell & rent in Nakuru";
const INTRO =
  "Shops, houses and land, cars, and local services from vendors across Nakuru County, Kenya. Browse by category or by area.";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getDirectoryData();
  return directoryMetadata({
    path: "/nakuru",
    title: "Nakuru marketplace: shops, property, cars & services",
    description: INTRO,
    listingCount: data.listings.length,
  });
}

export default async function NakuruDirectoryPage() {
  const data = await getDirectoryData();
  return (
    <SeoShell categories={data.categories}>
      <DirectoryView
        path="/nakuru"
        crumbs={[
          { name: "NakuruHub", href: "/" },
          { name: "Nakuru", href: "/nakuru" },
        ]}
        heading={HEADING}
        intro={INTRO}
        listings={data.listings.slice(0, 24)}
        related={[
          { title: "Browse by category", links: categoryLinks(data) },
          { title: "Browse by area", links: areaLinks(data) },
        ]}
      />
    </SeoShell>
  );
}
