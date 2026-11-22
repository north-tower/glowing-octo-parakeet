export const SITE_NAME = "NakuruHub";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://nakuruhub.co.ke"
).replace(/\/+$/, "");

export const SITE_DESCRIPTION =
  "NakuruHub is Nakuru's marketplace for shops, houses and land, cars, and local services across Nakuru County, Kenya. Free to join and list.";

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export function siteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORGANIZATION_ID,
        name: SITE_NAME,
        url: SITE_URL,
        logo: absoluteUrl("/icons/icon-512.png"),
        description: SITE_DESCRIPTION,
        areaServed: {
          "@type": "AdministrativeArea",
          name: "Nakuru County, Kenya",
        },
        address: {
          "@type": "PostalAddress",
          addressLocality: "Nakuru",
          addressRegion: "Nakuru County",
          addressCountry: "KE",
        },
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        name: SITE_NAME,
        url: SITE_URL,
        inLanguage: "en-KE",
        publisher: { "@id": ORGANIZATION_ID },
      },
    ],
  };
}

/** Serialises JSON-LD safely for a <script> tag (no `</script>` breakout). */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
