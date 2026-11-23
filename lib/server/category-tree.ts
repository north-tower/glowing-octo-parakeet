import { db } from "./db";

export async function resolveCategorySlug(slug: string): Promise<string> {
  const r = await db.q<{ canonical_slug: string }>(
    `select canonical_slug from category_aliases where alias_slug = $1`,
    [slug],
  );
  return r.rows[0]?.canonical_slug ?? slug;
}

export async function listCategoryAliases(): Promise<
  { aliasSlug: string; canonicalSlug: string }[]
> {
  const r = await db.q<{ alias_slug: string; canonical_slug: string }>(
    `select alias_slug, canonical_slug from category_aliases order by alias_slug`,
  );
  return r.rows.map((row) => ({
    aliasSlug: row.alias_slug,
    canonicalSlug: row.canonical_slug,
  }));
}

/** Visible leaf slugs under `slug` (includes `slug` when it is a leaf). */
export async function listLeafSlugsInSubtree(
  slug: string,
): Promise<string[] | null> {
  const canonical = await resolveCategorySlug(slug);
  const root = await db.q<{ slug: string }>(
    `select slug from categories where slug = $1 and visible`,
    [canonical],
  );
  if (!root.rows[0]) return null;

  const r = await db.q<{ slug: string }>(
    `with recursive subtree as (
       select slug from categories where slug = $1 and visible
       union all
       select c.slug from categories c
       join subtree s on c.parent_slug = s.slug
       where c.visible
     )
     select s.slug from subtree s
     where not exists (
       select 1 from categories c
       where c.parent_slug = s.slug and c.visible
     )`,
    [canonical],
  );
  return r.rows.map((row) => row.slug);
}

export async function isCategoryLeaf(slug: string): Promise<boolean> {
  const r = await db.q<{ n: number }>(
    `select count(*)::int n from categories
     where parent_slug = $1 and visible`,
    [slug],
  );
  return r.rows[0].n === 0;
}

export async function getCategoryRootSlug(slug: string): Promise<string | null> {
  const r = await db.q<{ slug: string }>(
    `with recursive ancestors as (
       select slug, parent_slug, depth from categories where slug = $1
       union all
       select c.slug, c.parent_slug, c.depth
       from categories c
       join ancestors a on c.slug = a.parent_slug
     )
     select slug from ancestors
     where parent_slug is null
     limit 1`,
    [slug],
  );
  return r.rows[0]?.slug ?? null;
}

export async function vendorMayUseProductCategory(
  vendorCategorySlugs: string[],
  productCategorySlug: string,
): Promise<boolean> {
  const root = await getCategoryRootSlug(productCategorySlug);
  if (!root) return false;
  return vendorCategorySlugs.includes(root);
}

export async function assertCategoryIsListableLeaf(slug: string): Promise<void> {
  const row = await db.q<{ slug: string; visible: boolean }>(
    `select slug, visible from categories where slug = $1`,
    [slug],
  );
  if (!row.rows[0]?.visible) {
    throw new CategoryTreeError(400, "bad_request");
  }
  if (!(await isCategoryLeaf(slug))) {
    throw new CategoryTreeError(400, "category_not_leaf");
  }
}

export class CategoryTreeError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string) {
    super(code);
    this.status = status;
    this.code = code;
  }
}