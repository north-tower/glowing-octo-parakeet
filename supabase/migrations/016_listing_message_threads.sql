-- Private in-app messages between buyer and listing vendor (one thread per buyer per listing).

create table if not exists listing_message_threads (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  customer_id uuid not null references users (id) on delete cascade,
  vendor_owner_id uuid not null references users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, customer_id)
);

create table if not exists listing_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references listing_message_threads (id) on delete cascade,
  sender_id uuid not null references users (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  constraint listing_messages_body_len check (
    char_length(body) >= 1 and char_length(body) <= 500
  )
);

create index if not exists listing_message_threads_customer_updated_idx
  on listing_message_threads (customer_id, updated_at desc);

create index if not exists listing_message_threads_vendor_updated_idx
  on listing_message_threads (vendor_owner_id, updated_at desc);

create index if not exists listing_messages_thread_created_idx
  on listing_messages (thread_id, created_at asc);