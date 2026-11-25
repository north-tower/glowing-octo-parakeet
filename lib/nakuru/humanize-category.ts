const CATEGORY_NAME_MAP: Record<string, string> = {
  "phone-and-laptop-repair": "Phone & Laptop Repair",
  shop: "Shopping",
  property: "Property",
  cars: "Vehicles",
  services: "Services",
  stays: "Stays",
  taxi: "Taxi",
  rider: "Riders",
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
  const mapped = CATEGORY_NAME_MAP[slug];
  if (mapped) return mapped;
  const fromApi = categoryLabel?.trim();
  if (fromApi && fromApi !== slug) return fromApi;
  if (!slug || slug === "all") return "All";
  return titleCaseSlug(slug);
}
