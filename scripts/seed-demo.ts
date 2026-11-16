/**
 * Idempotent demo catalog for local / staging Postgres (Supabase).
 * Only touches rows owned by demo-seed-*@seed.nakuruhub.local vendors.
 *
 * Usage:
 *   pnpm seed:demo           — insert missing demo vendors/products only
 *   pnpm seed:demo -- --reset — remove demo-seed rows, then insert fresh set
 */
import "./load-project-env";
import { db } from "../lib/server/db";
import { config } from "../lib/server/config";

const DEMO_EMAIL_SUFFIX = "@seed.nakuruhub.local";

const DEMO_OWNERS = {
  mama: `demo-seed-mama${DEMO_EMAIL_SUFFIX}`,
  rift: `demo-seed-rift${DEMO_EMAIL_SUFFIX}`,
  gilani: `demo-seed-gilani${DEMO_EMAIL_SUFFIX}`,
  zawadi: `demo-seed-zawadi${DEMO_EMAIL_SUFFIX}`,
  motors: `demo-seed-motors${DEMO_EMAIL_SUFFIX}`,
  peter: `demo-seed-peter${DEMO_EMAIL_SUFFIX}`,
} as const;

type DemoProduct = {
  ownerKey: keyof typeof DEMO_OWNERS;
  vendorName: string;
  verified: boolean;
  categories: string[];
  category: string;
  title: string;
  emoji: string;
  priceKes: number;
  description?: string;
  stock?: number | null;
  imageUrl?: string | null;
  galleryUrls?: string[];
  attributes?: Record<string, string>;
};

const DEMO_CATALOG: DemoProduct[] = [
  {
    ownerKey: "mama",
    vendorName: "Mama Fashions",
    verified: true,
    categories: ["shop"],
    category: "shop",
    title: "Mtumba jacket",
    emoji: "shirt",
    priceKes: 850,
    stock: 12,
  },
  {
    ownerKey: "rift",
    vendorName: "Rift Electro",
    verified: false,
    categories: ["shop"],
    category: "shop",
    title: "Phone charger",
    emoji: "smartphone",
    priceKes: 450,
    description:
      "Dual USB wall adapter with 1.2 m braided cable, fits Type-C and Micro-USB phones. Tested in-shop before dispatch. Nakuru CBD same-day drop-off when you order before 4 p.m.",
    stock: 30,
    imageUrl:
      "https://images.unsplash.com/photo-1583863788434-e58a363049cf?w=900&auto=format&fit=crop&q=80",
    galleryUrls: [
      "https://images.unsplash.com/photo-1583863788434-e58a363049cf?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1591290618608-c70f23c9d94f?w=900&auto=format&fit=crop&q=80",
    ],
  },
  {
    ownerKey: "gilani",
    vendorName: "Gilani Fresh",
    verified: true,
    categories: ["shop"],
    category: "shop",
    title: "Fresh veggies",
    emoji: "salad",
    priceKes: 120,
    stock: 40,
  },
  {
    ownerKey: "peter",
    vendorName: "Peter Plumbing",
    verified: true,
    categories: ["services"],
    category: "services",
    title: "Peter, plumber",
    emoji: "wrench",
    priceKes: 700,
    description: "Leaks and fittings · quote on site",
    stock: null,
  },
  {
    ownerKey: "zawadi",
    vendorName: "Zawadi Agents",
    verified: true,
    categories: ["property"],
    category: "property",
    title: "2BR house for rent, Milimani",
    emoji: "home",
    priceKes: 35000,
    description: "Rent per month",
    stock: null,
  },
  {
    ownerKey: "motors",
    vendorName: "Nakuru Motors",
    verified: true,
    categories: ["cars"],
    category: "cars",
    title: "Toyota Axio 2015",
    emoji: "car",
    priceKes: 1250000,
    description: "68,000 km",
    stock: null,
  },
  {
    ownerKey: "mama",
    vendorName: "Mama Fashions",
    verified: true,
    categories: ["shop"],
    category: "shop",
    title: "Kitenge two-piece — QA showcase",
    emoji: "shirt",
    priceKes: 3000,
    description:
      "Bright cotton kitenge set sized M–L. Freshly steamed, Nakuru CBD pickup or delivery. Ideal for church, weddings, or office Fridays.",
    stock: 8,
    imageUrl:
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=900&auto=format&fit=crop&q=80",
    galleryUrls: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583496661161-f2a7ab7da53c?w=900&auto=format&fit=crop&q=80",
    ],
    attributes: { year: "2024", area: "M–L" },
  },
];

async function demoOwnerIds(): Promise<string[]> {
  const emails = Object.values(DEMO_OWNERS);
  const r = await db.q<{ id: string }>(
    `select id from users where lower(email) = any($1::text[])`,
    [emails.map((e) => e.toLowerCase())],
  );
  return r.rows.map((row) => row.id);
}

async function resetDemoRows(): Promise<void> {
  const ownerIds = await demoOwnerIds();
  if (ownerIds.length === 0) {
    console.log("No demo-seed users to remove.");
    return;
  }
  await db.q(
    `delete from products
     where vendor_id in (select id from vendors where owner_id = any($1::uuid[]))`,
    [ownerIds],
  );
  await db.q(`delete from vendors where owner_id = any($1::uuid[])`, [ownerIds]);
  await db.q(
    `delete from users where id = any($1::uuid[]) and email like $2`,
    [ownerIds, `demo-seed-%${DEMO_EMAIL_SUFFIX}`],
  );
  console.log(`Removed demo-seed data for ${ownerIds.length} owner(s).`);
}

async function ensureOwner(email: string): Promise<string> {
  const found = await db.q<{ id: string }>(
    `select id from users where lower(email) = lower($1)`,
    [email],
  );
  if (found.rows[0]?.id) return found.rows[0].id;

  const ins = await db.q<{ id: string }>(
    `insert into users (email, role)
     values ($1, 'vendor')
     returning id`,
    [email],
  );
  return ins.rows[0]!.id;
}

async function ensureVendor(
  ownerId: string,
  name: string,
  verified: boolean,
  categories: string[],
): Promise<string> {
  const found = await db.q<{ id: string }>(
    `select id from vendors where owner_id = $1 limit 1`,
    [ownerId],
  );
  if (found.rows[0]?.id) {
    await db.q(
      `update vendors
       set name = $2, verified = $3, categories = $4::text[], status = 'approved'
       where id = $1`,
      [found.rows[0].id, name, verified, categories],
    );
    return found.rows[0].id;
  }
  const ins = await db.q<{ id: string }>(
    `insert into vendors (owner_id, name, verified, status, categories)
     values ($1, $2, $3, 'approved', $4::text[])
     returning id`,
    [ownerId, name, verified, categories],
  );
  return ins.rows[0]!.id;
}

async function ensureProduct(
  vendorId: string,
  row: DemoProduct,
): Promise<"inserted" | "skipped"> {
  const exists = await db.q<{ id: string }>(
    `select id from products where vendor_id = $1 and title = $2 limit 1`,
    [vendorId, row.title],
  );
  if (exists.rows[0]?.id) return "skipped";

  const gallery = row.galleryUrls?.length
    ? row.galleryUrls
    : row.imageUrl
      ? [row.imageUrl]
      : [];
  /** Leave null when no photo — app renders tinted category icon, not a fallback screenshot. */
  const primary = row.imageUrl ?? null;
  await db.q(
    `insert into products (
       vendor_id, category, title, description, emoji, price_kes, stock, active,
       image_url, gallery_urls, attributes
     ) values ($1, $2, $3, $4, $5, $6, $7, true, $8, $9::text[], $10::jsonb)`,
    [
      vendorId,
      row.category,
      row.title,
      row.description ?? "",
      row.emoji,
      row.priceKes,
      row.stock ?? null,
      primary,
      gallery,
      JSON.stringify(row.attributes ?? {}),
    ],
  );
  return "inserted";
}

async function main(): Promise<void> {
  if (!config.dbUrl?.trim()) {
    console.error("DATABASE_URL is not set. Add it to .env.local and retry.");
    process.exit(1);
  }

  const reset = process.argv.includes("--reset");
  if (reset) {
    await resetDemoRows();
  }

  let inserted = 0;
  let skipped = 0;

  const vendorCache = new Map<string, string>();

  for (const row of DEMO_CATALOG) {
    const email = DEMO_OWNERS[row.ownerKey];
    let ownerId = vendorCache.get(email);
    if (!ownerId) {
      ownerId = await ensureOwner(email);
      vendorCache.set(email, ownerId);
    }

    const vendorId = await ensureVendor(
      ownerId,
      row.vendorName,
      row.verified,
      row.categories,
    );

    const result = await ensureProduct(vendorId, row);
    if (result === "inserted") inserted += 1;
    else skipped += 1;
  }

  console.log(
    `Demo seed complete: ${inserted} product(s) inserted, ${skipped} already present.`,
  );
  console.log(
    "Listings use category icon placeholders (image_url null). Enable live catalog with NEXT_PUBLIC_USE_LIVE_CATALOG=true.",
  );
  if (!reset) {
    console.log(
      "To replace demo rows only, run: pnpm seed:demo -- --reset",
    );
  }

  await db.pool.end();
}

main().catch((err: Error) => {
  console.error(err.message);
  process.exit(1);
});