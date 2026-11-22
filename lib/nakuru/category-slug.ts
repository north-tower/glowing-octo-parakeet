export const CATEGORY_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const RESERVED_CATEGORY_SLUGS = new Set(["all"]);

export function slugifyCategoryLabel(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[/]+/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}