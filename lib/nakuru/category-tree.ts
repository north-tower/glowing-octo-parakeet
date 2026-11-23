export type CategoryTreeNode = {
  slug: string;
  label: string;
  kind: "official" | "community";
  listingMode: string;
  openForApply: boolean;
  sortOrder: number;
  parentSlug: string | null;
  depth: number;
  children: CategoryTreeNode[];
};

export type CategoryTreeRow = {
  slug: string;
  label: string;
  kind: "official" | "community";
  listingMode: string;
  openForApply: boolean;
  sortOrder: number;
  parentSlug: string | null;
  depth: number;
};

export function buildCategoryTree(rows: CategoryTreeRow[]): CategoryTreeNode[] {
  const bySlug = new Map<string, CategoryTreeNode>();
  for (const row of rows) {
    bySlug.set(row.slug, { ...row, children: [] });
  }
  const roots: CategoryTreeNode[] = [];
  for (const node of bySlug.values()) {
    if (node.parentSlug && bySlug.has(node.parentSlug)) {
      bySlug.get(node.parentSlug)!.children.push(node);
    } else if (node.depth === 0 || !node.parentSlug) {
      roots.push(node);
    }
  }
  const sortKids = (nodes: CategoryTreeNode[]) => {
    nodes.sort(
      (a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label),
    );
    for (const n of nodes) sortKids(n.children);
  };
  sortKids(roots);
  return roots;
}