-- Staff-managed homepage placements (hero carousel vendor spotlights).

create table homepage_placements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  placement text not null default 'hero'
    check (placement in ('hero')),
  sort_order integer not null default 50,
  headline text,
  subtitle text,
  image_url text,
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_by uuid references users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index homepage_placements_product_hero_uidx
  on homepage_placements (product_id)
  where placement = 'hero';

create index homepage_placements_hero_live_idx
  on homepage_placements (placement, active, sort_order)
  where placement = 'hero' and active;