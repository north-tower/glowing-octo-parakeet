create table categories (
  slug text primary key
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and slug <> 'all'),
  label text not null check (char_length(trim(label)) between 2 and 40),
  kind text not null check (kind in ('official', 'community')),
  listing_mode text not null
    check (listing_mode in ('shop', 'services', 'property', 'cars')),
  visible boolean not null default true,
  open_for_apply boolean not null default false,
  sort_order int not null default 100,
  created_by uuid references users (id),
  created_at timestamptz not null default now()
);

insert into categories (slug, label, kind, listing_mode, visible, open_for_apply, sort_order)
values
  ('shop', 'Shop', 'official', 'shop', true, true, 10),
  ('services', 'Services', 'official', 'services', true, true, 20),
  ('property', 'Property', 'official', 'property', true, false, 30),
  ('cars', 'Cars', 'official', 'cars', true, false, 40),
  ('stays', 'Stays', 'official', 'shop', true, false, 50),
  ('taxi', 'Taxi', 'official', 'services', true, false, 60);

alter table products drop constraint if exists products_category_check;

alter table products
  add constraint products_category_fk
  foreign key (category) references categories (slug);