-- Shop logo / profile picture shown on vendor profile and staff queue

alter table vendors
  add column if not exists logo_url text;