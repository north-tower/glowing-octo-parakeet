export type SeoArea = {
  slug: string;
  name: string;
  /** Short, factual intro shown on the area page. */
  blurb: string;
  matches: RegExp;
};

export const SEO_AREAS: SeoArea[] = [
  {
    slug: "town-cbd",
    name: "Nakuru Town (CBD)",
    blurb:
      "Nakuru's central business district — shops, offices, and services within walking distance of the main matatu stages.",
    matches: /\b(town|cbd)\b/i,
  },
  {
    slug: "milimani",
    name: "Milimani",
    blurb:
      "Milimani is a quiet, leafy residential area close to Nakuru town, popular for family homes and rentals.",
    matches: /\bmilimani\b/i,
  },
  {
    slug: "section-58",
    name: "Section 58",
    blurb:
      "Section 58 is an established residential estate just outside Nakuru town, with homes, rentals, and local businesses.",
    matches: /\bsection\s*58\b/i,
  },
  {
    slug: "lanet",
    name: "Lanet",
    blurb:
      "Lanet sits along the Nakuru–Nairobi highway and is one of Nakuru's fastest-growing areas for homes, plots, and services.",
    matches: /\blanet\b/i,
  },
  {
    slug: "free-area",
    name: "Free Area",
    blurb:
      "Free Area is a busy residential and trading area east of Nakuru town along the Nakuru–Nairobi road.",
    matches: /\bfree\s*area\b/i,
  },
];

export function areaBySlug(slug: string): SeoArea | undefined {
  return SEO_AREAS.find((a) => a.slug === slug);
}

export function areaForLocation(location: string | null | undefined): SeoArea | undefined {
  if (!location) return undefined;
  return SEO_AREAS.find((a) => a.matches.test(location));
}
