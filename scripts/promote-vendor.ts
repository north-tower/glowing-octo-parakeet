/**
 * Verify a live vendor and pin their shop on the home hero carousel.
 *
 * Usage:
 *   pnpm vendors:promote
 *   pnpm vendors:promote -- --email tracywairimu43@gmail.com
 *
 * Does not touch demo-seed vendors.
 */
import "./load-project-env";
import { db } from "../lib/server/db";
import { config } from "../lib/server/config";

const DEFAULT_EMAIL = "tracywairimu43@gmail.com";

const HEADLINE = "Phone & laptop repair in Nakuru";
const SUBTITLE =
  "Screens, batteries, charging ports — drop-in or same-day quotes";

function argValue(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  if (i === -1) return undefined;
  return process.argv[i + 1];
}

async function main(): Promise<void> {
  if (!config.dbUrl?.trim()) {
    console.error("DATABASE_URL is not set. Add it to .env.local and retry.");
    process.exit(1);
  }

  const email = (argValue("--email") ?? DEFAULT_EMAIL).trim().toLowerCase();

  const vendor = await db.q<{
    id: string;
    name: string;
    status: string;
    verified: boolean;
    owner_email: string;
  }>(
    `select v.id, v.name, v.status, v.verified, u.email as owner_email
     from vendors v
     join users u on u.id = v.owner_id
     where lower(u.email) = $1
     order by v.created_at desc
     limit 1`,
    [email],
  );

  const row = vendor.rows[0];
  if (!row) {
    console.error(`No vendor found for ${email}.`);
    process.exit(1);
  }

  await db.q(
    `update vendors
     set verified = true,
         status = 'approved',
         area = coalesce(nullif(trim(area), ''), 'Nakuru CBD')
     where id = $1::uuid`,
    [row.id],
  );

  const listing = await db.q<{ id: string; title: string; active: boolean }>(
    `select id, title, active
     from products
     where vendor_id = $1::uuid
     order by active desc, created_at desc
     limit 1`,
    [row.id],
  );

  const product = listing.rows[0];
  if (!product) {
    console.log(
      `Verified ${row.name} (${row.id}). No listing yet — add one, then re-run this script to pin the hero.`,
    );
    await db.pool.end();
    return;
  }

  if (!product.active) {
    await db.q(`update products set active = true where id = $1::uuid`, [
      product.id,
    ]);
  }

  const existing = await db.q<{ id: string }>(
    `select id from homepage_placements
     where product_id = $1::uuid and placement = 'hero'
     limit 1`,
    [product.id],
  );

  if (existing.rows[0]) {
    await db.q(
      `update homepage_placements
       set sort_order = 1,
           headline = $2,
           subtitle = $3,
           active = true,
           starts_at = null,
           ends_at = null,
           updated_at = now()
       where id = $1::uuid`,
      [existing.rows[0].id, HEADLINE, SUBTITLE],
    );
    console.log(
      `Updated hero placement for ${row.name} → “${product.title}”.`,
    );
  } else {
    await db.q(
      `insert into homepage_placements (
         product_id, placement, sort_order, headline, subtitle, active
       ) values ($1::uuid, 'hero', 1, $2, $3, true)`,
      [product.id, HEADLINE, SUBTITLE],
    );
    console.log(
      `Created hero placement for ${row.name} → “${product.title}”.`,
    );
  }

  console.log(
    `Vendor ${row.id} is verified and featured. Hero CTA opens /v/${row.id}.`,
  );
  await db.pool.end();
}

main().catch((err: Error) => {
  console.error(err.message);
  process.exit(1);
});
