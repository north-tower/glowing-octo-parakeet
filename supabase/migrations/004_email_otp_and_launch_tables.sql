-- NakuruHub launch additions (run after 003 on same database)

create table if not exists vendor_documents (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references vendors (id) on delete cascade,
  kind text not null check (
    kind in ('national_id_front', 'national_id_back', 'category_doc', 'logo')
  ),
  storage_key text not null,
  mime text not null,
  size_bytes int not null check (size_bytes > 0 and size_bytes <= 5242880),
  created_at timestamptz not null default now()
);
create index if not exists vendor_documents_vendor_id on vendor_documents (vendor_id);

create table if not exists service_inquiries (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id),
  customer_id uuid not null references users (id),
  message text not null default '',
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now()
);
create index if not exists service_inquiries_product on service_inquiries (product_id);
create index if not exists service_inquiries_customer on service_inquiries (customer_id);