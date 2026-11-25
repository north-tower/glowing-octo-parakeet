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
  prime: `demo-seed-prime${DEMO_EMAIL_SUFFIX}`,
  landmark: `demo-seed-landmark${DEMO_EMAIL_SUFFIX}`,
  riftland: `demo-seed-riftland${DEMO_EMAIL_SUFFIX}`,
} as const;

type DemoProduct = {
  seedKey: string;
  ownerKey: keyof typeof DEMO_OWNERS;
  vendorName: string;
  verified: boolean;
  categories: string[];
  category: string;
  title: string;
  emoji: string;
  priceKes: number;
  description: string;
  stock?: number | null;
  imageUrl: string;
  galleryUrls: string[];
  attributes?: Record<string, string>;
};

function photo(id: string): string {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=85`;
}

const DEMO_CATALOG: DemoProduct[] = [
  {
    seedKey: "mama-denim-jacket",
    ownerKey: "mama",
    vendorName: "Mama Fashions",
    verified: true,
    categories: ["shop"],
    category: "shop",
    title: "Mtumba denim jacket, size L · Bondeni",
    emoji: "shirt",
    priceKes: 850,
    description:
      "Thick Levi’s-style jacket, size L, no rips. Worn twice. Pickup at Bondeni stage or CBD drop-off same day if you order before 4 p.m. Cash on delivery.",
    stock: 1,
    imageUrl: photo("photo-1551028719-00167b16eac5"),
    galleryUrls: [
      photo("photo-1551028719-00167b16eac5"),
      photo("photo-1544027993-37dbfe435803"),
    ],
    attributes: { size: "L", condition: "Excellent", area: "Bondeni" },
  },
  {
    seedKey: "mama-kitenge",
    ownerKey: "mama",
    vendorName: "Mama Fashions",
    verified: true,
    categories: ["shop"],
    category: "shop",
    title: "Kitenge two-piece, sizes M–L · CBD",
    emoji: "shirt",
    priceKes: 3000,
    description:
      "Bright cotton kitenge set, freshly steamed. Fits M–L. Church, weddings, or office Fridays. Try-on at Mama Fashions, Kenyatta Avenue; delivery across Nakuru town.",
    stock: 8,
    imageUrl: photo("photo-1603252109303-27514432dd3a"),
    galleryUrls: [
      photo("photo-1603252109303-27514432dd3a"),
      photo("photo-1596755094514-f87e34085b2c"),
    ],
    attributes: { size: "M–L", condition: "New", area: "Nakuru CBD" },
  },
  {
    seedKey: "rift-charger",
    ownerKey: "rift",
    vendorName: "Rift Electro",
    verified: false,
    categories: ["shop"],
    category: "shop",
    title: "Dual USB wall charger + 1.2 m cable",
    emoji: "smartphone",
    priceKes: 450,
    description:
      "Fast wall adapter with braided cable. Type-C and Micro-USB heads in the pack. Tested on the counter before you leave. CBD pickup; Westside drop-off KES 50.",
    stock: 30,
    imageUrl: photo("photo-1583863788434-e58a36330cf0"),
    galleryUrls: [
      photo("photo-1583863788434-e58a36330cf0"),
      photo("photo-1593640408182-31c70c8268f5"),
    ],
    attributes: { condition: "New", area: "Nakuru CBD" },
  },
  {
    seedKey: "gilani-veggies",
    ownerKey: "gilani",
    vendorName: "Gilani Fresh",
    verified: true,
    categories: ["shop"],
    category: "shop",
    title: "Sukuma, tomatoes & onions pack · Gilanis",
    emoji: "salad",
    priceKes: 120,
    description:
      "Morning market mix: sukuma wiki, ripe tomatoes, and red onions. Packed after 6 a.m. at Gilanis. Collect by noon or we drop around Section 58 for a small fee.",
    stock: 40,
    imageUrl: photo("photo-1540420773420-3366772f4999"),
    galleryUrls: [
      photo("photo-1540420773420-3366772f4999"),
      photo("photo-1512621776951-a57141f2eefd"),
    ],
    attributes: { pack: "Family mix", area: "Gilanis" },
  },
  {
    seedKey: "mama-sofa",
    ownerKey: "mama",
    vendorName: "Mama Fashions",
    verified: true,
    categories: ["shop"],
    category: "shop",
    title: "5-seater sofa set, fabric · Gilanis",
    emoji: "sofa",
    priceKes: 18500,
    description:
      "3+2 fabric sofa, charcoal grey, firm cushions. One season in a living room, no pet hair. Viewing at Gilanis; delivery in Nakuru town with two helpers.",
    stock: 2,
    imageUrl: photo("photo-1555041469-a586c61ea9bc"),
    galleryUrls: [
      photo("photo-1555041469-a586c61ea9bc"),
      photo("photo-1493666438817-866a91353ca9"),
    ],
    attributes: { condition: "Good", area: "Gilanis" },
  },
  {
    seedKey: "peter-plumber",
    ownerKey: "peter",
    vendorName: "Peter Plumbing",
    verified: true,
    categories: ["services"],
    category: "services",
    title: "Peter — leaks, tanks & fittings",
    emoji: "wrench",
    priceKes: 700,
    description:
      "Call-out from KES 700. Burst pipes, leaking toilets, tank stands, and new fittings. Same-day in CBD, Milimani, and Section 58. Quote on site before work starts.",
    stock: null,
    imageUrl: photo("photo-1585704032915-c3400ca199e7"),
    galleryUrls: [
      photo("photo-1585704032915-c3400ca199e7"),
      photo("photo-1504148455328-c376907d081c"),
    ],
    attributes: { area: "Nakuru town", callout: "KES 700" },
  },
  {
    seedKey: "zawadi-2br",
    ownerKey: "zawadi",
    vendorName: "Zawadi Agents",
    verified: true,
    categories: ["property"],
    category: "property",
    title: "2-bedroom house to let · Milimani",
    emoji: "home",
    priceKes: 35000,
    description:
      "Ground-floor 2BR with parking, water backup, and 24h guard. Quiet cul-de-sac off Flamingo Road. Viewing Saturdays 10 a.m.–2 p.m. One month deposit.",
    stock: null,
    imageUrl: photo("photo-1560448204-e02f11c0d0e2"),
    galleryUrls: [
      photo("photo-1560448204-e02f11c0d0e2"),
      photo("photo-1600585154340-be6161a56a0c"),
    ],
    attributes: {
      tenure: "rent",
      bedrooms: "2",
      location: "Milimani, Nakuru",
    },
  },
  {
    seedKey: "prime-3br",
    ownerKey: "prime",
    vendorName: "Nakuru Prime Homes",
    verified: true,
    categories: ["property"],
    category: "property",
    title: "Modern 3-bedroom home for sale · Milimani",
    emoji: "home-sale",
    priceKes: 18500000,
    description:
      "Family house with garden, lock-up parking, and a fitted kitchen. Borehole and DSTV already in. Title at the lawyers. Viewing by appointment only.",
    stock: null,
    imageUrl: photo("photo-1600607687939-ce8a6c25118c"),
    galleryUrls: [
      photo("photo-1600607687939-ce8a6c25118c"),
      photo("photo-1600566753190-17f0baa2a6c3"),
    ],
    attributes: {
      tenure: "sale",
      bedrooms: "3",
      location: "Milimani, Nakuru",
      badge: "Featured",
    },
  },
  {
    seedKey: "landmark-50x100",
    ownerKey: "landmark",
    vendorName: "Landmark Properties",
    verified: true,
    categories: ["property"],
    category: "property",
    title: "50 × 100 plot near tarmac · Ngata",
    emoji: "land-plot",
    priceKes: 1650000,
    description:
      "Level residential plot, access road graded, power on the next street. Clean title. Weekday viewing; beacon certificate with the file.",
    stock: null,
    imageUrl: photo("photo-1500382017468-9049fed747ef"),
    galleryUrls: [
      photo("photo-1500382017468-9049fed747ef"),
      photo("photo-1464146072230-91cabc968266"),
    ],
    attributes: {
      tenure: "sale",
      plotSize: "50 × 100",
      location: "Ngata, Nakuru",
      badge: "New",
    },
  },
  {
    seedKey: "riftland-lanet",
    ownerKey: "riftland",
    vendorName: "Rift Land Ltd",
    verified: true,
    categories: ["property"],
    category: "property",
    title: "¼ acre serviced plot · Lanet",
    emoji: "land-plot",
    priceKes: 2800000,
    description:
      "Beacons in, murram road in, ready to build. 10 minutes off the highway. Site visit with the caretaker any afternoon.",
    stock: null,
    imageUrl: photo("photo-1500382017468-9049fed747ef"),
    galleryUrls: [
      photo("photo-1500382017468-9049fed747ef"),
      photo("photo-1470071459604-3b5ec3a7fe05"),
    ],
    attributes: {
      tenure: "sale",
      plotSize: "¼ acre",
      location: "Lanet, Nakuru",
      badge: "Hot deal",
    },
  },
  {
    seedKey: "motors-axio",
    ownerKey: "motors",
    vendorName: "Nakuru Motors",
    verified: true,
    categories: ["cars"],
    category: "cars",
    title: "Toyota Axio 2015 · 68,000 km",
    emoji: "car",
    priceKes: 1250000,
    description:
      "Silver Axio, petrol, auto. New tyres, service book, accident-free. Logbook ready for transfer at our CBD yard. Test drive with fuel in the tank.",
    stock: null,
    imageUrl: photo("photo-1549317661-bd32c8ce0db2"),
    galleryUrls: [
      photo("photo-1549317661-bd32c8ce0db2"),
      photo("photo-1494976388531-d1058494cdd8"),
    ],
    attributes: {
      mileage: "68,000 km",
      year: "2015",
      location: "Nakuru CBD",
      badge: "Popular",
    },
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

function productAttrs(row: DemoProduct): string {
  return JSON.stringify({ ...row.attributes, seedKey: row.seedKey });
}

async function ensureProduct(
  vendorId: string,
  row: DemoProduct,
): Promise<"inserted" | "updated"> {
  const gallery = row.galleryUrls;
  const primary = row.imageUrl;
  const attrs = productAttrs(row);

  const exists = await db.q<{ id: string }>(
    `select id from products
     where vendor_id = $1 and attributes->>'seedKey' = $2
     limit 1`,
    [vendorId, row.seedKey],
  );
  if (exists.rows[0]?.id) {
    await db.q(
      `update products
       set category = $2,
           title = $3,
           description = $4,
           emoji = $5,
           price_kes = $6,
           stock = $7,
           active = true,
           image_url = $8,
           gallery_urls = $9::text[],
           attributes = $10::jsonb
       where id = $1`,
      [
        exists.rows[0].id,
        row.category,
        row.title,
        row.description,
        row.emoji,
        row.priceKes,
        row.stock ?? null,
        primary,
        gallery,
        attrs,
      ],
    );
    return "updated";
  }

  await db.q(
    `insert into products (
       vendor_id, category, title, description, emoji, price_kes, stock, active,
       image_url, gallery_urls, attributes
     ) values ($1, $2, $3, $4, $5, $6, $7, true, $8, $9::text[], $10::jsonb)`,
    [
      vendorId,
      row.category,
      row.title,
      row.description,
      row.emoji,
      row.priceKes,
      row.stock ?? null,
      primary,
      gallery,
      attrs,
    ],
  );
  return "inserted";
}

async function pruneStaleDemoProducts(keepKeys: string[]): Promise<number> {
  const ownerIds = await demoOwnerIds();
  if (ownerIds.length === 0) return 0;
  const r = await db.q<{ id: string }>(
    `delete from products
     where vendor_id in (select id from vendors where owner_id = any($1::uuid[]))
       and coalesce(attributes->>'seedKey', '') <> all($2::text[])
     returning id`,
    [ownerIds, keepKeys],
  );
  return r.rows.length;
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
  let updated = 0;

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
    else updated += 1;
  }

  const pruned = await pruneStaleDemoProducts(
    DEMO_CATALOG.map((row) => row.seedKey),
  );

  console.log(
    `Demo seed complete: ${inserted} inserted, ${updated} updated, ${pruned} stale demo listing(s) removed.`,
  );
  console.log(
    "Enable the live catalog with NEXT_PUBLIC_USE_LIVE_CATALOG=true to see these rows in /app.",
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