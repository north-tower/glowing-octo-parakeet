-- Shop serving zone (header Nakuru list). Inherited by listings at read time.
alter table vendors
  add column if not exists area text;

create index if not exists vendors_area_idx on vendors (area)
  where area is not null;
