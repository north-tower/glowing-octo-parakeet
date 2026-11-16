-- Optional multi-image gallery and structured listing attributes (detail view).

alter table products
  add column if not exists gallery_urls text[] not null default '{}';

alter table products
  add column if not exists attributes jsonb not null default '{}';