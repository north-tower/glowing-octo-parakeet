-- Optional shop cover banner on public vendor page

alter table vendors
  add column if not exists banner_url text;