import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const jobs = [
  ["clerical-and-office-jobs", "Clerical & Office Jobs"],
  ["computing-and-it-jobs", "Computing & IT Jobs"],
  ["construction-and-skilled-trades-jobs", "Construction & Skilled Trades Jobs"],
  ["consulting-and-strategy-jobs", "Consulting & Strategy Jobs"],
  ["customer-service-jobs", "Customer Service Jobs"],
  ["driver-jobs", "Driver Jobs"],
  ["engineering-and-architecture-jobs", "Engineering & Architecture Jobs"],
  ["farming-and-veterinary-jobs", "Farming & Veterinary Jobs"],
  ["gardening-and-landscaping-jobs", "Gardening & Landscaping Jobs"],
  ["health-and-beauty-jobs", "Health & Beauty Jobs"],
  ["hospitality-and-catering-jobs", "Hospitality & Catering Jobs"],
  ["housekeeper-jobs", "Housekeeper Jobs"],
  ["human-resources-jobs", "Human Resources Jobs"],
  ["internship-jobs", "Internship Jobs"],
  ["legal-jobs", "Legal Jobs"],
  ["logistics-and-transportation-jobs", "Logistics & Transportation Jobs"],
  ["manual-labour-jobs", "Manual Labour Jobs"],
  ["manufacturing-jobs", "Manufacturing Jobs"],
  ["mining-industry-and-energy-jobs", "Mining, Industry & Energy Jobs"],
  ["quality-control-and-assurance-jobs", "Quality Control & Assurance Jobs"],
  ["research-survey-and-monitoring-jobs", "Research, Survey & Monitoring Jobs"],
  ["restaurant-and-bar-jobs", "Restaurant & Bar Jobs"],
  ["sales-jobs", "Sales Jobs"],
  ["security-jobs", "Security Jobs"],
  ["sports-club-and-entertainment-jobs", "Sports, Club & Entertainment Jobs"],
  ["teaching-jobs", "Teaching Jobs"],
  ["technology-jobs", "Technology Jobs"],
  ["tourism-and-travel-jobs", "Tourism & Travel Jobs"],
];

const categories = [];
let sortOrder = 155;
for (const [slug, label] of jobs) {
  categories.push({
    slug,
    label,
    parentSlug: "jobs",
    depth: 1,
    listingMode: "services",
    sortOrder: sortOrder++,
    openForApply: false,
    kind: "official",
  });
}
sortOrder = 183;
for (const [slug, label] of jobs) {
  categories.push({
    slug: slug.replace(/-jobs$/, "-cvs"),
    label: label.replace(/ Jobs$/, " CVs"),
    parentSlug: "seeking-work-cvs",
    depth: 1,
    listingMode: "services",
    sortOrder: sortOrder++,
    openForApply: false,
    kind: "official",
  });
}

const payload = {
  version: 1,
  source: "Jiji.co.ke jobs nav (curated 2026-11-23)",
  categories,
};

const esc = (s) => s.replace(/'/g, "''");
const values = categories.map(
  (c) =>
    `  ('${c.slug}', '${esc(c.label)}', 'official', '${c.listingMode}', true, ${c.openForApply ? "true" : "false"}, ${c.sortOrder}, '${c.parentSlug}', ${c.depth})`,
);

const sql = `-- Phase 2 Jiji jobs/CV children (from data/jiji-ke-categories.json)

insert into categories (slug, label, kind, listing_mode, visible, open_for_apply, sort_order, parent_slug, depth)
values
${values.join(",\n")}
on conflict (slug) do update
set label = excluded.label,
    listing_mode = excluded.listing_mode,
    parent_slug = excluded.parent_slug,
    depth = excluded.depth,
    sort_order = excluded.sort_order,
    visible = true;
`;

fs.mkdirSync(path.join(root, "data"), { recursive: true });
fs.writeFileSync(
  path.join(root, "data/jiji-ke-categories.json"),
  `${JSON.stringify(payload, null, 2)}\n`,
);
fs.writeFileSync(
  path.join(root, "supabase/migrations/014_jiji_category_phase2.sql"),
  sql,
);
console.log(`wrote ${categories.length} phase-2 categories`);