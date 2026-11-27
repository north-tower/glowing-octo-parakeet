import fs from "fs";
import path from "path";

const dir = path.join("c:/Users/mhki/hub/supabase/migrations");
const files = [
  "008_category_directory.sql",
  "012_rider_open_categories.sql",
  "013_category_tree.sql",
  "014_jiji_category_phase2.sql",
];

const re =
  /\('((?:''|[^'])*)',\s*'((?:''|[^'])*)',\s*'(official|community)',\s*'(shop|services|property|cars)',\s*(true|false),\s*(true|false),\s*(\d+)(?:,\s*(null|'[^']+'),\s*(\d+))?\)/g;

const bySlug = new Map();
for (const f of files) {
  const sql = fs.readFileSync(path.join(dir, f), "utf8");
  let m;
  while ((m = re.exec(sql))) {
    const slug = m[1];
    const label = m[2].replace(/''/g, "'");
    const kind = m[3];
    if (kind !== "official") continue;
    const listingMode = m[4];
    const openForApply = m[6] === "true";
    const sortOrder = Number(m[7]);
    let parentSlug = null;
    let depth = 0;
    if (m[8] !== undefined) {
      parentSlug = m[8] === "null" ? null : m[8].replace(/^'|'$/g, "");
      depth = Number(m[9]);
    }
    bySlug.set(slug, {
      slug,
      label,
      listingMode,
      openForApply,
      sortOrder,
      parentSlug,
      depth,
    });
  }
}

const cars = bySlug.get("cars");
if (cars) {
  cars.parentSlug = "vehicles";
  cars.depth = 1;
  cars.sortOrder = 12;
}
bySlug.delete("shop");
bySlug.delete("property");
for (const r of bySlug.values()) {
  if (r.depth === 0) r.openForApply = true;
}

const childCount = new Map();
for (const r of bySlug.values()) {
  if (r.parentSlug) {
    childCount.set(r.parentSlug, (childCount.get(r.parentSlug) || 0) + 1);
  }
}

const rows = [...bySlug.values()].sort(
  (a, b) => a.sortOrder - b.sortOrder || a.slug.localeCompare(b.slug),
);

function esc(s) {
  return s.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

const lines = rows.map((r) => {
  const hasChildren = (childCount.get(r.slug) || 0) > 0;
  const parent = r.parentSlug ? `'${r.parentSlug}'` : "null";
  return `  { slug: '${r.slug}', label: '${esc(r.label)}', kind: 'official', listingMode: '${r.listingMode}', visible: true, openForApply: ${r.openForApply}, sortOrder: ${r.sortOrder}, parentSlug: ${parent}, depth: ${r.depth}, hasChildren: ${hasChildren} }`;
});

const out = `import type { DirectoryCategory } from "./category-directory";

/** Official tree mirrored from migrations 008/012/013/014/019. */
export const OFFICIAL_CATEGORY_SEED: DirectoryCategory[] = [
${lines.join(",\n")}
];
`;

fs.writeFileSync(
  "c:/Users/mhki/hub/lib/nakuru/data/official-category-seed.ts",
  out,
);
console.log("rows", rows.length, "roots", rows.filter((r) => r.depth === 0).length);
