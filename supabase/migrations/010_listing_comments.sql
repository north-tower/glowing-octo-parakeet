-- Public listing comments (flat, soft-delete).

create table if not exists listing_comments (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  author_id uuid not null references users (id),
  body text not null check (char_length(body) between 1 and 500),
  deleted_at timestamptz,
  deleted_by uuid references users (id),
  created_at timestamptz not null default now()
);

create index if not exists listing_comments_product_created_idx
  on listing_comments (product_id, created_at);

create index if not exists listing_comments_author_created_idx
  on listing_comments (author_id, created_at);
