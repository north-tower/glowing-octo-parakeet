-- NakuruHub launch core schema (run on empty Supabase DB)
-- Supabase Dashboard → SQL → New query → paste → Run
-- Extensions: enable postgis + pgcrypto in Dashboard if this block fails.

create extension if not exists postgis;
create extension if not exists pgcrypto;

create table users (
  id uuid primary key default gen_random_uuid(),
  email text,
  phone text unique check (phone is null or phone ~ '^\+254[17][0-9]{8}$'),
  role text not null default 'customer'
    check (role in ('customer', 'vendor', 'rider', 'support', 'admin')),
  password_hash text,
  totp_secret text,
  totp_step bigint,
  failed_logins int not null default 0,
  locked_until timestamptz,
  disabled boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index users_email_lower on users (lower(email)) where email is not null;

create table otp_daily (
  email text not null,
  day date not null,
  n int not null default 0,
  primary key (email, day)
);

create table otp_codes (
  email text primary key,
  code_hash bytea not null,
  expires_at timestamptz not null,
  attempts int not null default 0,
  last_sent timestamptz not null default now()
);

create table refresh_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  family uuid not null,
  token_hash text unique not null,
  expires_at timestamptz not null,
  revoked boolean not null default false,
  created_at timestamptz not null default now()
);
create index refresh_tokens_family_idx on refresh_tokens (family);

create table audit_log (
  id bigserial primary key,
  at timestamptz not null default now(),
  user_id uuid,
  event text not null,
  ip inet,
  meta jsonb
);

create table vendors (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references users (id),
  name text not null,
  verified boolean not null default false,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  categories text[] not null default '{}',
  created_at timestamptz not null default now(),
  location geography (Point, 4326)
);
create index vendors_geo on vendors using gist (location);

create table orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references users (id),
  vendor_id uuid references vendors (id),
  rider_id uuid references users (id),
  status text not null default 'placed'
    check (
      status in (
        'placed',
        'accepted',
        'ready',
        'out_for_delivery',
        'delivered',
        'cancelled',
        'refused'
      )
    ),
  total_kes integer not null check (total_kes >= 0),
  payment text not null check (payment in ('cod', 'mpesa')),
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'pending', 'paid', 'failed')),
  zone text,
  delivery_fee_kes integer not null default 0,
  address text,
  delivery_code_enc text,
  delivery_attempts int not null default 0,
  delivery_point geography (Point, 4326),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_customer_idx on orders (customer_id);
create index orders_rider_idx on orders (rider_id);
create index orders_vendor_idx on orders (vendor_id);
create index orders_status_idx on orders (status);

create table products (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references vendors (id) on delete cascade,
  category text not null check (category in ('shop', 'property', 'cars', 'services')),
  title text not null,
  description text not null default '',
  emoji text not null default '🛍️',
  price_kes integer not null check (price_kes >= 0),
  stock integer check (stock is null or stock >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index products_vendor_idx on products (vendor_id);
create index products_cat_idx on products (category) where active;

create table order_items (
  order_id uuid not null references orders (id) on delete cascade,
  product_id uuid not null references products (id),
  title text not null,
  unit_kes integer not null,
  qty integer not null check (qty between 1 and 99),
  primary key (order_id, product_id)
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id),
  phone text not null,
  amount_kes integer not null,
  checkout_request_id text unique,
  merchant_request_id text,
  status text not null default 'pending'
    check (status in ('pending', 'success', 'failed')),
  mpesa_receipt text unique,
  result_desc text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index payments_order_idx on payments (order_id);