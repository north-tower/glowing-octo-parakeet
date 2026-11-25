import type { DirectoryCategory } from "@/lib/nakuru/data/category-directory";

/** Parent for a new community category during vendor onboarding or listing publish. */
export function parentSlugForCustomCategory(
  selectedSlugs: string[],
  rows: DirectoryCategory[],
): string {
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  for (const slug of selectedSlugs) {
    const row = bySlug.get(slug);
    if (row && row.depth <= 1) return slug;
    if (row?.parentSlug) {
      const parent = bySlug.get(row.parentSlug);
      if (parent && parent.depth <= 1) return parent.slug;
    }
  }
  const openRoot = rows.find(
    (r) => r.kind === "official" && r.depth === 0 && r.openForApply,
  );
  return openRoot?.slug ?? "business-and-industry";
}

export function vendorApplyChipRows(
  rows: DirectoryCategory[],
): DirectoryCategory[] {
  const seen = new Set<string>();
  const out: DirectoryCategory[] = [];

  const push = (row: DirectoryCategory) => {
    if (seen.has(row.slug)) return;
    seen.add(row.slug);
    out.push(row);
  };

  for (const row of rows) {
    if (!row.visible) continue;
    if (row.depth === 0) push(row);
  }
  const community = rows
    .filter(
      (r) =>
        r.visible && r.kind === "community" && r.openForApply && r.depth > 0,
    )
    .sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label));
  for (const row of community) push(row);

  return out;
}

function rowHasAncestorInSet(
  row: DirectoryCategory,
  roots: Set<string>,
  bySlug: Map<string, DirectoryCategory>,
): boolean {
  let cur: DirectoryCategory | undefined = row;
  while (cur) {
    if (roots.has(cur.slug)) return true;
    const parentSlug = cur.parentSlug;
    if (!parentSlug) break;
    cur = bySlug.get(parentSlug);
  }
  return false;
}

/** Visible listable leaves the vendor may publish under (profile roots + descendants). */
export function listingLeavesForVendor(
  rows: DirectoryCategory[],
  vendorRoots: string[],
): DirectoryCategory[] {
  const rootSet = new Set(vendorRoots);
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  return rows.filter(
    (r) =>
      r.visible &&
      !r.hasChildren &&
      (rootSet.has(r.slug) || rowHasAncestorInSet(r, rootSet, bySlug)),
  );
}

export function defaultListingCategorySlug(
  leaves: DirectoryCategory[],
  vendorRoots: string[],
  rows: DirectoryCategory[],
): string | null {
  if (!leaves.length) return null;
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  const rootSet = new Set(vendorRoots);

  for (const root of vendorRoots) {
    if (leaves.some((l) => l.slug === root)) return root;
    const leaf = leaves.find((l) => rowHasAncestorInSet(l, new Set([root]), bySlug));
    if (leaf) return leaf.slug;
  }

  const any = leaves.find((l) => rowHasAncestorInSet(l, rootSet, bySlug));
  return any?.slug ?? leaves[0]!.slug;
}

export function vendorRootLabels(
  vendorRoots: string[],
  rows: DirectoryCategory[],
): string[] {
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  return vendorRoots
    .map((slug) => bySlug.get(slug)?.label ?? slug)
    .filter(Boolean);
}