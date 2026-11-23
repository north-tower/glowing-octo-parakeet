import type { ListingMode } from "@/lib/nakuru/types";
import {
  CATEGORY_SLUG_RE,
  RESERVED_CATEGORY_SLUGS,
  slugifyCategoryLabel,
} from "@/lib/nakuru/category-slug";
import { db } from "./db";

export class CategoryError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string) {
    super(code);
    this.status = status;
    this.code = code;
  }
}

export type CategoryPublicRow = {
  slug: string;
  label: string;
  kind: "official" | "community";
  listingMode: ListingMode;
  openForApply: boolean;
  sortOrder: number;
  parentSlug: string | null;
  depth: number;
  hasChildren: boolean;
};

export type CategoryAdminRow = CategoryPublicRow & {
  visible: boolean;
  createdAt: Date;
  createdBy: string | null;
};

export type DbCategoryRow = {
  slug: string;
  label: string;
  kind: "official" | "community";
  listing_mode: ListingMode;
  visible: boolean;
  open_for_apply: boolean;
  sort_order: number;
  parent_slug: string | null;
  depth: number;
  created_by: string | null;
  created_at: Date;
  child_count?: number;
};

const categoryReturning = `slug, label, kind, listing_mode, visible, open_for_apply, sort_order,
  parent_slug, depth, created_by, created_at`;

const categorySelect = `c.slug, c.label, c.kind, c.listing_mode, c.visible, c.open_for_apply, c.sort_order,
  c.parent_slug, c.depth, c.created_by, c.created_at,
  (select count(*)::int from categories ch where ch.parent_slug = c.slug and ch.visible) as child_count`;

export function mapCategoryRow(r: DbCategoryRow): CategoryPublicRow {
  return {
    slug: r.slug,
    label: r.label,
    kind: r.kind,
    listingMode: r.listing_mode,
    openForApply: r.open_for_apply,
    sortOrder: r.sort_order,
    parentSlug: r.parent_slug,
    depth: r.depth,
    hasChildren: (r.child_count ?? 0) > 0,
  };
}

function mapCategoryAdminRow(r: DbCategoryRow): CategoryAdminRow {
  return {
    ...mapCategoryRow(r),
    visible: r.visible,
    createdAt: r.created_at,
    createdBy: r.created_by,
  };
}

function validateLabel(label: string): string {
  const trimmed = label.trim();
  const len = trimmed.length;
  if (len < 2 || len > 60) {
    throw new CategoryError(400, "bad_request");
  }
  return trimmed;
}

function validateSlug(slug: string): void {
  if (!slug || RESERVED_CATEGORY_SLUGS.has(slug) || !CATEGORY_SLUG_RE.test(slug)) {
    throw new CategoryError(400, "bad_request");
  }
}

export async function listVisibleCategories(
  parentSlug?: string | null,
): Promise<CategoryPublicRow[]> {
  if (parentSlug) {
    const r = await db.q<DbCategoryRow>(
      `select ${categorySelect}
       from categories c
       where c.visible and c.parent_slug = $1
       order by c.sort_order asc, c.label asc`,
      [parentSlug],
    );
    return r.rows.map(mapCategoryRow);
  }
  const r = await db.q<DbCategoryRow>(
    `select ${categorySelect}
     from categories c
     where c.visible
     order by c.sort_order asc, c.label asc`,
  );
  return r.rows.map(mapCategoryRow);
}

export async function listAllCategories(): Promise<CategoryAdminRow[]> {
  const r = await db.q<DbCategoryRow>(
    `select ${categorySelect}
     from categories c
     order by c.sort_order asc, c.label asc`,
  );
  return r.rows.map(mapCategoryAdminRow);
}

export async function getCategoryBySlug(
  slug: string,
): Promise<DbCategoryRow | null> {
  const r = await db.q<DbCategoryRow>(
    `select ${categorySelect} from categories c where c.slug = $1`,
    [slug],
  );
  return r.rows[0] ?? null;
}

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "23505"
  );
}

const DEFAULT_COMMUNITY_PARENT = "business-and-industry";

export async function upsertCommunityCategory(
  userId: string,
  label: string,
  parentSlug: string = DEFAULT_COMMUNITY_PARENT,
): Promise<CategoryPublicRow> {
  const trimmed = validateLabel(label);
  const slug = slugifyCategoryLabel(trimmed);
  validateSlug(slug);

  const parent = await getCategoryBySlug(parentSlug);
  if (!parent || !parent.visible || parent.depth > 1) {
    throw new CategoryError(400, "bad_request");
  }

  const existing = await getCategoryBySlug(slug);
  if (existing) {
    if (!existing.visible) {
      throw new CategoryError(409, "category_hidden");
    }
    return mapCategoryRow(existing);
  }

  const depth = parent.depth + 1;
  if (depth > 2) {
    throw new CategoryError(400, "bad_request");
  }

  const count = (
    await db.q<{ n: number }>(
      `select count(*)::int n from categories
       where created_by = $1 and kind = 'community'
         and created_at > now() - interval '1 day'`,
      [userId],
    )
  ).rows[0].n;
  if (count >= 20) {
    throw new CategoryError(429, "too_many_requests");
  }

  try {
    const inserted = (
      await db.q<DbCategoryRow>(
        `insert into categories (
           slug, label, kind, listing_mode, visible, open_for_apply, sort_order,
           created_by, parent_slug, depth
         )
         select $1, $2, 'community', $4, true, true,
           (select coalesce(max(sort_order), 60) + 10 from categories),
           $3, $5, $6
         returning ${categoryReturning}`,
        [slug, trimmed, userId, parent.listing_mode, parentSlug, depth],
      )
    ).rows[0];
    return mapCategoryRow({ ...inserted, child_count: 0 });
  } catch (err) {
    if (!isUniqueViolation(err)) throw err;
    const raced = await getCategoryBySlug(slug);
    if (!raced) {
      throw err;
    }
    if (!raced.visible) {
      throw new CategoryError(409, "category_hidden");
    }
    return mapCategoryRow(raced);
  }
}

export async function slugsAllowedForApply(slugs: string[]): Promise<boolean> {
  if (slugs.length === 0 || slugs.length > 4) {
    return false;
  }
  const r = await db.q<{ slug: string }>(
    `select slug from categories
     where slug = any($1::text[])
       and visible
       and open_for_apply
       and depth = 0`,
    [slugs],
  );
  const allowed = new Set(r.rows.map((row) => row.slug));
  return slugs.every((slug) => allowed.has(slug));
}

export async function staffCreateOfficial(input: {
  label: string;
  listingMode: ListingMode;
  openForApply: boolean;
}): Promise<CategoryPublicRow> {
  const trimmed = validateLabel(input.label);
  const slug = slugifyCategoryLabel(trimmed);
  validateSlug(slug);

  const existing = await getCategoryBySlug(slug);
  if (existing) {
    throw new CategoryError(409, "conflict");
  }

  const inserted = (
    await db.q<DbCategoryRow>(
      `insert into categories (
         slug, label, kind, listing_mode, visible, open_for_apply, sort_order
       )
       select $1, $2, 'official', $3, true, $4,
         (select coalesce(max(sort_order), 60) + 10 from categories)
       returning ${categorySelect}`,
      [slug, trimmed, input.listingMode, input.openForApply],
    )
  ).rows[0];
  return mapCategoryRow(inserted);
}

export async function staffPatchCategory(
  slug: string,
  patch: {
    visible?: boolean;
    listingMode?: ListingMode;
    openForApply?: boolean;
    label?: string;
  },
): Promise<CategoryPublicRow> {
  const existing = await getCategoryBySlug(slug);
  if (!existing) {
    throw new CategoryError(404, "not_found");
  }

  const sets: string[] = [];
  const params: unknown[] = [slug];
  let i = 2;

  if (patch.visible !== undefined) {
    sets.push(`visible = $${i++}`);
    params.push(patch.visible);
  }
  if (patch.listingMode !== undefined) {
    sets.push(`listing_mode = $${i++}`);
    params.push(patch.listingMode);
  }
  if (patch.openForApply !== undefined) {
    sets.push(`open_for_apply = $${i++}`);
    params.push(patch.openForApply);
  }
  if (patch.label !== undefined) {
    const trimmed = validateLabel(patch.label);
    sets.push(`label = $${i++}`);
    params.push(trimmed);
  }

  if (sets.length === 0) {
    return mapCategoryRow(existing);
  }

  const updated = (
    await db.q<DbCategoryRow>(
      `update categories set ${sets.join(", ")}
       where slug = $1
       returning ${categorySelect}`,
      params,
    )
  ).rows[0];
  return mapCategoryRow(updated);
}