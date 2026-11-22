import Link from "next/link";
import type { DirListing } from "@/lib/seo/directory";
import { absoluteUrl, jsonLdString, WEBSITE_ID } from "@/lib/seo/site";
import { ListingGrid } from "./ListingGrid";

export type Crumb = { name: string; href: string };
export type LinkGroup = {
  title: string;
  links: { href: string; label: string; count: number }[];
};

type Props = {
  path: string;
  crumbs: Crumb[];
  heading: string;
  intro: string;
  listings: DirListing[];
  related: LinkGroup[];
  /** Optional block rendered above the heading (e.g. vendor logo). */
  lead?: React.ReactNode;
};

function directoryJsonLd({ path, crumbs, heading, intro, listings }: Props) {
  const url = absoluteUrl(path);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#page`,
        url,
        name: heading,
        description: intro,
        inLanguage: "en-KE",
        isPartOf: { "@id": WEBSITE_ID },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: listings.length,
          itemListElement: listings.slice(0, 50).map((l, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: absoluteUrl(`/app/p/${encodeURIComponent(l.id)}`),
            name: l.title,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: crumbs.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: c.name,
          item: absoluteUrl(c.href),
        })),
      },
    ],
  };
}

export function DirectoryView(props: Props) {
  const { crumbs, heading, intro, listings, related, lead } = props;
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(directoryJsonLd(props)) }}
      />
      <nav className="seo-crumbs" aria-label="Breadcrumb">
        <ol>
          {crumbs.map((c, i) => (
            <li key={c.href}>
              {i === crumbs.length - 1 ? (
                <span aria-current="page">{c.name}</span>
              ) : (
                <Link href={c.href}>{c.name}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      {lead}
      <h1 className="seo-title">{heading}</h1>
      <p className="seo-intro">{intro}</p>

      {listings.length ? (
        <>
          <p className="seo-count">
            {listings.length} {listings.length === 1 ? "listing" : "listings"}
          </p>
          <ListingGrid listings={listings} />
        </>
      ) : (
        <div className="seo-empty">
          <p>No listings here yet. Be the first to list in this spot.</p>
          <Link className="seo-button" href="/app?start=vendor">
            Post a listing for free
          </Link>
        </div>
      )}

      {related
        .filter((g) => g.links.length)
        .map((g) => (
          <section key={g.title} className="seo-related">
            <h2>{g.title}</h2>
            <ul className="seo-chips">
              {g.links.map((l) => (
                <li key={l.href}>
                  <Link className="seo-chip" href={l.href}>
                    {l.label}
                    <span className="seo-chip-count">{l.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
    </>
  );
}
