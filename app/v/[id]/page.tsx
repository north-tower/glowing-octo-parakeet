import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { cache, Suspense } from "react";
import { DirectoryView } from "@/components/seo/DirectoryView";
import { SeoShell } from "@/components/seo/SeoShell";
import { isLiveCatalogEnabled } from "@/lib/nakuru/catalog-live";
import { isOptimizablePhotoUrl } from "@/lib/nakuru/listing-image";
import { areaForLocation } from "@/lib/seo/areas";
import { filterListings, getDirectoryData } from "@/lib/seo/directory";
import { placeName } from "@/lib/seo/directory-copy";
import { absoluteUrl, jsonLdString } from "@/lib/seo/site";
import { getPublicVendor } from "@/lib/server/vendors";

type PageProps = { params: Promise<{ id: string }> };

const loadVendor = cache(async (id: string) => {
  if (!isLiveCatalogEnabled()) return null;
  try {
    return await getPublicVendor(id);
  } catch {
    return null;
  }
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const vendor = await loadVendor(id);
  if (!vendor) return { title: "Vendor not found", robots: { index: false } };
  const data = await getDirectoryData();
  const count = filterListings(data.listings, { vendorId: vendor.id }).length;
  const place = placeName(areaForLocation(vendor.area)?.name);
  const title = `${vendor.name} in ${place}`;
  const description = `Shop and contact ${vendor.name}, a ${vendor.verified ? "verified " : ""}vendor in ${place}, Kenya on NakuruHub.`;
  return {
    title,
    description,
    alternates: { canonical: `/v/${vendor.id}` },
    robots: count > 0 ? undefined : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url: `/v/${vendor.id}`,
      type: "profile",
      siteName: "NakuruHub",
      locale: "en_KE",
      ...((vendor.banner_url ?? vendor.logo_url)
        ? { images: [vendor.banner_url ?? vendor.logo_url!] }
        : {}),
    },
  };
}

async function VendorContent({ params }: PageProps) {
  const { id } = await params;
  const vendor = await loadVendor(id);
  if (!vendor) notFound();

  const data = await getDirectoryData();
  const listings = filterListings(data.listings, { vendorId: vendor.id });
  const area = areaForLocation(vendor.area);
  const place = placeName(area?.name);
  const path = `/v/${vendor.id}`;

  const business = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${absoluteUrl(path)}#business`,
    name: vendor.name,
    url: absoluteUrl(path),
    ...(vendor.logo_url ? { logo: vendor.logo_url } : {}),
    ...((vendor.banner_url ?? vendor.logo_url)
      ? { image: vendor.banner_url ?? vendor.logo_url }
      : {}),
    address: {
      "@type": "PostalAddress",
      ...(area ? { streetAddress: area.name } : {}),
      addressLocality: "Nakuru",
      addressRegion: "Nakuru County",
      addressCountry: "KE",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(business) }}
      />
      <DirectoryView
        path={path}
        crumbs={[
          { name: "NakuruHub", href: "/" },
          { name: "Nakuru", href: "/nakuru" },
          ...(area ? [{ name: area.name, href: `/nakuru/${area.slug}` }] : []),
          { name: vendor.name, href: path },
        ]}
        lead={
          vendor.banner_url || vendor.logo_url ? (
            <div className="seo-vendor-lead">
              {vendor.banner_url ? (
                <Image
                  className="seo-vendor-banner"
                  src={vendor.banner_url}
                  alt={`${vendor.name} shop banner`}
                  width={1200}
                  height={400}
                  unoptimized={!isOptimizablePhotoUrl(vendor.banner_url)}
                />
              ) : null}
              {vendor.logo_url ? (
                <div className="seo-vendor-head">
                  <Image
                    className="seo-vendor-logo"
                    src={vendor.logo_url}
                    alt={`${vendor.name} logo`}
                    width={72}
                    height={72}
                    unoptimized={!isOptimizablePhotoUrl(vendor.logo_url)}
                  />
                </div>
              ) : null}
            </div>
          ) : null
        }
        heading={vendor.name}
        intro={`${vendor.verified ? "Verified vendor" : "Vendor"} in ${place}. Browse their listings below and contact them through NakuruHub.`}
        listings={listings}
        related={[]}
      />
    </>
  );
}

export default async function VendorPage({ params }: PageProps) {
  const data = await getDirectoryData();
  return (
    <SeoShell categories={data.categories}>
      <Suspense fallback={null}>
        <VendorContent params={params} />
      </Suspense>
    </SeoShell>
  );
}
