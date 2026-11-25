import type { Metadata } from "next";
import { cache, Suspense } from "react";
import { notFound } from "next/navigation";
import { ProductDetailShellLoading } from "@/components/app/loading/LoadingUi";
import { ProductDetailShell } from "@/components/app/ProductDetailShell";
import { getPublicListingById } from "@/lib/server/catalog";
import { categoryName } from "@/lib/nakuru/data/constants";
import { itemById } from "@/lib/nakuru/data/items";
import { isLiveCatalogEnabled } from "@/lib/nakuru/catalog-live";
import type { ListingMode } from "@/lib/nakuru/types";
import {
  absoluteUrl,
  jsonLdString,
  ORGANIZATION_ID,
  SITE_NAME,
} from "@/lib/seo/site";
import { cleanDescription } from "@/lib/nakuru/clean-description";

type PageProps = { params: Promise<{ id: string }> };

type SeoListing = {
  title: string;
  description: string;
  price: number;
  categorySlug: string;
  categoryLabel: string;
  mode: ListingMode | undefined;
  vendor: string | undefined;
  vendorId: string | undefined;
  area: string | undefined;
  images: string[];
};

const loadListing = cache(async (id: string): Promise<SeoListing | null> => {
  if (!isLiveCatalogEnabled()) {
    const demo = itemById(id);
    if (!demo) return null;
    return {
      title: demo.t,
      description: (demo.desc ?? demo.s).trim(),
      price: demo.p,
      categorySlug: demo.c,
      categoryLabel: demo.categoryLabel ?? categoryName(demo.c),
      mode: demo.listingMode,
      vendor: demo.vn,
      vendorId: undefined,
      area: demo.attrs?.location,
      images: [demo.img, ...(demo.imgs ?? [])].filter((u): u is string => !!u),
    };
  }
  try {
    const row = await getPublicListingById(id);
    if (!row) return null;
    return {
      title: row.title,
      description: row.description?.trim() || `${row.title} on NakuruHub`,
      price: row.price,
      categorySlug: row.category,
      categoryLabel: row.categoryLabel,
      mode: row.listingMode,
      vendor: row.vendor,
      vendorId: row.vendorId,
      area: row.attributes.location,
      images: [row.imageUrl, ...row.galleryUrls].filter(
        (u): u is string => !!u,
      ),
    };
  } catch {
    return null;
  }
});

function place(area: string | undefined): string {
  const a = area?.trim();
  if (!a) return "Nakuru";
  return /nakuru/i.test(a) ? a : `${a}, Nakuru`;
}

function seoTitle(l: SeoListing): string {
  const price = l.price > 0 ? ` – KSh ${l.price.toLocaleString("en-KE")}` : "";
  return `${l.title}${price} in ${place(l.area)}`;
}

function seoDescription(l: SeoListing): string {
  const cleaned = cleanDescription(l.description);
  const body = cleaned.paragraphs[0] || cleaned.bullets.join(", ") || l.title;
  const text = `${body} ${l.categoryLabel} in ${place(l.area)}, Kenya on NakuruHub.`;
  return text.length > 160 ? `${text.slice(0, 157).trimEnd()}…` : text;
}

function listingJsonLd(id: string, l: SeoListing) {
  const url = absoluteUrl(`/app/p/${encodeURIComponent(id)}`);
  const seller = l.vendor
    ? {
        "@type": "Organization",
        name: l.vendor,
        ...(l.vendorId ? { url: absoluteUrl(`/v/${l.vendorId}`) } : {}),
      }
    : { "@id": ORGANIZATION_ID };

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${url}#listing`,
        name: l.title,
        description: l.description,
        url,
        category: l.categoryLabel,
        ...(l.images.length ? { image: l.images.map(absoluteUrl) } : {}),
        ...(l.price > 0
          ? {
              offers: {
                "@type": "Offer",
                url,
                price: l.price,
                priceCurrency: "KES",
                availability: "https://schema.org/InStock",
                ...(l.mode === "shop"
                  ? { itemCondition: "https://schema.org/NewCondition" }
                  : {}),
                seller,
                areaServed: { "@type": "Place", name: `${place(l.area)}, Kenya` },
              },
            }
          : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: SITE_NAME, item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Nakuru", item: absoluteUrl("/nakuru") },
          {
            "@type": "ListItem",
            position: 3,
            name: l.categoryLabel,
            item: absoluteUrl(`/nakuru/${l.categorySlug}`),
          },
          { "@type": "ListItem", position: 4, name: l.title, item: url },
        ],
      },
    ],
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const listing = await loadListing(id);
  if (!listing) {
    return { title: "Listing not found", robots: { index: false, follow: true } };
  }

  const path = `/app/p/${encodeURIComponent(id)}`;
  const title = seoTitle(listing);
  const description = seoDescription(listing);
  const images = listing.images.slice(0, 1).map(absoluteUrl);

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      type: "website",
      siteName: SITE_NAME,
      locale: "en_KE",
      ...(images.length ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(images.length ? { images } : {}),
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const listing = await loadListing(id);
  if (isLiveCatalogEnabled() && !listing) notFound();
  return (
    <>
      {listing && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLdString(listingJsonLd(id, listing)),
          }}
        />
      )}
      <Suspense fallback={<ProductDetailShellLoading />}>
        <ProductDetailShell productId={id} />
      </Suspense>
    </>
  );
}
