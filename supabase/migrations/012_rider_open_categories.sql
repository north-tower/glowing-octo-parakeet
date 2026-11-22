-- Open all official categories for vendor apply; add Rider marketplace category.
update categories
set open_for_apply = true
where kind = 'official'
  and slug in ('property', 'cars', 'stays', 'taxi');

insert into categories (slug, label, kind, listing_mode, visible, open_for_apply, sort_order)
values ('rider', 'Rider', 'official', 'services', true, true, 65)
on conflict (slug) do update
set label = excluded.label,
    listing_mode = excluded.listing_mode,
    visible = excluded.visible,
    open_for_apply = excluded.open_for_apply,
    sort_order = excluded.sort_order;