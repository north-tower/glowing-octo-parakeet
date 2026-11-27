/** Only used when the directory/API did not supply a label. */
const LEGACY_SLUG_LABELS: Record<string, string> = {
  shop: "Shopping",
  property: "Property",
  cars: "Vehicles",
  services: "Services",
  stays: "Stays",
  taxi: "Taxi",
  rider: "Riders",
  "phone-and-laptop-repair": "Phone & Laptop Repair",
};

function titleCaseSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => {
      if (part === "and") return "&";
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ")
    .replace(/\s+&\s+/g, " & ");
}

/** Human label for a category slug; prefers API `categoryLabel` when present. */
export function humanizeCategoryName(
  slug: string,
  categoryLabel?: string | null,
): string {
  const fromApi = categoryLabel?.trim();
  if (fromApi && fromApi !== slug) return fromApi;
  const mapped = LEGACY_SLUG_LABELS[slug];
  if (mapped) return mapped;
  if (!slug || slug === "all") return "All";
  return titleCaseSlug(slug);
}
