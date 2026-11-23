import type { SeoCategory } from "./directory-copy";

export type SeoCategoryNode = SeoCategory & {
  parentSlug: string | null;
  depth: number;
};

/** Build alias → canonical map (first canonical wins per alias). */
export function aliasMap(
  aliases: ReadonlyArray<{ aliasSlug: string; canonicalSlug: string }>,
): Map<string, string> {
  const m = new Map<string, string>();
  for (const { aliasSlug, canonicalSlug } of aliases) {
    if (!m.has(aliasSlug)) m.set(aliasSlug, canonicalSlug);
  }
  return m;
}

export function resolveCategorySlug(
  slug: string,
  aliases: ReadonlyMap<string, string>,
): string {
  return aliases.get(slug) ?? slug;
}

/** Visible leaf slugs in the subtree rooted at `slug` (includes `slug` when it is a leaf). */
export function leafSlugsInSubtree(
  slug: string,
  categories: ReadonlyArray<SeoCategoryNode>,
): Set<string> {
  const byParent = new Map<string, SeoCategoryNode[]>();
  for (const c of categories) {
    if (c.parentSlug) {
      const list = byParent.get(c.parentSlug) ?? [];
      list.push(c);
      byParent.set(c.parentSlug, list);
    }
  }

  const leaves = new Set<string>();
  const stack = [slug];
  const seen = new Set<string>();

  while (stack.length) {
    const s = stack.pop()!;
    if (seen.has(s)) continue;
    seen.add(s);
    const children = byParent.get(s);
    if (!children?.length) {
      if (categories.some((c) => c.slug === s)) leaves.add(s);
      continue;
    }
    for (const child of children) stack.push(child.slug);
  }

  return leaves;
}

export function findCategory(
  data: { categories: SeoCategoryNode[] },
  slug: string,
  aliases: ReadonlyMap<string, string>,
): SeoCategoryNode | undefined {
  const canonical = resolveCategorySlug(slug, aliases);
  return data.categories.find((c) => c.slug === canonical);
}

export function listingInCategorySubtree(
  listingCategorySlug: string,
  category: SeoCategoryNode,
  categories: ReadonlyArray<SeoCategoryNode>,
): boolean {
  const leaves = leafSlugsInSubtree(category.slug, categories);
  return leaves.has(listingCategorySlug);
}